<?php
/**
 * Plugin Name:       ClientSync Support - Customer Support Ticket System
 * Description:       ClientSync Support plugin for managing customer support tickets, AI-generated replies, and assign tickets to support staff.
 * Plugin URI:        https://github.com/aialvi/clientsync-support
 * Version:           1.0.1
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            clientsync
 * Author URI:        https://clientsync.tech
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       clientsync-support
 *
 * @package Clientsync
 */

namespace ClientSync\CS_Support;

if (! defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/includes/namespace.php';
require_once __DIR__ . '/includes/constants.php';
require_once __DIR__ . '/includes/api-schema.php';

bootstrap();

// Register deactivation hook to clean up scheduled events
register_deactivation_hook(__FILE__, function() {
    GDPR_Manager::deactivate();
});
