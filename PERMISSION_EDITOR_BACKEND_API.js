// ============================================================
// PERMISSION EDITOR BACKEND API ROUTES
// ============================================================
// Add these routes to your Express backend (e.g., backend_server.js)
// Requires: Supabase client configured, authentication middleware
// ============================================================

const express = require('express');
const router = express.Router();

// PERMISSIONS CONFIGURATION
const PERMISSIONS = [
  { name: 'create_assessment', label: 'Create Assessment', description: 'Create new assessments' },
  { name: 'edit_assessment', label: 'Edit Assessment', description: 'Edit existing assessments' },
  { name: 'delete_assessment', label: 'Delete Assessment', description: 'Delete assessments' },
  { name: 'publish_assessment', label: 'Publish Assessment', description: 'Publish assessments for use' },
  { name: 'view_results', label: 'View Results', description: 'View assessment results' },
  { name: 'manage_users', label: 'Manage Users', description: 'Manage user accounts' },
  { name: 'send_to_trainees', label: 'Send to Trainees', description: 'Send assessments to trainees' },
  { name: 'view_analytics', label: 'View Analytics', description: 'View analytics and reports' },
  { name: 'manage_roles', label: 'Manage Roles', description: 'Manage roles and permissions' },
  { name: 'access_admin_dashboard', label: 'Access Admin Dashboard', description: 'Access admin dashboard' }
];

const ROLES = ['superadmin', 'admin', 'trainer', 'viewer', 'user'];

