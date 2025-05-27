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
		add_action('init', [$this, 'register_block_styles']);
		add_action('wp_enqueue_scripts', [$this, 'enqueue_frontend_assets'], 5);
		add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
	}

	/**
	 * Register block styles that can be used by both blocks and shortcodes
	 */
	public function register_block_styles(): void
	{
		$blocks = ['cs-support', 'cs-support-frontend'];
		
		foreach ($blocks as $block_name) {
			$style_file = $this->plugin->dir . 'build/' . $block_name . '/style-index.css';
			if (file_exists($style_file)) {
				wp_register_style(
					'cs-support-' . $block_name . '-style',
					$this->plugin->url . 'build/' . $block_name . '/style-index.css',
					[],
					filemtime($style_file)
				);
			}
		}
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
			// Check for blocks
			if (has_block('clientsync/cs-support', $post) || 
				has_block('clientsync/cs-support-frontend', $post)) {
				$should_load_assets = true;
			}
			
			// Check for shortcodes
			if (has_shortcode($post->post_content, 'cs_support') || 
				has_shortcode($post->post_content, 'cs_support_tickets')) {
				$should_load_assets = true;
			}
		}
		
		// Load assets if needed
		if ($should_load_assets) {
			// Enqueue block styles
			wp_enqueue_style('cs-support-cs-support-style');
			wp_enqueue_style('cs-support-cs-support-frontend-style');
			
			// Enqueue API scripts
			wp_enqueue_script('wp-api');
			wp_localize_script('wp-api', 'wpApiSettings', array(
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
		// Always load in editor
		wp_enqueue_style('cs-support-cs-support-style');
		wp_enqueue_style('cs-support-cs-support-frontend-style');
		
		wp_enqueue_script('wp-api');
		wp_localize_script('wp-api', 'wpApiSettings', array(
			'nonce' => wp_create_nonce('wp_rest'),
			'root' => esc_url_raw(rest_url()),
		));
	}
}
