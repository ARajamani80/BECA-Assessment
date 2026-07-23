// BECA Assessment Platform - Dashboard Module

/**
 * Render dashboard
 */
async function renderDashboard() {
  document.getElementById('pageTitle').textContent = 'Dashboard';

  try {
    const assessments = await getAssessments();
    const results = await getResults();

    let passRate = 0;
    if (results && results.length > 0) {
      const passed = results.filter(r => r.passed || r.total_score >= 60).length;
      passRate = Math.round((passed / results.length) * 100);
    }

    const uniqueStudents = new Set(
      results && results.length > 0 ? results.map(r => r.user_id).filter(Boolean) : []
    ).size;

    const assessmentCount = assessments && assessments.length > 0 ? assessments.length : 0;
    const resultCount = results && results.length > 0 ? results.length : 0;

    document.getElementById('page').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card" style="--stat-color: #3b82f6;">
          <div class="stat-value" style="color: #2563eb;">${assessmentCount}</div>
          <div class="stat-label">Total Assessments</div>
        </div>
        <div class="stat-card" style="--stat-color: #10b981;">
          <div class="stat-value" style="color: #059669;">${resultCount}</div>
          <div class="stat-label">Total Submissions</div>
        </div>
        <div class="stat-card" style="--stat-color: #f59e0b;">
          <div class="stat-value" style="color: #d97706;">${passRate}%</div>
          <div class="stat-label">Pass Rate</div>
        </div>
        <div class="stat-card" style="--stat-color: #7c3aed;">
          <div class="stat-value" style="color: #6d28d9;">${uniqueStudents}</div>
          <div class="stat-label">Unique Students</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">📋 Recent Submissions</div>
        <table class="table">
          <thead>
            <tr>
              <th>Assessment</th>
              <th>User</th>
              <th>Status</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody id="recentSubmissions"></tbody>
        </table>
      </div>
    `;

    // Populate recent submissions
    const recent = Array.isArray(results) ? results.slice(0, 10) : [];
    const submissionsHtml = recent.map(r => `
      <tr>
        <td><strong>${r.assessment_id || '-'}</strong></td>
        <td>${r.user_id ? r.user_id.substring(0, 8) : '-'}...</td>
        <td>${r.submitted_at ? '<span class="badge badge-success">✓ Submitted</span>' : '<span class="badge badge-warning">⏳ In Progress</span>'}</td>
        <td>${r.total_score ? r.total_score + '%' : '-'}</td>
        <td>${formatDate(r.submitted_at || r.created_at)}</td>
      </tr>
    `).join('');

    const tbody = document.getElementById('recentSubmissions');
    if (tbody) {
      tbody.innerHTML = submissionsHtml;
    }
  } catch (error) {
    showMessage('Error loading dashboard: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: var(--text-secondary);">Failed to load dashboard data</p></div>';
  }
}
