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

        // Hook into WordPress comment system to trigger customer notifications
        add_action('wp_insert_comment', [$this, 'maybe_send_customer_reply_notification'], 10, 2);
        add_action('comment_post', [$this, 'handle_new_comment_notification'], 10, 3);
    }

    /**
     * Handle new comment notification for ticket replies.
     *
     * @param int $comment_id Comment ID.
     * @param int|string $comment_approved Comment approval status.
     * @param array $commentdata Comment data.
     * @return void
     */
    public function handle_new_comment_notification(int $comment_id, $comment_approved, array $commentdata): void
    {
        // Only proceed if comment is approved
        if ($comment_approved !== 1 && $comment_approved !== 'approve') {
            return;
        }

        $this->maybe_send_customer_reply_notification($comment_id, $commentdata);
    }

    /**
     * Maybe send customer notification for new reply.
     *
     * @param int $comment_id Comment ID.
     * @param array|object $comment Comment data.
     * @return void
     */
    public function maybe_send_customer_reply_notification(int $comment_id, $comment = null): void
    {
        // Get comment object if not provided
        if (!$comment) {
            $comment = get_comment($comment_id);
        }

        if (!$comment) {
            // error_log("CS Support: Could not retrieve comment with ID {$comment_id}");
            return;
        }

        // Convert array to object if needed
        if (is_array($comment)) {
            $comment = (object) $comment;
        }

        $post_id = $comment->comment_post_ID ?? 0;
        if (!$post_id) {
            // error_log("CS Support: No post ID found for comment {$comment_id}");
            return;
        }

        // First check if this is a valid ticket by checking our custom table
        $ticket = $this->get_ticket_details($post_id);
        if (!$ticket) {
            // If not found in custom table, check if it's a WordPress post with ticket metadata
            $post = get_post($post_id);
            if (!$post) {
                // error_log("CS Support: Could not find post with ID {$post_id}");
                return;
            }

            // Check if this post has ticket-related metadata
            $is_ticket = get_post_meta($post_id, '_is_support_ticket', true) ||
                        get_post_meta($post_id, '_ticket_status', true) ||
                        (isset($post->post_type) && $post->post_type === 'cs_support_ticket');

            if (!$is_ticket) {
                // error_log("CS Support: Post {$post_id} is not a support ticket");
                return;
            }
        }

        // Get the comment author ID - try multiple methods
        $comment_author_id = 0;

        // Method 1: Check user_id field (WordPress standard)
        if (!empty($comment->user_id)) {
            $comment_author_id = (int) $comment->user_id;
        }

        // Method 2: Check comment meta for stored author ID
        if (!$comment_author_id) {
            $comment_author_id = (int) get_comment_meta($comment_id, '_comment_author_id', true);
        }

        // Method 3: Try to find user by email if author is registered
        if (!$comment_author_id && !empty($comment->comment_author_email)) {
            $user = get_user_by('email', $comment->comment_author_email);
            if ($user) {
                $comment_author_id = $user->ID;
            }
        }

        // Method 4: Check if comment author is the currently logged in user
        if (!$comment_author_id) {
            $current_user = wp_get_current_user();
            if ($current_user && $current_user->ID > 0 &&
                (($comment->comment_author_email && $current_user->user_email === $comment->comment_author_email) ||
                 ($comment->comment_author && $current_user->display_name === $comment->comment_author))) {
                $comment_author_id = $current_user->ID;
            }
        }

        // Enhanced logging for debugging
        // error_log("CS Support: Processing comment ID {$comment_id} on post {$post_id}");
        // error_log("CS Support: Comment author ID: {$comment_author_id}, Email: " . ($comment->comment_author_email ?? 'none'));
        // error_log("CS Support: Comment author name: " . ($comment->comment_author ?? 'none'));

        // Send the notification (even if author ID is 0 for guest comments)
        $this->send_customer_reply_notification($post_id, $comment_id, $comment_author_id);
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

        // First try to get from custom table
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

        // If not found in custom table, try to get from posts table (fallback)
        if (!$ticket) {
            $post = get_post($ticket_id);
            if ($post && $post->post_type === 'cs_support_ticket') {
                $author = get_user_by('ID', $post->post_author);
                $ticket = [
                    'id' => $post->ID,
                    'title' => $post->post_title,
                    'subject' => $post->post_title,
                    'status' => get_post_meta($post->ID, '_ticket_status', true) ?: 'open',
                    'priority' => get_post_meta($post->ID, '_ticket_priority', true) ?: 'medium',
                    'category' => get_post_meta($post->ID, '_ticket_category', true) ?: 'General',
                    'user_id' => $post->post_author,
                    'customer_name' => $author ? $author->display_name : '',
                    'customer_email' => $author ? $author->user_email : '',
                    'created_at' => $post->post_date,
                    'description' => $post->post_content
                ];
            }
        }

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
        // Get CSS content from external file
        $css_file = plugin_dir_path(__FILE__) . '../assets/email-template.css';
        $email_styles = '';
        if (file_exists($css_file)) {
            $email_styles = file_get_contents($css_file);
        }

        $template = '
		<html>
		<head>
			<style>' . $email_styles . '</style>
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
			<style>' . $email_styles . '</style>
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
			<style>' . $email_styles . '</style>
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
			<style>' . $email_styles . '</style>
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

    /**
     * Get reply details from custom table for notifications.
     *
     * @param int $reply_id Reply ID.
     * @return object|null Reply details or null if not found.
     */
    private function get_reply_details(int $reply_id): ?object
    {
        global $wpdb;

        // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
        $reply = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}cs_support_ticket_replies WHERE id = %d",
                $reply_id
            )
        );

        if (!$reply) {
            return null;
        }

        // Normalize the object to look like a WP_Comment object for compatibility
        $reply->comment_ID = $reply->id;
        $reply->comment_post_ID = $reply->ticket_id;
        $reply->comment_content = $reply->reply;
        $reply->comment_date = $reply->created_at;

        // Get author info
        $author = get_user_by('ID', $reply->user_id);
        if ($author) {
            $reply->comment_author = $author->display_name;
            $reply->comment_author_email = $author->user_email;
        } else {
            $reply->comment_author = 'Support Team';
            $reply->comment_author_email = '';
        }

        return $reply;
    }

    /**
     * Send customer notification for new reply.
     *
     * @param int $ticket_id Ticket ID.
     * @param int $reply_id Reply ID (comment ID).
     * @param int $reply_author_id ID of user who replied.
     * @return bool True if email was sent successfully.
     */
    public function send_customer_reply_notification(int $ticket_id, int $reply_id, int $reply_author_id): bool
    {
        // Check if customer reply notifications are enabled
        if (!$this->settings->is_notification_enabled('customer_reply_notifications')) {
            // error_log("CS Support: Customer reply notifications are disabled");
            return true; // Consider it successful if disabled
        }

        $ticket = $this->get_ticket_details($ticket_id);
        if (!$ticket) {
            // error_log("CS Support: Could not find ticket details for ticket ID {$ticket_id}");
            return false;
        }

        // Get the reply/comment details from our custom table
        $reply = $this->get_reply_details($reply_id);
        if (!$reply) {
            // error_log("CS Support: Could not find reply with ID {$reply_id} in custom table");
            return false;
        }

        // Get customer email - try multiple methods
        $customer_email = '';
        $customer_name = '';

        // Method 1: From ticket data (custom table)
        if (!empty($ticket['customer_email'])) {
            $customer_email = $ticket['customer_email'];
            $customer_name = $ticket['customer_name'] ?? '';
        }

        // Method 2: From ticket user_id
        if (empty($customer_email) && !empty($ticket['user_id'])) {
            $customer_user = get_user_by('ID', $ticket['user_id']);
            if ($customer_user) {
                $customer_email = $customer_user->user_email;
                $customer_name = $customer_user->display_name;
            }
        }

        // Method 3: From post meta
        if (empty($customer_email)) {
            $customer_email = get_post_meta($ticket_id, '_customer_email', true);
            if (!$customer_name) {
                $customer_name = get_post_meta($ticket_id, '_customer_name', true);
            }
        }

        // Method 4: From post author
        if (empty($customer_email)) {
            $post = get_post($ticket_id);
            if ($post && $post->post_author) {
                $author = get_user_by('ID', $post->post_author);
                if ($author) {
                    $customer_email = $author->user_email;
                    $customer_name = $author->display_name;
                }
            }
        }

        // Method 5: Try to find from ticket metadata
        if (empty($customer_email)) {
            $stored_email = get_post_meta($ticket_id, '_ticket_customer_email', true);
            if (!empty($stored_email)) {
                $customer_email = $stored_email;
            }
        }

        if (empty($customer_email)) {
            // error_log("CS Support: Could not determine customer email for ticket ID {$ticket_id}");
            return false;
        }

        // Don't send notification if the customer is the one who replied
        $customer_user = get_user_by('email', $customer_email);
        if ($customer_user && $customer_user->ID === $reply_author_id) {
            // error_log("CS Support: Customer replied to their own ticket, skipping notification");
            return true; // Customer replied, no need to notify them
        }

        // Also check by comment author email to avoid notifying customer of their own reply
        if (!empty($reply->comment_author_email) && $reply->comment_author_email === $customer_email) {
            // error_log("CS Support: Reply author email matches customer email, skipping notification");
            return true;
        }

        // Get reply author details - handle cases where author ID might be 0
        $reply_author_name = '';
        if ($reply_author_id > 0) {
            $reply_author = get_user_by('ID', $reply_author_id);
            if ($reply_author) {
                $reply_author_name = $reply_author->display_name;
            }
        }

        // Fallback to comment author name if no user found
        if (empty($reply_author_name) && !empty($reply->comment_author)) {
            $reply_author_name = $reply->comment_author;
        }

        // Final fallback
        if (empty($reply_author_name)) {
            $reply_author_name = 'Support Team';
        }

        $subject = sprintf(
            // translators: %1$s: site name, %2$d: ticket ID
            __('[%1$s] New reply on your support ticket #%2$d', 'clientsync-support'),
            get_bloginfo('name'),
            $ticket_id
        );

        $message = $this->get_customer_reply_email_template([
            'ticket' => $ticket,
            'reply' => $reply,
            'reply_author_name' => $reply_author_name,
            'customer_email' => $customer_email,
            'customer_name' => $customer_name,
            'site_name' => get_bloginfo('name'),
            'ticket_url' => $this->get_ticket_customer_url($ticket_id)
        ]);

        $headers = $this->settings->get_email_headers();

        $result = wp_mail($customer_email, $subject, $message, $headers);

        // Log the notification attempt
        if ($result) {
            // error_log("CS Support: Successfully sent customer reply notification for ticket #{$ticket_id} to {$customer_email} (reply by: {$reply_author_name})");
        } else {
            // error_log("CS Support: Failed to send customer reply notification for ticket #{$ticket_id} to {$customer_email}");
        }

        return $result;
    }

    /**
     * Get customer reply email template.
     *
     * @param array $data Template data.
     * @return string Formatted email content.
     */
    private function get_customer_reply_email_template(array $data): string
    {
        $template = '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333333; margin: 0; font-size: 24px;">New Reply on Your Support Ticket</h1>
                </div>

                <div style="margin-bottom: 25px;">
                    <h2 style="color: #0073aa; font-size: 18px; margin-bottom: 10px;">Ticket Details</h2>
                    <p style="margin: 5px 0;"><strong>Ticket ID:</strong> #{ticket_id}</p>
                    <p style="margin: 5px 0;"><strong>Subject:</strong> {ticket_title}</p>
                    <p style="margin: 5px 0;"><strong>Status:</strong> {ticket_status}</p>
                </div>

                <div style="margin-bottom: 25px;">
                    <h3 style="color: #333333; font-size: 16px; margin-bottom: 10px;">New Reply from {reply_author_name}:</h3>
                    <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0073aa; margin: 10px 0;">
                        <p style="margin: 0; line-height: 1.6;">{reply_content}</p>
                    </div>
                    <p style="font-size: 12px; color: #666666; margin: 10px 0 0 0;">Reply sent on: {reply_date}</p>
                </div>

                <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #666666; text-align: center;">
                    <p>This is an automated notification from {site_name}. Please do not reply to this email directly.</p>
                    <p>If you have any questions, please visit our support portal or contact us directly.</p>
                </div>
            </div>
        </div>';

        $replacements = [
            '{ticket_id}' => $data['ticket']['id'],
            '{ticket_title}' => esc_html($data['ticket']['title'] ?? $data['ticket']['subject'] ?? 'Support Ticket'),
            '{ticket_status}' => ucfirst($data['ticket']['status'] ?? 'open'),
            '{reply_author_name}' => esc_html($data['reply_author_name']),
            '{reply_content}' => wp_kses_post(wpautop($data['reply']->comment_content)),
            '{reply_date}' => wp_date(get_option('date_format') . ' ' . get_option('time_format'), strtotime($data['reply']->comment_date)),
            '{ticket_url}' => esc_url($data['ticket_url']),
            '{site_name}' => esc_html($data['site_name'])
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}
