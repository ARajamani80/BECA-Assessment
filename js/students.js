// BECA Assessment Platform - Students Module

/**
 * Render students page
 */
async function renderStudents() {
  document.getElementById('pageTitle').textContent = 'Students';

  try {
    const users = await getUsers();
    const students = Array.isArray(users) ? users.filter(u => u.user_role === 'user' || !u.user_role) : [];

    let html = `
      <div class="card">
        <div class="card-title"><i class="fas fa-book"></i> Student Management</div>
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (students.length === 0) {
      html += '<tr><td colspan="4" style="text-align: center; color: var(--text-secondary);">No students found</td></tr>';
    } else {
      students.forEach(s => {
        html += `
          <tr>
            <td>${s.full_name || 'N/A'}</td>
            <td>${s.email}</td>
            <td>${formatDate(s.created_at)}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="viewStudentProfile('${s.id}')"><i class="fas fa-eye"></i> View</button>
            </td>
          </tr>
        `;
      });
    }

    html += '</tbody></table></div>';
    document.getElementById('page').innerHTML = html;
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error loading students</p></div>';
  }
}

/**
 * View student profile
 * @param {string} id - Student ID
 */
async function viewStudentProfile(id) {
  showMessage('Student profile feature coming soon', 'success');
}
