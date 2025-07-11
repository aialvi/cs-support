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
	 * Check if user can assign tickets.
	 *
	 * @return bool
	 */
	public function check_assignment_permission(): bool
	{
		return current_user_can('assign_tickets') || current_user_can('manage_options');
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

		// Build WHERE clause based on user permissions
		$where_conditions = [];
		
		if ($user_param && current_user_can('manage_options')) {
			// Admin requesting specific user's tickets
			$where_conditions[] = $wpdb->prepare("t.user_id = %d", $user_param);
		} elseif (current_user_can('manage_options')) {
			// Admin can see all tickets (no additional filter)
		} elseif (current_user_can('view_all_tickets') || current_user_can('edit_tickets') || current_user_can('reply_to_tickets')) {
			// Support team members can see:
			// 1. Tickets assigned to them
			// 2. Unassigned tickets 
			// 3. Their own tickets (if they created any)
			$where_conditions[] = $wpdb->prepare(
				"(t.assignee_id = %d OR t.assignee_id IS NULL OR t.user_id = %d)",
				$current_user_id,
				$current_user_id
			);
		} else {
			// Regular users can only see their own tickets
			$where_conditions[] = $wpdb->prepare("t.user_id = %d", $current_user_id);
		}

		$where_clause = '';
		if (!empty($where_conditions)) {
			$where_clause = 'WHERE ' . implode(' AND ', $where_conditions);
		}

		$tickets = $wpdb->get_results(
			"SELECT t.*, u.display_name as user_name, u.user_email,
			        a.display_name as assignee_name, a.user_email as assignee_email
			 FROM {$wpdb->prefix}cs_support_tickets t
			 LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
			 LEFT JOIN {$wpdb->users} a ON t.assignee_id = a.ID
			 $where_clause
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

		// Validate assignee exists and can handle tickets
		$team_members = new Team_Members(get_plugin_instance());
		if (!$team_members->can_be_assigned_tickets($assignee_id)) {
			return new \WP_REST_Response([
				'success' => false,
				'message' => 'Invalid assignee - user cannot handle tickets'
			], 400);
		}

		$old_assignee_id = $ticket['assignee_id'];

		// Update ticket assignment
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

		// Get updated ticket data
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

	/**
	 * Check if user can access a specific ticket
	 *
	 * @param \WP_REST_Request $request Request object.
	 * @return bool
	 */
	public function check_ticket_access_permission(\WP_REST_Request $request): bool
	{
		if (!is_user_logged_in()) {
			return false;
		}

		$ticket_id = (int) $request->get_param('id');
		$current_user_id = get_current_user_id();

		// Admins can access all tickets
		if (current_user_can('manage_options')) {
			return true;
		}

		// Support team members can access tickets
		if (current_user_can('view_all_tickets') || current_user_can('edit_tickets') || current_user_can('reply_to_tickets')) {
			return true;
		}

		// Check if user is the ticket owner or assignee
		global $wpdb;
		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT user_id, assignee_id FROM {$wpdb->prefix}cs_support_tickets WHERE id = %d",
				$ticket_id
			),
			ARRAY_A
		);

		if (!$ticket) {
			return false;
		}

		// User owns the ticket or is assigned to it
		return ($ticket['user_id'] == $current_user_id) || ($ticket['assignee_id'] == $current_user_id);
	}

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
}
