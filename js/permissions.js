// Permission Editor Module
// Handles role-based permission management

let permissionsCache = {};

async function openPermissionEditor() {
  try {
    showMessage('Loading permissions...', 'success');
    
    // Load permissions from database
    const permissions = await apiCall('GET', 'role_permissions?select=*');
    
    // Group by role
    const roles = ['superadmin', 'admin', 'trainer', 'viewer', 'user'];
    const permissionNames = [...new Set(permissions.map(p => p.permission_name))];
    
    // Build matrix HTML
    let html = '<table class="table" style="width: 100%;"><thead><tr>';
    html += '<th>Permission</th>';
    roles.forEach(role => {
      const roleDisplay = role.charAt(0).toUpperCase() + role.slice(1);
      html += `<th style="text-align: center;"><strong>${roleDisplay}</strong></th>`;
    });
    html += '</tr></thead><tbody>';
    
    permissionNames.forEach(perm => {
      html += `<tr><td><strong>${perm}</strong></td>`;
      roles.forEach(role => {
        const perm_obj = permissions.find(p => p.role_name === role && p.permission_name === perm);
        const checked = perm_obj?.is_enabled ? 'checked' : '';
        html += `<td style="text-align: center;"><input type="checkbox" ${checked} data-role="${role}" data-perm="${perm}" class="perm-checkbox"></td>`;
      });
      html += '</tr>';
    });
    
    html += '</tbody></table>';
    document.getElementById('permissionMatrix').innerHTML = html;
    document.getElementById('permissionEditorModal').classList.add('active');
    
    permissionsCache = permissions;
    showMessage('Permissions loaded!', 'success');
  } catch (error) {
    console.error('Error loading permissions:', error);
    showMessage('Error loading permissions: ' + error.message, 'error');
  }
}

async function savePermissions() {
  try {
    const checkboxes = document.querySelectorAll('.perm-checkbox');
    const updates = [];
    
    checkboxes.forEach(cb => {
      const role = cb.dataset.role;
      const perm = cb.dataset.perm;
      const enabled = cb.checked;
      
      const original = permissionsCache.find(p => p.role_name === role && p.permission_name === perm);
      if (original && original.is_enabled !== enabled) {
        updates.push({
          role_name: role,
          permission_name: perm,
          is_enabled: enabled
        });
      }
    });
    
    if (updates.length === 0) {
      showMessage('No changes to save', 'success');
      return;
    }
    
    // Save each update
    for (const update of updates) {
      await apiCall('PATCH', 'role_permissions', update, 
        `?role_name=eq.${update.role_name}&permission_name=eq.${update.permission_name}`);
    }
    
    showMessage(`Saved ${updates.length} permission change(s)!`, 'success');
    closeModal('permissionEditorModal');
  } catch (error) {
    console.error('Error saving permissions:', error);
    showMessage('Error saving permissions: ' + error.message, 'error');
  }
}

function resetPermissions() {
  if (confirm('Reset all permissions to defaults? This cannot be undone.')) {
    showMessage('Reset feature coming soon', 'success');
  }
}
