<?php

/**
 * Render the CS Support ticket form block on the frontend
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
	exit;
}

// Check if we're in a block context or shortcode context
$is_shortcode = !isset($block);

$wrapper_attributes = $is_shortcode ? 
	'class="wp-block-clientsync-cs-support cs-support-shortcode"' : 
	get_block_wrapper_attributes([
		'class' => 'cs-support-block'
	]);

// Get block attributes
$title = $attributes['title'] ?? 'Create a new support ticket';
$show_title = $attributes['showTitle'] ?? true;
$submit_button_text = $attributes['submitButtonText'] ?? 'Create Ticket';
$background_color = $attributes['backgroundColor'] ?? '#ffffff';
$text_color = $attributes['textColor'] ?? '#000000';
$button_color = $attributes['buttonColor'] ?? '#2c3338';
$button_text_color = $attributes['buttonTextColor'] ?? '#ffffff';

// Get layout and styling attributes
$form_width = $attributes['formWidth'] ?? '100%';
$max_width = $attributes['maxWidth'] ?? '800px';
$padding = $attributes['padding'] ?? '20px';
$border_width = $attributes['borderWidth'] ?? '0px';
$border_color = $attributes['borderColor'] ?? '#dddddd';
$border_radius = $attributes['borderRadius'] ?? '8px';
$box_shadow = $attributes['boxShadow'] ?? false;
$box_shadow_color = $attributes['boxShadowColor'] ?? 'rgba(0, 0, 0, 0.1)';
$input_border_color = $attributes['inputBorderColor'] ?? '#dddddd';
$input_border_radius = $attributes['inputBorderRadius'] ?? '4px';
$button_border_radius = $attributes['buttonBorderRadius'] ?? '4px';
$button_padding = $attributes['buttonPadding'] ?? '10px 15px';
$button_align = $attributes['buttonAlign'] ?? 'left';
$button_full_width = $attributes['buttonFullWidth'] ?? false;
$redirect_page = $attributes['redirectPage'] ?? '';

// Get redirect URL if redirect page is set
$redirect_url = '';
if (!empty($redirect_page)) {
	$redirect_url = get_permalink(intval($redirect_page));
}

// Build inline styles
$form_style = sprintf(
	'background-color: %s; color: %s; width: %s; max-width: %s; padding: %s; border-radius: %s; border: %s solid %s; %s',
	esc_attr($background_color),
	esc_attr($text_color),
	esc_attr($form_width),
	esc_attr($max_width),
	esc_attr($padding),
	esc_attr($border_radius),
	esc_attr($border_width),
	esc_attr($border_color),
	$box_shadow ? 'box-shadow: 0 4px 8px ' . esc_attr($box_shadow_color) . ';' : ''
);

$input_style = sprintf(
	'border-color: %s; border-radius: %s;',
	esc_attr($input_border_color),
	esc_attr($input_border_radius)
);

$button_style = sprintf(
	'background-color: %s; color: %s; border-radius: %s; padding: %s; width: %s; display: block; margin-left: %s; margin-right: %s;',
	esc_attr($button_color),
	esc_attr($button_text_color),
	esc_attr($button_border_radius),
	esc_attr($button_padding),
	$button_full_width ? '100%' : 'auto',
	$button_align === 'center' ? 'auto' : ($button_align === 'right' ? 'auto' : '0'),
	$button_align === 'center' ? 'auto' : ($button_align === 'left' ? 'auto' : '0')
);

// Check if user is logged in
$is_logged_in = is_user_logged_in();
?>

<div <?php echo esc_attr($wrapper_attributes); ?>>
	<?php if (!$is_logged_in) : ?>
		<div class="cs-support-login-required">
			<p><?php esc_html_e('You must be logged in to create a support ticket.', 'cs-support'); ?></p>
			<a href="<?php echo esc_url(wp_login_url(get_permalink())); ?>" class="cs-support-login-link">
				<?php esc_html_e('Log in', 'cs-support'); ?>
			</a>
		</div>
	<?php else : ?>
		<div class="cs-support-ticket-form" style="<?php echo esc_attr($form_style); ?>">
			<?php if ($show_title) : ?>
				<h2><?php echo esc_html($title); ?></h2>
			<?php endif; ?>

			<form id="cs-support-form" data-redirect-url="<?php echo esc_url($redirect_url); ?>">
				<div class="cs-form-field">
					<div class="form-field-with-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
							<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
						</svg>
						<label for="cs-subject"><?php esc_html_e('Subject', 'cs-support'); ?></label>
					</div>
					<input type="text" id="cs-subject" name="subject" required style="<?php echo esc_attr($input_style); ?>">
				</div>

				<div class="cs-form-field">
					<div class="form-field-with-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
						</svg>
						<label for="cs-category"><?php esc_html_e('Category', 'cs-support'); ?></label>
					</div>
					<select id="cs-category" name="category" required style="<?php echo esc_attr($input_style); ?>">
						<option value=""><?php esc_html_e('Select a category', 'cs-support'); ?></option>
						<option value="technical"><?php esc_html_e('Technical', 'cs-support'); ?></option>
						<option value="billing"><?php esc_html_e('Billing', 'cs-support'); ?></option>
						<option value="general"><?php esc_html_e('General', 'cs-support'); ?></option>
					</select>
				</div>

				<div class="cs-form-field">
					<div class="form-field-with-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
							<line x1="12" y1="9" x2="12" y2="13"></line>
							<line x1="12" y1="17" x2="12.01" y2="17"></line>
						</svg>
						<label for="cs-priority"><?php esc_html_e('Priority', 'cs-support'); ?></label>
					</div>
					<select id="cs-priority" name="priority" required style="<?php echo esc_attr($input_style); ?>">
						<option value="low"><?php esc_html_e('Low', 'cs-support'); ?></option>
						<option value="normal" selected><?php esc_html_e('Normal', 'cs-support'); ?></option>
						<option value="high"><?php esc_html_e('High', 'cs-support'); ?></option>
						<option value="urgent"><?php esc_html_e('Urgent', 'cs-support'); ?></option>
					</select>
				</div>

				<div class="cs-form-field">
					<div class="form-field-with-icon">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z">
								</polyline>
								<line x1="16" y1="13" x2="8" y2="13"></line>
								<line x1="16" y1="17" x2="8" y2="17"></line>
								<polyline points="10 9 9 9 8 9"></polyline>
						</svg>
						<label for="cs-description"><?php esc_html_e('Description', 'cs-support'); ?></label>
					</div>
					<textarea id="cs-description" name="description" required style="<?php echo esc_attr($input_style); ?>"></textarea>
				</div>

				<div class="cs-form-message" style="display: none;"></div>

				<button
					type="submit"
					class="cs-form-submit"
					style="<?php echo esc_attr($button_style); ?>"
					data-success-message="<?php echo esc_attr($attributes['successMessage'] ?? 'Ticket created successfully!'); ?>"
					data-error-message="<?php echo esc_attr($attributes['errorMessage'] ?? 'Failed to create ticket. Please try again.'); ?>">
					<?php echo esc_html($submit_button_text); ?>
				</button>
			</form>
		</div>
	<?php endif; ?>
</div>