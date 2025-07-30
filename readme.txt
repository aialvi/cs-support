=== ClientSync Support - AI Powered Customer Support Ticket System ===

Contributors: clientsync, aialvi, mugniul
Donate link: https://www.buymeacoffee.com/aialvi
Tags: support, customer support, helpdesk, tickets, contact form
Requires at least: 6.7
Tested up to: 6.8
Stable tag: 1.0.2
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your WordPress site into a professional customer support hub with beautiful forms, ticket management, and seamless user experience.

== Description ==

**Turn Your WordPress Site Into a Customer Support Powerhouse!**

ClientSync Support is the ultimate solution for businesses looking to provide exceptional customer service directly through their WordPress website. Built with modern web standards and user experience in mind, this plugin transforms your site into a professional support hub that both you and your customers will love.

### Why Choose ClientSync Support?

**For Your Customers:**
- 📝 **Simple Ticket Submission** - Beautiful, user-friendly forms that work perfectly on phones, tablets, and desktops
- 👀 **Track Tickets Easily** - Customers can check ticket status and history anytime
- ⚡ **Fast and Secure** - Quick responses with top-notch security to protect their information

**For Your Business:**
- 📊 **Manage Everything in One Place** - Handle all customer inquiries from a single, intuitive dashboard
- 🎨 **Match Your Brand** - Customize forms and ticket pages to look like your website
- 📈 **Grow Without Limits** - Scales effortlessly as your business expands

### Perfect For:

- Small businesses looking for affordable, professional support tools
- E-commerce stores managing order inquiries
- Agencies offering branded client support
- Educational platforms assisting students
- Service providers streamlining client communication

### Key Features:

- **Gorgeous Support Forms:** Add stunning, customizable forms anywhere on your site.
- **Customer Ticket Portal:** Let users view their support history with ease.
- **Mobile-Friendly Design:** Looks and works great on any device.
- **Smart Notifications:** Automatic emails keep customers updated on their tickets.
- **Privacy First:** GDPR-compliant with easy data export and deletion options.
- **Works with Your Tools:** Compatible with Elementor, Divi, Gutenberg, and more.
- **AI-Powered Responses:** Optional AI assistant for quick ticket replies using OpenAI, Google Gemini, or Anthropic Claude.
- **Advanced Admin Dashboard:** Filter, search, and manage tickets efficiently.
- **Customizable Settings:** Change colors, styles, and text to fit your brand.
- **Easy Setup:** Install and configure in minutes with no coding required.
- **Comprehensive Documentation:** Step-by-step guides and video tutorials to help you get started.
- **Dedicated Support:** Friendly team ready to assist you via email and forums.
- **Regular Updates:** Continuous improvements and new features based on user feedback.
- **Open Source:** Built with love by the ClientSync team, available for free on WordPress.org.

== 🚀 Get Started in Minutes ==

### Step 1: Install
Go to **WordPress Admin** → **Plugins** → **Add New**
Search for “ClientSync Support,” click **Install Now**, then **Activate**
Find **Support Tickets** in your admin menu

### Step 2: Add a Support Form
**With Gutenberg:** Add the “ClientSync Support” block to any page and customize it live  
**With Shortcodes:** Use `[cs_support]` in your page or post

### Step 3: Show Ticket History
Add the “ClientSync Support Frontend” block or use `[cs_support_tickets]` to let customers view their tickets

### Step 4: Manage Tickets
Go to **Support Tickets** in your WordPress admin to view, respond to, and manage inquiries

**That’s it! Your support system is ready to impress your customers.**

== Screenshots ==

1. **Beautiful Support Form** - The customer-facing ticket creation form with modern design
2. **Powerful Admin Dashboard** - Manage all tickets with advanced filtering and search
3. **Customer Ticket Portal** - Users can view their ticket history and status
4. **Settings Panel** - Easy configuration with visual customization options
5. **Admin Ticket Management** - View, edit, and respond to customer inquiries
6. **AI Assistance** - AI-powered suggestions for ticket responses

== Changelog ==

= 1.0.1 - The Privacy & GDPR Update =
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
