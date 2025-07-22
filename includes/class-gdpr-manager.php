<?php

/**
 * GDPR Manager class.
 *
 * @package cs-support
 */

declare(strict_types=1);

namespace ClientSync\CS_Support;

/**
 * GDPR Manager class.
 */
class GDPR_Manager
{
	/**
	 * Constructor
	 */
	public function __construct()
	{
		// Schedule data retention cleanup
		add_action('init', [$this, 'schedule_data_retention_cleanup']);

		// Hook for the scheduled cleanup
		add_action('cs_support_data_retention_cleanup', [$this, 'run_scheduled_cleanup']);

		// WordPress privacy hooks
		add_filter('wp_privacy_personal_data_exporters', [$this, 'register_data_exporter']);
		add_filter('wp_privacy_personal_data_erasers', [$this, 'register_data_eraser']);
	}

	/**
	 * Schedule data retention cleanup
	 */
	public function schedule_data_retention_cleanup(): void
	{
		if (!wp_next_scheduled('cs_support_data_retention_cleanup')) {
			wp_schedule_event(time(), 'daily', 'cs_support_data_retention_cleanup');
		}
	}

	/**
	 * Run scheduled cleanup
	 */
	public function run_scheduled_cleanup(): void
	{
		$settings = get_option('cs_support_helpdesk_data_retention', []);

		if (empty($settings['enabled']) || empty($settings['auto_cleanup'])) {
			return;
		}

		$this->cleanup_old_data($settings);
	}

	/**
	 * Cleanup old data based on retention settings
	 *
	 * @param array $settings Retention settings
	 */
	protected function cleanup_old_data(array $settings): void
	{
		global $wpdb;

		$retention_days = isset($settings['retention_days']) ? intval($settings['retention_days']) : 730;
		$anonymize_instead_delete = isset($settings['anonymize_instead_delete']) ? $settings['anonymize_instead_delete'] : true;

		if ($retention_days <= 0) {
			return;
		}

		$cutoff_date = gmdate('Y-m-d H:i:s', strtotime("-{$retention_days} days"));

		// Get old tickets (no caching for cleanup operations to ensure data integrity)
		$old_tickets = $this->get_old_tickets($cutoff_date, false);

		foreach ($old_tickets as $ticket) {
			if ($anonymize_instead_delete) {
				// Anonymize the ticket
				$this->anonymize_ticket($ticket->id);
			} else {
				// Delete the ticket and its replies
				$this->delete_ticket($ticket->id);
			}
		}

		// Cleanup completed - log count processed
		// Note: Old tickets processed: count($old_tickets)
	}

	/**
	 * Anonymize a ticket
	 *
	 * @param int $ticket_id Ticket ID
	 */
	protected function anonymize_ticket(int $ticket_id): void
	{
		global $wpdb;

		// Clear any cached GDPR data for this ticket's user
		$this->clear_gdpr_cache_for_ticket($ticket_id);

		// Anonymize ticket
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Required for GDPR compliance, no caching needed for compliance operations
		$wpdb->update(
			$wpdb->prefix . 'cs_support_tickets',
			[
				'email' => 'anonymized@privacy.local',
				'name' => 'Anonymized User',
				'user_id' => 0,
				'subject' => 'Anonymized Ticket',
				'message' => 'This ticket has been anonymized for privacy compliance.'
			],
			['id' => $ticket_id],
			['%s', '%s', '%d', '%s', '%s'],
			['%d']
		);

		// Anonymize replies
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Required for GDPR compliance, no caching needed for compliance operations
		$wpdb->update(
			$wpdb->prefix . 'cs_support_replies',
			[
				'user_id' => 0,
				'author_name' => 'Anonymized User',
				'author_email' => 'anonymized@privacy.local',
				'message' => 'This reply has been anonymized for privacy compliance.'
			],
			['ticket_id' => $ticket_id],
			['%d', '%s', '%s', '%s'],
			['%d']
		);
	}

