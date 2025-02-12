<?php
/**
 * Editor class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

/**
 * Admin class.
 */
class Admin {

	/**
	 * Plugin instance.
	 *
	 * @var Plugin
	 */
	private Plugin $plugin;

	/**
	 * Constructor.
	 *
	 * @param Plugin $plugin Plugin instance.
	 */
	public function __construct( Plugin $plugin ) {
		$this->plugin = $plugin;
	}
}
