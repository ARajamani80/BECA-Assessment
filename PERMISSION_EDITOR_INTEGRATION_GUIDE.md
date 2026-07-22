# Permission Visual Editor - Integration Guide

## Overview
This guide explains how to integrate the Permission Visual Editor into your BECA Assessment app. The editor allows superadmins to visually manage permissions for each role without code changes.

---

## Components

### 1. Database Schema
**File:** `PERMISSION_EDITOR_DATABASE.sql`

Creates two new tables:
- `role_permissions` - Stores role-permission mappings
- `permission_audit_log` - Tracks all permission changes

### 2. Backend API
**File:** `PERMISSION_EDITOR_BACKEND_API.js`

Provides REST endpoints for permission management:
- `GET /api/permissions/permissions` - List all permissions
- `GET /api/permissions/roles` - List all roles
- `GET /api/permissions/role-permissions` - Get permission matrix
- `PUT /api/permissions/role-permissions/:role/:permission` - Update single permission
- `POST /api/permissions/role-permissions/batch` - Batch update permissions
- `POST /api/permissions/role-permissions/reset` - Reset to defaults
- `GET /api/permissions/role-permissions/audit` - View audit log

### 3. Frontend Component
**File:** `PERMISSION_EDITOR_FRONTEND.html`

Interactive UI with:
- Permission matrix table with checkboxes
- Real-time toggle capability
- Save/Reset buttons
- Audit log viewer

---

## Step 1: Database Setup

### 1.1 Execute Database Schema

1. Open your Supabase project
2. Go to SQL Editor
3. Copy and paste contents of `PERMISSION_EDITOR_DATABASE.sql`
4. Click "RUN"

Expected output:
```
CREATE TABLE
CREATE INDEX (multiple times)
ALTER TABLE (multiple times)
CREATE POLICY (multiple times)
INSERT (1 row)
INSERT (1 row)
... etc ...
```

### 1.2 Verify Tables Created

In Supabase, go to Table Editor and verify:
- `role_permissions` table exists with 50 rows (5 roles × 10 permissions)
- `permission_audit_log` table exists (empty initially)

---

## Step 2: Backend Integration

### 2.1 Create Routes File

Create new file: `backend/routes/permissionRoutes.js`

Copy contents from `PERMISSION_EDITOR_BACKEND_API.js`

### 2.2 Add Supabase Configuration

Ensure your backend has Supabase client initialized:

```javascript
// In your backend_server.js or config file
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);
```

### 2.3 Register Routes in Server

In your main server file (e.g., `backend_server.js` or `backend/routes/index.js`):

```javascript
const permissionRoutes = require('./routes/permissionRoutes');

// Add this to your Express app
app.use('/api/permissions', permissionRoutes);

// Make sure you have auth middleware set up
app.use('/api/permissions', verifyToken); // Your auth middleware
```

### 2.4 Test Backend Endpoints

```bash
# Test permissions list
curl http://localhost:3001/api/permissions/permissions

# Test role-permissions matrix
curl http://localhost:3001/api/permissions/role-permissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 3: Frontend Integration

### 3.1 Add Modal and Styles

1. Open your `index.html` file
2. Find the section with other modals (around line 1215 where `rolePermissionsModal` is)
3. Add the modal code from `PERMISSION_EDITOR_FRONTEND.html` before the closing `</body>` tag

### 3.2 Add JavaScript Functions

In the `<script>` section of your `index.html`:

1. Copy all JavaScript functions from `PERMISSION_EDITOR_FRONTEND.html`
2. Paste them before the closing `</script>` tag
3. Make sure `BACKEND_URL` is defined:

```javascript
// If not already defined in your app
const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
```

### 3.3 Add CSS Styles (if needed)

Copy the CSS styles from `PERMISSION_EDITOR_FRONTEND.html` and add to your main stylesheet or `<style>` tag

### 3.4 Update User Management Page

Find the User Management page render function and add a button to open the permission editor:

```javascript
// In renderUsers() function, add this button to the header
<button class="btn btn-secondary btn-sm" onclick="openPermissionEditor()">
  <i class="fas fa-lock"></i> Permission Editor
