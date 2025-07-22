<?php
/**
 * Shortcodes class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

/**
 * Shortcodes class.
 */
class Shortcodes {

    /**
     * Initialize shortcodes.
     */
    public function init(): void {
        add_action('init', [$this, 'register_shortcodes']);
        // Add a filter for admin footer text to show debug links when WP_DEBUG is true
        if (defined('WP_DEBUG') && WP_DEBUG) {
            add_filter('admin_footer_text', [$this, 'add_debug_links']);
        }
    }

    /**
     * Register shortcodes.
     */
    public function register_shortcodes(): void {
        add_shortcode('cs_support', [$this, 'render_support_form']);
        add_shortcode('cs_support_tickets', [$this, 'render_tickets_list']);
    }

    /**
     * Render the support ticket form shortcode.
     * 
     * @param array|string $atts Shortcode attributes.
     * @return string
     */
    public function render_support_form($atts = []): string {
        // Ensure $atts is an array
        if (!is_array($atts)) {
            $atts = [];
        }
        // Default attributes
        $default_atts = [
            'title' => 'Create a new support ticket',
            'show_title' => 'true',
            'submit_button_text' => 'Create Ticket',
            'success_message' => 'Ticket created successfully!',
            'error_message' => 'Failed to create ticket. Please try again.',
            'background_color' => '#ffffff',
            'text_color' => '#000000',
            'button_color' => '#2c3338',
            'button_text_color' => '#ffffff',
            'form_width' => '100%',
            'max_width' => '600px',
            'padding' => '20px',
            'border_width' => '0px',
            'border_color' => '#dddddd',
            'border_radius' => '8px',
            'box_shadow' => 'false',
            'box_shadow_color' => 'rgba(0, 0, 0, 0.1)',
            'input_border_color' => '#dddddd',
            'input_border_radius' => '4px',
            'button_border_radius' => '4px',
            'button_padding' => '10px 15px',
            'button_align' => 'left',
            'button_full_width' => 'false',
        ];

        // Parse shortcode attributes
        $attributes = shortcode_atts($default_atts, $atts, 'cs_support');
        
        // Debug mode output
        if (defined('WP_DEBUG') && WP_DEBUG && isset($_GET['debug_shortcode'])) {
            // Verify nonce for debug actions
            $nonce_verified = false;
            if (isset($_GET['_wpnonce'])) {
                $nonce_verified = wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'cs_support_debug_shortcode');
            }
            
            if ($nonce_verified) {
                require_once plugin_dir_path(__FILE__) . 'shortcode-validator.php';
                return ShortcodeValidator::debug_shortcode_render('cs_support', $attributes);
            } else {
                return '<div class="cs-support-error">Security check failed. Please use a valid nonce.</div>';
            }
        }
        
        // Convert string boolean values to actual booleans
        $attributes['showTitle'] = $attributes['show_title'] === 'true';
        $attributes['boxShadow'] = $attributes['box_shadow'] === 'true';
        $attributes['buttonFullWidth'] = $attributes['button_full_width'] === 'true';
        
        // Rename attributes to match block format
        $block_attributes = [
            'title' => $attributes['title'],
            'showTitle' => $attributes['showTitle'],
            'submitButtonText' => $attributes['submit_button_text'],
            'successMessage' => $attributes['success_message'],
            'errorMessage' => $attributes['error_message'],
            'backgroundColor' => $attributes['background_color'],
            'textColor' => $attributes['text_color'],
            'buttonColor' => $attributes['button_color'],
            'buttonTextColor' => $attributes['button_text_color'],
            'formWidth' => $attributes['form_width'],
            'maxWidth' => $attributes['max_width'],
            'padding' => $attributes['padding'],
            'borderWidth' => $attributes['border_width'],
            'borderColor' => $attributes['border_color'],
            'borderRadius' => $attributes['border_radius'],
            'boxShadow' => $attributes['boxShadow'],
            'boxShadowColor' => $attributes['box_shadow_color'],
            'inputBorderColor' => $attributes['input_border_color'],
            'inputBorderRadius' => $attributes['input_border_radius'],
            'buttonBorderRadius' => $attributes['button_border_radius'],
            'buttonPadding' => $attributes['button_padding'],
            'buttonAlign' => $attributes['button_align'],
            'buttonFullWidth' => $attributes['buttonFullWidth'],
        ];

        // Enqueue block styles and scripts
        $this->enqueue_block_assets('clientsync-support');

        // Start output buffering
        ob_start();
        
        // Set the attributes variable for the render file
        $attributes = $block_attributes;
        
        // Include the block render file with the attributes
        $render_file = plugin_dir_path(__FILE__) . '../src/cs-support/render.php';
        if (file_exists($render_file)) {
            include $render_file;
        }
        
