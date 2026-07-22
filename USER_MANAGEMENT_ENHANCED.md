# Enhanced User Management Features

## Database Setup

First, run this SQL in Supabase to add the new fields:

```sql
-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP;

-- Update Ashok to superadmin
UPDATE profiles 
SET user_role = 'superadmin', is_active = true
WHERE email = 'ashok@djbh-global.com';
```

## New User Management Features

### 1. Role Permission Matrix
Shows what each role can do:
- **Superadmin**: Create/Edit/Delete assessments, Manage users, View all results, Send to trainees
- **Admin**: Create/Edit assessments, View results, Send to trainees
- **Trainer**: Create assessments, View assigned results, Send to trainees
- **Viewer**: View results only
- **User**: Take assessments only

### 2. Change Password
- Admin can reset user passwords
- User receives password reset link
- Changes logged in audit trail

### 3. Deactivate/Reactivate User
- Deactivate: User can't login, assessments paused
- Reactivate: User regains access
- Shows deactivation timestamp

### 4. User Actions Log
- Who changed what, when
- Deactivations, password changes, role changes
- Audit trail for compliance

## UI Changes

### User Table
| Column | Shows |
|--------|-------|
| Name | User full name |
| Email | Email address |
| Role | Dropdown to change |
| Status | Active/Inactive badge |
| Joined | Date joined |
| Actions | Edit, Password, Deactivate/Reactivate |

### Actions Available
- **Edit**: Change role
- **Reset Password**: Send password reset email
- **Deactivate**: Disable account
- **Reactivate**: Enable account
- **Delete**: Remove user permanently

## Implementation Details

All features are integrated into the User Management page:
1. Enhanced table with more columns
2. Modal dialogs for actions
3. Audit logging for all changes
4. Permission matrix information
5. Status indicators for active/inactive users