	/**
	 * Delete a ticket and its replies
	 *
	 * @param int $ticket_id Ticket ID
	 */
	protected function delete_ticket(int $ticket_id): void
	{
		global $wpdb;

		// Clear any cached GDPR data for this ticket's user
		$this->clear_gdpr_cache_for_ticket($ticket_id);

		// Delete replies first
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Required for GDPR compliance, no caching needed for compliance operations
		$wpdb->delete(
			$wpdb->prefix . 'cs_support_replies',
			['ticket_id' => $ticket_id],
			['%d']
		);

		// Delete the ticket
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Required for GDPR compliance, no caching needed for compliance operations
		$wpdb->delete(
			$wpdb->prefix . 'cs_support_tickets',
			['id' => $ticket_id],
			['%d']
		);
	}

	/**
	 * Register data exporter for WordPress privacy tools
	 *
	 * @param array $exporters Existing exporters
	 * @return array Updated exporters
	 */
	public function register_data_exporter(array $exporters): array
	{
		$exporters['clientsync-support'] = [
			'exporter_friendly_name' => __('ClientSync Support Data', 'clientsync-support'),
			'callback' => [$this, 'export_user_data_wp'],
		];

		return $exporters;
	}

	/**
	 * Register data eraser for WordPress privacy tools
	 *
	 * @param array $erasers Existing erasers
	 * @return array Updated erasers
	 */
	public function register_data_eraser(array $erasers): array
	{
		$erasers['clientsync-support'] = [
			'eraser_friendly_name' => __('ClientSync Support Data', 'clientsync-support'),
			'callback' => [$this, 'erase_user_data_wp'],
		];

		return $erasers;
	}

	/**
	 * Export user data for WordPress privacy tools
	 *
	 * @param string $email_address User email address
	 * @param int $page Page number
	 * @return array Export data
	 */
	public function export_user_data_wp(string $email_address, int $page = 1): array
	{
		global $wpdb;

		$data_to_export = [];
		$user = get_user_by('email', $email_address);

		if (!$user) {
			return [
				'data' => $data_to_export,
				'done' => true,
			];
		}

		// Create cache key for user's tickets and replies
		$cache_key = 'cs_support_export_' . md5($email_address . $user->ID);
		$cached_data = wp_cache_get($cache_key, 'cs_support_gdpr');

		if (false !== $cached_data) {
			return $cached_data;
		}

		// Get user's tickets
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Required for GDPR data export
		$tickets = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}cs_support_tickets WHERE user_id = %d OR email = %s",
				$user->ID,
				$email_address
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- GDPR operation, using custom caching mechanism

		foreach ($tickets as $ticket) {
			$item_data = [
				[
					'name' => __('Ticket ID', 'clientsync-support'),
					'value' => $ticket->id,
				],
				[
					'name' => __('Subject', 'clientsync-support'),
					'value' => $ticket->subject,
				],
				[
					'name' => __('Message', 'clientsync-support'),
					'value' => $ticket->message,
				],
				[
					'name' => __('Status', 'clientsync-support'),
					'value' => $ticket->status,
				],
				[
					'name' => __('Priority', 'clientsync-support'),
					'value' => $ticket->priority,
				],
				[
					'name' => __('Created At', 'clientsync-support'),
					'value' => $ticket->created_at,
				],
			];

			$data_to_export[] = [
				'group_id' => 'cs-support-tickets',
				'group_label' => __('Support Tickets', 'clientsync-support'),
				'item_id' => "ticket-{$ticket->id}",
				'data' => $item_data,
			];
		}

		// Get user's replies
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Required for GDPR data export
		$replies = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT r.*, t.subject as ticket_subject 
				FROM {$wpdb->prefix}cs_support_replies r 
				JOIN {$wpdb->prefix}cs_support_tickets t ON r.ticket_id = t.id 
				WHERE r.user_id = %d OR r.author_email = %s",
				$user->ID,
				$email_address
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- GDPR operation, using custom caching mechanism

		foreach ($replies as $reply) {
			$item_data = [
				[
					'name' => __('Ticket Subject', 'clientsync-support'),
					'value' => $reply->ticket_subject,
				],
				[
					'name' => __('Reply Message', 'clientsync-support'),
					'value' => $reply->message,
				],
				[
					'name' => __('Created At', 'clientsync-support'),
					'value' => $reply->created_at,
				],
			];

			$data_to_export[] = [
				'group_id' => 'cs-support-replies',
				'group_label' => __('Support Replies', 'clientsync-support'),
				'item_id' => "reply-{$reply->id}",
				'data' => $item_data,
			];
		}

		$result = [
			'data' => $data_to_export,
			'done' => true,
		];

