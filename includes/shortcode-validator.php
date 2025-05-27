<?php
/**
 * Shortcode Validation and Debug Helper
 * 
 * This file provides utilities to validate shortcode functionality
 * and debug any issues with CSS loading or attribute handling
 */

namespace ClientSync\CS_Support;

class ShortcodeValidator {
    
    /**
     * Validate shortcode attributes
     */
    public static function validate_support_form_attributes($attributes): array {
        $errors = [];
        $warnings = [];
        
        // Check for required attributes
        if (empty($attributes['title'])) {
            $warnings[] = 'Title is empty, using default';
        }
        
        // Validate colors
        $color_attributes = ['background_color', 'text_color', 'button_color', 'button_text_color', 'border_color'];
        foreach ($color_attributes as $attr) {
            if (isset($attributes[$attr]) && !self::is_valid_color($attributes[$attr])) {
                $errors[] = "Invalid color value for {$attr}: {$attributes[$attr]}";
            }
        }
        
        // Validate dimensions
        $dimension_attributes = ['form_width', 'max_width', 'padding', 'border_width'];
        foreach ($dimension_attributes as $attr) {
            if (isset($attributes[$attr]) && !self::is_valid_dimension($attributes[$attr])) {
                $errors[] = "Invalid dimension value for {$attr}: {$attributes[$attr]}";
            }
        }
        
        // Validate boolean attributes
        $boolean_attributes = ['show_title', 'box_shadow', 'button_full_width'];
        foreach ($boolean_attributes as $attr) {
            if (isset($attributes[$attr]) && !in_array($attributes[$attr], ['true', 'false', '1', '0', 'yes', 'no'])) {
                $warnings[] = "Boolean attribute {$attr} has non-standard value: {$attributes[$attr]}";
            }
        }
        
        return [
            'errors' => $errors,
            'warnings' => $warnings,
            'valid' => empty($errors)
        ];
    }
    
    /**
     * Check if CSS and JS assets are properly loaded
     */
    public static function check_assets_loaded(): array {
        global $wp_styles, $wp_scripts;
        
        $status = [
            'shortcode_css' => false,
            'block_css' => [],
            'block_js' => []
        ];
        
        // Check if shortcode CSS is loaded
        if (isset($wp_styles->registered['cs-support-shortcode-styles'])) {
            $status['shortcode_css'] = true;
        }
        
        // Check for block CSS files
        $blocks = ['cs-support', 'cs-support-frontend'];
        foreach ($blocks as $block) {
            $handle = 'cs-support-' . $block . '-style';
            $status['block_css'][$block] = isset($wp_styles->registered[$handle]);
        }
        
        // Check for block JS files
        foreach ($blocks as $block) {
            $handle = 'cs-support-' . $block . '-view';
            $status['block_js'][$block] = isset($wp_scripts->registered[$handle]);
        }
        
        return $status;
    }
    
    /**
     * Debug shortcode rendering
     */
    public static function debug_shortcode_render($shortcode, $attributes): string {
        $output = "<div class='cs-support-debug'>";
        $output .= "<h4>Shortcode Debug: {$shortcode}</h4>";
        
        // Show parsed attributes
        $output .= "<h5>Parsed Attributes:</h5>";
        $output .= "<pre>" . print_r($attributes, true) . "</pre>";
        
        // Validate attributes
        if ($shortcode === 'cs_support') {
            $validation = self::validate_support_form_attributes($attributes);
            $output .= "<h5>Validation Results:</h5>";
            $output .= "<pre>" . print_r($validation, true) . "</pre>";
        }
        
        // Check asset loading
        $assets = self::check_assets_loaded();
        $output .= "<h5>Asset Loading Status:</h5>";
        $output .= "<pre>" . print_r($assets, true) . "</pre>";
        
        $output .= "</div>";
        
        return $output;
    }
    
    /**
     * Check if a color value is valid
     */
    private static function is_valid_color($color): bool {
        // Check hex colors
        if (preg_match('/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $color)) {
            return true;
        }
        
        // Check rgb/rgba colors
        if (preg_match('/^rgb\([\d\s,]+\)$/', $color) || preg_match('/^rgba\([\d\s,.]+\)$/', $color)) {
            return true;
        }
        
        // Check named colors (basic check)
        $named_colors = ['black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta', 'transparent'];
        if (in_array(strtolower($color), $named_colors)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a dimension value is valid
     */
    private static function is_valid_dimension($dimension): bool {
        // Check for valid CSS dimension values
        return preg_match('/^\d+(\.\d+)?(px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch)?$/', trim($dimension));
    }
}

// Add debug action if in development mode
if (defined('WP_DEBUG') && WP_DEBUG) {
    add_action('wp_footer', function() {
        if (current_user_can('manage_options')) {
            echo '<div id="cs-support-debug" style="background: #f1f1f1; padding: 20px; margin: 20px 0; border: 1px solid #ccc; font-family: monospace; font-size: 12px;">';
            echo '<h3>CS Support Debug Info</h3>';
            
            $assets = ShortcodeValidator::check_assets_loaded();
            echo '<h4>Asset Loading Status:</h4>';
            echo '<pre>' . print_r($assets, true) . '</pre>';
            
            echo '</div>';
        }
    });
}
