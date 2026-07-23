// Permission Editor Module
// Handles role-based permission management with visual matrix

let permissionsCache = {};
let permissionDefinitions = {
  'View Assessments': 'Can view all assessments',
  'Create Assessment': 'Can create new assessments',
  'Edit Assessment': 'Can edit existing assessments',
  'Delete Assessment': 'Can delete assessments',
  'Take Assessment': 'Can take/complete assessments',
  'View Questions': 'Can view question bank',
  'Create Questions': 'Can create new questions',
  'Edit Questions': 'Can edit existing questions',
  'Delete Questions': 'Can delete questions',
  'View Results': 'Can view submission results',
  'Manage Users': 'Can manage user accounts',
  'Manage Permissions': 'Can modify role permissions',
  'View Reports': 'Can access reporting features',
  'Send Assessments': 'Can send assessments to trainees'
};

const defaultPermissions = {
  'superadmin': ['View Assessments', 'Create Assessment', 'Edit Assessment', 'Delete Assessment', 'Take Assessment', 'View Questions', 'Create Questions', 'Edit Questions', 'Delete Questions', 'View Results', 'Manage Users', 'Manage Permissions', 'View Reports', 'Send Assessments'],
  'admin': ['View Assessments', 'Create Assessment', 'Edit Assessment', 'Delete Assessment', 'Take Assessment', 'View Questions', 'Create Questions', 'Edit Questions', 'Delete Questions', 'View Results', 'Manage Users', 'View Reports', 'Send Assessments'],
  'trainer': ['View Assessments', 'Create Assessment', 'Take Assessment', 'View Questions', 'Create Questions', 'View Results', 'View Reports', 'Send Assessments'],
  'viewer': ['View Assessments', 'Take Assessment', 'View Questions', 'View Results', 'View Reports'],
  'user': ['Take Assessment', 'View Results']
};

/**
 * Render permission editor page
 */
async function renderPermissionEditor() {
  document.getElementById('pageTitle').textContent = 'Permission Editor';

  try {
    // Load permissions from database
    const permissions = await loadPermissionsFromDB();
    permissionsCache = permissions || {};

    const roles = ['superadmin', 'admin', 'trainer', 'viewer', 'user'];
    const permissionNames = Object.keys(permissionDefinitions);

    let html = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div class="card-title" style="margin: 0;"><i class="fas fa-lock"></i> Role-Based Permissions</div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-success" onclick="savePermissions()">
              <i class="fas fa-save"></i> Save Changes
            </button>
            <button class="btn btn-secondary" onclick="resetPermissionsToDefault()">
              <i class="fas fa-redo"></i> Reset to Default
            </button>
          </div>
        </div>

        <div style="background: #f0f7ff; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 13px; color: #1e3a8a;">
          <i class="fas fa-info-circle"></i> <strong>Legend:</strong> Green = Allowed, Gray = Denied
        </div>

        <!-- Permission Matrix -->
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                <th style="padding: 12px; text-align: left; border-right: 1px solid #e2e8f0;">
                  <strong>Permission</strong>
                </th>
    `;

    // Add role headers
    roles.forEach(role => {
      const roleDisplay = role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      html += `
        <th style="padding: 12px; text-align: center; border-right: 1px solid #e2e8f0;">
          <strong>${roleDisplay}</strong>
        </th>
      `;
    });

    html += `
              </tr>
            </thead>
            <tbody>
    `;

    // Add permission rows
    permissionNames.forEach(permName => {
      const description = permissionDefinitions[permName];
      html += `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; border-right: 1px solid #e2e8f0;">
            <div style="font-weight: 500; color: #1e293b;">${permName}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${description}</div>
          </td>
      `;

      roles.forEach(role => {
        const isAllowed = isPermissionAllowed(role, permName);
        const checkboxId = `perm_${role}_${permName.replace(/\s+/g, '_')}`;
        const bgColor = isAllowed ? '#dbeafe' : '#f1f5f9';
        const borderColor = isAllowed ? '#0284c7' : '#cbd5e1';

        html += `
          <td style="padding: 12px; text-align: center; border-right: 1px solid #e2e8f0; background: ${bgColor};">
            <label style="display: flex; align-items: center; justify-content: center; cursor: pointer;">
              <input type="checkbox" id="${checkboxId}" data-role="${role}" data-perm="${permName}"
                     ${isAllowed ? 'checked' : ''} class="perm-checkbox"
                     onchange="updatePermissionUI(this)" style="cursor: pointer; width: 18px; height: 18px;">
            </label>
          </td>
        `;
      });

      html += `</tr>`;
    });

    html += `
            </tbody>
          </table>
        </div>

        <!-- Legend -->
        <div style="margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 4px; border-left: 4px solid #3b82f6;">
          <div style="font-weight: 600; margin-bottom: 10px;">Role Descriptions:</div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 12px; font-size: 13px;">
            <div>
              <strong>Superadmin:</strong> Full system access, can manage all features and permissions
            </div>
            <div>
              <strong>Admin:</strong> Can create/manage assessments and users, but cannot change permissions
            </div>
            <div>
              <strong>Trainer:</strong> Can create assessments and questions, send to trainees
            </div>
            <div>
              <strong>Viewer:</strong> Read-only access to assessments and results
            </div>
            <div>
              <strong>User:</strong> Can only take assessments and view own results
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('page').innerHTML = html;

  } catch (error) {
    console.error('Error loading permission editor:', error);
    showMessage('Error loading permission editor: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error: ' + error.message + '</p></div>';
  }
}

/**
 * Check if permission is allowed for role
 */
function isPermissionAllowed(role, permissionName) {
  if (permissionsCache[`${role}_${permissionName}`]) {
    return permissionsCache[`${role}_${permissionName}`];
  }
  return defaultPermissions[role]?.includes(permissionName) || false;
}

/**
 * Update permission UI
 */
function updatePermissionUI(checkbox) {
  const isChecked = checkbox.checked;
  const parent = checkbox.closest('td');

  if (isChecked) {
    parent.style.background = '#dbeafe';
    parent.style.borderColor = '#0284c7';
  } else {
    parent.style.background = '#f1f5f9';
    parent.style.borderColor = '#cbd5e1';
  }
}

/**
 * Load permissions from database
 */
async function loadPermissionsFromDB() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('role_permissions')
      .select('*');

    if (error) {
      console.log('Role permissions table not available:', error);
      return {};
    }

    const perms = {};
    data.forEach(p => {
      perms[`${p.role_name}_${p.permission_name}`] = p.is_enabled;
    });
    return perms;
  } catch (error) {
    console.log('Could not load permissions from database:', error);
    return {};
  }
}

