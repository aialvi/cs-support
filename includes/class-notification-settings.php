<?php
/**
 * Notification settings management class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

class Notification_Settings
{
    /**
     * Plugin instance.
     *
     * @var Plugin
     */
    protected $plugin;

    /**
     * Default notification settings.
     */
    const DEFAULT_SETTINGS = [
        'assignment_notifications' => true,
        'reassignment_notifications' => true,
        'status_change_notifications' => true,
        'notify_admins_on_assignment' => false,
        'email_template_style' => 'default',
        'custom_from_email' => '',
        'custom_from_name' => '',
    ];

    /**
     * Constructor.
     *
     * @param Plugin $plugin Plugin instance.
     */
    public function __construct(Plugin $plugin)
    {
        $this->plugin = $plugin;
    }

    /**
     * Get notification settings.
     *
     * @return array Notification settings.
     */
    public function get_settings(): array
    {
        $settings = get_option('cs_support_notification_settings', []);
        return wp_parse_args($settings, self::DEFAULT_SETTINGS);
    }

    /**
     * Update notification settings.
     *
     * @param array $settings New settings.
     * @return bool True if settings were updated successfully.
     */
    public function update_settings(array $settings): bool
    {
        $current_settings = $this->get_settings();
        $updated_settings = wp_parse_args($settings, $current_settings);

        // Sanitize settings
        $sanitized = $this->sanitize_settings($updated_settings);

        return update_option('cs_support_notification_settings', $sanitized);
    }

    /**
     * Check if a specific notification type is enabled.
     *
     * @param string $notification_type Notification type.
     * @return bool True if enabled.
     */
    public function is_notification_enabled(string $notification_type): bool
    {
        $settings = $this->get_settings();
        return !empty($settings[$notification_type]);
    }

    /**
     * Get custom email headers based on settings.
     *
     * @return array Email headers.
     */
    public function get_email_headers(): array
    {
        $settings = $this->get_settings();
        $headers = ['Content-Type: text/html; charset=UTF-8'];

        $from_email = !empty($settings['custom_from_email'])
            ? $settings['custom_from_email']
            : get_option('admin_email');

        $from_name = !empty($settings['custom_from_name'])
            ? $settings['custom_from_name']
            : get_bloginfo('name');

        $headers[] = 'From: ' . $from_name . ' <' . $from_email . '>';

        return $headers;
    }

    /**
     * Sanitize notification settings.
     *
     * @param array $settings Raw settings.
     * @return array Sanitized settings.
     */
    private function sanitize_settings(array $settings): array
    {
        $sanitized = [];

        // Boolean settings
        $boolean_keys = [
            'assignment_notifications',
            'reassignment_notifications',
            'status_change_notifications',
            'notify_admins_on_assignment'
        ];

        foreach ($boolean_keys as $key) {
            $sanitized[$key] = !empty($settings[$key]);
        }

        // String settings
        $sanitized['email_template_style'] = sanitize_text_field($settings['email_template_style'] ?? 'default');
        $sanitized['custom_from_email'] = sanitize_email($settings['custom_from_email'] ?? '');
        $sanitized['custom_from_name'] = sanitize_text_field($settings['custom_from_name'] ?? '');

        return $sanitized;
    }

    /**
     * Get notification statistics.
     *
     * @return array Statistics about sent notifications.
     */
    public function get_notification_stats(): array
    {
        global $wpdb;

        // This would require a notifications log table in a real implementation
        // For now, return mock data
        return [
            'total_sent' => 0,
            'assignment_notifications' => 0,
            'reassignment_notifications' => 0,
            'status_change_notifications' => 0,
            'failed_notifications' => 0,
        ];
    }
}
