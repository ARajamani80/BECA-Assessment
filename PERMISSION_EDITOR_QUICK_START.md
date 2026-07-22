# Permission Editor - Quick Start Guide

## 5-Minute Setup

### Step 1: Database (2 minutes)

1. Open Supabase SQL Editor
2. Copy-paste the entire content of `PERMISSION_EDITOR_DATABASE.sql`
3. Click "RUN"
4. ✓ Done! Tables created with default permissions

### Step 2: Backend (2 minutes)

1. Create file: `backend/routes/permissionRoutes.js`
2. Copy entire content from `PERMISSION_EDITOR_BACKEND_API.js`
3. In `backend_server.js`, add before routes:

```javascript
const permissionRoutes = require('./routes/permissionRoutes');
app.use('/api/permissions', permissionRoutes);
```

4. Restart backend server
5. ✓ Done! API endpoints ready

### Step 3: Frontend (1 minute)

1. Open `index.html`
2. Find line ~1215 (look for "rolePermissionsModal")
3. After `</div>` of that modal, paste entire `PERMISSION_EDITOR_FRONTEND.html`
4. Find User Management button section (line ~2620)
5. Add this button:

```javascript
<button class="btn btn-secondary btn-sm" onclick="openPermissionEditor()">
  <i class="fas fa-lock"></i> Permission Editor
</button>
```

6. ✓ Done! Ready to use

---

## Test It in 30 Seconds

1. Log in as superadmin
2. Click "User Management"
3. Click "Permission Editor"
4. Toggle one checkbox
5. Click "Save Changes"
6. See success message ✓

---

## Core API Endpoints

All require `Authorization: Bearer TOKEN` header with superadmin token.

```javascript
// Get all permissions metadata
GET /api/permissions/permissions
→ [{ name, label, description }, ...]

// Get permission matrix
GET /api/permissions/role-permissions
→ { superadmin: { create_assessment: true, ... }, admin: { ... }, ... }

// Update single permission
PUT /api/permissions/role-permissions/:role/:permission
Body: { enabled: true, reason: "optional" }
→ { success: true, data: { ... } }

// Batch update
POST /api/permissions/role-permissions/batch
Body: {
  updates: [
    { role: "admin", permission: "delete_assessment", enabled: true },
    ...
  ],
  reason: "optional"
}
→ { success: true, results: [...] }

// Reset to defaults
POST /api/permissions/role-permissions/reset
Body: { roles: ["admin", "trainer"] }  // optional, defaults to all
→ { success: true, updatedCount: 10 }

// View audit log
GET /api/permissions/role-permissions/audit?limit=100&offset=0&role=admin
→ { data: [...], pagination: { ... } }
```

---

## Frontend Functions

Call these from JavaScript:

```javascript
// Open permission editor modal
openPermissionEditor()

// Load permissions into editor
loadPermissionsMatrix()

// Save all changes
savePermissionChanges()

// Reset to defaults (with confirmation)
resetPermissionsToDefaults()

// View audit log
viewPermissionAuditLog()

// Load audit log data
loadAuditLog()

// Render audit log table
renderAuditLog(logs)
```

---

## Environment Configuration

In your `.env` file:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
BACKEND_URL=http://localhost:3001
NODE_ENV=development
```

---

## Default Permissions Matrix

| Permission | Superadmin | Admin | Trainer | Viewer | User |
|---|:---:|:---:|:---:|:---:|:---:|
| Create Assessment | ✓ | ✓ | ✓ | ✗ | ✗ |
| Edit Assessment | ✓ | ✓ | ✗ | ✗ | ✗ |
| Delete Assessment | ✓ | ✗ | ✗ | ✗ | ✗ |
| Publish Assessment | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Results | ✓ | ✓ | ✓ | ✓ | ✗ |
| Manage Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| Send to Trainees | ✓ | ✓ | ✓ | ✗ | ✗ |
| View Analytics | ✓ | ✓ | ✓ | ✓ | ✗ |
| Manage Roles | ✓ | ✗ | ✗ | ✗ | ✗ |
| Access Admin Dashboard | ✓ | ✓ | ✗ | ✗ | ✗ |

---

## Common Tasks

### Toggle a Permission Programmatically

```javascript
// In browser console or JavaScript code
const response = await fetch('/api/permissions/role-permissions/admin/delete_assessment', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    enabled: true,
    reason: 'Grant delete permission to admins'
  })
});
const result = await response.json();
console.log(result);
```

### Check if User Can Perform Action

```javascript
// Fetch user's role permissions
const userRole = currentUser.user_metadata.role; // e.g., 'admin'
const response = await fetch('/api/permissions/role-permissions');
const permissions = await response.json();
const canDelete = permissions[userRole].delete_assessment;

