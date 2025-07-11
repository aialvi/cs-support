<?php
/**
 * Team Members class for managing support staff.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

class Team_Members
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
		add_action('init', [$this, 'create_support_roles']);
		add_action('wp_loaded', [$this, 'maybe_create_support_roles']);
	}

	/**
	 * Create support team roles.
	 *
	 * @return void
	 */
	public function create_support_roles(): void
	{
		// Support Agent role - can handle tickets, reply to them
		add_role(
			'support_agent',
			__('Support Agent', 'cs-support'),
			[
				'read' => true,
				'edit_tickets' => true,
				'reply_to_tickets' => true,
				'view_all_tickets' => true,
				'update_ticket_status' => true,
			]
		);

		// Support Manager role - can do everything agents can plus assign tickets
		add_role(
			'support_manager',
			__('Support Manager', 'cs-support'),
			[
				'read' => true,
				'edit_tickets' => true,
				'reply_to_tickets' => true,
				'view_all_tickets' => true,
				'update_ticket_status' => true,
				'assign_tickets' => true,
				'manage_support_team' => true,
			]
		);

		// Add capabilities to Administrator role
		$admin_role = get_role('administrator');
		if ($admin_role) {
			$admin_role->add_cap('edit_tickets');
			$admin_role->add_cap('reply_to_tickets');
			$admin_role->add_cap('view_all_tickets');
			$admin_role->add_cap('update_ticket_status');
			$admin_role->add_cap('assign_tickets');
			$admin_role->add_cap('manage_support_team');
			$admin_role->add_cap('delete_tickets');
			$admin_role->add_cap('create_tickets');
		}
	}

	/**
	 * Maybe create support roles if they don't exist.
	 * 
	 * @return void
	 */
	public function maybe_create_support_roles(): void
	{
		if (!get_role('support_agent') || !get_role('support_manager')) {
			$this->create_support_roles();
		}
	}

	/**
	 * Get all support team members.
	 *
	 * @return array Array of user objects who can handle tickets.
	 */
	public function get_support_team_members(): array
	{
		// Query users directly by roles - more efficient than meta queries
		$users = get_users([
			'role__in' => ['support_agent', 'support_manager', 'administrator'],
		]);

		// Process user data
		$unique_members = [];
		$seen_ids = [];

		foreach ($users as $member) {
			if (!in_array($member->ID, $seen_ids)) {
				$unique_members[] = [
					'ID' => $member->ID,
					'display_name' => $member->display_name,
					'user_email' => $member->user_email,
					'roles' => $member->roles,
					'avatar_url' => get_avatar_url($member->ID, ['size' => 32])
				];
				$seen_ids[] = $member->ID;
			}
		}

		return $unique_members;
	}

	/**
	 * Check if user can be assigned tickets.
	 *
	 * @param int $user_id User ID to check.
	 * @return bool True if user can be assigned tickets.
	 */
	public function can_be_assigned_tickets(int $user_id): bool
	{
		$user = get_user_by('ID', $user_id);
		if (!$user) {
			return false;
		}

		return user_can($user, 'edit_tickets') || 
			   user_can($user, 'reply_to_tickets') || 
			   user_can($user, 'manage_options');
	}

	/**
	 * Get user's assigned ticket count.
	 *
	 * @param int $user_id User ID.
	 * @return int Number of assigned tickets.
	 */
	public function get_assigned_ticket_count(int $user_id): int
	{
		global $wpdb;

		// Cache key for this specific user's assigned ticket count
		$cache_key = 'cs_support_assigned_tickets_' . $user_id;
		$count = wp_cache_get($cache_key, 'cs_support_ticket_counts');
		
		if (false === $count) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
			$count = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT COUNT(*) FROM {$wpdb->prefix}cs_support_tickets 
					WHERE assignee_id = %d AND status NOT IN ('RESOLVED', 'CLOSED')",
					$user_id
				)
			);
			
			// Cache for 5 minutes
			wp_cache_set($cache_key, $count, 'cs_support_ticket_counts', 5 * MINUTE_IN_SECONDS);
		}

		return (int) $count;
	}

	/**
	 * Get team member statistics.
	 *
	 * @return array Team statistics.
	 */
	public function get_team_statistics(): array
	{
		$team_members = $this->get_support_team_members();
		$stats = [];

		foreach ($team_members as $member) {
			$stats[] = [
				'user' => $member,
				'assigned_tickets' => $this->get_assigned_ticket_count($member['ID']),
				'resolved_this_month' => $this->get_resolved_tickets_this_month($member['ID']),
			];
		}

		return $stats;
	}

	/**
	 * Get resolved tickets count for this month.
	 *
	 * @param int $user_id User ID.
	 * @return int Number of resolved tickets this month.
	 */
	private function get_resolved_tickets_this_month(int $user_id): int
	{
		global $wpdb;

		$start_of_month = gmdate('Y-m-01 00:00:00');
		$end_of_month = gmdate('Y-m-t 23:59:59');

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Statistical data that changes frequently, no caching needed for monthly reports
		$count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->prefix}cs_support_tickets 
				WHERE assignee_id = %d 
				AND status = 'RESOLVED' 
				AND updated_at BETWEEN %s AND %s",
				$user_id,
				$start_of_month,
				$end_of_month
			)
		);

		return (int) $count;
	}

	/**
	 * Assign a support role to a user.
	 *
	 * @param int $user_id User ID.
	 * @param string $role Role to assign (support_agent, support_manager, or remove).
	 * @return bool True on success, false on failure.
	 */
	public function assign_role_to_user(int $user_id, string $role): bool
	{
		$user = get_user_by('ID', $user_id);
		if (!$user) {
			return false;
		}

		// Valid support roles
		$valid_roles = ['support_agent', 'support_manager'];
		
		if ($role === 'remove') {
			// Remove support roles but keep existing roles
			$user->remove_role('support_agent');
			$user->remove_role('support_manager');
			return true;
		}

		if (!in_array($role, $valid_roles)) {
			return false;
		}

		// Remove any existing support roles first
		$user->remove_role('support_agent');
		$user->remove_role('support_manager');
		
		// Add the new role (keeping existing roles)
		$user->add_role($role);
		
		return true;
	}

	/**
	 * Get current user's support capabilities for debugging.
	 *
	 * @return array Current user capabilities.
	 */
	public function get_current_user_debug_info(): array
	{
		$current_user = wp_get_current_user();
		
		return [
			'user_id' => $current_user->ID,
			'username' => $current_user->user_login,
			'roles' => $current_user->roles,
			'capabilities' => [
				'manage_options' => current_user_can('manage_options'),
				'view_all_tickets' => current_user_can('view_all_tickets'),
				'edit_tickets' => current_user_can('edit_tickets'),
				'reply_to_tickets' => current_user_can('reply_to_tickets'),
				'assign_tickets' => current_user_can('assign_tickets'),
				'update_ticket_status' => current_user_can('update_ticket_status'),
			]
		];
	}
}
