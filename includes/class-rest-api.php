<?php
// phpcs:ignore WordPress.DB.DirectDatabaseQuery
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

		// GET /tickets/{id} - Get single ticket
		register_rest_route(
			'cs-support/v1',
			'/tickets/(?P<id>\d+)',
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_single_ticket'],
				'permission_callback' => [$this, 'check_ticket_access_permission'],
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

		// PATCH /tickets/{id}/assign - Assign ticket to team member
		register_rest_route(
			'cs-support/v1',
			'/tickets/(?P<id>\d+)/assign',
			[
				'methods' => 'PATCH',
				'callback' => [$this, 'assign_ticket'],
				'permission_callback' => [$this, 'check_assignment_permission'],
			]
		);

		// GET /team-members - Get support team members
		register_rest_route(
			'cs-support/v1',
			'/team-members',
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_team_members'],
				'permission_callback' => [$this, 'check_admin_permission'],
			]
		);

		// GET /team-members/stats - Get team member statistics
		register_rest_route(
			'cs-support/v1',
			'/team-members/stats',
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_team_stats'],
				'permission_callback' => [$this, 'check_admin_permission'],
			]
		);

		// POST /team-members/{id}/assign-role - Assign role to user
		register_rest_route(
			'cs-support/v1',
			'/team-members/(?P<id>\d+)/assign-role',
			[
				'methods' => 'POST',
				'callback' => [$this, 'assign_user_role'],
				'permission_callback' => [$this, 'check_admin_permission'],
			]
		);

		// GET /debug/user-capabilities - Debug current user capabilities
		register_rest_route(
			'cs-support/v1',
			'/debug/user-capabilities',
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_user_capabilities_debug'],
				'permission_callback' => [$this, 'check_permission'],
			]
		);

		// GDPR Compliance endpoints
		// GET /gdpr/my-data - Export user's personal data
		register_rest_route(
			'cs-support/v1',
			'/gdpr/my-data',
			[
				'methods' => 'GET',
				'callback' => [$this, 'export_user_data'],
				'permission_callback' => [$this, 'check_permission'],
			]
		);

		// DELETE /gdpr/my-data - Delete user's personal data
		register_rest_route(
			'cs-support/v1',
			'/gdpr/my-data',
			[
				'methods' => 'DELETE',
				'callback' => [$this, 'delete_user_data'],
				'permission_callback' => [$this, 'check_permission'],
			]
		);

		// GET /gdpr/data-retention - Get data retention settings
		register_rest_route(
			'cs-support/v1',
			'/gdpr/data-retention',
			[
				'methods' => 'GET',
				'callback' => [$this, 'get_data_retention_settings'],
				'permission_callback' => [$this, 'check_admin_permission'],
			]
		);

		// POST /gdpr/data-retention - Update data retention settings
		register_rest_route(
			'cs-support/v1',
			'/gdpr/data-retention',
			[
				'methods' => 'POST',
				'callback' => [$this, 'update_data_retention_settings'],
				'permission_callback' => [$this, 'check_admin_permission'],
			]
		);

		// POST /gdpr/cleanup - Run data cleanup based on retention settings
		register_rest_route(
			'cs-support/v1',
			'/gdpr/cleanup',
			[
				'methods' => 'POST',
				'callback' => [$this, 'run_data_cleanup'],
				'permission_callback' => [$this, 'check_admin_permission'],
			]
		);
	}

	/**
	 * Check basic permissions for REST API access.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool True if user has permission.
	 */
	public function check_permission(\WP_REST_Request $request): bool
	{
		return is_user_logged_in();
	}

	/**
	 * Check permissions for accessing a specific ticket.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool True if user has permission.
	 */
	public function check_ticket_access_permission(\WP_REST_Request $request): bool
	{
		// Admin users can access all tickets
		if (current_user_can('manage_options')) {
			return true;
		}
		
		// Support team members can access all tickets
		if (current_user_can('view_all_tickets') || current_user_can('edit_tickets') || current_user_can('reply_to_tickets')) {
			return true;
		}
		
		// Get ticket details
		$ticket_id = (int) $request->get_param('id');
		if (!$ticket_id) {
			return false;
		}
		
		global $wpdb;
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Permission check for custom table, caching not worth overhead for access control
		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT user_id, assignee_id FROM {$wpdb->prefix}cs_support_tickets WHERE id = %d",
				$ticket_id
			)
		);
		
		if (!$ticket) {
			return false;
		}
		
		$current_user_id = get_current_user_id();
		
		// User owns the ticket or is assigned to it
		return ($ticket->user_id == $current_user_id) || ($ticket->assignee_id == $current_user_id);
	}
	
	/**
	 * Check admin permissions.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool True if user has permission.
	 */
	public function check_admin_permission(\WP_REST_Request $request): bool
	{
		return current_user_can('manage_options') || current_user_can('edit_tickets');
	}

	/**
	 * Check permissions for ticket assignment operations.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool True if user has permission.
	 */
	public function check_assignment_permission(\WP_REST_Request $request): bool
	{
		return current_user_can('manage_options') || current_user_can('edit_tickets') || current_user_can('assign_tickets');
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

		// Get current settings to compare
		$current_settings = get_option('cs_support_helpdesk_settings', []);
		
		// Update the option - update_option returns false if the value is the same
		// So we need to check if it actually failed or if the values were just identical
		$updated = update_option('cs_support_helpdesk_settings', $sanitized_settings);
		
		// If update_option returned false, check if it's because the values are the same
		if (!$updated) {
			$new_current_settings = get_option('cs_support_helpdesk_settings', []);
			// If the settings match what we tried to save, then the update was successful
			if ($new_current_settings === $sanitized_settings || json_encode($new_current_settings) === json_encode($sanitized_settings)) {
				$updated = true;
			}
		}

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

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table insert, no WordPress equivalent
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

		// Get redirect URL if set in settings
		$redirect_url = '';
		if (!empty($settings['general']['redirectPage'])) {
			$redirect_url = get_permalink($settings['general']['redirectPage']);
		}

		$response_data = [
			'success' => true,
			'ticket_id' => $wpdb->insert_id
		];

		if ($redirect_url) {
			$response_data['redirect_url'] = $redirect_url;
		}

		return new \WP_REST_Response($response_data, 201);
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

		// Execute query based on user permissions with proper preparation
		if ($user_param && current_user_can('manage_options')) {
			// Admin requesting specific user's tickets
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$tickets = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT t.*, u.display_name as user_name, u.user_email,
					        a.display_name as assignee_name, a.user_email as assignee_email
					 FROM {$wpdb->prefix}cs_support_tickets t
					 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
					 LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
					 WHERE t.user_id = %d
					 ORDER BY t.created_at DESC",
					$user_param
				),
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Tickets regularly change, caching would add overhead
				ARRAY_A
			);
		} elseif (current_user_can('manage_options')) {
			// Admin can see all tickets (no additional filter)
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table query for admin dashboard
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Tickets regularly change, caching would add overhead
			$tickets = $wpdb->get_results(
				"SELECT t.*, u.display_name as user_name, u.user_email,
				        a.display_name as assignee_name, a.user_email as assignee_email
				 FROM {$wpdb->prefix}cs_support_tickets t
				 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
				 LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
				 ORDER BY t.created_at DESC",
				ARRAY_A
			);
		} elseif (current_user_can('view_all_tickets') || current_user_can('edit_tickets') || current_user_can('reply_to_tickets')) {
			// Support team members can see:
			// 1. Tickets assigned to them
			// 2. Unassigned tickets 
			// 3. Their own tickets (if they created any)
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table query for support team access
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Tickets regularly change, caching would add overhead
			$tickets = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT t.*, u.display_name as user_name, u.user_email,
					        a.display_name as assignee_name, a.user_email as assignee_email
					 FROM {$wpdb->prefix}cs_support_tickets t
					 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
					 LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
					 WHERE (t.assignee_id = %d OR t.assignee_id IS NULL OR t.user_id = %d)
					 ORDER BY t.created_at DESC",
					$current_user_id,
					$current_user_id
				),
				ARRAY_A
			);
		} else {
			// Regular users can only see their own tickets
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table query for user's own tickets
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Tickets regularly change, caching would add overhead
			$tickets = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT t.*, u.display_name as user_name, u.user_email,
					        a.display_name as assignee_name, a.user_email as assignee_email
					 FROM {$wpdb->prefix}cs_support_tickets t
					 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
					 LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
					 WHERE t.user_id = %d
					 ORDER BY t.created_at DESC",
					$current_user_id
				),
				ARRAY_A
			);
		}

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

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table query to get single ticket
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Single ticket query, caching not necessary
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
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Simple existence check for custom table, no need for caching
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

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table insert for ticket reply
		$inserted = $wpdb->insert(
			$wpdb->prefix . 'cs_support_ticket_replies',
			$data,
			['%d', '%d', '%s', '%s', '%d']
		);

		if (false === $inserted) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to add reply'
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

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table query for ticket replies
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Replies regularly change, caching would add overhead
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
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table query to validate ticket existence
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Single ticket validation, caching not necessary
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
		$status_changed = false;
		$old_status = $ticket['status'];

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
			
			if ($status !== $old_status) {
				$status_changed = true;
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
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table update operation, no caching needed for updates
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

		// Add system note for status change
		if ($status_changed) {
			$system_note = sprintf(
				'Status changed from %s to %s',
				$old_status,
				$update_data['status']
			);

			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table insert for system note
			$wpdb->insert(
				$wpdb->prefix . 'cs_support_ticket_replies',
				[
					'ticket_id' => $ticket_id,
					'user_id' => get_current_user_id(),
					'reply' => $system_note,
					'created_at' => current_time('mysql'),
					'is_system_note' => 1,
				],
				['%d', '%d', '%s', '%s', '%d']
			);

			// Send status change notification
			$notifications = new Notifications(get_plugin_instance());
			$notifications->send_status_change_notification(
				$ticket_id,
				$old_status,
				$update_data['status'],
				get_current_user_id()
			);
		}

		// Get updated ticket data
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Custom table query to get updated ticket
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Single ticket query for response, caching not necessary
		$updated_ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT t.*, u.display_name as user_name, u.user_email,
				        a.display_name as assignee_name, a.user_email as assignee_email
				FROM {$wpdb->prefix}cs_support_tickets t
				LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
				LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
				WHERE t.id = %d",
				$ticket_id
			),
			ARRAY_A
		);

		return new \WP_REST_Response($updated_ticket, 200);
	}

	/**
	 * Assign ticket to a team member.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function assign_ticket(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		$ticket_id = (int) $request->get_param('id');
		$params = $request->get_json_params();

		if (!isset($params['assignee_id'])) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Assignee ID is required'
			], 400);
		}

		$assignee_id = (int) $params['assignee_id'];
		$current_user_id = get_current_user_id();

		// Validate ticket exists - custom table, no WordPress equivalent for ticket validation
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
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

		// Validate assignee exists and can handle tickets
		$team_members = new Team_Members(get_plugin_instance());
		if (!$team_members->can_be_assigned_tickets($assignee_id)) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Invalid assignee - user cannot handle tickets'
			], 400);
		}

		$old_assignee_id = $ticket['assignee_id'];

		// Update ticket assignment - custom table update, no WordPress equivalent
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table update for ticket assignment, no caching needed for updates
		$updated = $wpdb->update(
			$wpdb->prefix . 'cs_support_tickets',
			['assignee_id' => $assignee_id],
			['id' => $ticket_id],
			['%d'],
			['%d']
		);

		if (false === $updated) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to assign ticket: ' . $wpdb->last_error
			], 500);
		}

		// Add system note about assignment
		$assignee = get_user_by('ID', $assignee_id);
		$assigner = get_user_by('ID', $current_user_id);
		
		$system_note = '';
		if ($old_assignee_id && $old_assignee_id != $assignee_id) {
			$old_assignee = get_user_by('ID', $old_assignee_id);
			$system_note = sprintf(
				'Ticket reassigned from %s to %s by %s',
				$old_assignee ? $old_assignee->display_name : 'Unknown',
				$assignee->display_name,
				$assigner->display_name
			);
		} else {
			$system_note = sprintf(
				'Ticket assigned to %s',
				$assignee->display_name,
			);
		}

		// Insert system note for assignment - custom table insert, no WordPress equivalent
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table insert for system note, no caching needed for inserts
		$wpdb->insert(
			$wpdb->prefix . 'cs_support_ticket_replies',
			[
				'ticket_id' => $ticket_id,
				'user_id' => $current_user_id,
				'reply' => $system_note,
				'created_at' => current_time('mysql'),
				'is_system_note' => 1,
			],
			['%d', '%d', '%s', '%s', '%d']
		);

		// Send notification emails
		$notifications = new Notifications(get_plugin_instance());
		
		if ($old_assignee_id && $old_assignee_id != $assignee_id) {
			// This is a reassignment
			$notifications->send_reassignment_notification(
				$ticket_id,
				$old_assignee_id,
				$assignee_id,
				$current_user_id
			);
		} else {
			// This is a new assignment
			$notifications->send_assignment_notification(
				$ticket_id,
				$assignee_id,
				$current_user_id
			);
		}

		// Get updated ticket data for response - custom table query, no WordPress equivalent
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$updated_ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT t.*, u.display_name as user_name, u.user_email,
				        a.display_name as assignee_name, a.user_email as assignee_email
				FROM {$wpdb->prefix}cs_support_tickets t
				LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
				LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
				WHERE t.id = %d",
				$ticket_id
			),
			ARRAY_A
		);

		return new \WP_REST_Response([
			'success' => true,
			'message' => 'Ticket assigned successfully',
			'ticket' => $updated_ticket
		], 200);
	}

	/**
	 * Get support team members.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_team_members(\WP_REST_Request $request): \WP_REST_Response
	{
		$team_members = new Team_Members(get_plugin_instance());
		$members = $team_members->get_support_team_members();

		return new \WP_REST_Response($members, 200);
	}

	/**
	 * Get team member statistics.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_team_stats(\WP_REST_Request $request): \WP_REST_Response
	{
		$team_members = new Team_Members(get_plugin_instance());
		$stats = $team_members->get_team_statistics();

		return new \WP_REST_Response($stats, 200);
	}

	/**
	 * Get single ticket with proper permission checking.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_single_ticket(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;

		$ticket_id = (int) $request->get_param('id');

		// Get single ticket with user details - custom table query, no WordPress equivalent
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT t.*, u.display_name as user_name, u.user_email,
				        a.display_name as assignee_name, a.user_email as assignee_email
				 FROM {$wpdb->prefix}cs_support_tickets t
				 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
				 LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
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

	// The check_ticket_access_permission method is already defined earlier in this class
	
	/**
	 * Assign role to user.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function assign_user_role(\WP_REST_Request $request): \WP_REST_Response
	{
		$user_id = (int) $request->get_param('id');
		$params = $request->get_json_params();

		if (!isset($params['role'])) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Role is required'
			], 400);
		}

		$role = sanitize_text_field($params['role']);
		$team_members = new Team_Members(get_plugin_instance());
		
		$success = $team_members->assign_role_to_user($user_id, $role);

		if (!$success) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Failed to assign role - invalid user or role'
			], 400);
		}

		return new \WP_REST_Response([
			'success' => true,
			'message' => 'Role assigned successfully'
		], 200);
	}

	/**
	 * Get current user capabilities for debugging.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function get_user_capabilities_debug(\WP_REST_Request $request): \WP_REST_Response
	{
		$team_members = new Team_Members(get_plugin_instance());
		$debug_info = $team_members->get_current_user_debug_info();

		return new \WP_REST_Response($debug_info, 200);
	}

	/**
	 * Export user's personal data.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function export_user_data(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;
		$user_id = get_current_user_id();
		$user = get_user_by('ID', $user_id);
		
		if (!$user) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'User not found'
			], 404);
		}

		// Get user's tickets - custom table query for GDPR export, no WordPress equivalent
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$tickets = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}cs_support_tickets WHERE user_id = %d ORDER BY created_at DESC",
				$user_id
			),
			ARRAY_A
		);

		// Get user's replies - custom table query for GDPR export, no WordPress equivalent  
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
		$replies = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT r.*, t.subject as ticket_subject 
				FROM {$wpdb->prefix}cs_support_ticket_replies r 
				JOIN {$wpdb->prefix}cs_support_tickets t ON r.ticket_id = t.id 
				WHERE r.user_id = %d ORDER BY r.created_at DESC",
				$user_id
			),
			ARRAY_A
		);

		$export_data = [
			'user_info' => [
				'user_id' => $user->ID,
				'username' => $user->user_login,
				'email' => $user->user_email,
				'display_name' => $user->display_name,
				'registration_date' => $user->user_registered
			],
			'tickets' => $tickets,
			'replies' => $replies,
			'export_date' => current_time('mysql'),
			'export_format' => 'JSON'
		];

		// Set headers for file download
		$filename = 'cs-support-data-export-' . $user_id . '-' . gmdate('Y-m-d-H-i-s') . '.json';
		
		return new \WP_REST_Response([
			'success' => true,
			'data' => $export_data,
			'filename' => $filename,
			'message' => 'Data exported successfully'
		], 200);
	}

	/**
	 * Delete user's personal data.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function delete_user_data(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;
		$user_id = get_current_user_id();
		$deletion_type = $request->get_param('type') ?: 'anonymize'; // 'anonymize' or 'delete'
		
		$deletion_stats = [
			'tickets_affected' => 0,
			'replies_affected' => 0,
			'action_taken' => $deletion_type
		];

		if ($deletion_type === 'anonymize') {
			// Anonymize tickets (keep content but remove personal identifiers)
			// Note: Only anonymize user_id since we don't have separate email/name fields in tickets table
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table update for GDPR compliance, no caching needed for updates
			$tickets_updated = $wpdb->update(
				$wpdb->prefix . 'cs_support_tickets',
				[
					'user_id' => 0  // Set to 0 to anonymize
				],
				['user_id' => $user_id],
				['%d'],
				['%d']
			);
			$deletion_stats['tickets_affected'] = $tickets_updated;

			// Anonymize replies - just set user_id to 0 since we don't have author_name/email fields
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table update for GDPR compliance, no caching needed for updates
			$replies_updated = $wpdb->update(
				$wpdb->prefix . 'cs_support_ticket_replies',
				[
					'user_id' => 0
				],
				['user_id' => $user_id],
				['%d'],
				['%d']
			);
			$deletion_stats['replies_affected'] = $replies_updated;
			
		} else if ($deletion_type === 'delete') {
			// Get user's tickets for reply deletion
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table query for user data deletion, caching not necessary
			$user_tickets = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT id FROM {$wpdb->prefix}cs_support_tickets WHERE user_id = %d",
					$user_id
				)
			);

			// Delete replies first
			foreach ($user_tickets as $ticket_id) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table delete for GDPR compliance, no caching needed for deletes
				$replies_deleted = $wpdb->delete(
					$wpdb->prefix . 'cs_support_ticket_replies',
					['ticket_id' => $ticket_id],
					['%d']
				);
				$deletion_stats['replies_affected'] += $replies_deleted;
			}

			// Delete tickets - custom table delete for GDPR compliance
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table delete for GDPR compliance, no caching needed for deletes
			$tickets_deleted = $wpdb->delete(
				$wpdb->prefix . 'cs_support_tickets',
				['user_id' => $user_id],
				['%d']
			);
			$deletion_stats['tickets_affected'] = $tickets_deleted;
		}

		return new \WP_REST_Response([
			'success' => true,
			'message' => ucfirst($deletion_type) . ' completed successfully',
			'stats' => $deletion_stats
		], 200);
	}

	/**
	 * Get data retention settings.
	 *
	 * @return \WP_REST_Response
	 */
	public function get_data_retention_settings(): \WP_REST_Response
	{
		$settings = get_option('cs_support_helpdesk_data_retention', [
			'enabled' => false,
			'retention_days' => 730, // 2 years default
			'auto_cleanup' => false,
			'notify_before_days' => 30,
			'anonymize_instead_delete' => true
		]);
		
		// Convert to camelCase for frontend
		$camelCaseSettings = [
			'enabled' => $settings['enabled'],
			'retentionDays' => $settings['retention_days'],
			'autoCleanup' => $settings['auto_cleanup'],
			'notifyBeforeDays' => $settings['notify_before_days'],
			'anonymizeInsteadDelete' => $settings['anonymize_instead_delete']
		];
		
		return new \WP_REST_Response($camelCaseSettings, 200);
	}

	/**
	 * Update data retention settings.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function update_data_retention_settings(\WP_REST_Request $request): \WP_REST_Response
	{
		$settings = $request->get_json_params();
		$sanitized_settings = [];

		// Sanitize settings - handle both camelCase (from frontend) and snake_case
		if (isset($settings['enabled'])) {
			$sanitized_settings['enabled'] = (bool) $settings['enabled'];
		}
		
		if (isset($settings['retentionDays'])) {
			$sanitized_settings['retention_days'] = max(30, intval($settings['retentionDays'])); // Minimum 30 days
		} elseif (isset($settings['retention_days'])) {
			$sanitized_settings['retention_days'] = max(30, intval($settings['retention_days'])); // Minimum 30 days
		}
		
		if (isset($settings['autoCleanup'])) {
			$sanitized_settings['auto_cleanup'] = (bool) $settings['autoCleanup'];
		} elseif (isset($settings['auto_cleanup'])) {
			$sanitized_settings['auto_cleanup'] = (bool) $settings['auto_cleanup'];
		}
		
		if (isset($settings['notifyBeforeDays'])) {
			$sanitized_settings['notify_before_days'] = max(1, intval($settings['notifyBeforeDays'])); // Minimum 1 day
		} elseif (isset($settings['notify_before_days'])) {
			$sanitized_settings['notify_before_days'] = max(1, intval($settings['notify_before_days'])); // Minimum 1 day
		}
		
		if (isset($settings['anonymizeInsteadDelete'])) {
			$sanitized_settings['anonymize_instead_delete'] = (bool) $settings['anonymizeInsteadDelete'];
		} elseif (isset($settings['anonymize_instead_delete'])) {
			$sanitized_settings['anonymize_instead_delete'] = (bool) $settings['anonymize_instead_delete'];
		}

		// Get current settings to compare
		$current_settings = get_option('cs_support_helpdesk_data_retention', []);
		
		// Update the option - update_option returns false if the value is the same
		$updated = update_option('cs_support_helpdesk_data_retention', $sanitized_settings);
		
		// If update_option returned false, check if it's because the values are the same
		if (!$updated) {
			$new_current_settings = get_option('cs_support_helpdesk_data_retention', []);
			// If the settings match what we tried to save, then the update was successful
			if ($new_current_settings === $sanitized_settings || json_encode($new_current_settings) === json_encode($sanitized_settings)) {
				$updated = true;
			}
		}

		return new \WP_REST_Response([
			'success' => $updated,
			'message' => $updated ? 'Data retention settings updated successfully' : 'Failed to update data retention settings'
		], $updated ? 200 : 500);
	}

	/**
	 * Run data cleanup based on retention settings.
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return \WP_REST_Response
	 */
	public function run_data_cleanup(\WP_REST_Request $request): \WP_REST_Response
	{
		global $wpdb;
		
		$retention_settings = get_option('cs_support_helpdesk_data_retention', []);
		$cleanup_stats = [
			'tickets_deleted' => 0,
			'replies_deleted' => 0,
			'attachments_deleted' => 0
		];

		// Default retention period: 2 years
		$retention_days = isset($retention_settings['retention_days']) ? intval($retention_settings['retention_days']) : 730;
		
		if ($retention_days > 0) {
			$cutoff_date = gmdate('Y-m-d H:i:s', strtotime("-{$retention_days} days"));
			
			// Delete old tickets - custom table query for data retention cleanup
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
			$old_tickets = $wpdb->get_results(
				$wpdb->prepare(
					"SELECT id FROM {$wpdb->prefix}cs_support_tickets WHERE created_at < %s",
					$cutoff_date
				)
			);
			
			foreach ($old_tickets as $ticket) {
				// Delete replies first - custom table delete for data retention cleanup
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table delete for data retention cleanup, no caching needed for deletes
				$replies_deleted = $wpdb->delete(
					$wpdb->prefix . 'cs_support_ticket_replies',
					['ticket_id' => $ticket->id],
					['%d']
				);
				$cleanup_stats['replies_deleted'] += $replies_deleted;
				
				// Delete the ticket - custom table delete for data retention cleanup
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Custom table delete for data retention cleanup, no caching needed for deletes
				$ticket_deleted = $wpdb->delete(
					$wpdb->prefix . 'cs_support_tickets',
					['id' => $ticket->id],
					['%d']
				);
				if ($ticket_deleted) {
					$cleanup_stats['tickets_deleted']++;
				}
			}
		}

		return new \WP_REST_Response([
			'success' => true,
			'message' => 'Data cleanup completed successfully',
			'stats' => $cleanup_stats
		], 200);
	}
}