if (canDelete) {
  showDeleteButton();
} else {
  showLockedMessage();
}
```

### Get Audit Log for Specific Role

```javascript
const response = await fetch('/api/permissions/role-permissions/audit?role=admin&limit=50');
const { data } = await response.json();
console.log(`Found ${data.length} audit entries for admin role`);
```

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| "Unauthorized" error | Verify logged in as superadmin: `currentUser.user_metadata.role === 'superadmin'` |
| Modal doesn't open | Ensure `openPermissionEditor()` function is defined, check console for errors |
| Changes don't save | Check backend is running, verify `BACKEND_URL` is correct, check console errors |
| Audit log empty | Verify `permission_audit_log` table exists in Supabase |
| Checkboxes not loading | Check network tab for 404/500 errors on `/api/permissions/role-permissions` |

---

## File Structure

```
BECA-Assessment/
├── backend/
│   ├── routes/
│   │   └── permissionRoutes.js          ← Copy PERMISSION_EDITOR_BACKEND_API.js here
│   └── backend_server.js                ← Add permission routes registration
├── index.html                            ← Add modal + functions from PERMISSION_EDITOR_FRONTEND.html
├── PERMISSION_EDITOR_DATABASE.sql        ← Run in Supabase SQL Editor
├── PERMISSION_EDITOR_BACKEND_API.js      ← Reference/copy to backend/routes
├── PERMISSION_EDITOR_FRONTEND.html       ← Reference/copy to index.html
├── PERMISSION_EDITOR_INTEGRATION_GUIDE.md ← Full documentation
└── PERMISSION_EDITOR_QUICK_START.md      ← This file
```

---

## Key Features

✓ **Visual Matrix UI** - Checkbox-based permission management  
✓ **Batch Updates** - Save multiple changes at once  
✓ **Audit Trail** - Complete history of all changes  
✓ **Reset Defaults** - One-click return to system defaults  
✓ **Role-Based** - Superadmin-only access  
✓ **Real-time** - No page refresh needed  
✓ **Responsive** - Works on all screen sizes  
✓ **Secure** - RLS policies + backend validation  

---

## Security Checklist

- [ ] Only superadmins can access Permission Editor
- [ ] All API endpoints validate superadmin status
- [ ] Database RLS policies restrict access
- [ ] Audit log tracks all permission changes
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention via parameterized queries

---

## What's Next?

After setup:

1. **Customize Permissions** - Add/remove permissions in `PERMISSIONS` array
2. **Customize Roles** - Add custom roles to `ROLES` array
3. **Monitor Changes** - Regularly review audit log
4. **Test Thoroughly** - Verify permissions work across all features
5. **Document Changes** - Keep track of permission updates
6. **Train Superadmins** - Show team how to use the editor

---

## Support Resources

- **Full Integration Guide**: See `PERMISSION_EDITOR_INTEGRATION_GUIDE.md`
- **API Reference**: See inline comments in `PERMISSION_EDITOR_BACKEND_API.js`
- **Frontend Component**: See `PERMISSION_EDITOR_FRONTEND.html`
- **Database Schema**: See `PERMISSION_EDITOR_DATABASE.sql`

---

## Version

**Permission Editor v1.0.0**  
Compatible with BECA Assessment Platform v1.0+

---

## Questions?

Refer to the full **Integration Guide** for detailed explanations and troubleshooting.
