# ClientSync Support Shortcode Examples

This document provides examples of how to use the ClientSync Support shortcodes in your WordPress content.

## Support Form Shortcode (`[cs_support]`)

### Basic Usage
```
[cs_support]
```
This displays a basic support form with default styling.

### Custom Title and Button Text
```
[cs_support title="Contact Our Support Team" submit_button_text="Send Request"]
```

### Styled Form with Custom Colors
```
[cs_support 
    title="Get Help" 
    background_color="#f8f9fa" 
    text_color="#333333" 
    button_color="#007cba" 
    button_text_color="#ffffff"
    border_radius="12px"
    box_shadow="true"
]
```

### Compact Form
```
[cs_support 
    show_title="false" 
    max_width="500px" 
    padding="15px"
    submit_button_text="Submit"
]
```

### Full-Width Form with Custom Messages
```
[cs_support 
    title="Support Request Form"
    form_width="100%"
    max_width="1000px"
    success_message="Thank you! We'll get back to you within 24 hours."
    error_message="Sorry, there was an issue. Please try again or contact us directly."
    background_color="#ffffff"
    border_radius="8px"
    box_shadow="true"
]
```

## Support Tickets List Shortcode (`[cs_support_tickets]`)

### Basic Usage
```
[cs_support_tickets]
```
This displays the user's support tickets with default styling.

### Custom Title and Pagination
```
[cs_support_tickets title="Your Support Requests" tickets_per_page="5"]
```

### Styled Tickets List
```
[cs_support_tickets 
    title="My Tickets" 
    background_color="#ffffff" 
    text_color="#333333" 
    accent_color="#007cba"
    border_radius="10"
    box_shadow="true"
    row_hover_effect="true"
]
```

### Modern Card Style
```
[cs_support_tickets 
    title="Support History"
    card_style="modern"
    button_style="rounded"
    accent_color="#e74c3c"
    tickets_per_page="8"
]
```

### Minimal Style
```
[cs_support_tickets 
    show_title="false"
    box_shadow="false"
    row_hover_effect="false"
    border_radius="0"
    button_style="square"
]
```

## Use Cases and Page Examples

### Support Page
Create a dedicated support page with both shortcodes:

```
<h2>Need Help?</h2>
<p>Submit a new support request or check the status of existing tickets.</p>

<h3>Create New Ticket</h3>
[cs_support title="Submit Support Request" background_color="#f8f9fa"]

<h3>Your Existing Tickets</h3>
[cs_support_tickets title="Track Your Requests" tickets_per_page="10"]
```

### Contact Page
Use the support form as a contact form:

```
<h2>Contact Us</h2>
<p>We're here to help! Send us a message and we'll get back to you soon.</p>

[cs_support 
    title="Send us a message" 
    submit_button_text="Send Message"
    success_message="Message sent successfully! We'll respond within 24 hours."
    background_color="#ffffff"
    button_color="#28a745"
    box_shadow="true"
]
```

### User Dashboard
Add ticket management to a user dashboard:

```
<h2>Your Account Dashboard</h2>

<div class="dashboard-section">
    <h3>Support Tickets</h3>
    [cs_support_tickets 
        title="Recent Tickets" 
        tickets_per_page="5"
        card_style="modern"
        accent_color="#6c757d"
    ]
</div>

<div class="dashboard-section">
    <h3>Need Help?</h3>
    [cs_support 
        title="Create New Ticket" 
        max_width="600px"
        background_color="#f8f9fa"
    ]
</div>
```

### Sidebar Widget
Use in a sidebar for quick access:

```
[cs_support 
    show_title="false" 
    max_width="100%" 
    padding="10px"
    submit_button_text="Get Help"
    border_radius="4px"
]
```

## Color Scheme Examples

### Blue Theme
```
[cs_support 
    background_color="#e3f2fd" 
    button_color="#1976d2" 
    text_color="#0d47a1"
]
```

### Green Theme
```
[cs_support 
    background_color="#e8f5e8" 
    button_color="#4caf50" 
    text_color="#2e7d32"
]
```

### Dark Theme
```
[cs_support 
    background_color="#2c3e50" 
    text_color="#ecf0f1" 
    button_color="#3498db"
    button_text_color="#ffffff"
]
```

## Tips

1. **Color Values**: Use hex colors (e.g., `#ffffff`) or CSS color names (e.g., `white`)
2. **Measurements**: Include units for sizes (e.g., `20px`, `100%`, `2rem`)
3. **Boolean Values**: Use `"true"` or `"false"` in quotes for boolean attributes
4. **Testing**: Test your shortcodes in preview mode before publishing
5. **Responsive**: The forms are responsive by default, but test on different screen sizes
6. **Accessibility**: The forms include proper ARIA labels and keyboard navigation support

## Troubleshooting

### Form Not Displaying
- Check that the plugin is activated
- Verify shortcode syntax (no extra spaces)
- Ensure you're using the correct shortcode name

### Styling Issues
- Check color values are valid CSS colors
- Verify measurement units are included
- Test with default values first, then add customizations

### Tickets Not Loading
- Ensure user is logged in (tickets are user-specific)
- Check that the user has created tickets
- Verify REST API endpoints are working
