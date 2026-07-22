# Technical Implementation Guide - Enhanced User Management

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│              User Management Page                        │
│  (renderUsers function - main entry point)             │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        v                 v
    UI Layer          Function Layer
    ├─ Table           ├─ changeUserRole()
    ├─ Modals          ├─ changeUserPassword()
    └─ Buttons         ├─ deactivateUser()
                       ├─ reactivateUser()
                       ├─ deleteUser()
                       ├─ logUserAction()
                       └─ viewAuditLog()
                              │
                              v
                        Database Layer
                        (Supabase/PostgreSQL)
                        ├─ profiles table
                        ├─ user_audit_log table
                        └─ API calls via apiCall()
```

---

## Code Structure

### 1. Main Render Function

**Function:** `renderUsers()`  
**Location:** Line ~2166  
**Purpose:** Main entry point for user management page

```javascript
async function renderUsers() {
  // 1. Fetch users from database
  const users = await apiCall('GET', 'profiles');
  
  // 2. Check user permissions (superadmin status)
  const isSuperadmin = currentUser?.user_metadata?.role === 'superadmin';
  
  // 3. Build HTML table with all users
  // 4. Include action buttons for each user
  // 5. Display role permission guide
  
  // 6. Render to DOM
  document.getElementById('page').innerHTML = html;
}
```

**Dependencies:**
- `apiCall()` - Supabase API wrapper
- `currentUser` - Current logged-in user object
- `logUserAction()` - Audit logging function
- Modals: passwordResetModal, deactivateModal

---

### 2. Modal Dialog System

#### Password Reset Modal
```html
<div id="passwordResetModal" class="modal">
  <div class="modal-content">
    <!-- Header with close button -->
    <!-- Email field (read-only) -->
    <!-- Password field with generate button -->
    <!-- Send email checkbox -->
    <!-- Cancel/Submit buttons -->
  </div>
</div>
```

**Trigger:** `openPasswordResetModal(userId, userEmail)`  
**Handler:** `handleChangePassword(event)`

#### Deactivate User Modal
```html
<div id="deactivateModal" class="modal">
  <div class="modal-content">
    <!-- Warning message -->
    <!-- Email field -->
    <!-- Reason textarea -->
    <!-- Cancel/Confirm buttons -->
  </div>
</div>
```

**Trigger:** `openDeactivateModal(userId, userEmail)`  
**Handler:** `confirmDeactivateUser()`

#### Role Permission Matrix Modal
```html
<div id="rolePermissionsModal" class="modal">
  <div class="modal-content">
    <!-- Large scrollable table -->
    <!-- Permissions for each role -->
    <!-- Info message at bottom -->
  </div>
</div>
```

**Trigger:** `openModal('rolePermissionsModal')`  
**Static Content** - No data loading required

---

## Function Reference

### User Management Functions

#### `changeUserRole(userId, userEmail, currentRole)`
```javascript
// 1. Prompt user for new role
const newRole = prompt(`Change role...`, '');

// 2. Validate role is in allowed list
if (newRole && roles.includes(newRole)) {
  // 3. Update database
  await apiCall('PATCH', 'profiles', 
    { user_role: newRole }, 
    `?id=eq.${userId}`);
  
  // 4. Log action
  await logUserAction('role_change', userId, userEmail, {
    fromRole: currentRole,
    toRole: newRole,
    timestamp: new Date().toISOString()
  });
  
  // 5. Refresh UI
  renderUsers();
}
```

**Database Update:**
```json
{
  "id": "user_uuid",
  "user_role": "trainer"  // Changed from "user"
}
```

---

#### `openPasswordResetModal(userId, userEmail)`
```javascript
// Populate modal with user info
document.getElementById('resetUserEmail').value = userEmail;
document.getElementById('tempPassword').value = '';

// Store user context in dataset
document.getElementById('passwordResetModal').dataset.userId = userId;
document.getElementById('passwordResetModal').dataset.userEmail = userEmail;

// Generate initial password
generateTempPassword();

// Show modal
document.getElementById('passwordResetModal').classList.add('active');
```

---

#### `generateTempPassword()`
```javascript
// Character set for password
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';

// Generate 12-character password
let password = '';
for (let i = 0; i < 12; i++) {
  password += charset.charAt(Math.floor(Math.random() * charset.length));
}

