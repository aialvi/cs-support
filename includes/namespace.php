<?php
/**
 * cs-support namespace file.
 *
 * @package cs-support
 */

declare ( strict_types=1 );

namespace ClientSync\CS_Support;

/**
 * Get plugin instance.
 *
 * @return Plugin
 */
function get_plugin_instance() {
	static $instance;
	if ( is_null( $instance ) ) {
		$instance = new Plugin();
	}
	return $instance;
}

/**
 * Bootstraps the plugin.
 *
 * @return void
 */
function bootstrap(): void {
	static $plugin_instance = null;

	if ( $plugin_instance === null ) {
		$plugin_instance = new Plugin();
		$plugin_instance->init( dirname( __DIR__, 1 ) . '/clientsync-support.php' );
	}

	// Use the same initialized plugin instance for all classes
	new Editor( $plugin_instance );
	new Admin( $plugin_instance );
	new Rest_API( $plugin_instance );
	new DB_Updater( $plugin_instance );
	new Team_Members( $plugin_instance );
	new AI_Assistant( $plugin_instance );
	new Notification_Settings( $plugin_instance );
	new GDPR_Manager();

	// Initialize notifications
	$notifications = new Notifications( $plugin_instance );
	$plugin_instance->set_notifications( $notifications );


	// Initialize shortcodes
	$shortcodes = new Shortcodes();
	$shortcodes->init();

	// Register blocks
	add_action( 'init', function() {
		register_block_type( __DIR__ . '/../build/cs-support' );
		register_block_type( __DIR__ . '/../build/cs-support-frontend' );
	});
}
