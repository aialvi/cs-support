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
		add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets'], 5);
		add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
		add_filter('render_block', [$this, 'enqueue_block_assets'], 10, 2);
	}

	/**
	 * Enqueue assets when a block is rendered
	 */
	public function enqueue_block_assets($block_content, $block): string
	{
		if (in_array($block['blockName'], ['clientsync/cs-support', 'clientsync/cs-support-frontend'])) {
			// Enqueue the API script
			wp_enqueue_script('wp-api-fetch');

			// Add inline script to make wpApiSettings available globally
			wp_add_inline_script('wp-api-fetch',
				'window.wpApiSettings = window.wpApiSettings || {' .
				'nonce: "' . wp_create_nonce('wp_rest') . '",' .
				'root: "' . esc_url_raw(rest_url()) . '"' .
				'};',
				'before'
			);
		}

		return $block_content;
	}

	/**
	 * Enqueue frontend assets when blocks or shortcodes are present
	 */
	public function enqueue_frontend_assets(): void
	{
		global $post;
		$should_load_assets = false;

		// Check if we're on a page that might have blocks or shortcodes
		if (is_singular() && $post) {
			// Check for shortcodes (blocks are automatically handled by WordPress)
			if (has_shortcode($post->post_content, 'cs_support') ||
				has_shortcode($post->post_content, 'cs_support_tickets')) {
				$should_load_assets = true;
			}
		}

		// Load assets for shortcodes
		if ($should_load_assets) {
			// Get plugin instance for URLs
			$plugin_url = $this->plugin->url;

			// Enqueue shortcode styles (same as block styles)
			$cs_support_style = $plugin_url . 'build/cs-support/style-index.css';
			$cs_support_frontend_style = $plugin_url . 'build/cs-support-frontend/style-index.css';

			if (file_exists($this->plugin->dir . 'build/cs-support/style-index.css')) {
				wp_enqueue_style(
					'cs-support-shortcode-style',
					$cs_support_style,
					[],
					filemtime($this->plugin->dir . 'build/cs-support/style-index.css')
				);
			}

			if (file_exists($this->plugin->dir . 'build/cs-support-frontend/style-index.css')) {
				wp_enqueue_style(
					'cs-support-frontend-shortcode-style',
					$cs_support_frontend_style,
					[],
					filemtime($this->plugin->dir . 'build/cs-support-frontend/style-index.css')
				);
			}

			// Enqueue API scripts
			wp_enqueue_script('wp-api');
			wp_localize_script('wp-api', 'clientsyncCsSupportApiSettings', array(
				'nonce' => wp_create_nonce('wp_rest'),
				'root' => esc_url_raw(rest_url()),
			));
		}
	}

	/**
	 * Enqueue editor assets
	 */
	public function enqueue_editor_assets(): void
	{
		wp_enqueue_script('wp-api');
		wp_localize_script('wp-api', 'clientsyncCsSupportApiSettings', array(
			'nonce' => wp_create_nonce('wp_rest'),
			'root' => esc_url_raw(rest_url()),
		));
	}
}