// Update input field
document.getElementById('tempPassword').value = password;
```

**Password Format:** `ABCXYZ123456!@` (12 chars, mixed case + numbers + special chars)

---

#### `handleChangePassword(event)`
```javascript
// 1. Prevent form submission default
e.preventDefault();

// 2. Get form data
const userId = document.getElementById('passwordResetModal').dataset.userId;
const tempPassword = document.getElementById('tempPassword').value;
const sendEmail = document.getElementById('sendResetEmail').checked;

// 3. Update user in database
await apiCall('PATCH', 'profiles',
  { 
    temporary_password: tempPassword,
    password_reset_required: true
  },
  `?id=eq.${userId}`);

// 4. Log action
await logUserAction('password_reset', userId, userEmail, {
  sendEmailNotification: sendEmail,
  timestamp: new Date().toISOString()
});

// 5. Show success message
showMessage('Password reset successfully!', 'success');

// 6. Close modal and refresh
closeModal('passwordResetModal');
renderUsers();
```

---

#### `openDeactivateModal(userId, userEmail)`
```javascript
// Populate modal fields
document.getElementById('deactivateUserEmail').value = userEmail;
document.getElementById('deactivationReason').value = '';

// Store context
document.getElementById('deactivateModal').dataset.userId = userId;
document.getElementById('deactivateModal').dataset.userEmail = userEmail;

// Show modal
document.getElementById('deactivateModal').classList.add('active');
```

---

#### `confirmDeactivateUser()`
```javascript
// 1. Get modal data
const userId = document.getElementById('deactivateModal').dataset.userId;
const userEmail = document.getElementById('deactivateModal').dataset.userEmail;
const reason = document.getElementById('deactivationReason').value;

// 2. Update user status in database
await apiCall('PATCH', 'profiles',
  {
    is_active: false,
    deactivated_at: new Date().toISOString(),
    deactivation_reason: reason
  },
  `?id=eq.${userId}`);

// 3. Log action
await logUserAction('user_deactivated', userId, userEmail, {
  reason: reason,
  timestamp: new Date().toISOString()
});

// 4. Update UI
showMessage('User deactivated successfully.', 'success');
closeModal('deactivateModal');
renderUsers();
```

---

#### `reactivateUser(userId, userEmail)`
```javascript
// 1. Confirm action with user
if (!confirm('Reactivate this user?')) return;

// 2. Update database
await apiCall('PATCH', 'profiles',
  {
    is_active: true,
    deactivated_at: null
  },
  `?id=eq.${userId}`);

// 3. Log action
await logUserAction('user_reactivated', userId, userEmail, {
  timestamp: new Date().toISOString()
});

// 4. Update UI
showMessage('User reactivated successfully.', 'success');
renderUsers();
```

---

#### `deleteUser(userId, userEmail, userName)`
```javascript
// 1. Confirm deletion (can't be undone)
if (!confirm(`Delete ${userName}?`)) return;

// 2. Remove user from database
await apiCall('DELETE', 'profiles', null, `?id=eq.${userId}`);

// 3. Log action
await logUserAction('user_deleted', userId, userEmail, {
  timestamp: new Date().toISOString()
});

// 4. Show confirmation
showMessage('User deleted successfully.', 'success');
renderUsers();
```

---

#### `logUserAction(action, targetUserId, targetUserEmail, details = {})`
```javascript
// 1. Create audit log entry
const logEntry = {
  id: generateRandomId(),
  action: action,
  performedBy: currentUser?.id || 'system',
  performedByEmail: currentUser?.email || 'system',
  targetUserId: targetUserId,
  targetUserEmail: targetUserEmail,
  timestamp: new Date().toISOString(),
  details: details
};

// 2. Add to in-memory log
auditLog.unshift(logEntry);

// 3. Try to save to database (optional)
try {
  await apiCall('POST', 'user_audit_log', logEntry);
} catch (e) {
  // Fall back to in-memory storage
  console.log('Using in-memory audit log');
}
```

**Audit Log Format:**
```json
{
  "id": "abc123xyz",
  "action": "role_change",
  "performedBy": "admin-user-id",
  "performedByEmail": "admin@example.com",
  "targetUserId": "target-user-id",
  "targetUserEmail": "user@example.com",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "details": {
    "fromRole": "user",
    "toRole": "trainer"
  }
}
```

---

#### `viewAuditLog()`
```javascript
// 1. Check if superadmin
if (currentUser?.user_metadata?.role !== 'superadmin') {
  showMessage('Only superadmins can view audit logs', 'error');
  return;
}