		// Cache the result for 5 minutes (privacy exports don't change frequently)
		wp_cache_set($cache_key, $result, 'cs_support_gdpr', 300);

		return $result;
	}

	/**
	 * Erase user data for WordPress privacy tools
	 *
	 * @param string $email_address User email address
	 * @param int $page Page number
	 * @return array Erase results
	 */
	public function erase_user_data_wp(string $email_address, int $page = 1): array
	{
		global $wpdb;

		$user = get_user_by('email', $email_address);
		$items_removed = 0;
		$items_retained = 0;
		$messages = [];

		if (!$user) {
			return [
				'items_removed' => $items_removed,
				'items_retained' => $items_retained,
				'messages' => $messages,
				'done' => true,
			];
		}

		$settings = get_option('cs_support_helpdesk_data_retention', []);
		$anonymize_instead_delete = isset($settings['anonymize_instead_delete']) ? $settings['anonymize_instead_delete'] : true;

		// Get user's tickets
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Required for GDPR data erasure, no caching needed for compliance operations
		$tickets = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id FROM {$wpdb->prefix}cs_support_tickets WHERE user_id = %d OR email = %s",
				$user->ID,
				$email_address
			)
		);

		foreach ($tickets as $ticket) {
			if ($anonymize_instead_delete) {
				$this->anonymize_ticket($ticket->id);
				$items_retained++;
			} else {
				$this->delete_ticket($ticket->id);
				$items_removed++;
			}
		}

		if ($anonymize_instead_delete) {
			$messages[] = __('Support tickets have been anonymized rather than deleted to maintain support quality records.', 'clientsync-support');
		} else {
			$messages[] = __('Support tickets and replies have been permanently deleted.', 'clientsync-support');
		}

		return [
			'items_removed' => $items_removed,
			'items_retained' => $items_retained,
			'messages' => $messages,
			'done' => true,
		];
	}

	/**
	 * Get old tickets with optional caching for performance
	 *
	 * @param string $cutoff_date Cutoff date for old tickets
	 * @param bool $use_cache Whether to use caching (default: false for cleanup operations)
	 * @return array Array of old ticket objects
	 */
	protected function get_old_tickets(string $cutoff_date, bool $use_cache = false): array
	{
		global $wpdb;

		if ($use_cache) {
			$cache_key = 'cs_support_old_tickets_' . md5($cutoff_date);
			$cached_tickets = wp_cache_get($cache_key, 'cs_support_cleanup');
			
			if (false !== $cached_tickets) {
				return $cached_tickets;
			}
		}

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery -- Necessary for data retention management
		$old_tickets = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, user_id FROM {$wpdb->prefix}cs_support_tickets WHERE created_at < %s",
				$cutoff_date
			)
		);
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.NoCaching -- Using custom caching with the cache_key

		if ($use_cache && !empty($old_tickets)) {
			// Cache for 1 hour if using cache
			wp_cache_set($cache_key, $old_tickets, 'cs_support_cleanup', 3600);
		}

		return $old_tickets ?: [];
	}

	/**
	 * Clear GDPR cache for a specific ticket
	 *
	 * @param int $ticket_id Ticket ID
	 */
	protected function clear_gdpr_cache_for_ticket(int $ticket_id): void
	{
		global $wpdb;

		// Get the ticket details to find associated users
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Necessary for cache invalidation, this is part of cache management itself
		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT user_id, email FROM {$wpdb->prefix}cs_support_tickets WHERE id = %d",
				$ticket_id
			)
		);

		if ($ticket) {
			// Clear cache for the ticket owner
			if ($ticket->user_id > 0) {
				$user = get_user_by('ID', $ticket->user_id);
				if ($user) {
					$cache_key = 'cs_support_export_' . md5($user->user_email . $user->ID);
					wp_cache_delete($cache_key, 'cs_support_gdpr');
				}
			}

			// Also clear cache for the email address if different
			if ($ticket->email) {
				$cache_key = 'cs_support_export_' . md5($ticket->email . ($ticket->user_id ?: 0));
				wp_cache_delete($cache_key, 'cs_support_gdpr');
			}
		}
	}

	/**
	 * Deactivate scheduled events
	 */
	public static function deactivate(): void
	{
		wp_clear_scheduled_hook('cs_support_data_retention_cleanup');
	}
}
