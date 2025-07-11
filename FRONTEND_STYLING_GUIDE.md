# CS Support Frontend Block - Enhanced Styling Options

This document outlines the enhanced styling and customization options available for the CS Support Frontend block.

## Enhanced Sidebar Options

### Basic Settings
- **Tickets Per Page**: Control how many tickets display per page (1-50)
- **Font Size**: Choose from Small, Medium, Large, or Extra Large
- **Spacing**: Select Tight, Normal, or Loose spacing throughout the block
- **Max Width**: Set container width limits (None, 600px, 800px, 1200px)

### Layout & Display
- **Card Style**: Choose between Default, Modern, or Minimal visual styles
- **Compact View**: Enable tighter spacing for more content density
- **Show Search Bar**: Add a search input for filtering tickets
- **Show Status Filters**: Display filter buttons for ticket status
- **Enable Column Sorting**: Allow users to sort tickets by column headers

### Table Settings
- **Striped Rows**: Alternate row background colors for better readability
- **Table Borders**: Add borders around table cells
- **Row Hover Effect**: Highlight table rows on mouse hover

### Visual Effects
- **Border Radius**: Control corner roundness (0-24px)
- **Enable Box Shadow**: Add subtle depth with shadows
- **Button Style**: Choose between Rounded, Square, Pill, or Outlined buttons

### Color Settings

#### Primary Colors
- **Background Color**: Main container background
- **Text Color**: Primary text color
- **Accent Color**: Headers and primary interface elements
- **Primary Color**: Main action elements (buttons, links)

#### Status Colors
- **Success Color**: For resolved tickets (default: green)
- **Warning Color**: For in-progress tickets (default: orange) 
- **Error Color**: For new/open tickets (default: red)
- **Secondary Color**: Background accents and subtle elements

### Advanced Options
- **Custom CSS**: Add custom CSS rules for advanced styling
- CSS variables are automatically applied for consistent theming

## CSS Classes Applied

The block automatically applies CSS classes based on settings:

### Font Size Classes
- `.font-size-small`
- `.font-size-medium` 
- `.font-size-large`
- `.font-size-x-large`

### Spacing Classes
- `.spacing-tight`
- `.spacing-normal`
- `.spacing-loose`

### Feature Classes
- `.compact-view`
- `.table-striped`
- `.table-bordered`
- `.has-search`
- `.has-filters`
- `.sortable`

### Card Style Classes
- `.card-style-default`
- `.card-style-modern`
- `.card-style-minimal`

## CSS Variables

The following CSS variables are automatically set for custom styling:

```css
--cs-primary-color: /* Primary color from settings */
--cs-primary-color-hover: /* Automatically darkened version */
--cs-success-color: /* Success status color */
--cs-warning-color: /* Warning status color */
--cs-error-color: /* Error status color */
--cs-success-color-rgb: /* RGB values for transparency effects */
--cs-warning-color-rgb: /* RGB values for transparency effects */
--cs-error-color-rgb: /* RGB values for transparency effects */
```

## Interactive Features

### Search Functionality
When enabled, adds a search input that filters tickets in real-time.

### Status Filters
Provides filter buttons for:
- All tickets
- New tickets
- In Progress tickets  
- Resolved tickets

### Sortable Headers
Click column headers to sort by:
- Ticket ID
- Subject
- Status
- Date

Visual indicators show current sort direction (↑ ↓).

## Responsive Design

The block includes responsive breakpoints:

- **768px and below**: Adjusts filter layout and reduces padding
- **480px and below**: Further compacts table cells and spacing

## Custom Events

The block emits custom events for advanced functionality:

- `ticketsRendered`: Fired when tickets table is rendered
- `csSearchTickets`: Fired when search is performed
- `csFilterTickets`: Fired when status filter is applied
- `csSortTickets`: Fired when column sorting is applied

## Best Practices

1. **Color Accessibility**: Ensure sufficient contrast between text and background colors
2. **Responsive Testing**: Test layouts on mobile devices when using custom settings
3. **Custom CSS**: Use CSS variables when possible for consistent theming
4. **Performance**: Avoid excessive custom CSS that might impact loading times

## Example Custom CSS

```css
/* Use theme colors */
.wp-block-clientsync-cs-support-frontend {
    --cs-primary-color: var(--wp--preset--color--primary);
    --cs-success-color: #22c55e;
}

/* Custom hover effects */
.cs-support-tickets-table tbody tr:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Custom spacing for large screens */
@media (min-width: 1200px) {
    .spacing-loose .cs-support-frontend-container {
        padding: 48px;
    }
}
```
