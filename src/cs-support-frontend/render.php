<?php

/**
 * Render the CS Support Frontend block on the frontend
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'cs-support-frontend-block'
]);

// Get block attributes
$title = $attributes['title'] ?? 'My Support Tickets';
$background_color = $attributes['backgroundColor'] ?? '#ffffff';
$text_color = $attributes['textColor'] ?? '#000000';
$accent_color = $attributes['accentColor'] ?? '#2c3338';
$tickets_per_page = $attributes['ticketsPerPage'] ?? 10;

// Build inline styles
$container_style = sprintf(
    'background-color: %s; color: %s; padding: 20px; border-radius: 8px;',
    esc_attr($background_color),
    esc_attr($text_color)
);

$table_header_style = sprintf(
    'background-color: %s; color: #ffffff;',
    esc_attr($accent_color)
);

$button_style = sprintf(
    'background-color: %s; color: #ffffff;',
    esc_attr($accent_color)
);

// Check if user is logged in
$is_logged_in = is_user_logged_in();
?>

<div <?php echo $wrapper_attributes; ?>>
    <?php if (!$is_logged_in) : ?>
        <div class="cs-support-login-required">
            <p><?php esc_html_e('You must be logged in to view your support tickets.', 'cs-support'); ?></p>
            <a href="<?php echo esc_url(wp_login_url(get_permalink())); ?>" class="cs-support-login-link">
                <?php esc_html_e('Log in', 'cs-support'); ?>
            </a>
        </div>
    <?php else : ?>
        <div class="cs-support-frontend-container" style="<?php echo esc_attr($container_style); ?>" data-tickets-per-page="<?php echo esc_attr($tickets_per_page); ?>">
            <h2 class="cs-support-frontend-title"><?php echo esc_html($title); ?></h2>

            <!-- Initial loading state -->
            <div id="cs-support-frontend-content" class="cs-support-frontend-content">
                <div class="cs-support-loading">
                    <?php esc_html_e('Loading your tickets...', 'cs-support'); ?>
                </div>
            </div>

            <!-- Templates -->
            <template id="cs-support-tickets-template">
                <table class="cs-support-tickets-table">
                    <thead>
                        <tr style="<?php echo esc_attr($table_header_style); ?>">
                            <th><?php esc_html_e('Ticket ID', 'cs-support'); ?></th>
                            <th><?php esc_html_e('Subject', 'cs-support'); ?></th>
                            <th><?php esc_html_e('Status', 'cs-support'); ?></th>
                            <th><?php esc_html_e('Date', 'cs-support'); ?></th>
                        </tr>
                    </thead>
                    <tbody id="cs-support-tickets-list"></tbody>
                </table>
                <div id="cs-support-pagination" class="cs-support-pagination"></div>
            </template>

            <template id="cs-support-no-tickets-template">
                <div class="cs-support-no-tickets">
                    <p><?php esc_html_e('You have not created any support tickets yet.', 'cs-support'); ?></p>
                    <?php
                    // Get ID of page with CS Support block, if any exists
                    $support_page_id = get_option('cs_support_page_id');
                    if ($support_page_id) {
                        $support_page_url = get_permalink($support_page_id);
                    } else {
                        $support_page_url = admin_url('admin.php?page=clientsync-support-helpdesk-create-ticket');
                    }
                    ?>
                    <a href="<?php echo esc_url($support_page_url); ?>" class="cs-support-create-ticket-link" style="<?php echo esc_attr($button_style); ?>">
                        <?php esc_html_e('Create a Support Ticket', 'cs-support'); ?>
                    </a>
                </div>
            </template>

            <template id="cs-support-ticket-details-template">
                <a href="#" class="cs-support-back-link" id="cs-support-back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <?php esc_html_e('Back to tickets', 'cs-support'); ?>
                </a>
                
                <div class="cs-support-ticket-details">
                    <h3 id="cs-ticket-subject"></h3>
                    <div class="cs-ticket-meta">
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Status', 'cs-support'); ?></span>
                            <span id="cs-ticket-status"></span>
                        </div>
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Priority', 'cs-support'); ?></span>
                            <span id="cs-ticket-priority"></span>
                        </div>
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Category', 'cs-support'); ?></span>
                            <span id="cs-ticket-category"></span>
                        </div>
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Created', 'cs-support'); ?></span>
                            <span id="cs-ticket-created"></span>
                        </div>
                    </div>
                    <div class="cs-ticket-description" id="cs-ticket-description"></div>
                </div>
                
                <div class="cs-support-replies">
                    <h3><?php esc_html_e('Conversation', 'cs-support'); ?></h3>
                    <div id="cs-support-replies-list"></div>
                </div>
                
                <div class="cs-support-reply-form">
                    <h3><?php esc_html_e('Add a Reply', 'cs-support'); ?></h3>
                    <form id="cs-support-reply-form">
                        <textarea id="cs-reply-message" placeholder="<?php esc_attr_e('Type your reply here...', 'cs-support'); ?>"></textarea>
                        <button type="submit" id="cs-submit-reply" style="<?php echo esc_attr($button_style); ?>">
                            <?php esc_html_e('Send Reply', 'cs-support'); ?>
                        </button>
                    </form>
                </div>
            </template>

            <template id="cs-support-error-template">
                <div class="cs-support-error">
                    <p id="cs-error-message"></p>
                </div>
            </template>
        </div>
    <?php endif; ?>
</div>

