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
					__('Please run `pnpm build` or `pnpm `dev` inside %s directory.', 'cs-support'),
					$this->plugin->dir
				)
			);

			return;
		}

		$asset = include $asset_filepath;

		if (empty($asset) || ! is_array($asset)) {
			wp_trigger_error(
				__METHOD__,
				__('Invalid asset file.', 'cs-support')
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
			__('CS Support', 'cs-support'),
			__('CS Support', 'cs-support'),
			'manage_options',
			'clientsync-support-helpdesk',
			$this->render_page(...),
			'dashicons-schedule',
			'3.2'
		);

		// add_submenu_page(
		// 	'clientsync-support-helpdesk',
		// 	__('Create Ticket', 'cs-support'),
		// 	__('Create Ticket', 'cs-support'),
		// 	'manage_options',
		// 	'clientsync-support-helpdesk-create-ticket',
		// 	[$this, 'render_create_ticket_page']
		// );

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Tickets', 'cs-support'),
			__('Tickets', 'cs-support'),
			'read', // Allow any logged-in user, but we'll do detailed permission check in the page
			'clientsync-support-helpdesk-tickets',
			[$this, 'render_tickets_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Team Management', 'cs-support'),
			__('Team Management', 'cs-support'),
			'assign_tickets',
			'clientsync-support-helpdesk-team',
			[$this, 'render_team_management_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Settings', 'cs-support'),
			__('Settings', 'cs-support'),
			'manage_options',
			'clientsync-support-helpdesk-settings',
			[$this, 'render_settings_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('FAQ', 'cs-support'),
			__('FAQ', 'cs-support'),
			'manage_options',
			'clientsync-support-helpdesk-help',
			[$this, 'render_faq_page']
		);

		add_submenu_page(
			'clientsync-support-helpdesk',
			__('Shortcodes', 'cs-support'),
			__('Shortcodes', 'cs-support'),
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
			wp_die(__('Sorry, you are not allowed to access this page.', 'cs-support'));
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
                    <?php _e('CS Support Shortcodes', 'cs-support'); ?>
                </h1>
                <div class="cs-support-shortcodes-help cs-shortcodes-grid">
                    <div class="cs-modern-card">
                        <h2 class="cs-modern-card-title"><?php _e('Support Form Shortcode', 'cs-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <p class="cs-shortcodes-desc"><?php _e('Display a support ticket creation form:', 'cs-support'); ?></p>
                            <code class="cs-modern-shortcode">[cs_support]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php _e('With Custom Attributes:', 'cs-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support title="Contact Us" submit_button_text="Send Message" background_color="#f8f9fa"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php _e('Available Attributes:', 'cs-support'); ?></h4>
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
                        <h2 class="cs-modern-card-title"><?php _e('Tickets List Shortcode', 'cs-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <p class="cs-shortcodes-desc"><?php _e('Display the current user\'s support tickets:', 'cs-support'); ?></p>
                            <code class="cs-modern-shortcode">[cs_support_tickets]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php _e('With Custom Attributes:', 'cs-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support_tickets title="Your Tickets" tickets_per_page="5" accent_color="#007cba"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php _e('Available Attributes:', 'cs-support'); ?></h4>
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
                        <h2 class="cs-modern-card-title"><?php _e('Usage Examples', 'cs-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <h4 class="cs-shortcodes-subtitle"><?php _e('Contact Page:', 'cs-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support title="Contact Us" submit_button_text="Send Message" background_color="#f8f9fa" button_color="#007cba"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php _e('User Dashboard:', 'cs-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support_tickets title="My Tickets" tickets_per_page="5"]</code>
                            <h4 class="cs-shortcodes-subtitle"><?php _e('Widget Area (Sidebar):', 'cs-support'); ?></h4>
                            <code class="cs-modern-shortcode">[cs_support show_title="false" max_width="100%" submit_button_text="Get Help"]</code>
                        </div>
                    </div>
                    <div class="cs-modern-card">
                        <h2 class="cs-modern-card-title"><?php _e('Notes', 'cs-support'); ?></h2>
                        <div class="cs-modern-card-body">
                            <ul>
                                <li><?php _e('Shortcodes work in any editor: Classic Editor, Gutenberg, page builders, and widget areas.', 'cs-support'); ?></li>
                                <li><?php _e('The ticket list shortcode only shows tickets for the currently logged-in user.', 'cs-support'); ?></li>
                                <li><?php _e('Colors can be specified using hex values (#ffffff) or CSS color names (white).', 'cs-support'); ?></li>
                                <li><?php _e('All forms are responsive and include accessibility features.', 'cs-support'); ?></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <style>
            .cs-support-shortcodes-modern {
                background: linear-gradient(120deg, #f8fafc 0%, #e0e7ef 100%);
                padding: 32px 0 24px 0;
                border-radius: 0;
                box-shadow: 0 4px 32px 0 rgba(60,72,100,0.10);
                max-width: none;
                width: 100vw;
                margin: 0;
            }
            .cs-support-shortcodes-fullwidth {
                width: 100vw !important;
                max-width: 100vw !important;
                margin-left: 0 !important;
                margin-right: 0 !important;
                border-radius: 0 !important;
            }
            .cs-support-shortcodes-inner {
                max-width: 1650px;
                margin: 0 0 auto 0;
                padding: 0 32px;
            }
            .cs-shortcodes-title {
                font-size: 3rem;
                font-weight: 900;
                color: #2d3748;
                margin-bottom: 3rem !important;
                letter-spacing: -0.01em;
            }
            .cs-shortcodes-grid {
                display: flex;
                flex-wrap: wrap;
                gap: 32px;
            }
            .cs-modern-card {
                background: #fff;
                border-radius: 16px;
                box-shadow: 0 2px 16px 0 rgba(60,72,100,0.08);
                margin-bottom: 0;
                padding: 0;
                overflow: hidden;
                border: 1px solid #e5e7eb;
                flex: 1 1 45%;
                min-width: 340px;
                max-width: 48%;
                display: flex;
                flex-direction: column;
            }
            .cs-modern-card-title {
                background: linear-gradient(90deg,rgb(59, 59, 59) 0%,rgb(27, 27, 27) 100%);
                color: #fff;
                font-size: 1.08rem;
                font-weight: 600;
                padding: 14px 22px;
                margin: 0;
                letter-spacing: 0.01em;
            }
            .cs-modern-card-body {
                padding: 18px 22px 16px 22px;
                font-size: 0.98rem;
            }
            .cs-modern-shortcode {
                display: block;
                background: #f1f5f9;
                color: #6b6b6b;
                padding: 10px 12px;
                margin: 10px 0 14px 0;
                border-left: 4px solid #333333;
                font-family: 'Fira Mono', 'Consolas', 'Menlo', monospace;
                font-size: 0.97rem;
                border-radius: 6px;
                overflow-x: auto;
                white-space: pre;
            }
            .cs-modern-attributes {
                margin-left: 12px;
                margin-bottom: 0;
                color: #475569;
                font-size: 0.97rem;
            }
            .cs-modern-attributes li {
                margin-bottom: 4px;
            }
            .cs-modern-attributes strong {
                color: #000000;
            }
            .cs-shortcodes-desc {
                font-size: 0.97rem;
                color: #475569;
                margin-bottom: 0.5rem;
            }
            .cs-shortcodes-subtitle {
                font-size: 1.01rem;
                color: #0f0f0f !important;
                margin: 12px 0 6px 0;
                font-weight: 600;
            }
            .cs-modern-card-body h4 {
                font-size: 1.01rem;
                color: #0ea5e9;
                margin: 12px 0 6px 0;
                font-weight: 600;
            }
            .cs-modern-card_body ul {
                padding-left: 14px;
            }
            .cs-modern-card_body ul li {
                list-style: disc;
            }
            @media (max-width: 900px) {
                .cs-support-shortcodes-inner {
                    padding: 0 8px;
                }
                .cs-shortcodes-grid {
                    gap: 18px;
                }
                .cs-modern-card {
                    min-width: 260px;
                    max-width: 100%;
                }
            }
            @media (max-width: 700px) {
                .cs-support-shortcodes-modern {
                    padding: 12px 0;
                }
                .cs-shortcodes-grid {
                    flex-direction: column;
                    gap: 18px;
                }
                .cs-modern-card-title, .cs-modern-card-body {
                    padding-left: 10px;
                    padding-right: 10px;
                }
                .cs-modern-card {
                    min-width: 0;
                    max-width: 100%;
                }
            }
            </style>
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