// ============================================================
// MIDDLEWARE - SUPERADMIN ONLY
// ============================================================
const requireSuperadmin = async (req, res, next) => {
  try {
    const user = req.user; // Assumes auth middleware sets req.user
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is superadmin
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_role')
      .eq('id', user.id)
      .single();

    if (error || !profile || profile.user_role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmins can access this resource' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// GET ALL PERMISSIONS FOR DISPLAY
// ============================================================
// Returns list of all available permissions with descriptions
router.get('/permissions', async (req, res) => {
  try {
    res.json(PERMISSIONS);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// GET ALL ROLES
// ============================================================
router.get('/roles', async (req, res) => {
  try {
    res.json(ROLES);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// GET ROLE PERMISSIONS MATRIX
// ============================================================
// Returns the complete permission matrix for all roles
router.get('/role-permissions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .order('role_name, permission_name');

    if (error) throw error;

    // Structure the response as a matrix
    const matrix = {};
    ROLES.forEach(role => {
      matrix[role] = {};
      PERMISSIONS.forEach(perm => {
        const entry = data.find(p => p.role_name === role && p.permission_name === perm.name);
        matrix[role][perm.name] = entry ? entry.is_enabled : false;
      });
    });

    res.json(matrix);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// GET DETAILED PERMISSION MATRIX (with metadata)
// ============================================================
// Returns permissions with full metadata for UI display
router.get('/role-permissions/detailed', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select('*')
      .order('role_name, permission_name');

    if (error) throw error;

    const detailed = {
      permissions: PERMISSIONS,
      roles: ROLES,
      matrix: {}
    };

    ROLES.forEach(role => {
      detailed.matrix[role] = PERMISSIONS.map(perm => {
        const entry = data.find(p => p.role_name === role && p.permission_name === perm.name);
        return {
          name: perm.name,
          label: perm.label,
          description: perm.description,
          enabled: entry ? entry.is_enabled : false,
          lastUpdated: entry ? entry.updated_at : null
        };
      });
    });

    res.json(detailed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// UPDATE SINGLE PERMISSION
// ============================================================
// Update a specific role's permission
router.put('/role-permissions/:role/:permission', requireSuperadmin, async (req, res) => {
  try {
    const { role, permission } = req.params;
    const { enabled, reason } = req.body;
    const user = req.user;

    // Validate role and permission exist
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    if (!PERMISSIONS.find(p => p.name === permission)) {
      return res.status(400).json({ error: 'Invalid permission' });
    }

    // Get current permission state for audit log
    const { data: current } = await supabase
      .from('role_permissions')
      .select('is_enabled')
      .eq('role_name', role)
      .eq('permission_name', permission)
      .single();

    const previousValue = current ? current.is_enabled : false;

    // Update the permission
    const { data, error } = await supabase
      .from('role_permissions')
      .update({
        is_enabled: enabled,
        updated_at: new Date().toISOString()
      })
      .eq('role_name', role)
      .eq('permission_name', permission)
      .select();

    if (error) throw error;

    // Log the change
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    await supabase
      .from('permission_audit_log')
      .insert({
        action_type: 'permission_updated',
        role_name: role,
        permission_name: permission,
        changed_by: user.id,
        changed_by_email: profile?.email,
        previous_value: { enabled: previousValue },
        new_value: { enabled },
        change_reason: reason || null
      });

    res.json({
      success: true,
      message: `Permission '${permission}' for role '${role}' updated to ${enabled ? 'enabled' : 'disabled'}`,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// BATCH UPDATE PERMISSIONS
// ============================================================
// Update multiple permissions at once
router.post('/role-permissions/batch', requireSuperadmin, async (req, res) => {
  try {
    const { updates, reason } = req.body;
    const user = req.user;

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ error: 'Updates array is required' });
    }

    const results = [];
    const auditLogs = [];

    // Get user email for audit log
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    for (const update of updates) {
      const { role, permission, enabled } = update;

      // Validate
      if (!ROLES.includes(role) || !PERMISSIONS.find(p => p.name === permission)) {
        results.push({ role, permission, success: false, error: 'Invalid role or permission' });
        continue;
      }

      try {
        // Get current state
        const { data: current } = await supabase
          .from('role_permissions')
          .select('is_enabled')
          .eq('role_name', role)
          .eq('permission_name', permission)
          .single();

        const previousValue = current ? current.is_enabled : false;

        // Update
        const { data, error } = await supabase
          .from('role_permissions')
          .update({
            is_enabled: enabled,
            updated_at: new Date().toISOString()
          })
          .eq('role_name', role)
          .eq('permission_name', permission)
          .select();

        if (error) throw error;

        // Prepare audit log entry
        auditLogs.push({
          action_type: 'permission_updated',
          role_name: role,
          permission_name: permission,
          changed_by: user.id,
          changed_by_email: profile?.email,
          previous_value: { enabled: previousValue },
          new_value: { enabled },
          change_reason: reason || null
        });

        results.push({ role, permission, success: true, data: data[0] });
      } catch (error) {
        results.push({ role, permission, success: false, error: error.message });
      }
    }

    // Insert all audit logs
    if (auditLogs.length > 0) {
      await supabase
        .from('permission_audit_log')
        .insert(auditLogs);
    }

    res.json({
      success: true,
      message: `Updated ${results.filter(r => r.success).length} permissions`,
      results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// RESET PERMISSIONS TO DEFAULTS
// ============================================================
// Restore all permissions to system defaults
router.post('/role-permissions/reset', requireSuperadmin, async (req, res) => {
  try {
    const { roles: rolesToReset } = req.body;
    const user = req.user;

    // Default permission configurations
    const defaults = {
      superadmin: {
        create_assessment: true, edit_assessment: true, delete_assessment: true,
        publish_assessment: true, view_results: true, manage_users: true,
        send_to_trainees: true, view_analytics: true, manage_roles: true,
        access_admin_dashboard: true
      },
      admin: {
        create_assessment: true, edit_assessment: true, delete_assessment: false,
        publish_assessment: true, view_results: true, manage_users: true,
        send_to_trainees: true, view_analytics: true, manage_roles: false,
        access_admin_dashboard: true
      },
      trainer: {
        create_assessment: true, edit_assessment: false, delete_assessment: false,
        publish_assessment: false, view_results: true, manage_users: false,
        send_to_trainees: true, view_analytics: true, manage_roles: false,
        access_admin_dashboard: false
      },
      viewer: {
        create_assessment: false, edit_assessment: false, delete_assessment: false,
        publish_assessment: false, view_results: true, manage_users: false,
        send_to_trainees: false, view_analytics: true, manage_roles: false,
        access_admin_dashboard: false
      },
      user: {
        create_assessment: false, edit_assessment: false, delete_assessment: false,
        publish_assessment: false, view_results: false, manage_users: false,
        send_to_trainees: false, view_analytics: false, manage_roles: false,
        access_admin_dashboard: false
      }
    };

    const rolesToUpdate = rolesToReset || ROLES;
    const auditLogs = [];
    const updates = [];

    // Get user email for audit log
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    for (const role of rolesToUpdate) {
      if (!ROLES.includes(role)) continue;

      for (const permission of PERMISSIONS) {
        const newValue = defaults[role][permission.name];

        // Get current value for audit
        const { data: current } = await supabase
          .from('role_permissions')
          .select('is_enabled')
          .eq('role_name', role)
          .eq('permission_name', permission.name)
          .single();

        const previousValue = current ? current.is_enabled : false;

        if (previousValue !== newValue) {
          updates.push({
            role_name: role,
            permission_name: permission.name,
            is_enabled: newValue,
            updated_at: new Date().toISOString()
          });

          auditLogs.push({
            action_type: 'permission_reset_to_default',
            role_name: role,
            permission_name: permission.name,
            changed_by: user.id,
            changed_by_email: profile?.email,
            previous_value: { enabled: previousValue },
            new_value: { enabled: newValue }
          });
        }
      }
    }

    // Perform batch update
    for (const update of updates) {
      await supabase
        .from('role_permissions')
        .update({ is_enabled: update.is_enabled })
        .eq('role_name', update.role_name)
        .eq('permission_name', update.permission_name);
    }

    // Log all changes
    if (auditLogs.length > 0) {
      await supabase
        .from('permission_audit_log')
        .insert(auditLogs);
    }

    res.json({
      success: true,
      message: `Reset permissions for ${rolesToUpdate.length} role(s) to defaults`,
      updatedCount: updates.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// GET PERMISSION AUDIT LOG
// ============================================================
// Retrieve audit log of all permission changes
router.get('/role-permissions/audit', requireSuperadmin, async (req, res) => {
  try {
    const { limit = 100, offset = 0, role, action } = req.query;

    let query = supabase
      .from('permission_audit_log')
      .select('*')
      .order('changed_at', { ascending: false });

    if (role) {
      query = query.eq('role_name', role);
    }
    if (action) {
      query = query.eq('action_type', action);
    }

    const { data, error, count } = await query
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    res.json({
      data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// EXPORT THE ROUTER
// ============================================================
module.exports = router;

// ============================================================
// INTEGRATION EXAMPLE
// ============================================================
/*
// In your main backend file (e.g., backend_server.js):

const permissionRoutes = require('./permissionRoutes');

// Add this middleware before routes
app.use('/api/permissions', permissionRoutes);

// Usage examples:
// GET    /api/permissions/permissions
// GET    /api/permissions/roles
// GET    /api/permissions/role-permissions
// GET    /api/permissions/role-permissions/detailed
// PUT    /api/permissions/role-permissions/:role/:permission
// POST   /api/permissions/role-permissions/batch
// POST   /api/permissions/role-permissions/reset
// GET    /api/permissions/role-permissions/audit
*/
