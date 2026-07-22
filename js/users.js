// BECA Assessment Platform - User Management Module

let auditLog = [];

/**
 * Log user action for audit trail
 * @param {string} action - Action name
 * @param {string} targetUserId - Target user ID
 * @param {string} targetUserEmail - Target user email
 * @param {object} details - Additional details
 */
async function logUserAction(action, targetUserId, targetUserEmail, details = {}) {
  const logEntry = {
    id: Math.random().toString(36).substr(2, 9),
    action: action,
    performedBy: currentUser?.id || 'system',
    performedByEmail: currentUser?.email || 'system',
    targetUserId: targetUserId,
    targetUserEmail: targetUserEmail,
    timestamp: new Date().toISOString(),
    details: details
  };

  auditLog.unshift(logEntry);

  // Try to save to database
  try {
    await saveAuditLog(logEntry);
  } catch (e) {
    console.log('Audit log table not available:', e);
  }
}

/**
 * Render users management page
 */
async function renderUsers() {
  document.getElementById('pageTitle').textContent = 'User Management';

  try {
    const users = await getUsers();
    const isSuperadmin = currentUser?.user_metadata?.role === 'superadmin';

    let html = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div class="card-title" style="margin: 0;"><i class="fas fa-users"></i> User Management</div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-secondary btn-sm" onclick="openRolePermissionsModal()">
              <i class="fas fa-shield-alt"></i> Role Permissions
            </button>
            ${isSuperadmin ? `<button class="btn btn-secondary btn-sm" onclick="viewAuditLog()">
              <i class="fas fa-history"></i> Audit Log
            </button>` : ''}
          </div>
        </div>

        <div style="overflow-x: auto;">
          <table class="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (!Array.isArray(users) || users.length === 0) {
      html += '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">No users found</td></tr>';
    } else {
      users.forEach(u => {
        const role = u.user_role || u.role || 'user';
        const badgeClass = `badge-${role}`;
        const isActive = u.is_active !== false;
        const statusBadge = isActive
          ? '<span class="badge badge-success"><i class="fas fa-check-circle"></i> Active</span>'
          : '<span class="badge badge-danger"><i class="fas fa-times-circle"></i> Inactive</span>';
        const joinedDate = u.created_at ? formatDate(u.created_at) : 'N/A';

        html += `
          <tr ${!isActive ? 'style="opacity: 0.7;"' : ''}>
            <td>
              <strong>${u.full_name || 'N/A'}</strong>
              ${!isActive && u.deactivated_at ? `<br><small style="color: #ef4444;">Deactivated: ${formatDate(u.deactivated_at)}</small>` : ''}
            </td>
            <td>${u.email}</td>
            <td>
              <span class="badge ${badgeClass}">${role}</span>
            </td>
            <td>${statusBadge}</td>
            <td>${joinedDate}</td>
            <td>
              <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                <button class="btn btn-primary btn-sm" onclick="changeUserRolePrompt('${u.id}', '${u.email}', '${role}')" title="Change Role">
                  <i class="fas fa-exchange-alt"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="openPasswordResetModal('${u.id}', '${u.email}')" title="Reset Password">
                  <i class="fas fa-key"></i>
                </button>
                ${isActive
                  ? `<button class="btn btn-danger btn-sm" onclick="openDeactivateModal('${u.id}', '${u.email}')" title="Deactivate User">
                    <i class="fas fa-ban"></i>
                  </button>`
                  : `<button class="btn btn-success btn-sm" onclick="reactivateUserConfirm('${u.id}', '${u.email}')" title="Reactivate User">
                    <i class="fas fa-check"></i>
                  </button>`
                }
                <button class="btn btn-danger btn-sm" onclick="deleteUserConfirm('${u.id}', '${u.email}', '${u.full_name || u.email}')" title="Delete User">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      });
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="margin-top: 20px;">
        <div class="card-title"><i class="fas fa-info-circle"></i> User Management Guide</div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;">
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="font-weight: 600; margin-bottom: 6px;"><i class="fas fa-exchange-alt"></i> Change Role</p>
            <p style="color: var(--text-secondary); font-size: 13px;">Modify user role to adjust their permissions.</p>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <p style="font-weight: 600; margin-bottom: 6px;"><i class="fas fa-key"></i> Reset Password</p>
            <p style="color: var(--text-secondary); font-size: 13px;">Generate a temporary password for users who forgot theirs.</p>
          </div>
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #ef4444;">
            <p style="font-weight: 600; margin-bottom: 6px;"><i class="fas fa-ban"></i> Deactivate User</p>
            <p style="color: var(--text-secondary); font-size: 13px;">Temporarily disable access without deleting user record.</p>
          </div>
        </div>
      </div>
    `;

    document.getElementById('page').innerHTML = html;
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error loading users: ' + error.message + '</p></div>';
  }
}

/**
 * Change user role with prompt
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @param {string} currentRole - Current role
 */
function changeUserRolePrompt(userId, userEmail, currentRole) {
  const roles = ['viewer', 'user', 'trainer', 'admin', 'superadmin'];
  const roleOptions = roles.filter(r => r !== currentRole).join(', ');
  const newRole = prompt(`Change role from "${currentRole}" to one of:\n${roleOptions}`, '');

  if (newRole && roles.includes(newRole)) {
    changeUserRole(userId, userEmail, currentRole, newRole);
  }
}

/**
 * Change user role
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @param {string} fromRole - From role
 * @param {string} toRole - To role
 */
async function changeUserRole(userId, userEmail, fromRole, toRole) {
  try {
    await updateAssessmentTaker({ user_role: toRole }, `?id=eq.${userId}`);

    // Log the action
    await logUserAction('role_change', userId, userEmail, {
      fromRole: fromRole,
      toRole: toRole,
      timestamp: new Date().toISOString()
    });

    showMessage('User role updated successfully!', 'success');
    renderUsers();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Handle password change
 * @param {Event} e - Form event
 */
async function handleChangePassword(e) {
  e.preventDefault();

  try {
    const userId = document.getElementById('passwordResetModal').dataset.userId;
    const userEmail = document.getElementById('passwordResetModal').dataset.userEmail;
    const tempPassword = document.getElementById('tempPassword').value;
    const sendEmail = document.getElementById('sendResetEmail').checked;

    if (!tempPassword) {
      showMessage('Please generate a temporary password', 'error');
      return;
    }

    // Update user password in database
    await apiCall('PATCH', 'profiles',
      { temporary_password: tempPassword, password_reset_required: true },
      `?id=eq.${userId}`
    );

    // Log the action
    await logUserAction('password_reset', userId, userEmail, {
      sendEmailNotification: sendEmail,
      timestamp: new Date().toISOString()
    });

    closeModal('passwordResetModal');
    showMessage('Password reset successfully! User must change password on next login.', 'success');
    renderUsers();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Confirm deactivate user
 */
async function confirmDeactivateUser() {
  const userId = document.getElementById('deactivateModal').dataset.userId;
  const userEmail = document.getElementById('deactivateModal').dataset.userEmail;
  const reason = document.getElementById('deactivationReason').value;

  try {
    await apiCall('PATCH', 'profiles',
      {
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason
      },
      `?id=eq.${userId}`
    );

    // Log the action
    await logUserAction('user_deactivated', userId, userEmail, {
      reason: reason,
      timestamp: new Date().toISOString()
    });

    closeModal('deactivateModal');
    showMessage('User has been deactivated successfully.', 'success');
    renderUsers();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Reactivate user with confirmation
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 */
async function reactivateUserConfirm(userId, userEmail) {
  if (!confirm('Reactivate this user? They will be able to login again.')) return;

  try {
    await apiCall('PATCH', 'profiles',
      {
        is_active: true,
        deactivated_at: null
      },
      `?id=eq.${userId}`
    );

    // Log the action
    await logUserAction('user_reactivated', userId, userEmail, {
      timestamp: new Date().toISOString()
    });

    showMessage('User has been reactivated successfully.', 'success');
    renderUsers();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Delete user with confirmation
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 * @param {string} userName - User name
 */
async function deleteUserConfirm(userId, userEmail, userName) {
  if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) return;

  try {
    await apiCall('DELETE', 'profiles', null, `?id=eq.${userId}`);

    // Log the action
    await logUserAction('user_deleted', userId, userEmail, {
      timestamp: new Date().toISOString()
    });

    showMessage('User deleted successfully.', 'success');
    renderUsers();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * View audit log
 */
function viewAuditLog() {
  if (currentUser?.user_metadata?.role !== 'superadmin') {
    showMessage('Only superadmins can view audit logs', 'error');
    return;
  }

  let html = '<div class="card"><div class="card-title"><i class="fas fa-history"></i> User Audit Log</div>';

  if (auditLog.length === 0) {
    html += '<p style="color: var(--text-secondary); text-align: center;">No audit log entries</p>';
  } else {
    html += '<table class="table"><thead><tr><th>Action</th><th>User</th><th>Target User</th><th>Date/Time</th><th>Details</th></tr></thead><tbody>';
    auditLog.slice(0, 50).forEach(entry => {
      html += `
        <tr>
          <td><span class="badge badge-warning">${entry.action}</span></td>
          <td>${entry.performedByEmail}</td>
          <td>${entry.targetUserEmail}</td>
          <td>${formatDateTime(entry.timestamp)}</td>
          <td style="font-size: 12px; color: var(--text-secondary);">${JSON.stringify(entry.details).substring(0, 50)}...</td>
        </tr>
      `;
    });
    html += '</tbody></table>';
  }
  html += '</div>';

  document.getElementById('page').innerHTML = html;
}
