=== CS Support ===

Contributors: clientsync
Donate link: https://www.buymeacoffee.com/aialvi
Tags: support, help, customer support, helpdesk, tickets, contact form, customer service, support tickets, helpdesk system
Requires at least: 5.0
Tested up to: 6.7.2
Stable tag: 0.1.0
Requires PHP: 5.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your WordPress site into a professional customer support hub with beautiful forms, ticket management, and seamless user experience.

== Description ==

🚀 **Turn Your WordPress Site Into a Customer Support Powerhouse!**

CS Support is the ultimate solution for businesses looking to provide exceptional customer service directly through their WordPress website. Built with modern web standards and user experience in mind, this plugin transforms your site into a professional support hub that both you and your customers will love.

### ✨ Why Choose CS Support?

**For Your Customers:**
- 🎯 **Effortless Ticket Creation** - Beautiful, intuitive forms that work on any device
- 📱 **Mobile-First Design** - Optimized for smartphones and tablets
- 🔒 **Secure & Private** - Your customers' data is protected with WordPress security standards
- 👀 **Real-Time Tracking** - Customers can view their ticket status and history
- ⚡ **Lightning Fast** - Optimized performance with minimal load times

**For Your Business:**
- 📊 **Centralized Management** - Handle all customer inquiries from one dashboard
- 🎨 **Fully Customizable** - Match your brand with extensive styling options
- 🔧 **Developer Friendly** - Built with modern PHP, React, and REST API
- 📈 **Scalable Solution** - Grows with your business needs
- 🆓 **Completely Free** - No hidden fees or premium upsells

### 🛠️ Flexible Integration Options

**Gutenberg Blocks** (Recommended)
Perfect for the modern WordPress editor with live preview and visual customization.

**Shortcodes** (Universal)
Compatible with Classic Editor, Elementor, Divi, and virtually any page builder.

**REST API** (Advanced)
For developers who want to build custom integrations or mobile apps.

### 🎯 Perfect For:

- 💼 **Small Businesses** - Provide professional support without enterprise costs
- 🏢 **Agencies** - Offer client support solutions with your branding
- 🛒 **E-commerce Stores** - Handle customer inquiries and order issues
- 📚 **Educational Sites** - Student support and course assistance
- 🏥 **Service Providers** - Client communication and service requests

### 🔥 Latest Updates (v0.1.1)

We're constantly improving your experience:
- ✅ **Enhanced Compatibility** - Works flawlessly with popular themes and page builders
- 🐛 **Bug Fixes** - Resolved CSS loading issues and PHP warnings
- 🚀 **Performance Boost** - Optimized asset loading with smart caching
- 🔍 **Advanced Debugging** - Comprehensive validation and error handling
- 📱 **Mobile Improvements** - Enhanced responsive design across all devices

== 🚀 Quick Start Guide ==

### Step 1: Installation
1. **WordPress Admin** → Plugins → Add New → Upload Plugin
2. **Activate** the plugin
3. Navigate to **Support Tickets** in your admin sidebar

### Step 2: Add Support Form
**Using Gutenberg (Recommended):**
1. Edit any page/post → Add Block → Search "CS Support"
2. Customize appearance with live preview
3. Publish!

**Using Shortcodes:**
Simply add `[cs_support]` anywhere in your content.

### Step 3: Display User Tickets
**Gutenberg:** Add "CS Support Frontend" block
**Shortcode:** Use `[cs_support_tickets]`

### Step 4: Manage Tickets
Access your admin dashboard → **Support Tickets** to view and respond to customer inquiries.

== 🎨 Shortcode Reference ==

### Support Form: `[cs_support]`

Create beautiful, customizable support forms anywhere on your site.

**Basic Usage:**
```
[cs_support]
```

**Advanced Customization:**
```
[cs_support 
    title="Get Help Now" 
    submit_button_text="Send Request"
    background_color="#f8f9fa" 
    button_color="#007cba"
    max_width="600px"
    box_shadow="true"
]
```

**📋 Complete Attribute List:**

