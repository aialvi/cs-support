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

		$cutoff_date = date('Y-m-d H:i:s', strtotime("-{$retention_days} days"));
		
		// Get old tickets
		$old_tickets = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT id, user_id FROM {$wpdb->prefix}cs_support_tickets WHERE created_at < %s",
				$cutoff_date
			)
		);

		foreach ($old_tickets as $ticket) {
			if ($anonymize_instead_delete) {
				// Anonymize the ticket
				$this->anonymize_ticket($ticket->id);
			} else {
				// Delete the ticket and its replies
				$this->delete_ticket($ticket->id);
			}
		}

		// Log the cleanup
		error_log("CS Support: Data retention cleanup completed. Processed " . count($old_tickets) . " old tickets.");
	}

	/**
	 * Anonymize a ticket
	 *
	 * @param int $ticket_id Ticket ID
	 */
	protected function anonymize_ticket(int $ticket_id): void
	{
		global $wpdb;
		
		// Anonymize ticket
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
		
		// Delete replies first
		$wpdb->delete(
			$wpdb->prefix . 'cs_support_replies',
			['ticket_id' => $ticket_id],
			['%d']
		);

		// Delete the ticket
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
		$exporters['cs-support'] = [
			'exporter_friendly_name' => __('CS Support Data', 'cs-support'),
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
		$erasers['cs-support'] = [
			'eraser_friendly_name' => __('CS Support Data', 'cs-support'),
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

		// Get user's tickets
		$tickets = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT * FROM {$wpdb->prefix}cs_support_tickets WHERE user_id = %d OR email = %s",
				$user->ID,
				$email_address
			)
		);

		foreach ($tickets as $ticket) {
			$item_data = [
				[
					'name' => __('Ticket ID', 'cs-support'),
					'value' => $ticket->id,
				],
				[
					'name' => __('Subject', 'cs-support'),
					'value' => $ticket->subject,
				],
				[
					'name' => __('Message', 'cs-support'),
					'value' => $ticket->message,
				],
				[
					'name' => __('Status', 'cs-support'),
					'value' => $ticket->status,
				],
				[
					'name' => __('Priority', 'cs-support'),
					'value' => $ticket->priority,
				],
				[
					'name' => __('Created At', 'cs-support'),
					'value' => $ticket->created_at,
				],
			];

			$data_to_export[] = [
				'group_id' => 'cs-support-tickets',
				'group_label' => __('Support Tickets', 'cs-support'),
				'item_id' => "ticket-{$ticket->id}",
				'data' => $item_data,
			];
		}

		// Get user's replies
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

		foreach ($replies as $reply) {
			$item_data = [
				[
					'name' => __('Ticket Subject', 'cs-support'),
					'value' => $reply->ticket_subject,
				],
				[
					'name' => __('Reply Message', 'cs-support'),
					'value' => $reply->message,
				],
				[
					'name' => __('Created At', 'cs-support'),
					'value' => $reply->created_at,
				],
			];

			$data_to_export[] = [
				'group_id' => 'cs-support-replies',
				'group_label' => __('Support Replies', 'cs-support'),
				'item_id' => "reply-{$reply->id}",
				'data' => $item_data,
			];
		}

		return [
			'data' => $data_to_export,
			'done' => true,
		];
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
			$messages[] = __('Support tickets have been anonymized rather than deleted to maintain support quality records.', 'cs-support');
		} else {
			$messages[] = __('Support tickets and replies have been permanently deleted.', 'cs-support');
		}

		return [
			'items_removed' => $items_removed,
			'items_retained' => $items_retained,
			'messages' => $messages,
			'done' => true,
		];
	}

	/**
	 * Deactivate scheduled events
	 */
	public static function deactivate(): void
	{
		wp_clear_scheduled_hook('cs_support_data_retention_cleanup');
	}
}
