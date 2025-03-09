<?php

/**
 * Editor class.
 *
 * @package cs-support
 */

declare(strict_types=1);

namespace ClientSync\CS_Support;

/**
 * Editor class.
 */
class Editor
{
	/**
	 * Constructor
	 *
	 * @param Plugin $plugin Plugin instance.
	 */
	public function __construct(protected Plugin $plugin)
	{
		add_action('wp_enqueue_scripts', [$this, 'enqueue_block_assets']);
	}

	/**
	 * Enqueue block assets for the frontend
	 */
	public function enqueue_block_assets(): void
	{
		// Only enqueue if the block is present on the page

		wp_enqueue_script('wp-api');

		// Add nonce for REST API
		wp_localize_script('wp-api', 'wpApiSettings', array(
			'nonce' => wp_create_nonce('wp_rest'),
			'root' => esc_url_raw(rest_url()),
		));
	}
}
