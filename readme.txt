=== ClientSync Support - Customer Support Ticket System ===

Contributors: clientsync, aialvi, mugniul
Donate link: https://www.buymeacoffee.com/aialvi
Tags: support, customer support, helpdesk, tickets, contact form
Requires at least: 6.7
Tested up to: 6.8
Stable tag: 1.0.0
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your WordPress site into a professional customer support hub with beautiful forms, ticket management, and seamless user experience.

== Description ==

🚀 **Turn Your WordPress Site Into a Customer Support Powerhouse!**

ClientSync Support is the ultimate solution for businesses looking to provide exceptional customer service directly through their WordPress website. Built with modern web standards and user experience in mind, this plugin transforms your site into a professional support hub that both you and your customers will love.

### ✨ Why Choose ClientSync Support?

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

### 🔥 Latest Updates (v0.1.2)

We're constantly improving your experience:
- 🛡️ **GDPR Compliance** - Full data export, deletion, and retention management
- 🔐 **Privacy Controls** - Users can export or delete their personal data
- 🔒 **WordPress Privacy Integration** - Works with WordPress privacy tools
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
1. Edit any page/post → Add Block → Search "ClientSync Support"
2. Customize appearance with live preview
3. Publish!

**Using Shortcodes:**
Simply add `[cs_support]` anywhere in your content.

### Step 3: Display User Tickets
**Gutenberg:** Add "ClientSync Support Frontend" block
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
2. Search for "ClientSync Support"
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
3. **WordPress Admin** → **Plugins** → **Activate** ClientSync Support

**🎉 That's it! Your support system is ready to go.**

== ❓ Frequently Asked Questions ==

= 🚀 How do I get started? =

**Super Easy!** After activation:
1. Add the support form using `[cs_support]` shortcode or Gutenberg block
2. Create a "My Tickets" page with `[cs_support_tickets]` shortcode
3. Manage tickets from your admin dashboard

= 🎨 Can I customize the appearance? =

**Absolutely!** ClientSync Support offers extensive customization:
- **Colors**: Background, text, buttons, accents
- **Layout**: Width, padding, border radius
- **Styling**: Modern or classic designs
- **Branding**: Custom titles and messages

Use shortcode attributes or Gutenberg block settings for live preview.

= 📱 Is it mobile-friendly? =

**100% Responsive!** ClientSync Support is built mobile-first:
- ✅ Works perfectly on phones and tablets
- ✅ Touch-friendly interface
- ✅ Optimized for all screen sizes
- ✅ Fast loading on mobile networks

= 🔧 Does it work with page builders? =

**Yes!** ClientSync Support works with:
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

= 🔌 Can I integrate with other plugins? =

**Developer-Friendly:**
- ✅ REST API for custom integrations
- ✅ WordPress hooks and filters
- ✅ Compatible with membership plugins

= 📊 Can I export ticket data? =

**Complete Data Control:**
- ✅ Export your personal data to JSON format
- ✅ One-click data export from user settings
- ✅ Admin data export tools for all tickets
- ✅ Backup and restore functionality
- ✅ GDPR compliance features

= 🛡️ Is my data secure and GDPR compliant? =

**Bank-Level Security & Full GDPR Compliance:**
- ✅ Built with WordPress security standards
- ✅ Data sanitization and validation
- ✅ SQL injection protection
- ✅ XSS prevention
- ✅ Regular security updates
- ✅ **Personal data export** - Download your data anytime
- ✅ **Right to be forgotten** - Delete or anonymize your data
- ✅ **Data retention management** - Automatic cleanup of old data
- ✅ **Privacy by design** - Minimal data collection

= 🆘 Where do I get support? =

**We're Here to Help:**
- 📧 Email: support@clientsync.tech
- 💬 WordPress.org support forums
- 📖 Comprehensive documentation
- 🎥 Video tutorials

== 📸 Screenshots ==

1. **Beautiful Support Form** - The customer-facing ticket creation form with modern design
2. **Powerful Admin Dashboard** - Manage all tickets with advanced filtering and search
3. **Customer Ticket Portal** - Users can view their ticket history and status
4. **Settings Panel** - Easy configuration with visual customization options
5. **Admin Ticket Management** - View, edit, and respond to customer inquiries
6. **AI Assistance** - AI-powered suggestions for ticket responses

