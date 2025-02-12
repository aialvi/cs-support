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
	 * Plugin version.
	 *
	 * @var string
	 */
	public string $version = '0.1.0';

	/**
	 * Plugin file.
	 *
	 * @var string
	 */
	public string $file = '';

	/**
	 * Initialize the plugin.
	 *
	 * @param string $file Plugin file.
	 *
	 * @return void
	 */
	public function init( string $file ): void {
		$this->file = $file;
	}
}
