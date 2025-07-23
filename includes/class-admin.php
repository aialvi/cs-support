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
			'cs-support_page_clientsync-support-helpdesk-team',
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
					__('Please run `pnpm build` or `pnpm `dev` inside %s directory.', 'clientsync-support'),
					$this->plugin->dir
				)
			);

			return;
		}

		$asset = include $asset_filepath;

		if (empty($asset) || ! is_array($asset)) {
			wp_trigger_error(
				__METHOD__,
				__('Invalid asset file.', 'clientsync-support')
			);

			return;
		}

		wp_enqueue_style(
			"{$this->plugin->prefix}-admin",
			"{$this->plugin->url}build/tailwind-style.css",
			[],
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
					'apiBaseUrl' => rest_url('cs-support/v1'),
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

		// Load team management assets
		if ($hook === 'cs-support_page_clientsync-support-helpdesk-team') {
			$asset_file = include "{$this->plugin->dir}build/admin/team-management.asset.php";

			wp_enqueue_script(
				"{$this->plugin->prefix}-team-management",
				"{$this->plugin->url}build/admin/team-management.js",
				$asset_file['dependencies'],
				$asset_file['version'],
				true
			);

			wp_localize_script(
				"{$this->plugin->prefix}-team-management",
				'CS_SUPPORT_HELPDESK_TEAM_CONFIG',
				$this->get_script_data()
			);
		}
	}

	/**
	 * Generate a nonced URL for ticket viewing
	 *
	 * @param int $ticket_id The ticket ID to view
	 * @return string The URL with nonce
	 */
	protected function get_ticket_view_url(int $ticket_id): string
	{
		return add_query_arg(
			[
				'page' => 'clientsync-support-helpdesk-tickets',
				'ticket_id' => absint($ticket_id),
				'_wpnonce' => wp_create_nonce('view_ticket_' . absint($ticket_id))
			],
			admin_url('admin.php')
		);
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
			'adminUrl' => admin_url('admin.php'),
			'ticketsPage' => 'clientsync-support-helpdesk-tickets',
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
			__('CS Support', 'clientsync-support'),
			__('CS Support', 'clientsync-support'),
			'manage_options',
			'clientsync-support-helpdesk',
			$this->render_page(...),
			'dashicons-schedule',
			'3.2'
		);

		// add_submenu_page(
		// 	'clientsync-support-helpdesk',
		// 	__('Create Ticket', 'clientsync-support'),
		// 	__('Create Ticket', 'clientsync-support'),
		// 	'manage_options',
		// 	'clientsync-support-helpdesk-create-ticket',
		// 	[$this, 'render_create_ticket_page']
		// );

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Tickets', 'clientsync-support'),
			__('Tickets', 'clientsync-support'),
			'read', // Allow any logged-in user, but we'll do detailed permission check in the page
			'clientsync-support-helpdesk-tickets',
			[$this, 'render_tickets_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Team Management', 'clientsync-support'),
			__('Team Management', 'clientsync-support'),
			'assign_tickets',
			'clientsync-support-helpdesk-team',
			[$this, 'render_team_management_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Settings', 'clientsync-support'),
			__('Settings', 'clientsync-support'),
			'manage_options',
			'clientsync-support-helpdesk-settings',
			[$this, 'render_settings_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('FAQ', 'clientsync-support'),
			__('FAQ', 'clientsync-support'),
			'manage_options',
			'clientsync-support-helpdesk-help',
			[$this, 'render_faq_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Shortcodes', 'clientsync-support'),
			__('Shortcodes', 'clientsync-support'),
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
		// Check if user has permission to view tickets
		if (!$this->can_user_access_tickets()) {
			wp_die(esc_html__('Sorry, you are not allowed to access this page.', 'clientsync-support'));
		}
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
        <div class="wrap cs-support-shortcodes-modern cs-support-shortcodes-fullwidth">
            <div class="cs-support-shortcodes-inner">
                <h1 class="cs-shortcodes-title">
                    <?php esc_html_e('ClientSync Support Shortcodes', 'clientsync-support'); ?>
                </h1>
                <div class="cs-support-shortcodes-help cs-shortcodes-grid">
                    <div class="cs-modern-card">
                        <h2 class="cs-modern-card-title"><?php esc_html_e('Support Form Shortcode', 'clientsync-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <p class="cs-shortcodes-desc"><?php esc_html_e('Display a support ticket creation form:', 'clientsync-support'); ?></p>
                            <code class="cs-modern-shortcode">[cs_support]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php esc_html_e('With Custom Attributes:', 'clientsync-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support title="Contact Us" submit_button_text="Send Message" background_color="#f8f9fa"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php esc_html_e('Available Attributes:', 'clientsync-support'); ?></h4>
                            <ul class="cs-modern-attributes">
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
                    <div class="cs-modern-card">
                        <h2 class="cs-modern-card-title"><?php esc_html_e('Tickets List Shortcode', 'clientsync-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <p class="cs-shortcodes-desc"><?php esc_html_e('Display the current user\'s support tickets:', 'clientsync-support'); ?></p>
                            <code class="cs-modern-shortcode">[cs_support_tickets]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php esc_html_e('With Custom Attributes:', 'clientsync-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support_tickets title="Your Tickets" tickets_per_page="5" accent_color="#007cba"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php esc_html_e('Available Attributes:', 'clientsync-support'); ?></h4>
                            <ul class="cs-modern-attributes">
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
                    <div class="cs-modern-card">
                        <h2 class="cs-modern-card-title"><?php esc_html_e('Usage Examples', 'clientsync-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <h4 class="cs-shortcodes-subtitle"><?php esc_html_e('Contact Page:', 'clientsync-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support title="Contact Us" submit_button_text="Send Message" background_color="#f8f9fa" button_color="#007cba"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php esc_html_e('User Dashboard:', 'clientsync-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support_tickets title="My Tickets" tickets_per_page="5"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php esc_html_e('Widget Area (Sidebar):', 'clientsync-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support show_title="false" max_width="100%" submit_button_text="Get Help"]</code>
                        </div>
                    </div>
                    <div class="cs-modern-card">
                        <h2 class="cs-modern-card-title"><?php esc_html_e('Notes', 'clientsync-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <ul>
                                <li><?php esc_html_e('Shortcodes work in any editor: Classic Editor, Gutenberg, page builders, and widget areas.', 'clientsync-support'); ?></li>
                                <li><?php esc_html_e('The ticket list shortcode only shows tickets for the currently logged-in user.', 'clientsync-support'); ?></li>
                                <li><?php esc_html_e('Colors can be specified using hex values (#ffffff) or CSS color names (white).', 'clientsync-support'); ?></li>
                                <li><?php esc_html_e('All forms are responsive and include accessibility features.', 'clientsync-support'); ?></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <?php
            // Enqueue admin shortcodes styles
            wp_enqueue_style(
                'clientsync-cs-support-admin-shortcodes',
                plugin_dir_url(__FILE__) . '../assets/admin-shortcodes.css',
                [],
                '1.0.0'
            );
            ?>
        </div>
        <?php
	}

	/**
	 * Render the team management page
	 */
	public function render_team_management_page(): void
	{
	?>
		<div class="wrap">
			<div id="cs-support-team-management"></div>
		</div>
	<?php
	}

	/**
	 * Check if current user can access tickets page
	 *
	 * @return bool True if user has access
	 */
	protected function can_user_access_tickets(): bool
	{
		$current_user_id = get_current_user_id();

		// Admins can access all tickets
		if (current_user_can('manage_options')) {
			return true;
		}

		// Support team members can access tickets
		if (current_user_can('view_all_tickets') || current_user_can('edit_tickets') || current_user_can('reply_to_tickets')) {
			return true;
		}

		// If accessing a specific ticket, check if user is assigned to it or owns it
		if (isset($_GET['ticket_id'])) {
			$ticket_id = (int) $_GET['ticket_id'];

			// Check nonce when viewing specific tickets
			$nonce_action = 'view_ticket_' . $ticket_id;
			$nonce_ok = isset($_GET['_wpnonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_GET['_wpnonce'])), $nonce_action);

			// If nonce is provided but invalid, deny access
			if (isset($_GET['_wpnonce']) && !$nonce_ok) {
				wp_die(esc_html__('Security check failed. Please try again.', 'clientsync-support'));
			}

			return $this->can_user_access_ticket($ticket_id, $current_user_id);
		}

		// Regular users can access their own tickets
		return is_user_logged_in();
	}

	/**
	 * Check if user can access a specific ticket
	 *
	 * @param int $ticket_id Ticket ID
	 * @param int $user_id User ID
	 * @return bool True if user has access
	 */
	protected function can_user_access_ticket(int $ticket_id, int $user_id): bool
	{
		global $wpdb;

		// Admins can access all tickets
		if (current_user_can('manage_options')) {
			return true;
		}

		// Support team members can access tickets
		if (current_user_can('view_all_tickets') || current_user_can('edit_tickets') || current_user_can('reply_to_tickets')) {
			return true;
		}

		// Check if user is the ticket owner or assignee
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- Access control check, not worth caching
		$ticket = $wpdb->get_row(
			$wpdb->prepare(
				"SELECT user_id, assignee_id FROM {$wpdb->prefix}cs_support_tickets WHERE id = %d",
				$ticket_id
			),
			ARRAY_A
		);

		if (!$ticket) {
			return false;
		}

		// User owns the ticket or is assigned to it
		return ($ticket['user_id'] == $user_id) || ($ticket['assignee_id'] == $user_id);
	}
}