== 📋 Changelog ==

= 0.1.2 - The Privacy & GDPR Update =
*Release Date: July 11, 2025*

**🛡️ GDPR Compliance Features:**
* Personal data export functionality for users
* Right to be forgotten - data deletion and anonymization options
* Automatic data retention management with configurable periods
* WordPress privacy tools integration for admin exports/erasures
* Privacy-first design with minimal data collection

**🔐 Privacy Controls:**
* User settings panel for data management
* One-click personal data export to JSON
* Choice between data deletion or anonymization
* Admin data cleanup tools with retention policies
* Scheduled automatic cleanup based on retention settings

**⚖️ Legal Compliance:**
* Full GDPR Article 20 (Data Portability) compliance
* GDPR Article 17 (Right to Erasure) implementation
* Transparent data usage and retention policies
* Privacy by design principles throughout the system
* Audit trail for data management actions

**🔧 Technical Improvements:**
* New REST API endpoints for privacy operations
* Enhanced database structure for data retention
* Improved error handling and validation
* Better documentation for privacy features
* Performance optimizations for large datasets

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

= 0.1.2 =
**Major Privacy Update:** This version adds comprehensive GDPR compliance features including personal data export, deletion rights, and automatic data retention management. Essential for EU compliance and recommended for all users.

**What's New:**
- Personal data export and deletion tools
- GDPR-compliant data retention management
- WordPress privacy tools integration
- Enhanced user privacy controls
- Automatic data cleanup scheduling

**Upgrade Process:**
1. Backup your site (always recommended)
2. Update through WordPress admin or download manually
3. New database options will be created automatically
4. All existing tickets and settings are preserved
5. New privacy settings available in admin panel

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

**Love ClientSync Support?** Help us make it even better:

- ⭐ **Rate us** on WordPress.org (5 stars appreciated!)
- 💬 **Share feedback** in the support forums
- 🐛 **Report bugs** for quick fixes
- 💡 **Suggest features** for future updates
- ☕ **Buy us a coffee** to fuel development

**Need Help?**
- 📖 Check our comprehensive documentation
- 🎥 Watch our video tutorials
- 💬 Visit WordPress.org support forums
- 📧 Email: support@clientsync.tech

**Stay Connected:**
- 🌐 Website: https://clientsync.tech
- 🐦 Twitter: @ClientSync
- 📘 Facebook: ClientSync

---

**Built with ❤️ by ClientSync Team**

*Making WordPress support systems simple, beautiful, and effective.*

== External Services ==

This plugin connects to external AI services to provide automated support ticket responses when the AI Assistant feature is enabled. These services are only used when explicitly configured by the administrator and are optional features.

**OpenAI API (api.openai.com)**
- **Purpose**: Generate AI-powered responses to support tickets using GPT models
- **Data Sent**: Support ticket content, conversation history, and configured system prompts
- **When**: Only when admin enables AI assistant and manually triggers AI response generation
- **Terms of Service**: https://openai.com/terms/
- **Privacy Policy**: https://openai.com/privacy/

**Google Gemini API (generativelanguage.googleapis.com)**
- **Purpose**: Generate AI-powered responses to support tickets using Gemini models
- **Data Sent**: Support ticket content, conversation history, and configured system prompts
- **When**: Only when admin enables AI assistant and manually triggers AI response generation
- **Terms of Service**: https://ai.google.dev/terms
- **Privacy Policy**: https://policies.google.com/privacy

**Anthropic Claude API (api.anthropic.com)**
- **Purpose**: Generate AI-powered responses to support tickets using Claude models
- **Data Sent**: Support ticket content, conversation history, and configured system prompts
- **When**: Only when admin enables AI assistant and manually triggers AI response generation
- **Terms of Service**: https://www.anthropic.com/terms
- **Privacy Policy**: https://www.anthropic.com/privacy

**Important Notes:**
- No external services are contacted unless the AI Assistant feature is explicitly enabled
- No data is sent automatically - AI responses are only generated when manually triggered by administrators
- All external API communications use secure HTTPS connections
- API keys are stored securely in your WordPress database and are never transmitted to third parties
- You can disable these features at any time from the plugin settings
