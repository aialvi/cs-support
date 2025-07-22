# ClientSync Support Plugin - Team Assignment System

## Overview

The ClientSync Support plugin now includes a comprehensive ticket assignment system that allows administrators to:

1. **Assign tickets to support team members**
2. **Manage team member roles and permissions**
3. **Send email notifications for assignments**
4. **Track team performance and statistics**
5. **Add system notes for assignment activities**

## New Features

### 1. Team Member Roles

The plugin introduces three new user roles:

- **Support Agent**: Can view, reply to, and update ticket status
- **Support Manager**: All agent capabilities plus ability to assign tickets
- **Administrator**: Full access to all features

### 2. Ticket Assignment

#### REST API Endpoints

- `PATCH /wp-json/cs-support/v1/tickets/{id}/assign` - Assign ticket to team member
- `GET /wp-json/cs-support/v1/team-members` - Get all team members
- `GET /wp-json/cs-support/v1/team-members/stats` - Get team statistics

#### Assignment Features

- Dropdown assignment interface in ticket list
- Real-time assignment updates
- Assignment history tracking
- Unassign functionality

### 3. Email Notifications

#### Assignment Notifications
- New assignment notification to assignee
- Reassignment notifications to both old and new assignees
- Assignment confirmation with ticket details

#### Status Change Notifications
- Customer notifications when ticket status changes
- System notes for all status changes

### 4. Team Management Dashboard

- Team member statistics and performance metrics
- Workload distribution visualization
- Monthly resolution tracking
- Avatar and role display

### 5. System Notes

Automatic system notes are created for:
- Ticket assignments and reassignments
- Status changes
- Priority updates

## Database Changes

### Existing Tables Updated

1. **cs_support_tickets table**:
   - `assignee_id` column added (if not exists)

2. **cs_support_ticket_replies table**:
   - `is_system_note` column added for system-generated notes

## Usage

### Assigning a Ticket

1. Navigate to **ClientSync Support > Tickets**
2. In the "Assigned To" column, click the dropdown
3. Select a team member from the list
4. The assignee will receive an email notification

### Managing Team Members

1. Go to **ClientSync Support > Team Management**
2. View team statistics and workload distribution
3. Monitor team performance metrics

### Setting Up Team Members

1. Go to **Users > Add New** or edit existing users
2. Assign appropriate roles:
   - **Support Agent** for basic support staff
   - **Support Manager** for team leads
   - **Administrator** for full access

## Email Templates

The system includes professionally designed email templates for:

- Assignment notifications
- Reassignment notifications  
- Status change notifications

All emails include:
- Ticket details and context
- Direct links to admin/customer views
- Professional branding
- Mobile-responsive design

## Permissions

### Support Agent Capabilities
- `read`
- `edit_tickets`
- `reply_to_tickets`
- `view_all_tickets`
- `update_ticket_status`

### Support Manager Capabilities
- All Support Agent capabilities plus:
- `assign_tickets`
- `manage_support_team`

### Administrator Capabilities
- All capabilities plus:
- `delete_tickets`
- `create_tickets`
- `manage_options`

## Technical Implementation

### Key Classes

1. **Team_Members**: Manages team member functionality
2. **Notifications**: Handles email notifications
3. **Rest_API**: Extended with assignment endpoints

### React Components

1. **TicketAssignment.jsx**: Assignment dropdown interface
2. **TeamManagement.jsx**: Team statistics dashboard

### Database Schema

```sql
-- Tickets table (updated)
ALTER TABLE wp_cs_support_tickets 
ADD COLUMN assignee_id BIGINT(20) UNSIGNED DEFAULT NULL;

-- Replies table (updated)  
ALTER TABLE wp_cs_support_ticket_replies 
ADD COLUMN is_system_note TINYINT(1) NOT NULL DEFAULT 0;
```

## Best Practices

### Assignment Strategy
- Distribute tickets evenly among team members
- Consider specialization areas when assigning
- Monitor workload to prevent burnout

### Email Management
- Ensure SMTP is properly configured
- Test email delivery before going live
- Consider email frequency for customers

### Team Management
- Regularly review team statistics
- Provide feedback based on resolution metrics
- Adjust team size based on ticket volume

## Future Enhancements

Potential future features could include:
- Automatic assignment based on workload
- Skill-based assignment routing
- Advanced reporting and analytics
- Integration with external tools
- SLA management and tracking
- Escalation workflows

## Support

For questions or issues with the assignment system, please refer to the plugin documentation or contact support.