| Attribute | Default | Description |
|-----------|---------|-------------|
| `title` | "Create a new support ticket" | Form heading text |
| `show_title` | "true" | Show/hide the title |
| `submit_button_text` | "Create Ticket" | Button text |
| `success_message` | "Ticket created successfully!" | Success notification |
| `error_message` | "Failed to create ticket. Please try again." | Error notification |
| `background_color` | "#ffffff" | Form background color |
| `text_color` | "#000000" | Text color |
| `button_color` | "#2c3338" | Button background |
| `button_text_color` | "#ffffff" | Button text color |
| `form_width` | "100%" | Form width |
| `max_width` | "800px" | Maximum width |
| `padding` | "20px" | Internal spacing |
| `border_radius` | "8px" | Corner rounding |
| `box_shadow` | "false" | Drop shadow effect |

### Tickets List: `[cs_support_tickets]`

Display user's support tickets with advanced filtering and styling.

**Basic Usage:**
```
[cs_support_tickets]
```

**Advanced Customization:**
```
[cs_support_tickets 
    title="My Support History" 
    tickets_per_page="5"
    accent_color="#007cba"
    card_style="modern"
    button_style="rounded"
]
```

**📋 Complete Attribute List:**

| Attribute | Default | Description |
|-----------|---------|-------------|
| `title` | "My Support Tickets" | List heading |
| `tickets_per_page` | "10" | Pagination limit |
| `background_color` | "#ffffff" | Background color |
| `text_color` | "#000000" | Text color |
| `accent_color` | "#2c3338" | Accent color for UI elements |
| `border_radius` | "8" | Corner rounding (px) |
| `box_shadow` | "true" | Drop shadow effect |
| `row_hover_effect` | "true" | Hover animations |
| `button_style` | "rounded" | "rounded" or "square" |
| `card_style` | "default" | "default" or "modern" |

== ⚡ Installation ==

### Automatic Installation (Recommended)
1. **WordPress Admin** → **Plugins** → **Add New**
2. Search for "CS Support"
3. Click **Install Now** → **Activate**
4. Navigate to **Support Tickets** in your admin sidebar

### Manual Installation
1. Download the plugin ZIP file
2. **WordPress Admin** → **Plugins** → **Add New** → **Upload Plugin**
3. Choose file → **Install Now** → **Activate**
4. Navigate to **Support Tickets** in your admin sidebar

### FTP Installation (Advanced)
1. Unzip the plugin files
2. Upload `cs-support` folder to `/wp-content/plugins/`
3. **WordPress Admin** → **Plugins** → **Activate** CS Support

**🎉 That's it! Your support system is ready to go.**

== ❓ Frequently Asked Questions ==

= 🚀 How do I get started? =

**Super Easy!** After activation:
1. Add the support form using `[cs_support]` shortcode or Gutenberg block
2. Create a "My Tickets" page with `[cs_support_tickets]` shortcode
3. Manage tickets from your admin dashboard

= 🎨 Can I customize the appearance? =

**Absolutely!** CS Support offers extensive customization:
- **Colors**: Background, text, buttons, accents
- **Layout**: Width, padding, border radius
- **Styling**: Modern or classic designs
- **Branding**: Custom titles and messages

Use shortcode attributes or Gutenberg block settings for live preview.

= 📱 Is it mobile-friendly? =

**100% Responsive!** CS Support is built mobile-first:
- ✅ Works perfectly on phones and tablets
- ✅ Touch-friendly interface
- ✅ Optimized for all screen sizes
- ✅ Fast loading on mobile networks

= 🔧 Does it work with page builders? =

**Yes!** CS Support works with:
- ✅ Elementor
- ✅ Divi Builder
- ✅ Beaver Builder
- ✅ WPBakery
- ✅ Classic Editor
- ✅ Any theme or page builder

Simply use the shortcodes `[cs_support]` and `[cs_support_tickets]`.

= 🎯 How do I manage customer inquiries? =

**Easy Management:**
1. Navigate to **Support Tickets** in your WordPress admin
2. View all tickets with status filtering
3. Click any ticket to view details and respond
4. Customers get email notifications automatically

= 📧 Do customers receive notifications? =

**Smart Notifications:**
- ✅ Email confirmation when ticket is created
- ✅ Updates when you respond
- ✅ Status change notifications
- ✅ Customizable email templates

= 🛡️ Is my data secure? =

**Bank-Level Security:**
- ✅ Built with WordPress security standards
- ✅ Data sanitization and validation
- ✅ SQL injection protection
- ✅ XSS prevention
- ✅ Regular security updates

= 💰 Are there any hidden costs? =