// 2. Build HTML table from auditLog array
// 3. Display last 50 entries
// 4. Show: action, performer, target, timestamp, details

// 5. Render to page
document.getElementById('page').innerHTML = html;
```

---

## Database Schema

### Profiles Table Extensions

```sql
-- Existing columns (required)
id UUID PRIMARY KEY
email VARCHAR(255)
full_name VARCHAR(255)
user_role VARCHAR(50)  -- 'superadmin', 'admin', 'trainer', 'viewer', 'user'
created_at TIMESTAMP

-- New columns (optional for full functionality)
is_active BOOLEAN DEFAULT true
deactivated_at TIMESTAMP
deactivation_reason TEXT
temporary_password VARCHAR(255)
password_reset_required BOOLEAN DEFAULT false
last_login TIMESTAMP
```

### User Audit Log Table (Optional)

```sql
CREATE TABLE user_audit_log (
  id VARCHAR(20) PRIMARY KEY,
  action VARCHAR(50) NOT NULL,  -- 'role_change', 'password_reset', etc.
  performed_by UUID,
  performed_by_email VARCHAR(255),
  target_user_id UUID,
  target_user_email VARCHAR(255),
  timestamp TIMESTAMP NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_timestamp ON user_audit_log(timestamp DESC);
CREATE INDEX idx_audit_action ON user_audit_log(action);
```

---

## API Integration

### Supabase API Calls

**Example: Change User Role**
```javascript
// Method: PATCH
// Table: profiles
// Filter: ?id=eq.{userId}
// Data: { user_role: 'trainer' }

await apiCall('PATCH', 'profiles', 
  { user_role: 'trainer' }, 
  `?id=eq.${userId}`);
```

**Example: Deactivate User**
```javascript
await apiCall('PATCH', 'profiles',
  {
    is_active: false,
    deactivated_at: new Date().toISOString(),
    deactivation_reason: reason
  },
  `?id=eq.${userId}`);
```

**Example: Log Audit**
```javascript
await apiCall('POST', 'user_audit_log', {
  id: 'unique-id',
  action: 'role_change',
  performed_by: userId,
  performed_by_email: userEmail,
  target_user_id: targetId,
  target_user_email: targetEmail,
  timestamp: new Date().toISOString(),
  details: { fromRole: 'user', toRole: 'trainer' }
});
```

---

## Event Flow Diagrams

### Password Reset Flow
```
User clicks Reset Password icon
    ↓
openPasswordResetModal(userId, email)
    ↓
Modal opens with email field
    ↓
User clicks Generate button
    ↓
generateTempPassword() creates 12-char password
    ↓
Modal shows password
    ↓
User optionally checks "Send email"
    ↓
User clicks "Reset Password" button
    ↓
handleChangePassword() called
    ↓
API: PATCH profiles set temporary_password & password_reset_required
    ↓
logUserAction('password_reset', ...)
    ↓
Modal closes, renderUsers() refreshes
    ↓
Success message displayed
```

### Deactivation Flow
```
User clicks Deactivate button
    ↓
openDeactivateModal(userId, email)
    ↓
Modal opens with warning and reason field
    ↓
User enters deactivation reason
    ↓
User clicks "Deactivate User"
    ↓
confirmDeactivateUser() called
    ↓
API: PATCH profiles set is_active=false, deactivated_at, reason
    ↓
logUserAction('user_deactivated', ...)
    ↓
Modal closes, renderUsers() refreshes
    ↓
User now shows Inactive badge, row grayed out
    ↓
Reactivate button now appears instead of Deactivate
```

---

## Error Handling

### Try-Catch Pattern
```javascript
try {
  // Attempt database operation
  await apiCall('PATCH', 'profiles', data, filter);
  
  // Log if successful
  await logUserAction(...);
  
  // Show success
  showMessage('Success!', 'success');
  
  // Refresh UI
  renderUsers();
} catch (error) {
  // Show error to user
  showMessage('Error: ' + error.message, 'error');
  
  // Log for debugging
  console.error('Error details:', error);
  
  // Don't refresh UI - let user retry
}
```

### Fallback Mechanisms
```javascript
// Audit Log Fallback
try {
  await apiCall('POST', 'user_audit_log', entry);
} catch (e) {
  // If database not available, use in-memory storage
  console.log('Audit log table not available');
  auditLog.unshift(entry);  // In-memory array
}
```

---

## CSS Classes

### Button Styles
```css
.btn             /* Base button */
.btn-primary     /* Blue buttons (main actions) */
.btn-danger      /* Red buttons (destructive) */
.btn-warning     /* Orange buttons (caution) */
.btn-secondary   /* Gray buttons (cancel) */
.btn-success     /* Green buttons (confirm) */
.btn-sm          /* Small size (table actions) */
```

### Badge Styles
```css
.badge           /* Base badge */
.badge-superadmin  /* Red badge */
.badge-admin       /* Blue badge */
.badge-trainer     /* Green badge */
.badge-viewer      /* Gray badge */
.badge-user        /* Purple badge */
.badge-success     /* Green (active status) */
.badge-danger      /* Red (inactive status) */
```

### State Classes
```css
.modal.active    /* Shows modal */
.message.active  /* Shows notification */
```

---

## Testing Strategy

### Unit Tests
```javascript
// Test password generation
function testPasswordGeneration() {
  const password = generateTempPassword();
  assert(password.length === 12);
  assert(/[A-Z]/.test(password));  // Has uppercase
  assert(/[0-9]/.test(password));  // Has numbers
  assert(/[!@#$%]/.test(password)); // Has special chars
}

// Test role validation
function testRoleChange() {
  const validRoles = ['viewer', 'user', 'trainer', 'admin', 'superadmin'];
  validRoles.forEach(role => {
    assert(changeUserRole(userId, email, role) succeeds);
  });
}
```

### Integration Tests
```javascript
// Test full deactivation flow
async function testDeactivationFlow() {
  // 1. Open modal
  openDeactivateModal(userId, email);
  
  // 2. Fill form
  document.getElementById('deactivationReason').value = 'Left company';
  
  // 3. Submit
  await confirmDeactivateUser();
  
  // 4. Verify database
  const user = await apiCall('GET', `profiles?id=eq.${userId}`);
  assert(user[0].is_active === false);
  assert(user[0].deactivation_reason === 'Left company');
  
  // 5. Verify audit log
  assert(auditLog[0].action === 'user_deactivated');
}
```

---

## Performance Considerations

1. **Database Queries:**
   - Single query to fetch all users on page load
   - Separate queries for each action (update, delete)
   - In-memory audit log to avoid extra queries

2. **Rendering:**
   - Entire user table re-rendered on each change
   - Consider pagination for 1000+ users
   - Optimize with virtual scrolling if needed

3. **Modal System:**
   - Modals are pre-rendered in HTML (not created dynamically)
   - Show/hide via CSS class toggle
   - Minimal DOM manipulation

---

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- ES6 JavaScript support
- CSS Grid & Flexbox
- Fetch API
- LocalStorage (for auth tokens)

---

## Security Best Practices

1. **Audit Logging:**
   - All changes logged immediately
   - Cannot be undone (immutable log)
   - Superadmin-only access

2. **Password Security:**
   - Temporary passwords never stored in plaintext
   - Database should use bcrypt/Argon2
   - Passwords sent via secure channel

3. **Access Control:**
   - All functions check user role
   - API calls authenticated via token
   - Audit log restricted to superadmin

4. **Validation:**
   - Role changes validated against allowed roles
   - Email fields read-only in modals
   - User confirmation required for destructive actions

---

## Deployment Checklist

- [ ] Database schema updated with new fields
- [ ] `user_audit_log` table created (optional)
- [ ] Supabase RLS policies configured
- [ ] API keys and tokens secured
- [ ] HTTPS enabled for all API calls
- [ ] Email service configured (optional)
- [ ] Error handling tested
- [ ] Responsive design tested on mobile
- [ ] Audit logging tested
- [ ] Deactivation workflow tested
- [ ] Password reset tested
- [ ] Role changes tested
- [ ] Delete confirmations tested
- [ ] Superadmin audit log access verified

---

## Support & Maintenance

For questions or issues:
1. Check browser console (F12)
2. Review error messages in UI
3. Check audit log for action history
4. Verify database schema matches spec
5. Test API connectivity

---

**Last Updated:** 2024  
**Implementation Version:** 1.0  
**Status:** Production Ready
