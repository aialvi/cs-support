<?php
/**
 * Plugin class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

/**
 * Plugin class.
 */
class Plugin {

    /**
     * Prefix for plugin options.
     *
     * @var string
     */
    public $prefix;

    /**
     * Rest namespace.
     *
     * @var string
     */
    public $rest_namespace;

    /**
     * Plugin display name.
     *
     * @var string
     */
    public $display_name;

    /**
     * Plugin version.
     *
     * @var string
     */
    public string $version = '0.1.0';

    /**
     * Plugin text domain for translations.
     *
     * @var string
     */
    public $text_domain;

    /**
     * Plugin directory path.
     *
     * @var string
     */
    public $dir;

    /**
     * Plugin directory URL.
     *
     * @var string
     */
    public $url;

    /**
     * Plugin basename.
     *
     * @var string
     */
    public string $basename;

    /**
     * Clone function.
     *
     * @return void
     * @throws \Exception Cloning is not allowed.
     */
    public function __clone(): void
    {
        throw new \Exception('Cloning ' . __CLASS__ . ' is not allowed.');
    }

    /**
     * Wakeup function.
     *
     * @return void
     * @throws \Exception Unserializing is not allowed.
     */
    public function __wakeup(): void
    {
        throw new \Exception('Unserializing ' . __CLASS__ . ' is not allowed.');
    }

    /**
     * Initialize the plugin.
     *
     * @param string $file Plugin file.
     *
     * @return void
     */
    public function init(string $file): void
    {
        $plugin_file_data = get_file_data(
            $file,
            [
                'display_name' => 'CS Support',
                'version'      => '0.1.0',
                'text_domain'  => 'cs-support',
            ]
        );

        $this->prefix         = 'cs_support';
        $this->display_name   = isset($plugin_file_data['display_name']) ? $plugin_file_data['display_name'] : '';
        $this->version        = isset($plugin_file_data['version']) ? $plugin_file_data['version'] : '1.0.0';
        $this->text_domain    = isset($plugin_file_data['text_domain']) ? $plugin_file_data['text_domain'] : '';
        $this->dir            = plugin_dir_path($file);
        $this->url            = plugin_dir_url($file);
        $this->basename       = plugin_basename($file);

        // Initialize hooks
        add_action('init', [$this, 'create_roles']);
        register_activation_hook($file, [$this, 'create_table']);
    }

    public function create_roles(): void
    {
        // Add Admin role
        add_role(
            'support_admin',
            __('Support Admin', 'clientsync-support-helpdesk'),
            [
                'read' => true,
                'edit_tickets' => true,
                'manage_options' => true,
            ]
        );

        // Add capabilities to Administrator role
        $admin_role = get_role('administrator');
        if ($admin_role) {
            $admin_role->add_cap('edit_tickets');
            $admin_role->add_cap('delete_tickets');
            $admin_role->add_cap('create_tickets');
        }
    }

    public function create_table(): void
    {
        global $wpdb;

        $table_name = $wpdb->prefix . 'cs_' . 'support_tickets';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED DEFAULT NULL,
            assignee_id BIGINT(20) UNSIGNED DEFAULT NULL,
            subject TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'NEW',
            priority VARCHAR(20) NOT NULL DEFAULT 'normal',
            category VARCHAR(50) DEFAULT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) $charset_collate;";

        $table_replies = $wpdb->prefix . 'cs_' . 'support_ticket_replies';
        $sql_replies = "CREATE TABLE IF NOT EXISTS $table_replies (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            ticket_id BIGINT UNSIGNED NOT NULL,
            user_id BIGINT UNSIGNED NOT NULL,
            reply TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        dbDelta($sql_replies);
    }
}
