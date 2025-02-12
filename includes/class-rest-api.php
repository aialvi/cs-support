<?php
/**
 * REST API class.
 *
 * @package cs-support
 */

namespace ClientSync\CS_Support;

/**
 * REST API class.
 */
class Rest_API {

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
