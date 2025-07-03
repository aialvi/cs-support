<?php

/**
 * Database Updater class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

class DB_Updater
{
    /**
     * Plugin instance.
     *
     * @var Plugin
     */
    protected $plugin;

    /**
     * Constructor.
     *
     * @param Plugin $plugin Plugin instance.
     */
    public function __construct(Plugin $plugin)
    {
        $this->plugin = $plugin;
        add_action('init', [$this, 'check_db_updates']);
    }

    /**
     * Check if database needs updates.
     *
     * @return void
     */
    public function check_db_updates(): void
    {
        $db_version = get_option('cs_support_db_version', '0');
        
        // If we're already at the latest version, do nothing
        if (version_compare($db_version, PLUGIN_VERSION, '>=')) {
            return;
        }
        
        // Run the update methods
        $this->update_db_structure();
        
        // Update the DB version
        update_option('cs_support_db_version', PLUGIN_VERSION);
    }

    /**
     * Update database structure.
     *
     * @return void
     */
    private function update_db_structure(): void
    {
        global $wpdb;

        // Check if is_system_note column exists
        $column_exists = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = %s 
                AND TABLE_NAME = %s 
                AND COLUMN_NAME = 'is_system_note'",
                DB_NAME,
                $wpdb->prefix . 'cs_support_ticket_replies'
            )
        );

        // If column doesn't exist, add it
        if (empty($column_exists)) {
            $wpdb->query(
                "ALTER TABLE {$wpdb->prefix}cs_support_ticket_replies 
                ADD COLUMN is_system_note TINYINT(1) NOT NULL DEFAULT 0"
            );
        }

        // Check if assignee_id column exists in tickets table
        $assignee_column_exists = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = %s 
                AND TABLE_NAME = %s 
                AND COLUMN_NAME = 'assignee_id'",
                DB_NAME,
                $wpdb->prefix . 'cs_support_tickets'
            )
        );

        // If assignee_id column doesn't exist, add it
        if (empty($assignee_column_exists)) {
            $wpdb->query(
                "ALTER TABLE {$wpdb->prefix}cs_support_tickets 
                ADD COLUMN assignee_id BIGINT(20) UNSIGNED DEFAULT NULL"
            );
        }
    }
}
