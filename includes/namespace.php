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

	$plugin_instance = get_plugin_instance();
	$plugin_instance->init( dirname( __DIR__, 1 ) . '/cs-support.php' );

	new Editor( get_plugin_instance() );
	new Admin( get_plugin_instance() );
	new Rest_API( get_plugin_instance() );
	new DB_Updater( get_plugin_instance() );
	
	// Initialize shortcodes
	$shortcodes = new Shortcodes();
	$shortcodes->init();
}