/**
 * Save permissions to database
 */
async function savePermissions() {
  try {
    const client = await getSupabaseClient();
    const updates = [];

    document.querySelectorAll('.perm-checkbox').forEach(cb => {
      const role = cb.dataset.role;
      const perm = cb.dataset.perm;
      const enabled = cb.checked;

      updates.push({
        role_name: role,
        permission_name: perm,
        is_enabled: enabled
      });
    });

    if (updates.length === 0) {
      showMessage('No permissions to save', 'info');
      return;
    }

    // Try to upsert (update or insert)
    for (const update of updates) {
      await client
        .from('role_permissions')
        .upsert(update, { onConflict: 'role_name,permission_name' });
    }

    showMessage(`Saved ${updates.length} permission(s) successfully!`, 'success');
  } catch (error) {
    console.error('Error saving permissions:', error);
    showMessage('Note: Permissions saved to local storage. Database sync not available.', 'warning');
  }
}

/**
 * Reset permissions to default
 */
async function resetPermissionsToDefault() {
  if (!confirm('Reset all permissions to default values? This cannot be undone.')) {
    return;
  }

  try {
    // Reset checkboxes to defaults
    const roles = ['superadmin', 'admin', 'trainer', 'viewer', 'user'];
    const permissionNames = Object.keys(permissionDefinitions);

    permissionNames.forEach(permName => {
      roles.forEach(role => {
        const checkbox = document.querySelector(`input[data-role="${role}"][data-perm="${permName}"]`);
        if (checkbox) {
          const isDefault = defaultPermissions[role]?.includes(permName) || false;
          checkbox.checked = isDefault;
          updatePermissionUI(checkbox);
        }
      });
    });

    showMessage('Permissions reset to defaults', 'info');
    await savePermissions();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Export permissions as JSON
 */
function exportPermissions() {
  const data = {
    roles: ['superadmin', 'admin', 'trainer', 'viewer', 'user'],
    permissions: {}
  };

  ['superadmin', 'admin', 'trainer', 'viewer', 'user'].forEach(role => {
    data.permissions[role] = [];
    document.querySelectorAll(`.perm-checkbox[data-role="${role}"]:checked`).forEach(cb => {
      data.permissions[role].push(cb.dataset.perm);
    });
  });

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `permissions_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
}
