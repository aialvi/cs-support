<?php

/**
 * Rest API class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

class Rest_API
{
	/**
	 * Plugin instance.
	 *
	 * @var Plugin
	 */
	protected $plugin;

	/**
	 * Constructor.
	 *
	 * @param Plugin $plugin Plugin instance.
	 */
	public function __construct(Plugin $plugin)
	{
		$this->plugin = $plugin;
		add_action('rest_api_init', [$this, 'register_routes']);
	}

	/**
	 * Register routes.
	 *
	 * @return void
	 */
	public function register_routes(): void
	{
		register_rest_route(
			'cs-support/v1',
			'/tickets',
			[
				'methods' => 'POST',
				'callback' => [$this, 'create_ticket'],
				'permission_callback' => [$this, 'check_permission'],
			]
		);

		register_rest_route(
			'cs-support/v1',
			'/tickets',
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_tickets'],
				'permission_callback' => [$this, 'check_permission'],
			]
		);
		
		// PATCH /tickets/{id} - Update ticket status
		register_rest_route(
			'cs-support/v1',
			'/tickets/(?P<id>\d+)',
			[
				'methods' => 'PATCH',
				'callback' => [$this, 'update_ticket'],
				'permission_callback' => [$this, 'check_admin_permission'],
			]
		);

		// POST /tickets/{id}/replies
		register_rest_route(
			'cs-support/v1',
			'/tickets/(?P<ticket_id>\d+)/replies',
			[
				'methods'  => 'POST',
				'callback' => [$this, 'create_reply'],
				'permission_callback' => [$this, 'check_permission'],
			]
		);

		// GET /tickets/{id}/replies
		register_rest_route(
			'cs-support/v1',
			'/tickets/(?P<ticket_id>\d+)/replies',
			[
				'methods'  => 'GET',
				'callback' => [$this, 'get_replies'],
				'permission_callback' => [$this, 'check_permission'],
			]
		);

		// GET /settings
		register_rest_route(
			'cs-support/v1',
			'/settings',
			[
				[
					'methods' => 'GET',
					'callback' => [$this, 'get_settings'],
					'permission_callback' => [$this, 'check_admin_permission'],
				],
				[
					'methods' => 'POST',
					'callback' => [$this, 'update_settings'],
					'permission_callback' => [$this, 'check_admin_permission'],
				]
			]
		);
	}

	/**
	 * Check if user is logged in.
	 *
	 * @return bool
	 */
	public function check_permission(): bool
	{
		return is_user_logged_in();
	}

	/**
	 * Check if user is an admin.
	 *
	 * @return bool
	 */
	public function check_admin_permission(): bool
	{
		return current_user_can('manage_options');
	}

	/**
	 * Get settings.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_settings(): \WP_REST_Response
	{
		$settings = get_option('cs_support_helpdesk_settings', []);
		return new \WP_REST_Response($settings, 200);
	}

	/**
	 * Update settings.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function update_settings(\WP_REST_Request $request): \WP_REST_Response
	{
		$settings = $request->get_json_params();

		// Recursively sanitize settings
		$sanitized_settings = $this->sanitize_settings($settings);

		$updated = update_option('cs_support_helpdesk_settings', $sanitized_settings);

		if (!$updated) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to update settings'
			], 500);
		}

		return new \WP_REST_Response([
			'success' => true,
			'message' => 'Settings updated successfully'
		], 200);
	}

	/**
	 * Recursively sanitize settings.
	 *
	 * @param array $settings Settings to sanitize.
	 * @return array Sanitized settings.
	 */
	private function sanitize_settings($settings): array
	{
		$sanitized = [];

		foreach ($settings as $key => $value) {
			if (is_array($value)) {
				$sanitized[$key] = $this->sanitize_settings($value);
			} else {
				$sanitized[$key] = sanitize_text_field($value);
			}
		}

		return $sanitized;
	}

	/**
	 * Create ticket.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function create_ticket(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		$params = $request->get_params();

		// Get default priority from settings
		$settings = get_option('cs_support_helpdesk_settings', []);
		$default_priority = isset($settings['general']['defaultPriority']) ? $settings['general']['defaultPriority'] : 'normal';

		$data = [
			'user_id' => get_current_user_id(),
			'subject' => sanitize_text_field($params['subject']),
			'category' => sanitize_text_field($params['category']),
			'priority' => sanitize_text_field($params['priority'] ?? $default_priority), // Use default priority if none provided
			'description' => sanitize_text_field($params['description']),
			'status' => sanitize_text_field($params['status'] ?? 'NEW'),
		];

		$result = $wpdb->insert(
			$wpdb->prefix . 'cs_support_tickets',
			$data,
			['%d', '%s', '%s', '%s', '%s', '%s']
		);

		if ($result === false) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to create ticket'
			], 500);
		}

		return new \WP_REST_Response([
			'success' => true,
			'ticket_id' => $wpdb->insert_id
		], 201);
	}

	/**
	 * Get tickets.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_tickets(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		$current_user_id = get_current_user_id();
		$user_param = isset($request) ? $request->get_param('user_id') : null;

		// If user_id is provided in request and current user is admin, filter by that user
		// Otherwise, filter by current user
		$user_id_filter = '';
		if ($user_param && current_user_can('manage_options')) {
			$user_id_filter = $wpdb->prepare("WHERE t.user_id = %d", $user_param);
		} else {
			// For normal users, only show their own tickets
			// For admins without a user_id param, show all tickets
			if (!current_user_can('manage_options')) {
				$user_id_filter = $wpdb->prepare("WHERE t.user_id = %d", $current_user_id);
			}
		}

		$tickets = $wpdb->get_results(
			"SELECT t.*, u.display_name as user_name, u.user_email
			 FROM {$wpdb->prefix}cs_support_tickets t
			 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
			 $user_id_filter
			 ORDER BY t.created_at DESC",
			ARRAY_A
		);

		if (is_null($tickets)) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to fetch tickets'
			], 500);
		}

		return new \WP_REST_Response($tickets, 200);
	}

	/**
	 * Get ticket.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_ticket(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		$ticket_id = (int) $request->get_param('id');

		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT t.*, u.display_name as user_name, u.user_email 
				 FROM {$wpdb->prefix}cs_support_tickets t
				 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
				 WHERE t.id = %d",
				$ticket_id
			),
			ARRAY_A
		);

		if (!$ticket) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Ticket not found'
			], 404);
		}

		return new \WP_REST_Response($ticket, 200);
	}

	/**
	 * Create reply.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function create_reply(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		// 1. Validate ticket exists
		$ticket_id = (int) $request->get_param('ticket_id');
		$ticket_exists = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT id FROM {$wpdb->prefix}cs_support_tickets WHERE id = %d",
				$ticket_id
			)
		);

		if (!$ticket_exists) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Ticket not found'
			], 404);
		}

		// 2. Validate reply content
		$reply = $request->get_param('reply');
		if (empty($reply)) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Reply content is required'
			], 400);
		}

		// Check if this is a system note
		$is_system_note = (bool) $request->get_param('is_system_note');
		
		// 3. Insert with error logging
		$data = [
			'ticket_id' => $ticket_id,
			'user_id'   => get_current_user_id(),
			'reply'     => sanitize_text_field($reply),
			'created_at' => current_time('mysql'),
			'is_system_note' => $is_system_note ? 1 : 0,
		];

		$inserted = $wpdb->insert(
			$wpdb->prefix . 'cs_support_ticket_replies',
			$data,
			['%d', '%d', '%s', '%s', '%d']
		);

		if (false === $inserted) {
			// Log the actual database error
			error_log('DB Error: ' . $wpdb->last_error);
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to add reply: ' . $wpdb->last_error
			], 500);
		}

		return new \WP_REST_Response([
			'success' => true,
			'reply_id' => $wpdb->insert_id
		], 201);
	}

	/**
	 * Get replies.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_replies(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		$ticket_id = (int) $request->get_param('ticket_id');

		$replies = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}cs_support_ticket_replies WHERE ticket_id = %d ORDER BY created_at DESC",
				$ticket_id
			),
			ARRAY_A
		);

		return new \WP_REST_Response($replies, 200);
	}

	/**
	 * Update ticket.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function update_ticket(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		$ticket_id = (int) $request->get_param('id');
		$params = $request->get_json_params();

		// Validate ticket exists
		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}cs_support_tickets WHERE id = %d",
				$ticket_id
			),
			ARRAY_A
		);

		if (!$ticket) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Ticket not found'
			], 404);
		}

		// Prepare update data
		$update_data = [];
		$update_format = [];

		// Update status if provided
		if (isset($params['status'])) {
			$valid_statuses = ['NEW', 'IN_PROGRESS', 'RESOLVED'];
			$status = strtoupper(sanitize_text_field($params['status']));
			
			if (!in_array($status, $valid_statuses)) {
				return new \WP_REST_Response([
					'success' => false,
					'message' => 'Invalid status value'
				], 400);
			}
			
			$update_data['status'] = $status;
			$update_format[] = '%s';
		}

		// Update priority if provided
		if (isset($params['priority'])) {
			$valid_priorities = ['low', 'normal', 'high', 'urgent'];
			$priority = sanitize_text_field($params['priority']);
			
			if (!in_array($priority, $valid_priorities)) {
				return new \WP_REST_Response([
					'success' => false,
					'message' => 'Invalid priority value'
				], 400);
			}
			
			$update_data['priority'] = $priority;
			$update_format[] = '%s';
		}

		// If no valid update fields were provided
		if (empty($update_data)) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'No valid fields to update'
			], 400);
		}

		// Update the ticket
		$updated = $wpdb->update(
			$wpdb->prefix . 'cs_support_tickets',
			$update_data,
			['id' => $ticket_id],
			$update_format,
			['%d']
		);

		if (false === $updated) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to update ticket: ' . $wpdb->last_error
			], 500);
		}

		// Get updated ticket data
		$updated_ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT t.*, u.display_name as user_name, u.user_email 
				FROM {$wpdb->prefix}cs_support_tickets t
				LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
				WHERE t.id = %d",
				$ticket_id
			),
			ARRAY_A
		);

		return new \WP_REST_Response($updated_ticket, 200);
	}
}
