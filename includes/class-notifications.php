<?php
/**
 * Notification system for sending email alerts.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

class Notifications
{
    /**
     * Plugin instance.
     *
     * @var Plugin
     */
    protected $plugin;

    /**
     * Notification settings instance.
     *
     * @var Notification_Settings
     */
    protected $settings;

    /**
     * Constructor.
     *
     * @param Plugin $plugin Plugin instance.
     */
    public function __construct(Plugin $plugin)
    {
        $this->plugin = $plugin;
        $this->settings = new Notification_Settings($plugin);
    }

    /**
     * Send ticket assignment notification.
     *
     * @param int $ticket_id Ticket ID.
     * @param int $assignee_id Assignee user ID.
     * @param int $assigned_by_id User ID who assigned the ticket.
     * @return bool True if email was sent successfully.
     */
    public function send_assignment_notification(int $ticket_id, int $assignee_id, int $assigned_by_id): bool
    {
        // Check if assignment notifications are enabled
        if (!$this->settings->is_notification_enabled('assignment_notifications')) {
            return true; // Consider it successful if disabled
        }

        $ticket = $this->get_ticket_details($ticket_id);
        if (!$ticket) {
            return false;
        }

        $assignee = get_user_by('ID', $assignee_id);
        $assigned_by = get_user_by('ID', $assigned_by_id);

        if (!$assignee || !$assigned_by) {
            return false;
        }

        $subject = sprintf(
            // translators: %1$s: site name, %2$d: ticket ID
            __('[%1$s] Ticket #%2$d has been assigned to you', 'clientsync-support'),
            get_bloginfo('name'),
            $ticket_id
        );

        $message = $this->get_assignment_email_template([
            'ticket' => $ticket,
            'assignee' => $assignee,
            'assigned_by' => $assigned_by,
            'site_name' => get_bloginfo('name'),
            'ticket_url' => $this->get_ticket_admin_url($ticket_id)
        ]);

        $headers = $this->settings->get_email_headers();

        $result = wp_mail($assignee->user_email, $subject, $message, $headers);

        return $result;
    }

    /**
     * Send ticket reassignment notification.
     *
     * @param int $ticket_id Ticket ID.
     * @param int $old_assignee_id Previous assignee user ID.
     * @param int $new_assignee_id New assignee user ID.
     * @param int $reassigned_by_id User ID who reassigned the ticket.
     * @return bool True if emails were sent successfully.
     */
    public function send_reassignment_notification(int $ticket_id, int $old_assignee_id, int $new_assignee_id, int $reassigned_by_id): bool
    {
        $ticket = $this->get_ticket_details($ticket_id);
        if (!$ticket) {
            return false;
        }

        $new_assignee = get_user_by('ID', $new_assignee_id);
        $old_assignee = get_user_by('ID', $old_assignee_id);
        $reassigned_by = get_user_by('ID', $reassigned_by_id);

        if (!$new_assignee || !$reassigned_by) {
            return false;
        }

        $success = true;

        // Send notification to new assignee
        $subject_new = sprintf(
            // translators: %1$s: site name, %2$d: ticket ID
            __('[%1$s] Ticket #%2$d has been reassigned to you', 'clientsync-support'),
            get_bloginfo('name'),
            $ticket_id
        );

        $message_new = $this->get_reassignment_email_template([
            'ticket' => $ticket,
            'assignee' => $new_assignee,
            'old_assignee' => $old_assignee,
            'reassigned_by' => $reassigned_by,
            'site_name' => get_bloginfo('name'),
            'ticket_url' => $this->get_ticket_admin_url($ticket_id),
            'type' => 'new_assignee'
        ]);

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . get_bloginfo('name') . ' <' . get_option('admin_email') . '>'
        ];

        $success &= wp_mail($new_assignee->user_email, $subject_new, $message_new, $headers);

        // Send notification to old assignee if different and exists
        if ($old_assignee && $old_assignee_id !== $new_assignee_id) {
            $subject_old = sprintf(
                // translators: %1$s: site name, %2$d: ticket ID
                __('[%1$s] Ticket #%2$d has been reassigned', 'clientsync-support'),
                get_bloginfo('name'),
                $ticket_id
            );

            $message_old = $this->get_reassignment_email_template([
                'ticket' => $ticket,
                'assignee' => $old_assignee,
                'new_assignee' => $new_assignee,
                'reassigned_by' => $reassigned_by,
                'site_name' => get_bloginfo('name'),
                'ticket_url' => $this->get_ticket_admin_url($ticket_id),
                'type' => 'old_assignee'
            ]);

            $success &= wp_mail($old_assignee->user_email, $subject_old, $message_old, $headers);
        }

        return $success;
    }

    /**
     * Send ticket status change notification.
     *
     * @param int $ticket_id Ticket ID.
     * @param string $old_status Previous status.
     * @param string $new_status New status.
     * @param int $changed_by_id User ID who changed the status.
     * @return bool True if email was sent successfully.
     */
    public function send_status_change_notification(int $ticket_id, string $old_status, string $new_status, int $changed_by_id): bool
    {
        $ticket = $this->get_ticket_details($ticket_id);
        if (!$ticket) {
            return false;
        }

        // Send to customer who created the ticket
        $customer = get_user_by('ID', $ticket['user_id']);
        if (!$customer) {
            return false;
        }

        $subject = sprintf(
            // translators: %1$s: site name, %2$d: ticket ID
            __('[%1$s] Your ticket #%2$d status has been updated', 'clientsync-support'),
            get_bloginfo('name'),
            $ticket_id
        );

        $message = $this->get_status_change_email_template([
            'ticket' => $ticket,
            'customer' => $customer,
            'old_status' => $old_status,
            'new_status' => $new_status,
            'site_name' => get_bloginfo('name'),
            'ticket_url' => $this->get_ticket_customer_url($ticket_id)
        ]);

        $headers = [
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . get_bloginfo('name') . ' <' . get_option('admin_email') . '>'
        ];

        return wp_mail($customer->user_email, $subject, $message, $headers);
    }

    /**
     * Get ticket details for notifications.
     *
     * @param int $ticket_id Ticket ID.
     * @return array|null Ticket details or null if not found.
     */
    private function get_ticket_details(int $ticket_id): ?array
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Necessary for ticket notifications, caching unnecessary for one-time notification processing
        $ticket = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT t.*, u.display_name as customer_name, u.user_email as customer_email
				FROM {$wpdb->prefix}cs_support_tickets t
				LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID
				WHERE t.id = %d",
                $ticket_id
            ),
            ARRAY_A
        );

        return $ticket ?: null;
    }

    /**
     * Get assignment email template.
     *
     * @param array $data Template data.
     * @return string HTML email content.
     */
    private function get_assignment_email_template(array $data): string
    {
        $template = '
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007cba; }
				.content { padding: 20px; }
				.ticket-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
				.btn { background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block; }
				.footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="header">
				<h2>🎫 New Ticket Assignment</h2>
			</div>

			<div class="content">
				<p>Hello <strong>{assignee_name}</strong>,</p>

				<p>A support ticket has been assigned to you by <strong>{assigned_by_name}</strong>.</p>

				<div class="ticket-details">
					<h3>Ticket Details:</h3>
					<p><strong>Ticket ID:</strong> #{ticket_id}</p>
					<p><strong>Subject:</strong> {subject}</p>
					<p><strong>Priority:</strong> {priority}</p>
					<p><strong>Category:</strong> {category}</p>
					<p><strong>Customer:</strong> {customer_name} ({customer_email})</p>
					<p><strong>Status:</strong> {status}</p>
					<p><strong>Created:</strong> {created_at}</p>
				</div>

				<p><strong>Description:</strong></p>
				<p>{description}</p>

				<p>
					<a href="{ticket_url}" class="btn">View Ticket in Admin</a>
				</p>

				<p>Please review the ticket and respond as soon as possible.</p>
			</div>

			<div class="footer">
				<p>This email was sent automatically from {site_name}.</p>
			</div>
		</body>
		</html>';

        $replacements = [
            '{assignee_name}' => $data['assignee']->display_name,
            '{assigned_by_name}' => $data['assigned_by']->display_name,
            '{ticket_id}' => $data['ticket']['id'],
            '{subject}' => $data['ticket']['subject'],
            '{priority}' => ucfirst($data['ticket']['priority']),
            '{category}' => $data['ticket']['category'] ?: 'General',
            '{customer_name}' => $data['ticket']['customer_name'],
            '{customer_email}' => $data['ticket']['customer_email'],
            '{status}' => $data['ticket']['status'],
            '{created_at}' => gmdate('F j, Y g:i A', strtotime($data['ticket']['created_at'])),
            '{description}' => wp_strip_all_tags($data['ticket']['description']),
            '{ticket_url}' => $data['ticket_url'],
            '{site_name}' => $data['site_name']
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    /**
     * Get reassignment email template.
     *
     * @param array $data Template data.
     * @return string HTML email content.
     */
    private function get_reassignment_email_template(array $data): string
    {
        if ($data['type'] === 'new_assignee') {
            return $this->get_new_assignee_template($data);
        } else {
            return $this->get_old_assignee_template($data);
        }
    }

    /**
     * Get new assignee email template.
     *
     * @param array $data Template data.
     * @return string HTML email content.
     */
    private function get_new_assignee_template(array $data): string
    {
        $template = '
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.header { background-color: #f8f9fa; padding: 20px; border-bottom: 3px solid #007cba; }
				.content { padding: 20px; }
				.ticket-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
				.btn { background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block; }
				.footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="header">
				<h2>🔄 Ticket Reassigned to You</h2>
			</div>

			<div class="content">
				<p>Hello <strong>{assignee_name}</strong>,</p>

				<p>A support ticket has been reassigned to you by <strong>{reassigned_by_name}</strong>.</p>

				{old_assignee_info}

				<div class="ticket-details">
					<h3>Ticket Details:</h3>
					<p><strong>Ticket ID:</strong> #{ticket_id}</p>
					<p><strong>Subject:</strong> {subject}</p>
					<p><strong>Priority:</strong> {priority}</p>
					<p><strong>Category:</strong> {category}</p>
					<p><strong>Customer:</strong> {customer_name} ({customer_email})</p>
					<p><strong>Status:</strong> {status}</p>
				</div>

				<p>
					<a href="{ticket_url}" class="btn">View Ticket in Admin</a>
				</p>

				<p>Please review the ticket history and continue providing support.</p>
			</div>

			<div class="footer">
				<p>This email was sent automatically from {site_name}.</p>
			</div>
		</body>
		</html>';

        $old_assignee_info = '';
        if (isset($data['old_assignee']) && $data['old_assignee']) {
            $old_assignee_info = '<p>This ticket was previously assigned to <strong>' . $data['old_assignee']->display_name . '</strong>.</p>';
        }

        $replacements = [
            '{assignee_name}' => $data['assignee']->display_name,
            '{reassigned_by_name}' => $data['reassigned_by']->display_name,
            '{old_assignee_info}' => $old_assignee_info,
            '{ticket_id}' => $data['ticket']['id'],
            '{subject}' => $data['ticket']['subject'],
            '{priority}' => ucfirst($data['ticket']['priority']),
            '{category}' => $data['ticket']['category'] ?: 'General',
            '{customer_name}' => $data['ticket']['customer_name'],
            '{customer_email}' => $data['ticket']['customer_email'],
            '{status}' => $data['ticket']['status'],
            '{ticket_url}' => $data['ticket_url'],
            '{site_name}' => $data['site_name']
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    /**
     * Get old assignee email template.
     *
     * @param array $data Template data.
     * @return string HTML email content.
     */
    private function get_old_assignee_template(array $data): string
    {
        $template = '
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.header { background-color: #fff3cd; padding: 20px; border-bottom: 3px solid #ffc107; }
				.content { padding: 20px; }
				.ticket-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
				.footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="header">
				<h2>ℹ️ Ticket Reassigned</h2>
			</div>

			<div class="content">
				<p>Hello <strong>{assignee_name}</strong>,</p>

				<p>This is to notify you that ticket #{ticket_id} has been reassigned from you to <strong>{new_assignee_name}</strong> by <strong>{reassigned_by_name}</strong>.</p>

				<div class="ticket-details">
					<h3>Ticket Details:</h3>
					<p><strong>Ticket ID:</strong> #{ticket_id}</p>
					<p><strong>Subject:</strong> {subject}</p>
					<p><strong>New Assignee:</strong> {new_assignee_name}</p>
				</div>

				<p>You no longer need to handle this ticket. Thank you for your previous work on it.</p>
			</div>

			<div class="footer">
				<p>This email was sent automatically from {site_name}.</p>
			</div>
		</body>
		</html>';

        $replacements = [
            '{assignee_name}' => $data['assignee']->display_name,
            '{new_assignee_name}' => $data['new_assignee']->display_name,
            '{reassigned_by_name}' => $data['reassigned_by']->display_name,
            '{ticket_id}' => $data['ticket']['id'],
            '{subject}' => $data['ticket']['subject'],
            '{site_name}' => $data['site_name']
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    /**
     * Get status change email template.
     *
     * @param array $data Template data.
     * @return string HTML email content.
     */
    private function get_status_change_email_template(array $data): string
    {
        $template = '
		<html>
		<head>
			<style>
				body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
				.header { background-color: #d4edda; padding: 20px; border-bottom: 3px solid #28a745; }
				.content { padding: 20px; }
				.status-change { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
				.btn { background-color: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 3px; display: inline-block; }
				.footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
			</style>
		</head>
		<body>
			<div class="header">
				<h2>📊 Ticket Status Updated</h2>
			</div>

			<div class="content">
				<p>Hello <strong>{customer_name}</strong>,</p>

				<p>The status of your support ticket has been updated.</p>

				<div class="status-change">
					<h3>Status Change</h3>
					<p><strong>Ticket #</strong>{ticket_id}: {subject}</p>
					<p><strong>Status changed from:</strong> {old_status} <strong>to:</strong> {new_status}</p>
				</div>

				<p>
					<a href="{ticket_url}" class="btn">View Your Ticket</a>
				</p>

				<p>If you have any questions, please don\'t hesitate to contact us.</p>
			</div>

			<div class="footer">
				<p>This email was sent automatically from {site_name}.</p>
			</div>
		</body>
		</html>';

        $replacements = [
            '{customer_name}' => $data['customer']->display_name,
            '{ticket_id}' => $data['ticket']['id'],
            '{subject}' => $data['ticket']['subject'],
            '{old_status}' => $data['old_status'],
            '{new_status}' => $data['new_status'],
            '{ticket_url}' => $data['ticket_url'],
            '{site_name}' => $data['site_name']
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }

    /**
     * Get admin ticket URL.
     *
     * @param int $ticket_id Ticket ID.
     * @return string Admin ticket URL.
     */
    private function get_ticket_admin_url(int $ticket_id): string
    {
        return admin_url('admin.php?page=clientsync-support-helpdesk-tickets&ticket_id=' . $ticket_id);
    }

    /**
     * Get customer ticket URL.
     *
     * @param int $ticket_id Ticket ID.
     * @return string Customer ticket URL.
     */
    private function get_ticket_customer_url(int $ticket_id): string
    {
        // This would typically be a frontend page where customers can view their tickets
        return home_url('/support/ticket/' . $ticket_id);
    }
}
