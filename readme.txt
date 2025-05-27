=== CS Support ===

Contributors: clientsync
Donate link: https://www.buymeacoffee.com/aialvi
Tags: support, help, customer support
Requires at least: 5.0
Tested up to: 6.7.2
Stable tag: 0.1.0
Requires PHP: 5.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A simple plugin to provide support to your customers.

CS Support plugin

== Description ==

This plugin provides a simple way to offer customer support through your WordPress website. It includes a contact form and a system for managing and responding to customer inquiries.

You can use the support forms in two ways:
1. Through Gutenberg blocks in the block editor
2. Through shortcodes in any editor (Classic Editor, Page Builders, etc.)

**Version 0.1.1 Improvements:**
* Fixed CSS loading issues for shortcodes
* Resolved undefined array key warnings
* Improved shortcode compatibility with themes and page builders
* Enhanced asset loading with duplicate prevention
* Added comprehensive validation and debugging tools

== Shortcodes ==

= Support Form Shortcode =
Use `[cs_support]` to display the support ticket creation form.

Basic usage:
`[cs_support]`

With custom attributes:
`[cs_support title="Contact Us" submit_button_text="Send Message" background_color="#f8f9fa" button_color="#007cba"]`

Available attributes:
* `title` - Form title (default: "Create a new support ticket")
* `show_title` - Show/hide title (default: "true")
* `submit_button_text` - Button text (default: "Create Ticket")
* `success_message` - Success message (default: "Ticket created successfully!")
* `error_message` - Error message (default: "Failed to create ticket. Please try again.")
* `background_color` - Form background color (default: "#ffffff")
* `text_color` - Text color (default: "#000000")
* `button_color` - Button background color (default: "#2c3338")
* `button_text_color` - Button text color (default: "#ffffff")
* `form_width` - Form width (default: "100%")
* `max_width` - Maximum form width (default: "800px")
* `padding` - Form padding (default: "20px")
* `border_radius` - Border radius (default: "8px")
* `box_shadow` - Enable box shadow (default: "false")

= Tickets List Shortcode =
Use `[cs_support_tickets]` to display the user's support tickets.

Basic usage:
`[cs_support_tickets]`

With custom attributes:
`[cs_support_tickets title="Your Tickets" tickets_per_page="5" accent_color="#007cba"]`

Available attributes:
* `title` - List title (default: "My Support Tickets")
* `tickets_per_page` - Number of tickets per page (default: "10")
* `background_color` - Background color (default: "#ffffff")
* `text_color` - Text color (default: "#000000")
* `accent_color` - Accent color for buttons and status (default: "#2c3338")
* `border_radius` - Border radius (default: "8")
* `box_shadow` - Enable box shadow (default: "true")
* `row_hover_effect` - Enable row hover effect (default: "true")
* `button_style` - Button style: "rounded" or "square" (default: "rounded")
* `card_style` - Card style: "default" or "modern" (default: "default")

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/cs-support` directory, or install the plugin through the WordPress plugins screen directly.
1. Activate the plugin through the 'Plugins' screen in WordPress


== Frequently Asked Questions ==

= How do I use the contact form? =

You can add the contact form in two ways:
1. In the Gutenberg editor, add the "CS Support" block
2. Use the shortcode `[cs_support]` in any editor

= How do I display user tickets? =

You can display user tickets in two ways:
1. In the Gutenberg editor, add the "CS Support Frontend" block
2. Use the shortcode `[cs_support_tickets]` in any editor

= Can I customize the appearance? =

Yes! Both blocks and shortcodes support extensive customization through attributes. See the Shortcodes section for available options.

= How do I manage customer inquiries? =

Customer inquiries can be managed through the admin panel under "Support Tickets".

= How do I respond to customer inquiries? =

You can respond to customer inquiries through the admin panel by clicking on any ticket to view details and add replies.

= Is this plugin free? =

Yes, this plugin is free.

== Screenshots ==

1. This is the contact form that customers will use to submit inquiries.
2. This is the admin panel where you can manage and respond to customer inquiries.
3. This is the settings page where you can configure the plugin.

== Changelog ==

= 0.1.0 =
* Initial release
* Support ticket creation form block
* Support tickets display block for frontend
* Admin panel for managing tickets
* REST API for ticket operations
* Shortcode support for both blocks
* Accessibility features
* Responsive design