        return ob_get_clean();
    }

    /**
     * Render the tickets list shortcode.
     * 
     * @param array|string $atts Shortcode attributes.
     * @return string
     */
    public function render_tickets_list($atts = []): string {
        // Ensure $atts is an array
        if (!is_array($atts)) {
            $atts = [];
        }
        // Default attributes
        $default_atts = [
            'title' => 'My Support Tickets',
            'tickets_per_page' => '10',
            'background_color' => '#ffffff',
            'text_color' => '#000000',
            'accent_color' => '#2c3338',
            'border_radius' => '8',
            'box_shadow' => 'true',
            'row_hover_effect' => 'true',
            'button_style' => 'rounded',
            'card_style' => 'default',
        ];

        // Parse shortcode attributes
        $attributes = shortcode_atts($default_atts, $atts, 'cs_support_tickets');
        
        // Debug mode output
        if (defined('WP_DEBUG') && WP_DEBUG && isset($_GET['debug_shortcode'])) {
            // Verify nonce for debug actions
            $nonce_verified = false;
            if (isset($_GET['_wpnonce'])) {
                $nonce_verified = wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), 'cs_support_debug_shortcode');
            }
            
            if ($nonce_verified) {
                require_once plugin_dir_path(__FILE__) . 'shortcode-validator.php';
                return ShortcodeValidator::debug_shortcode_render('cs_support_tickets', $attributes);
            } else {
                return '<div class="cs-support-error">Security check failed. Please use a valid nonce.</div>';
            }
        }
        
        // Convert string values to appropriate types
        $attributes['ticketsPerPage'] = (int) $attributes['tickets_per_page'];
        $attributes['borderRadius'] = (int) $attributes['border_radius'];
        $attributes['boxShadow'] = $attributes['box_shadow'] === 'true';
        $attributes['rowHoverEffect'] = $attributes['row_hover_effect'] === 'true';
        
        // Rename attributes to match block format
        $block_attributes = [
            'title' => $attributes['title'],
            'ticketsPerPage' => $attributes['ticketsPerPage'],
            'backgroundColor' => $attributes['background_color'],
            'textColor' => $attributes['text_color'],
            'accentColor' => $attributes['accent_color'],
            'borderRadius' => $attributes['borderRadius'],
            'boxShadow' => $attributes['boxShadow'],
            'rowHoverEffect' => $attributes['rowHoverEffect'],
            'buttonStyle' => $attributes['button_style'],
            'cardStyle' => $attributes['card_style'],
        ];

        // Enqueue block styles and scripts
        $this->enqueue_block_assets('cs-support-frontend');

        // Start output buffering
        ob_start();
        
        // Set the attributes variable for the render file
        $attributes = $block_attributes;
        
        // Include the block render file with the attributes
        $render_file = plugin_dir_path(__FILE__) . '../src/cs-support-frontend/render.php';
        if (file_exists($render_file)) {
            include $render_file;
        }
        
        return ob_get_clean();
    }

    /**
     * Generate a debug URL for shortcodes.
     *
     * @param string $shortcode The shortcode to debug.
     * @return string The URL with nonce.
     */
    public function get_debug_url(string $shortcode): string {
        $current_url = remove_query_arg(['_wpnonce', 'debug_shortcode']);
        $url = add_query_arg(
            [
                'debug_shortcode' => '1',
                '_wpnonce' => wp_create_nonce('cs_support_debug_shortcode')
            ],
            $current_url
        );
        
        return esc_url($url);
    }

    /**
     * Add debug links to the admin footer when in debug mode.
     *
     * @param string $text The current admin footer text.
     * @return string The modified footer text.
     */
    public function add_debug_links(string $text): string {
        // Only show on our plugin's admin pages
        $screen = get_current_screen();
        if ($screen && strpos($screen->id, 'clientsync-support-helpdesk') !== false) {
            $text .= ' | <a href="' . $this->get_debug_url('cs_support') . '">Debug Support Form</a>';
            $text .= ' | <a href="' . $this->get_debug_url('cs_support_tickets') . '">Debug Tickets List</a>';
        }
        return $text;
    }

    /**
     * Enqueue block assets for shortcode usage.
     * 
     * @param string $block_name The block name.
     */
    private function enqueue_block_assets(string $block_name): void {
        // Enqueue the same styles that blocks use to ensure consistency
        $style_handle = 'cs-support-' . $block_name . '-style';
        
        // The styles are registered in the Editor class, just enqueue them
        if (wp_style_is($style_handle, 'registered')) {
            wp_enqueue_style($style_handle);
        }

        // Enqueue block scripts if they exist and we're on frontend
        if (!is_admin()) {
            $plugin_path = plugin_dir_path(__FILE__) . '../';
            $plugin_url = plugin_dir_url(__FILE__) . '../';
            
            $script_file_path = $plugin_path . 'build/' . $block_name . '/view.js';
            $asset_file = $plugin_path . 'build/' . $block_name . '/view.asset.php';
            
            if (file_exists($script_file_path) && file_exists($asset_file)) {
                $script_handle = 'cs-support-' . $block_name . '-view';
                if (!wp_script_is($script_handle, 'enqueued')) {
                    $asset_data = include $asset_file;
                    wp_enqueue_script(
                        $script_handle,
                        $plugin_url . 'build/' . $block_name . '/view.js',
                        $asset_data['dependencies'] ?? [],
                        $asset_data['version'] ?? filemtime($script_file_path),
                        true
                    );
                }
            }
        }
    }
}
