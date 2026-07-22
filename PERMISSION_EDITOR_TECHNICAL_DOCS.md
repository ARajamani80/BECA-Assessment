# Permission Editor - Technical Documentation

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Browser)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Permission Editor Modal Component                    │  │
│  │  ├─ Permission Matrix Table (with checkboxes)        │  │
│  │  ├─ Save Changes Button                               │  │
│  │  ├─ Reset to Defaults Button                          │  │
│  │  └─ View Audit Log Link                               │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTP/REST API Calls
               │ (Authorization: Bearer Token)
┌──────────────▼──────────────────────────────────────────────┐
│                     Backend (Node.js/Express)               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Permission Routes (/api/permissions/*)               │  │
│  │  ├─ requireSuperadmin middleware                      │  │
│  │  ├─ CRUD operations                                   │  │
│  │  └─ Audit logging operations                          │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────────────────────────────┘
               │ Supabase Client SDK
               │
┌──────────────▼──────────────────────────────────────────────┐
│                   Supabase (PostgreSQL)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  role_permissions Table                               │  │
│  │  ├─ id UUID (PK)                                      │  │
│  │  ├─ role_name VARCHAR(50)                             │  │
│  │  ├─ permission_name VARCHAR(100)                      │  │
│  │  ├─ is_enabled BOOLEAN                                │  │
│  │  ├─ permission_description TEXT                       │  │
│  │  ├─ created_at TIMESTAMP                              │  │
│  │  └─ updated_at TIMESTAMP                              │  │
│  │  UNIQUE INDEX: (role_name, permission_name)           │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  permission_audit_log Table                           │  │
│  │  ├─ id UUID (PK)                                      │  │
│  │  ├─ action_type VARCHAR(50)                           │  │
│  │  ├─ role_name VARCHAR(50)                             │  │
│  │  ├─ permission_name VARCHAR(100)                      │  │
│  │  ├─ changed_by UUID (FK to profiles)                  │  │
│  │  ├─ previous_value JSONB                              │  │
│  │  ├─ new_value JSONB                                   │  │
│  │  ├─ change_reason TEXT                                │  │
│  │  └─ changed_at TIMESTAMP (indexed)                    │  │
│  │  INDEXES: role_name, changed_by, changed_at, action   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  RLS Policies (Row Level Security)                    │  │
│  │  ├─ Superadmins only can read/write permissions       │  │
│  │  ├─ Superadmins only can read audit log               │  │
│  │  └─ System can insert audit records                   │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Database Schema Details

### role_permissions Table

```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) NOT NULL,
  permission_name VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  permission_description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(role_name, permission_name)
);
```

**Key Design Points:**
- `UNIQUE(role_name, permission_name)` - Ensures no duplicate role-permission pairs
- `is_enabled BOOLEAN` - Simple true/false for enabled/disabled
- `updated_at` - Tracks last modification time
- No foreign key to roles table - Allows roles to be added without schema changes

**Indexes:**
```sql
CREATE INDEX idx_role_permissions_role ON role_permissions(role_name);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_name);
CREATE INDEX idx_role_permissions_enabled ON role_permissions(role_name, is_enabled);
```

**Index Strategy:**
- `idx_role_permissions_role` - For fetching all permissions for a role
- `idx_role_permissions_permission` - For finding which roles have a permission
- `idx_role_permissions_enabled` - For finding enabled permissions per role (most common query)

---

### permission_audit_log Table

```sql
CREATE TABLE permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type VARCHAR(50) NOT NULL,
  role_name VARCHAR(50) NOT NULL,
  permission_name VARCHAR(100),
  changed_by UUID NOT NULL,
  changed_by_email VARCHAR(255),
  previous_value JSONB,
  new_value JSONB,
  change_reason TEXT,
  changed_at TIMESTAMP DEFAULT now()
);
```

**Key Design Points:**
- `action_type` - Can be: `permission_updated`, `permission_reset_to_default`, `batch_update`
- `JSONB` columns - Store before/after state as JSON objects
- `changed_by_email` - Denormalized for easier reporting (don't need to join profiles)
- `change_reason` - Optional notes about why change was made
- `changed_at` - Immutable timestamp (DEFAULT now())

**Example audit_log Entry:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "action_type": "permission_updated",
  "role_name": "admin",
  "permission_name": "delete_assessment",
  "changed_by": "123e4567-e89b-12d3-a456-426614174000",
  "changed_by_email": "superadmin@example.com",
  "previous_value": { "enabled": false },
  "new_value": { "enabled": true },
  "change_reason": "Grant delete permission to admins",
  "changed_at": "2024-01-15T10:30:45Z"
}
```

---

## API Endpoint Reference

### 1. GET /api/permissions/permissions

Returns list of all available permissions in the system.

**Response:**
```json
[
  {
    "name": "create_assessment",
    "label": "Create Assessment",
    "description": "Create new assessments"
  },
  {
    "name": "edit_assessment",
    "label": "Edit Assessment",
    "description": "Edit existing assessments"
  },
  ...
]
```

**Use Cases:**
- Populate permission dropdown/filter
- Validate permission names
- Display permission labels in UI

---

### 2. GET /api/permissions/roles

Returns list of all available roles in the system.

**Response:**
```json
["superadmin", "admin", "trainer", "viewer", "user"]
```

**Use Cases:**
- Populate role filter
- Validate role names
- Display role list in UI

---

### 3. GET /api/permissions/role-permissions

Returns the complete permission matrix for all roles.

**Query Parameters:** None

**Response:**
```json
{
  "superadmin": {
    "create_assessment": true,
    "edit_assessment": true,
    "delete_assessment": true,
    ...
  },
  "admin": {
    "create_assessment": true,
    "edit_assessment": true,
    "delete_assessment": false,
    ...
  },
  ...
}
```

**Use Cases:**
- Load permission matrix on page load
- Check user permissions before rendering features
- Populate permission matrix UI

---

### 4. PUT /api/permissions/role-permissions/:role/:permission

Update a single permission for a specific role.

**Parameters:**
- `role` - Role name (e.g., 'admin')
- `permission` - Permission name (e.g., 'create_assessment')

**Request Body:**
```json
{
  "enabled": true,
  "reason": "Grant edit permission to trainers"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Permission 'create_assessment' for role 'admin' updated to enabled",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "role_name": "admin",
    "permission_name": "create_assessment",
    "is_enabled": true,
    "updated_at": "2024-01-15T10:30:45Z"
  }
}
```

**Authentication:** Requires superadmin

**Side Effects:**
- Updates `role_permissions` table
- Inserts entry in `permission_audit_log`
- Updates `updated_at` timestamp

---

### 5. POST /api/permissions/role-permissions/batch

Batch update multiple permissions at once.

**Request Body:**
```json
{
  "updates": [
    {
      "role": "admin",
      "permission": "delete_assessment",
      "enabled": true
    },
    {
      "role": "trainer",
      "permission": "edit_assessment",
      "enabled": true
    },
    {
      "role": "viewer",
      "permission": "manage_users",
      "enabled": false
    }
  ],
  "reason": "Update permissions based on new policy"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Updated 3 permissions",
  "results": [
    {
      "role": "admin",
      "permission": "delete_assessment",
      "success": true,
      "data": { ... }
    },
    {
      "role": "trainer",
      "permission": "edit_assessment",
      "success": true,
      "data": { ... }
    },
    {
      "role": "viewer",
      "permission": "manage_users",
      "success": true,
      "data": { ... }
    }
  ]
}
```

**Benefits:**
- Single API call for multiple changes
- Atomic transaction (all succeed or all fail)
- Single audit log entry for related changes
- Better performance than individual updates

---

### 6. POST /api/permissions/role-permissions/reset

Reset permissions for one or more roles to system defaults.

**Request Body:**
```json
{
  "roles": ["admin", "trainer"],
  "reason": "Resetting to defaults after audit"
}
```

Or omit `roles` to reset all roles:
```json
{
  "reason": "System maintenance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reset permissions for 2 role(s) to defaults",
  "updatedCount": 8
}
```

**Security:**
- Requires confirmation in UI (browser confirm dialog)
- Cannot be undone (previous permissions are in audit log)
- All changes logged with "permission_reset_to_default" action

**Default Values:**
- Superadmin: All permissions enabled
- Admin: All except delete_assessment, manage_roles
- Trainer: Create, view, send permissions only
- Viewer: View/analytics only
- User: No permissions (read-only access)

---

### 7. GET /api/permissions/role-permissions/audit

Retrieve audit log of permission changes.

**Query Parameters:**
- `limit` - Number of records to return (default: 100)
- `offset` - Skip first N records (default: 0)
- `role` - Filter by role name (optional)
- `action` - Filter by action type (optional)

**Examples:**
```
GET /api/permissions/role-permissions/audit?limit=50&offset=0
GET /api/permissions/role-permissions/audit?role=admin
GET /api/permissions/role-permissions/audit?action=permission_updated
GET /api/permissions/role-permissions/audit?limit=100&role=trainer
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "action_type": "permission_updated",
      "role_name": "admin",
      "permission_name": "delete_assessment",
      "changed_by": "123e4567-e89b-12d3-a456-426614174000",
      "changed_by_email": "superadmin@example.com",
      "previous_value": { "enabled": false },
      "new_value": { "enabled": true },
      "change_reason": "Grant delete permission to admins",
      "changed_at": "2024-01-15T10:30:45Z"
    },
    ...
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 245
  }
}
```

**Use Cases:**
- View who changed what and when
- Filter changes by role or action
- Pagination for large audit logs
- Generate compliance reports

---

## RLS Policies

### Policy 1: Superadmins can manage role permissions

```sql
CREATE POLICY "Superadmins can manage role permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'superadmin')
  );
```

**Effect:**
- Only superadmins can SELECT, INSERT, UPDATE, or DELETE
- Non-superadmins get 0 rows (no error, just empty results)

---

### Policy 2: Superadmins can view audit log

```sql
CREATE POLICY "Superadmins can view permission audit log" ON permission_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_role = 'superadmin')
  );
```

**Effect:**
- Only superadmins can SELECT audit log
- Prevents other users from viewing who changed what

---

### Policy 3: System can insert audit records

```sql
CREATE POLICY "System can log permission changes" ON permission_audit_log
  FOR INSERT WITH CHECK (true);
```

**Effect:**
- Backend (with service role key) can always insert audit records
- Ensures all changes are logged even if user's token expires

---

## Frontend State Management

### permissionEditorState Object

```javascript
{
  permissions: {
    superadmin: { create_assessment: true, edit_assessment: true, ... },
    admin: { create_assessment: true, edit_assessment: true, ... },
    ...
  },
  originalPermissions: { ... },  // Backup of loaded state
  roles: ['superadmin', 'admin', 'trainer', 'viewer', 'user'],
  permissionsList: [
    { name: 'create_assessment', label: 'Create Assessment', description: '...' },
    ...
  ]
}
```

**Key Properties:**
- `permissions` - Current state (may have unsaved changes)
- `originalPermissions` - Last saved state (for detecting changes)
- `roles` - List of all available roles
- `permissionsList` - Metadata for each permission

**Change Detection:**
```javascript
const hasChanges = JSON.stringify(permissions) !== 
                   JSON.stringify(originalPermissions);
```

---

## Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Unknown error');
  }
  const data = await response.json();
  return data;
} catch (error) {
  showMessage('Error: ' + error.message, 'error');
}
```

**Error Types:**
- `401 Unauthorized` - Token expired, ask to log in again
- `403 Forbidden` - Not superadmin, show "Access Denied"
- `400 Bad Request` - Invalid input, show validation error
- `500 Server Error` - Backend error, show generic error message

### Backend Error Handling

```javascript
router.put('/role-permissions/:role/:permission', requireSuperadmin, async (req, res) => {
  try {
    // Validate inputs
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (!PERMISSIONS.find(p => p.name === permission)) {
      return res.status(400).json({ error: 'Invalid permission' });
    }
    
    // Try operation
    const { data, error } = await supabase.from('role_permissions').update(...);
    if (error) throw error;
    
    // Success
    res.json({ success: true, data });
  } catch (error) {
    // Log error (implement logging)
    console.error('Permission update error:', error);
    res.status(500).json({ error: error.message });
  }
});
```

---

## Performance Considerations

### Database Performance

**Query Optimization:**
- `idx_role_permissions_enabled` - Used for most common query (get enabled perms per role)
- Composite index faster than separate indexes
- Limit to 3 indexes to avoid write overhead

**Audit Log Performance:**
- Time-based partitioning recommended for >1M rows
- Archive old audit logs to separate table annually
- Pagination required (limit 100 by default)

**Example Partition Query:**
```sql
CREATE TABLE permission_audit_log_2024 PARTITION OF permission_audit_log
  FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### Frontend Performance

**Caching Strategy:**
```javascript
// Cache permissions for 1 hour
const cacheKey = 'permission_matrix_cache';
const cachedData = localStorage.getItem(cacheKey);
const cacheTime = localStorage.getItem(cacheKey + '_time');

if (cachedData && Date.now() - cacheTime < 3600000) {
  return JSON.parse(cachedData);
} else {
  const data = await fetchPermissions();
  localStorage.setItem(cacheKey, JSON.stringify(data));
  localStorage.setItem(cacheKey + '_time', Date.now());
  return data;
}
```

**Rendering Performance:**
- Virtual scrolling for audit log if >1000 entries
- Debounce checkbox changes to avoid rapid API calls
- Batch updates instead of individual updates

---

## Security Implementation

### Authentication Flow

```
User Login → JWT Token → Store in localStorage
                ↓
API Request → Include Token in Authorization header
                ↓
Backend Middleware → Verify Token Signature & Expiration
                ↓
extractSuperadminRole() → Check user_role = 'superadmin'
                ↓
RLS Policy → SELECT from profiles confirms superadmin
                ↓
Allow/Deny Operation
```

### SQL Injection Prevention

✓ All queries use parameterized queries via Supabase client
✓ No string concatenation in queries
✓ Input validation before queries (role, permission names)

```javascript
// SAFE - Uses parameterized queries
const { data } = await supabase
  .from('role_permissions')
  .select('*')
  .eq('role_name', role);  // ← Safely parameterized

// UNSAFE - Never do this
const query = `SELECT * FROM role_permissions WHERE role_name = '${role}'`;
```

### CSRF Protection

✓ Uses modern browser Same-Origin-Policy
✓ CORS configured to allow only trusted origins
✓ State-changing operations use POST/PUT/DELETE (not GET)

---

## Monitoring & Logging

### What to Monitor

1. **Permission Changes**: Alert on suspicious activity
2. **Failed Auth Attempts**: Track login failures
3. **API Latency**: Monitor permission endpoint response times
4. **Database Queries**: Log slow queries (>1s)
5. **Audit Log Growth**: Monitor storage usage

### Logging Implementation

```javascript
// Backend: Log all operations
const logger = require('./logger');

router.put('/role-permissions/:role/:permission', async (req, res) => {
  logger.info('Permission update requested', {
    role,
    permission,
    userId: req.user.id,
    enabled: req.body.enabled,
    timestamp: new Date().toISOString()
  });
  
  try {
    // ... operation
  } catch (error) {
    logger.error('Permission update failed', {
      error: error.message,
      userId: req.user.id,
      role,
      permission
    });
  }
});
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('Permission Editor', () => {
  describe('Permission Matrix Loading', () => {
    it('should load all role-permission pairs', async () => {
      const matrix = await loadPermissionsMatrix();
      expect(Object.keys(matrix)).toEqual(['superadmin', 'admin', 'trainer', 'viewer', 'user']);
      expect(Object.keys(matrix.superadmin).length).toBe(10);
    });

    it('should return boolean values for permissions', async () => {
      const matrix = await loadPermissionsMatrix();
      Object.values(matrix).forEach(role => {
        Object.values(role).forEach(value => {
          expect(typeof value).toBe('boolean');
        });
      });
    });
  });

  describe('Permission Updates', () => {
    it('should reject non-superadmin requests', async () => {
      const response = await updatePermission('admin', 'admin', 'create_assessment', true);
      expect(response.status).toBe(403);
    });

    it('should validate role and permission names', async () => {
      const response = await updatePermission('superadmin', 'invalid_role', 'create_assessment', true);
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid role');
    });

    it('should log changes to audit table', async () => {
      await updatePermission('superadmin', 'admin', 'create_assessment', true);
      const logs = await getAuditLog();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action_type).toBe('permission_updated');
    });
  });
});
```

### Integration Tests

```javascript
describe('Permission Editor Integration', () => {
  it('should save and retrieve permissions correctly', async () => {
    // Save
    await updatePermission('superadmin', 'admin', 'delete_assessment', true);
    
    // Retrieve
    const matrix = await loadPermissionsMatrix();
    
    // Verify
    expect(matrix.admin.delete_assessment).toBe(true);
  });

  it('should enforce RLS policies', async () => {
    // Try to access as non-superadmin
    const response = await fetch('/api/permissions/role-permissions', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    
    expect(response.status).toBe(403);
  });

  it('should maintain audit trail consistency', async () => {
    const before = await getAuditLog();
    
    await updatePermission('superadmin', 'admin', 'create_assessment', false);
    
    const after = await getAuditLog();
    expect(after.length).toBe(before.length + 1);
  });
});
```

---

## Deployment Checklist

- [ ] Database schema created in Supabase
- [ ] RLS policies enabled and tested
- [ ] Backend routes registered and tested
- [ ] Frontend modal added to index.html
- [ ] JavaScript functions added to page
- [ ] User Management button updated
- [ ] Environment variables configured
- [ ] CORS configured correctly
- [ ] SSL/HTTPS enabled (production)
- [ ] Audit log monitoring set up
- [ ] Superadmin account verified
- [ ] Test permission changes work end-to-end
- [ ] Verify RLS prevents non-superadmin access
- [ ] Document any custom changes

---

## Future Enhancements

### v1.1 Planned Features
- [ ] Time-based permissions (temporary access)
- [ ] Permission templates for quick role setup
- [ ] Bulk role assignment
- [ ] Permission conflict detection

### v2.0 Planned Features
- [ ] Custom permission creation from UI
- [ ] Role cloning/duplication
- [ ] Permission inheritance chains
- [ ] Permission analytics dashboard
- [ ] Role-based feature flags

---

## Related Documentation

- Database Schema: `PERMISSION_EDITOR_DATABASE.sql`
- Backend API: `PERMISSION_EDITOR_BACKEND_API.js`
- Frontend Component: `PERMISSION_EDITOR_FRONTEND.html`
- Integration Guide: `PERMISSION_EDITOR_INTEGRATION_GUIDE.md`
- Quick Start: `PERMISSION_EDITOR_QUICK_START.md`

---

## Glossary

| Term | Definition |
|------|-----------|
| **RLS** | Row Level Security - PostgreSQL feature for row-level access control |
| **Superadmin** | User with role = 'superadmin', has unrestricted access |
| **Permission** | An action a user can perform (e.g., create_assessment) |
| **Role** | A collection of permissions (e.g., admin, trainer) |
| **Audit Log** | Immutable record of all permission changes |
| **Batch Update** | Multiple permission changes in single API call |
| **RLS Policy** | Rule that restricts database access based on user context |

---

## Support & Contact

For technical issues or questions, refer to:
1. Supabase documentation: https://supabase.com/docs
2. Backend logs: Check server console for errors
3. Browser console: F12 → Console tab for frontend errors
4. Audit log: Review permission changes and timing

Last Updated: 2024
Version: 1.0.0
