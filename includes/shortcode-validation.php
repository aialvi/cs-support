<?php
/**
 * Shortcode validation utility
 * 
 * This file can be included in WordPress to check if shortcodes are properly registered.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check if ClientSync Support shortcodes are registered
 */
function cs_support_validate_shortcodes() {
    global $shortcode_tags;
    
    $cs_shortcodes = ['cs_support', 'cs_support_tickets'];
    $registered = [];
    $missing = [];
    
    foreach ($cs_shortcodes as $shortcode) {
        if (array_key_exists($shortcode, $shortcode_tags)) {
            $registered[] = $shortcode;
        } else {
            $missing[] = $shortcode;
        }
    }
    
    return [
        'registered' => $registered,
        'missing' => $missing,
        'all_registered' => empty($missing)
    ];
}

/**
 * Display shortcode status in admin
 */
function cs_support_admin_notice_shortcodes() {
    $status = cs_support_validate_shortcodes();
    
    if ($status['all_registered']) {
        echo '<div class="notice notice-success"><p>';
        echo '<strong>ClientSync Support:</strong> All shortcodes are properly registered: ';
        echo esc_html(implode(', ', array_map(function($tag) { return "[$tag]"; }, $status['registered'])));
        echo '</p></div>';
    } else {
        echo '<div class="notice notice-error"><p>';
        echo '<strong>ClientSync Support:</strong> Some shortcodes are missing: ';
        echo esc_html(implode(', ', array_map(function($tag) { return "[$tag]"; }, $status['missing'])));
        echo '</p></div>';
    }
}

// Uncomment the next line to show shortcode status in admin
// add_action('admin_notices', 'cs_support_admin_notice_shortcodes');

/**
 * Test shortcode rendering
 */
function cs_support_test_shortcode_rendering() {
    $tests = [
        '[cs_support]' => 'Basic support form',
        '[cs_support title="Test"]' => 'Support form with custom title',
        '[cs_support_tickets]' => 'Basic tickets list',
        '[cs_support_tickets tickets_per_page="5"]' => 'Tickets list with custom pagination'
    ];
    
    echo '<div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">';
    echo '<h3>ClientSync Support Shortcode Tests</h3>';
    
    foreach ($tests as $shortcode => $description) {
        echo '<h4>' . esc_html($description) . '</h4>';
        echo '<p><code>' . esc_html($shortcode) . '</code></p>';
        
        $output = do_shortcode($shortcode);
        if (!empty($output)) {
            echo '<div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">';
            echo wp_kses_post($output);
            echo '</div>';
        } else {
            echo '<p style="color: red;">No output generated</p>';
        }
    }
    
    echo '</div>';
}

// Uncomment the next line to show test rendering on frontend
// add_action('wp_footer', 'cs_support_test_shortcode_rendering');
