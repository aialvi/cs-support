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
			'cs-support_page_clientsync-support-helpdesk-help'
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

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Create Ticket', 'clientsync-support-helpdesk'),
			__('Create Ticket', 'clientsync-support-helpdesk'),
			'manage_options',
			'clientsync-support-helpdesk-create-ticket',
			[$this, 'render_create_ticket_page']
		);

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
<?php
	}
}
