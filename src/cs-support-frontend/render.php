<?php

/**
 * Render the ClientSync Support Frontend block on the frontend
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Add REST API nonce meta tag for JavaScript access
add_action('wp_head', function() {
	echo '<meta name="wp-rest-nonce" content="' . esc_attr(wp_create_nonce('wp_rest')) . '">' . "\n";
}, 1);

// Check if we're in a block context or shortcode context
$is_shortcode = !isset($block);

// Get block attributes
$title = $attributes['title'] ?? 'My Support Tickets';
$background_color = $attributes['backgroundColor'] ?? '#ffffff';
$text_color = $attributes['textColor'] ?? '#000000';
$accent_color = $attributes['accentColor'] ?? '#2c3338';
$tickets_per_page = $attributes['ticketsPerPage'] ?? 10;
$border_radius = $attributes['borderRadius'] ?? 8;
$box_shadow = isset($attributes['boxShadow']) ? $attributes['boxShadow'] : true;
$row_hover_effect = isset($attributes['rowHoverEffect']) ? $attributes['rowHoverEffect'] : true;
$button_style = $attributes['buttonStyle'] ?? 'rounded';
$card_style = $attributes['cardStyle'] ?? 'default';

// New enhanced attributes
$table_striped = isset($attributes['tableStriped']) ? $attributes['tableStriped'] : false;
$table_bordered = isset($attributes['tableBordered']) ? $attributes['tableBordered'] : true;
$show_search = isset($attributes['showSearch']) ? $attributes['showSearch'] : false;
$show_filters = isset($attributes['showFilters']) ? $attributes['showFilters'] : false;
$enable_sorting = isset($attributes['enableSorting']) ? $attributes['enableSorting'] : false;
$compact_view = isset($attributes['compactView']) ? $attributes['compactView'] : false;
$primary_color = $attributes['primaryColor'] ?? '#1976d2';
$secondary_color = $attributes['secondaryColor'] ?? '#f5f5f5';
$success_color = $attributes['successColor'] ?? '#4caf50';
$warning_color = $attributes['warningColor'] ?? '#ff9800';
$error_color = $attributes['errorColor'] ?? '#f44336';
$custom_css = $attributes['customCSS'] ?? '';
$font_size = $attributes['fontSize'] ?? 'medium';
$spacing = $attributes['spacing'] ?? 'normal';
$max_width = $attributes['maxWidth'] ?? 'none';

// Add class for card style
$card_style_class = 'card-style-' . $card_style;

// Add class for row hover effect
$row_hover_class = $row_hover_effect ? 'row-hover-enabled' : 'row-hover-disabled';

// Add additional classes for new features
$additional_classes = [];
if ($table_striped) $additional_classes[] = 'table-striped';
if ($table_bordered) $additional_classes[] = 'table-bordered';
if ($show_search) $additional_classes[] = 'has-search';
if ($show_filters) $additional_classes[] = 'has-filters';
if ($enable_sorting) $additional_classes[] = 'sortable';
if ($compact_view) $additional_classes[] = 'compact-view';
$additional_classes[] = 'font-size-' . $font_size;
$additional_classes[] = 'spacing-' . $spacing;

$all_classes = array_merge([$card_style_class, $row_hover_class], $additional_classes);

if ($is_shortcode) {
    $wrapper_attributes = 'class="wp-block-clientsync-cs-support-frontend cs-support-shortcode ' . esc_attr(implode(' ', $all_classes)) . '"';
} else {
    $block_classes = array_merge(['wp-block-clientsync-cs-support-frontend'], $all_classes);
    $wrapper_attributes = get_block_wrapper_attributes([
        'class' => implode(' ', $block_classes)
    ]);
}

// For WordPress coding standards compliance, we need to handle escaping properly
// get_block_wrapper_attributes() returns pre-escaped content, but we need to mark it as safe
$wrapper_attributes_safe = $wrapper_attributes;

// Build inline styles
$font_size_values = ['small' => '14px', 'medium' => '16px', 'large' => '18px', 'x-large' => '20px'];
$spacing_values = ['tight' => '12px', 'normal' => '20px', 'loose' => '32px'];

$font_size_css = $font_size_values[$font_size] ?? '16px';
$spacing_css = $spacing_values[$spacing] ?? '20px';

$shadow_css = $box_shadow ? 'box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);' : '';
$max_width_css = $max_width !== 'none' ? "max-width: {$max_width}; margin: 0 auto;" : '';

$container_style = sprintf(
    'background-color: %s; color: %s; padding: %s; border-radius: %spx; font-size: %s; %s %s',
    esc_attr($background_color),
    esc_attr($text_color),
    esc_attr($spacing_css),
    esc_attr($border_radius),
    esc_attr($font_size_css),
    $shadow_css,
    $max_width_css
);

$table_header_style = sprintf(
    'background-color: %s; color: #ffffff;',
    esc_attr($accent_color)
);

// Set button style based on selection
$btn_border_radius = 4; // Default
if ($button_style === 'rounded') {
    $btn_border_radius = 4;
} elseif ($button_style === 'square') {
    $btn_border_radius = 0;
} elseif ($button_style === 'pill') {
    $btn_border_radius = 24;
}

$btn_style_css = $button_style === 'outlined'
    ? sprintf('background-color: transparent; color: %1$s; border: 1px solid %1$s;', esc_attr($accent_color))
    : sprintf('background-color: %s; color: #ffffff;', esc_attr($accent_color));

$button_style_attr = sprintf(
    '%s border-radius: %spx;',
    $btn_style_css,
    $btn_border_radius
);

// Enqueue custom styles instead of inline CSS
if (!empty($custom_css)) {
    wp_add_inline_style('clientsync-cs-support-frontend-style', $custom_css);
}

// Check if user is logged in
$is_logged_in = is_user_logged_in();
?>

<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
    <?php if (!$is_logged_in) : ?>
        <div class="cs-support-login-required">
            <p><?php esc_html_e('You must be logged in to view your support tickets.', 'clientsync-support'); ?></p>
            <a href="<?php echo esc_url(wp_login_url(get_permalink())); ?>" class="cs-support-login-link">
                <?php esc_html_e('Log in', 'clientsync-support'); ?>
            </a>
        </div>
    <?php else : ?>
        <div class="cs-support-frontend-container"
             style="<?php echo esc_attr($container_style); ?>"
             data-tickets-per-page="<?php echo esc_attr($tickets_per_page); ?>"
             data-show-search="<?php echo esc_attr($show_search ? 'true' : 'false'); ?>"
             data-show-filters="<?php echo esc_attr($show_filters ? 'true' : 'false'); ?>"
             data-enable-sorting="<?php echo esc_attr($enable_sorting ? 'true' : 'false'); ?>"
             data-compact-view="<?php echo esc_attr($compact_view ? 'true' : 'false'); ?>"
             data-success-color="<?php echo esc_attr($success_color); ?>"
             data-warning-color="<?php echo esc_attr($warning_color); ?>"
             data-error-color="<?php echo esc_attr($error_color); ?>"
             data-primary-color="<?php echo esc_attr($primary_color); ?>">

            <h2 class="cs-support-frontend-title"><?php echo esc_html($title); ?></h2>

            <!-- Initial loading state -->
            <div id="cs-support-frontend-content" class="cs-support-frontend-content">
                <div class="cs-support-loading">
                    <?php esc_html_e('Loading your tickets...', 'clientsync-support'); ?>
                </div>
            </div>

            <!-- Templates -->
            <template id="cs-support-tickets-template">
                <table class="cs-support-tickets-table">
                    <thead>
                        <tr style="<?php echo esc_attr($table_header_style); ?>">
                            <th><?php esc_html_e('Ticket ID', 'clientsync-support'); ?></th>
                            <th><?php esc_html_e('Subject', 'clientsync-support'); ?></th>
                            <th><?php esc_html_e('Status', 'clientsync-support'); ?></th>
                            <th><?php esc_html_e('Date', 'clientsync-support'); ?></th>
                        </tr>
                    </thead>
                    <tbody id="cs-support-tickets-list"></tbody>
                </table>
                <div id="cs-support-pagination" class="cs-support-pagination"></div>
            </template>

            <template id="cs-support-no-tickets-template">
                <div class="cs-support-no-tickets">
                    <p><?php esc_html_e('You have not created any support tickets yet.', 'clientsync-support'); ?></p>
                    <?php
                    // Get ID of page with ClientSync Support block, if any exists
                    $support_page_id = get_option('cs_support_page_id');
                    if ($support_page_id) {
                        $support_page_url = get_permalink($support_page_id);
                    } else {
                        $support_page_url = admin_url('admin.php?page=clientsync-support-helpdesk-create-ticket');
                    }
                    ?>
                    <a href="<?php echo esc_url($support_page_url); ?>" class="cs-support-create-ticket-link" style="<?php echo esc_attr($button_style_attr); ?>">
                        <?php esc_html_e('Create a Support Ticket', 'clientsync-support'); ?>
                    </a>
                </div>
            </template>

            <template id="cs-support-ticket-details-template">
                <a href="#" class="cs-support-back-link" id="cs-support-back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    <?php esc_html_e('Back to tickets', 'clientsync-support'); ?>
                </a>

                <div class="cs-support-ticket-details">
                    <h3 id="cs-ticket-subject"></h3>
                    <div class="cs-ticket-meta">
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Status', 'clientsync-support'); ?></span>
                            <span id="cs-ticket-status"></span>
                        </div>
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Priority', 'clientsync-support'); ?></span>
                            <span id="cs-ticket-priority"></span>
                        </div>
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Category', 'clientsync-support'); ?></span>
                            <span id="cs-ticket-category"></span>
                        </div>
                        <div class="cs-ticket-meta-item">
                            <span class="label"><?php esc_html_e('Created', 'clientsync-support'); ?></span>
                            <span id="cs-ticket-created"></span>
                        </div>
                    </div>
                    <div class="cs-ticket-description" id="cs-ticket-description"></div>
                </div>

                <div class="cs-support-replies">
                    <h3><?php esc_html_e('Conversation', 'clientsync-support'); ?></h3>
                    <div id="cs-support-replies-list"></div>
                </div>

                <div class="cs-support-reply-form">
                    <h3><?php esc_html_e('Add a Reply', 'clientsync-support'); ?></h3>
                    <form id="cs-support-reply-form">
                        <label for="cs-reply-message" class="sr-only"><?php esc_html_e('Your reply', 'clientsync-support'); ?></label>
                        <textarea
                            id="cs-reply-message"
                            placeholder="<?php esc_attr_e('Type your reply here...', 'clientsync-support'); ?>"
                            aria-label="<?php esc_attr_e('Type your reply here', 'clientsync-support'); ?>"
                            required
                        ></textarea>
                        <button type="submit" id="cs-submit-reply" style="<?php echo esc_attr($button_style_attr); ?>">
                            <?php esc_html_e('Send Reply', 'clientsync-support'); ?>
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