</button>
```

**Exact location in index.html:**

Find this section (around line 2620):
```javascript
<button class="btn btn-secondary btn-sm" onclick="openModal('rolePermissionsModal')">
  <i class="fas fa-shield-alt"></i> Role Permissions
</button>
```

Replace it with:
```javascript
<button class="btn btn-secondary btn-sm" onclick="openPermissionEditor()">
  <i class="fas fa-lock"></i> Permission Editor
</button>
<button class="btn btn-secondary btn-sm" onclick="openModal('rolePermissionsModal')">
  <i class="fas fa-shield-alt"></i> View Defaults
</button>
```

---

## Step 4: Access Control

### 4.1 Frontend Authorization

The frontend checks if user is superadmin before showing the editor. Already included in `openPermissionEditor()`.

### 4.2 Backend Authorization

All permission endpoints require superadmin status via `requireSuperadmin` middleware.

### 4.3 Database RLS Policies

RLS policies automatically restrict access:
- Only superadmins can query `role_permissions`
- Only superadmins can view `permission_audit_log`
- System can insert audit records

---

## Step 5: Testing

### 5.1 Manual Test - Save Permission Change

1. Log in as superadmin
2. Go to User Management
3. Click "Permission Editor"
4. Toggle one checkbox (e.g., Admin → Delete Assessment)
5. Click "Save Changes"
6. Verify:
   - Success message appears
   - Modal title shows no asterisk (unsaved indicator gone)
   - Change appears in Audit Log

### 5.2 Manual Test - Reset to Defaults

1. In Permission Editor, click "Reset to Defaults"
2. Confirm the warning
3. Verify all permissions return to default values
4. Check Audit Log shows reset entries

### 5.3 Manual Test - Audit Log

1. Make several permission changes
2. Click "Audit Log" button
3. Verify all changes are logged with:
   - Timestamp
   - Action type
   - Role and permission
   - Previous/new values
   - Changed by email

### 5.4 Automated Tests

Create tests for backend endpoints:

```javascript
// Example test
describe('Permission API', () => {
  it('should reject non-superadmin access', async () => {
    const response = await fetch('/api/permissions/role-permissions', {
      headers: { 'Authorization': 'Bearer user_token' }
    });
    expect(response.status).toBe(403);
  });

  it('should allow superadmin to update permissions', async () => {
    const response = await fetch('/api/permissions/role-permissions/admin/create_assessment', {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer superadmin_token' },
      body: JSON.stringify({ enabled: true })
    });
    expect(response.status).toBe(200);
  });
});
```

---

## Step 6: Deployment

### 6.1 Environment Variables

Ensure your `.env` file includes:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
BACKEND_URL=your_backend_url
```

### 6.2 Database Migration

```bash
# Run database schema
psql -U postgres -d your_db < PERMISSION_EDITOR_DATABASE.sql

# Or use Supabase UI:
# 1. Paste SQL into SQL Editor
# 2. Click RUN
```

### 6.3 Deploy Backend

```bash
# Redeploy your backend to include new routes
# This depends on your deployment platform
git push heroku main  # For Heroku
# or your platform's deployment command
```

### 6.4 Deploy Frontend

```bash
# Update index.html with new modal and functions
# Redeploy to Netlify, Vercel, or your hosting
npm run build
# Push to GitHub and let CI/CD handle deployment
```

---

## Usage Examples

### Example 1: Grant Edit Permission to Trainer

1. Open Permission Editor
2. Find "Edit Assessment" row
3. Check the "Trainer" column checkbox
4. Click "Save Changes"
5. View audit log to confirm

### Example 2: Remove All Permissions from Viewer

1. Open Permission Editor
2. Uncheck all boxes in "Viewer" column
3. Click "Save Changes"
4. Viewers will no longer see admin features

### Example 3: Create Custom Role (Advanced)

For custom roles not in default list:
1. Add role to `ROLES` array in backend API
2. Add role to `ROLES` array in frontend state
3. Insert default permissions in database
4. Update RLS policies if needed