**Completely Free!** 
- ✅ No premium versions
- ✅ No feature limitations
- ✅ No usage restrictions
- ✅ Free updates and support

= 🔌 Can I integrate with other plugins? =

**Developer-Friendly:**
- ✅ REST API for custom integrations
- ✅ WordPress hooks and filters
- ✅ Compatible with membership plugins
- ✅ WooCommerce integration ready

= 📊 Can I export ticket data? =

**Data Control:**
- ✅ Export tickets to CSV
- ✅ Backup and restore functionality
- ✅ Data migration tools
- ✅ GDPR compliance features

= 🆘 Where do I get support? =

**We're Here to Help:**
- 📧 Email: support@clientsync.com
- 💬 WordPress.org support forums
- 📖 Comprehensive documentation
- 🎥 Video tutorials

== 📸 Screenshots ==

1. **Beautiful Support Form** - The customer-facing ticket creation form with modern design
2. **Powerful Admin Dashboard** - Manage all tickets with advanced filtering and search
3. **Customer Ticket Portal** - Users can view their ticket history and status
4. **Gutenberg Integration** - Live preview and customization in the block editor
5. **Mobile Experience** - Responsive design that works perfectly on all devices
6. **Settings Panel** - Easy configuration with visual customization options

== 📋 Changelog ==

= 0.1.1 - The Compatibility Update =
*Release Date: July 11, 2025*

**🔧 Bug Fixes:**
* Fixed CSS loading issues affecting shortcode styling
* Resolved undefined array key warnings in PHP 8.0+
* Corrected asset loading conflicts with popular themes

**🚀 Improvements:**
* Enhanced shortcode compatibility with Elementor, Divi, and other page builders
* Implemented smart asset loading with duplicate prevention
* Added comprehensive validation and debugging tools
* Improved mobile responsiveness across all devices
* Optimized database queries for better performance

**🎯 Developer Enhancements:**
* Added new WordPress hooks for custom integrations
* Improved REST API documentation and examples
* Enhanced error handling and logging
* Better code documentation and inline comments

= 0.1.0 - The Genesis Release =
*Release Date: June 15, 2025*

**🎉 Initial Features:**
* Support ticket creation form with Gutenberg block
* Frontend ticket display with user dashboard
* Complete admin panel for ticket management
* RESTful API for programmatic access
* Shortcode support for universal compatibility
* Full accessibility compliance (WCAG 2.1)
* Responsive design for all devices
* Multi-language ready (translation ready)

**🎨 Design Features:**
* Modern, clean interface design
* Customizable colors and styling
* Multiple layout options
* Professional email templates
* Mobile-first responsive design

**🔐 Security Features:**
* WordPress security standards compliance
* Input sanitization and validation
* SQL injection prevention
* XSS protection
* Secure file uploads

**🛠️ Technical Features:**
* Built with modern React and PHP
* REST API with authentication
* Database optimization
* Caching compatibility
* Performance monitoring

== 🔄 Upgrade Notice ==

= 0.1.1 =
**Important Update:** This version fixes critical compatibility issues with popular themes and page builders. If you're using shortcodes with Elementor, Divi, or experiencing CSS loading issues, this update is essential.

**What's New:**
- Enhanced theme compatibility
- Improved shortcode performance
- Better error handling
- Mobile experience improvements

**Upgrade Process:**
1. Backup your site (always recommended)
2. Update through WordPress admin or download manually
3. No database changes required
4. Existing tickets and settings are preserved

== 💝 Support & Feedback ==

**Love CS Support?** Help us make it even better:

- ⭐ **Rate us** on WordPress.org (5 stars appreciated!)
- 💬 **Share feedback** in the support forums
- 🐛 **Report bugs** for quick fixes
- 💡 **Suggest features** for future updates
- ☕ **Buy us a coffee** to fuel development

**Need Help?**
- 📖 Check our comprehensive documentation
- 🎥 Watch our video tutorials
- 💬 Visit WordPress.org support forums
- 📧 Email: support@clientsync.com

**Stay Connected:**
- 🌐 Website: https://clientsync.com
- 🐦 Twitter: @ClientSyncWP
- 📘 Facebook: ClientSync WordPress

---

**Built with ❤️ by ClientSync Team**

*Making WordPress support systems simple, beautiful, and effective.*