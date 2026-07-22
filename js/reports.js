// BECA Assessment Platform - Reports Module

/**
 * Render reports page
 */
async function renderReports() {
  document.getElementById('pageTitle').textContent = 'Reports';

  try {
    const results = await getResults();

    let passRate = 0;
    let avgScore = 0;

    if (Array.isArray(results) && results.length > 0) {
      const passed = results.filter(r => r.passed).length;
      passRate = Math.round((passed / results.length) * 100);

      const totalScore = results.reduce((sum, r) => sum + (r.total_score || 0), 0);
      avgScore = Math.round(totalScore / results.length);
    }

    document.getElementById('page').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card" style="--stat-color: #10b981;">
          <div class="stat-value" style="color: #059669;">${passRate}%</div>
          <div class="stat-label">Overall Pass Rate</div>
        </div>
        <div class="stat-card" style="--stat-color: #f59e0b;">
          <div class="stat-value" style="color: #d97706;">${avgScore}%</div>
          <div class="stat-label">Average Score</div>
        </div>
        <div class="stat-card" style="--stat-color: #7c3aed;">
          <div class="stat-value" style="color: #6d28d9;">${Array.isArray(results) ? results.length : 0}</div>
          <div class="stat-label">Total Submissions</div>
        </div>
      </div>
    `;
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error loading reports</p></div>';
  }
}
