<?php
/**
 * Plugin Name:       CS Support
 * Description:       CS Support plugin
 * Plugin URI:        https://github.com/aialvi/cs-support
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            clientsync
 * Author URI:        https://clientsync.tech
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       cs-support
 * Domain Path: 	  /languages
 *
 * @package Clientsync
 */

namespace ClientSync\CS_Support;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/includes/namespace.php';
require_once __DIR__ . '/includes/constants.php';

bootstrap();

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function clientsync_cs_support_block_init() {
	// Register the main support form block
	\register_block_type( __DIR__ . '/build/' . PLUGIN_NAME );
	
	// Register the frontend display block
	\register_block_type( __DIR__ . '/build/cs-support-frontend' );
}

\add_action( 'init', __NAMESPACE__ . '\\clientsync_cs_support_block_init' );