---

## Configuration

### Customize Permissions List

In `PERMISSION_EDITOR_BACKEND_API.js`, modify `PERMISSIONS`:

```javascript
const PERMISSIONS = [
  { name: 'custom_permission', label: 'Custom Label', description: 'Custom description' },
  // ... more permissions
];
```

### Customize Roles

In `PERMISSION_EDITOR_BACKEND_API.js`, modify `ROLES`:

```javascript
const ROLES = ['superadmin', 'admin', 'trainer', 'viewer', 'user', 'custom_role'];
```

### Customize Default Permissions

In `PERMISSION_EDITOR_DATABASE.sql`, modify INSERT statement to change defaults.

---

## Troubleshooting

### Issue: "Unauthorized" when accessing Permission Editor

**Solution:**
1. Verify you're logged in as superadmin
2. Check token is valid: `localStorage.getItem('token')`
3. Verify backend auth middleware is working
4. Check RLS policies in Supabase

### Issue: Checkboxes don't save

**Solution:**
1. Check browser console for errors (F12)
2. Verify backend URL is correct: `BACKEND_URL`
3. Check network tab to see if request is sent
4. Verify backend server is running
5. Check Supabase connection in backend

### Issue: Audit log is empty

**Solution:**
1. Verify `permission_audit_log` table exists
2. Check RLS policies allow inserts
3. Review browser console for errors
4. Check backend logs for API errors

### Issue: Modal doesn't appear

**Solution:**
1. Verify modal HTML was added to index.html
2. Check CSS class `.modal` is defined
3. Verify `openPermissionEditor()` function is defined
4. Check browser console for JavaScript errors

---

## Security Considerations

### 1. Access Control
- ✓ Only superadmins can access permission editor
- ✓ Backend validates superadmin status
- ✓ Database RLS policies enforce access
- ✓ Audit log tracks all changes

### 2. Data Protection
- ✓ HTTPS only (ensure in production)
- ✓ Secure token storage in localStorage
- ✓ CORS properly configured
- ✓ SQL injection prevention via parameterized queries

### 3. Audit Trail
- ✓ All changes logged in `permission_audit_log`
- ✓ Includes user email, timestamp, previous/new values
- ✓ Immutable audit log (append-only)

### 4. Input Validation
- ✓ Role names validated against `ROLES` list
- ✓ Permission names validated against `PERMISSIONS` list
- ✓ Boolean values strictly typed
- ✓ All API endpoints require authentication

---

## File Checklist

Before deploying, ensure you have:

- [ ] `PERMISSION_EDITOR_DATABASE.sql` - Database schema
- [ ] `PERMISSION_EDITOR_BACKEND_API.js` - Backend routes
- [ ] `PERMISSION_EDITOR_FRONTEND.html` - Frontend component
- [ ] `PERMISSION_EDITOR_INTEGRATION_GUIDE.md` - This guide
- [ ] Database migration executed in Supabase
- [ ] Backend routes registered and tested
- [ ] Frontend modal and functions added to index.html
- [ ] User Management page button updated
- [ ] Environment variables configured

---

## Support

For issues or questions:

1. Check the Troubleshooting section above
2. Review browser console for errors (F12)
3. Check backend logs
4. Review Supabase logs
5. Check git history for recent changes

---

## Version History

### v1.0.0 (Initial Release)
- Core permission matrix
- CRUD operations
- Audit logging
- Reset to defaults
- Superadmin-only access

---

## Future Enhancements

Potential features for future versions:
- [ ] Role cloning/duplication
- [ ] Permission templates
- [ ] Time-based permissions (temporary access)
- [ ] Bulk role assignment
- [ ] Permission inheritance
- [ ] Custom permission creation UI
- [ ] Permission conflict detection
- [ ] Role analytics dashboard

---

## License & Attribution

Part of BECA Assessment Platform
Created: 2024

---

## Quick Links

- Supabase Documentation: https://supabase.com/docs
- Express.js Guide: https://expressjs.com/
- Row Level Security: https://supabase.com/docs/guides/auth/row-level-security
