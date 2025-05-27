<?php

/**
 * Editor class.
 *
 * @package cs-support
 */

declare(strict_types=1);

namespace ClientSync\CS_Support;

/**
 * Admin class.
 */
class Admin
{

	/**
	 * Content element ID.
	 *
	 * @var string
	 */
	const CONTENT_ID = 'cs-support-admin';

	/**
	 * Page hook suffix
	 *
	 * @var string
	 */
	protected $hook;


	/**
	 * Constructor
	 *
	 * @param Plugin $plugin Plugin instance.
	 */
	public function __construct(protected Plugin $plugin)
	{
		add_action('admin_menu', $this->register_page(...));
		add_action('admin_enqueue_scripts', $this->enqueue_scripts(...));
	}

	/**
	 * Enqueue assets for our admin page
	 *
	 * @param string $hook Current admin page hook.
	 */
	protected function enqueue_scripts(string $hook): void
	{
		// Only load on our plugin pages
		if (!in_array($hook, [
			$this->hook,
			'cs-support_page_clientsync-support-helpdesk-create-ticket',
			'cs-support_page_clientsync-support-helpdesk-tickets',
			'cs-support_page_clientsync-support-helpdesk-settings',
			'cs-support_page_clientsync-support-helpdesk-help',
			'cs-support_page_clientsync-support-helpdesk-shortcodes'
		])) {
			return;
		}

		$asset_filepath = "{$this->plugin->dir}build/admin/admin.asset.php";

		if (! file_exists($asset_filepath)) {
			wp_trigger_error(
				__METHOD__,
				sprintf(
					// Translators: %s Plugin directory path.
					__('Please run `pnpm build` or `pnpm `dev` inside %s directory.', 'clientsync-support-helpdesk'),
					$this->plugin->dir
				)
			);

			return;
		}

		$asset = include $asset_filepath;

		if (empty($asset) || ! is_array($asset)) {
			wp_trigger_error(
				__METHOD__,
				__('Invalid asset file.', 'clientsync-support-helpdesk')
			);

			return;
		}

		wp_enqueue_style(
			"{$this->plugin->prefix}-admin",
			"{$this->plugin->url}build/tailwind-style.css",
			$asset['version']
		);

		wp_enqueue_script(
			"{$this->plugin->prefix}-admin",
			"{$this->plugin->url}build/admin/admin.js",
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_add_inline_script(
			"{$this->plugin->prefix}-admin",
			sprintf(
				'var CS_SUPPORT_HELPDESK_CONFIG = %1$s;',
				wp_json_encode($this->get_script_data())
			),
			'before'
		);


		// Load create ticket assets
		if ($hook === 'cs-support_page_clientsync-support-helpdesk-create-ticket') {
			$asset_file = include "{$this->plugin->dir}build/admin/create-ticket.asset.php";

			wp_enqueue_style(
				"{$this->plugin->prefix}-create-ticket",
				"{$this->plugin->url}build/admin/create-ticket.css",
				[],
				$asset_file['version']
			);

			wp_enqueue_script(
				"{$this->plugin->prefix}-create-ticket",
				"{$this->plugin->url}build/admin/create-ticket.js",
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_localize_script(
				"{$this->plugin->prefix}-create-ticket",
				'CS_SUPPORT_HELPDESK_CREATE_TICKET_CONFIG',
				$this->get_script_data()
			);
		}

		// Load tickets list assets
		if ($hook === 'cs-support_page_clientsync-support-helpdesk-tickets') {
			$asset_file = include "{$this->plugin->dir}build/admin/tickets.asset.php";

			wp_enqueue_script(
				"{$this->plugin->prefix}-tickets",
				"{$this->plugin->url}build/admin/tickets.js",
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_localize_script(
				"{$this->plugin->prefix}-tickets",
				'CS_SUPPORT_HELPDESK_TICKETS_CONFIG',
				$this->get_script_data()
			);
		}

		// Load settings page assets
		if ($hook === 'cs-support_page_clientsync-support-helpdesk-settings') {
			$asset_file = include "{$this->plugin->dir}build/admin/settings.asset.php";

			wp_enqueue_script(
				"{$this->plugin->prefix}-settings",
				"{$this->plugin->url}build/admin/settings.js",
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_localize_script(
				"{$this->plugin->prefix}-settings",
				'CS_SUPPORT_HELPDESK_SETTINGS_CONFIG',
				[
					'nonce' => wp_create_nonce('wp_rest'),
					'apiUrl' => rest_url('cs-support/v1/settings'),
					'initialSettings' => get_option('cs_support_helpdesk_settings', [
						'general' => [
							'defaultPriority' => 'normal',
						],
					]),
				]
			);
		}

		// Load FAQ page assets
		if ($hook === 'cs-support_page_clientsync-support-helpdesk-help') {
			$asset_file = include "{$this->plugin->dir}build/admin/faq.asset.php";

			wp_enqueue_script(
				"{$this->plugin->prefix}-faq",
				"{$this->plugin->url}build/admin/faq.js",
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_localize_script(
				"{$this->plugin->prefix}-faq",
				'CS_SUPPORT_HELPDESK_FAQ_CONFIG',
				[
					'nonce' => wp_create_nonce('wp_rest'),
				]
			);
		}
	}

	/**
	 * Get script data
	 *
	 * @return array
	 */
	protected function get_script_data(): array
	{
		return [
			'containerId' => self::CONTENT_ID,
			'nonce' => wp_create_nonce('wp_rest'),
			'createTicketFormId' => 'cs-create-ticket-form',
			'apiUrl' => rest_url('cs-support/v1'),
			'ticketsUrl' => rest_url('cs-support/v1/tickets'),
			'repliesUrl' => rest_url('cs-support/v1/tickets/%s/replies'),
		];
	}

	/**
	 * Get create ticket script data
	 *
	 * @return array
	 */
	protected function get_create_ticket_script_data(): array
	{
		return [
			'nonce' => wp_create_nonce('wp_rest'),
			'apiUrl' => rest_url('cs-support/v1/tickets'),
		];
	}


	/**
	 * Add top-level settings page for the plugin
	 */
	protected function register_page(): void
	{
		$this->hook = add_menu_page(
			__('CS Support', 'clientsync-support-helpdesk'),
			__('CS Support', 'clientsync-support-helpdesk'),
			'manage_options',
			'clientsync-support-helpdesk',
			$this->render_page(...),
			'dashicons-schedule',
			'3.2'
		);

		// add_submenu_page(
		// 	'clientsync-support-helpdesk',
		// 	__('Create Ticket', 'clientsync-support-helpdesk'),
		// 	__('Create Ticket', 'clientsync-support-helpdesk'),
		// 	'manage_options',
		// 	'clientsync-support-helpdesk-create-ticket',
		// 	[$this, 'render_create_ticket_page']
		// );

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Tickets', 'clientsync-support-helpdesk'),
			__('Tickets', 'clientsync-support-helpdesk'),
			'manage_options',
			'clientsync-support-helpdesk-tickets',
			[$this, 'render_tickets_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Settings', 'clientsync-support-helpdesk'),
			__('Settings', 'clientsync-support-helpdesk'),
			'manage_options',
			'clientsync-support-helpdesk-settings',
			[$this, 'render_settings_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('FAQ', 'clientsync-support-helpdesk'),
			__('FAQ', 'clientsync-support-helpdesk'),
			'manage_options',
			'clientsync-support-helpdesk-help',
			[$this, 'render_faq_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Shortcodes', 'clientsync-support-helpdesk'),
			__('Shortcodes', 'clientsync-support-helpdesk'),
			'manage_options',
			'clientsync-support-helpdesk-shortcodes',
			[$this, 'render_shortcodes_page']
		);
	}

	/**
	 * Render the admin page
	 */
	protected function render_page(): void
	{
?>
		<div class="wrap">
			<div id="<?php echo esc_attr(self::CONTENT_ID); ?>"></div>
		</div>
	<?php
	}

	/**
	 * Render the create ticket page
	 */
	public function render_create_ticket_page(): void
	{
	?>
		<div class="wrap">
			<div id="cs-create-ticket-form"></div>
		</div>
	<?php
	}

	/**
	 * Render the tickets page
	 */
	public function render_tickets_page(): void
	{
	?>
		<div class="wrap">
			<div id="cs-tickets-table"></div>
		</div>
	<?php
	}

	/**
	 * Render the settings page
	 */
	public function render_settings_page(): void
	{
	?>
		<div class="wrap">
			<div id="cs-settings"></div>
		</div>
	<?php
	}

	/**
	 * Render the help page
	 */
	public function render_faq_page(): void
	{
	?>
		<div class="wrap">
			<div id="cs-faq"></div>
		</div>
	<?php
	}

	/**
	 * Render the shortcodes page
	 */
	public function render_shortcodes_page(): void
	{
		?>
		<div class="wrap">
			<h1><?php _e('CS Support Shortcodes', 'clientsync-support-helpdesk'); ?></h1>
			
			<div class="cs-support-shortcodes-help">
				<p><?php _e('Use these shortcodes to add CS Support forms and ticket displays to any page, post, or widget area.', 'clientsync-support-helpdesk'); ?></p>
				
				<div class="postbox">
					<h2 class="hndle"><?php _e('Support Form Shortcode', 'clientsync-support-helpdesk'); ?></h2>
					<div class="inside">
						<p><?php _e('Display a support ticket creation form:', 'clientsync-support-helpdesk'); ?></p>
						<code class="shortcode-example">[cs_support]</code>
						
						<h4><?php _e('With Custom Attributes:', 'clientsync-support-helpdesk'); ?></h4>
						<code class="shortcode-example">[cs_support title="Contact Us" submit_button_text="Send Message" background_color="#f8f9fa"]</code>
						
						<h4><?php _e('Available Attributes:', 'clientsync-support-helpdesk'); ?></h4>
						<ul class="shortcode-attributes">
							<li><strong>title</strong> - Form title (default: "Create a new support ticket")</li>
							<li><strong>show_title</strong> - Show/hide title: "true" or "false" (default: "true")</li>
							<li><strong>submit_button_text</strong> - Button text (default: "Create Ticket")</li>
							<li><strong>background_color</strong> - Form background color (default: "#ffffff")</li>
							<li><strong>text_color</strong> - Text color (default: "#000000")</li>
							<li><strong>button_color</strong> - Button background color (default: "#2c3338")</li>
							<li><strong>button_text_color</strong> - Button text color (default: "#ffffff")</li>
							<li><strong>max_width</strong> - Maximum form width (default: "600px")</li>
							<li><strong>border_radius</strong> - Border radius (default: "8px")</li>
							<li><strong>box_shadow</strong> - Enable box shadow: "true" or "false" (default: "false")</li>
							<li><strong>button_align</strong> - Button alignment: "left", "center", or "right" (default: "left")</li>
							<li><strong>button_full_width</strong> - Full width button: "true" or "false" (default: "false")</li>
						</ul>
					</div>
				</div>
				
				<div class="postbox">
					<h2 class="hndle"><?php _e('Tickets List Shortcode', 'clientsync-support-helpdesk'); ?></h2>
					<div class="inside">
						<p><?php _e('Display the current user\'s support tickets:', 'clientsync-support-helpdesk'); ?></p>
						<code class="shortcode-example">[cs_support_tickets]</code>
						
						<h4><?php _e('With Custom Attributes:', 'clientsync-support-helpdesk'); ?></h4>
						<code class="shortcode-example">[cs_support_tickets title="Your Tickets" tickets_per_page="5" accent_color="#007cba"]</code>
						
						<h4><?php _e('Available Attributes:', 'clientsync-support-helpdesk'); ?></h4>
						<ul class="shortcode-attributes">
							<li><strong>title</strong> - List title (default: "My Support Tickets")</li>
							<li><strong>tickets_per_page</strong> - Number of tickets per page (default: "10")</li>
							<li><strong>background_color</strong> - Background color (default: "#ffffff")</li>
							<li><strong>text_color</strong> - Text color (default: "#000000")</li>
							<li><strong>accent_color</strong> - Accent color for buttons and status (default: "#2c3338")</li>
							<li><strong>border_radius</strong> - Border radius (default: "8")</li>
							<li><strong>box_shadow</strong> - Enable box shadow: "true" or "false" (default: "true")</li>
							<li><strong>row_hover_effect</strong> - Enable row hover effect: "true" or "false" (default: "true")</li>
						</ul>
					</div>
				</div>
				
				<div class="postbox">
					<h2 class="hndle"><?php _e('Usage Examples', 'clientsync-support-helpdesk'); ?></h2>
					<div class="inside">
						<h4><?php _e('Contact Page:', 'clientsync-support-helpdesk'); ?></h4>
						<code class="shortcode-example">[cs_support title="Contact Us" submit_button_text="Send Message" background_color="#f8f9fa" button_color="#007cba"]</code>
						
						<h4><?php _e('User Dashboard:', 'clientsync-support-helpdesk'); ?></h4>
						<code class="shortcode-example">[cs_support_tickets title="My Tickets" tickets_per_page="5"]</code>
						
						<h4><?php _e('Widget Area (Sidebar):', 'clientsync-support-helpdesk'); ?></h4>
						<code class="shortcode-example">[cs_support show_title="false" max_width="100%" submit_button_text="Get Help"]</code>
					</div>
				</div>
				
				<div class="postbox">
					<h2 class="hndle"><?php _e('Notes', 'clientsync-support-helpdesk'); ?></h2>
					<div class="inside">
						<ul>
							<li><?php _e('Shortcodes work in any editor: Classic Editor, Gutenberg, page builders, and widget areas.', 'clientsync-support-helpdesk'); ?></li>
							<li><?php _e('The ticket list shortcode only shows tickets for the currently logged-in user.', 'clientsync-support-helpdesk'); ?></li>
							<li><?php _e('Colors can be specified using hex values (#ffffff) or CSS color names (white).', 'clientsync-support-helpdesk'); ?></li>
							<li><?php _e('All forms are responsive and include accessibility features.', 'clientsync-support-helpdesk'); ?></li>
						</ul>
					</div>
				</div>
			</div>
			
			<style>
			.cs-support-shortcodes-help .postbox {
				margin-bottom: 20px;
				padding: 20px;
			}
			.shortcode-example {
				display: block;
				background: #f1f1f1;
				padding: 10px;
				margin: 10px 0;
				border-left: 4px solid #0073aa;
				font-family: monospace;
				overflow-x: auto;
				white-space: nowrap;
			}
			.shortcode-attributes {
				margin-left: 20px;
			}
			.shortcode-attributes li {
				margin-bottom: 5px;
			}
			.shortcode-attributes strong {
				color: #0073aa;
			}
			</style>
		</div>
		<?php
	}
}
