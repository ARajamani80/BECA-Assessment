# User Management - Quick Reference Guide

## Quick Links
- **Access:** Navigate to Users → Management → Users
- **Role Matrix:** Click "Role Permissions" button
- **Audit Log:** Click "Audit Log" button (superadmin only)

---

## Common Tasks

### Reset a User's Password
1. Find user in the user list
2. Click the **key icon** (🔑)
3. Click **Generate** to create temporary password
4. (Optional) Check "Send password reset email"
5. Click **Reset Password**
6. Share temporary password with user (via secure channel)

### Deactivate a User
1. Find user in the user list
2. Click the **ban icon** (⛔)
3. Enter reason for deactivation
4. Click **Deactivate User**
5. User will now be disabled and unable to login

### Reactivate a User
1. Find deactivated user (gray status badge)
2. Click the **check icon** (✓)
3. Confirm reactivation
4. User can now login again

### Change User Role
1. Find user in the user list
2. Click the **exchange icon** (⇄) or click role badge
3. Select new role from prompt
4. Click confirm
5. Role updated immediately

### View Audit Log (Superadmin)
1. Click **Audit Log** button at top
2. Browse recent actions
3. See who changed what and when

### Delete a User
1. Find user in the user list
2. Click the **trash icon** (🗑️)
3. Confirm deletion
4. User record permanently removed

---

## Role Reference

### Superadmin
- Can do everything
- Full user management access
- Can view audit logs

### Admin
- Create/edit assessments
- Send to trainees
- Manage users (reset password, deactivate)
- View all results

### Trainer
- Create assessments
- Send to trainees
- View assigned results

### Viewer
- View results only

### User
- Take assessments only

---

## Status Badges

| Badge | Meaning |
|-------|---------|
| 🟢 Active | User can login and use system |
| ⚪ Inactive | User cannot login, deactivated |

---

## Action Icons

| Icon | Action | Hotkey |
|------|--------|--------|
| ⇄ | Change role | None |
| 🔑 | Reset password | None |
| ⛔ | Deactivate user | None |
| ✓ | Reactivate user | None |
| 🗑️ | Delete user | None |

---

## Tips & Tricks

**Password Reset Best Practices:**
- Generate new password
- Share via secure channel (not email)
- User must change on first login
- Consider sending separately from username

**Deactivation vs. Deletion:**
- Use deactivate to temporarily disable access
- Keeps user record for audit/history
- Use delete only when record should be removed
- Deleted users cannot be recovered

**Role Changes:**
- Changes take effect immediately
- No page refresh needed
- User will see new permissions on next login
- All changes are logged

**Audit Log Tips:**
- Only superadmins can view
- Shows last 50 entries
- Most recent actions at top
- Click "Audit Log" to see full history
- Useful for compliance and security

---

## Common Issues

**"User role updated" but no change?**
- Refresh the page
- User may need to logout and login
- Check browser console for errors

**Can't deactivate user?**
- You may not have permission
- Only admin and superadmin can deactivate
- Check your role in sidebar

**Password reset not sending email?**
- Check email configuration in settings
- "Send email" is optional
- Share password via secure channel instead

**Audit log is empty?**
- First time viewing - no actions logged yet
- May require refresh to see recent actions
- Only superadmins can view audit log

---

## Keyboard Shortcuts

No keyboard shortcuts currently - all actions via UI buttons

---

## Security Reminders

⚠️ **Important:**
- Never share passwords in plain email
- Use secure channel for password delivery
- Audit log tracks who did what
- Deactivate before deleting for safety
- Keep temporary passwords secure
- Change passwords regularly

---

## Support

Need help? Check:
1. This quick reference
2. Full documentation: `ENHANCED_USER_MANAGEMENT.md`
3. Browser console (F12) for error messages
4. Admin/superadmin support

---

**Last Updated:** 2024  
**Quick Reference Version:** 1.0
