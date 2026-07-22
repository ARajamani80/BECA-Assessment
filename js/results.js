// BECA Assessment Platform - Results Module

/**
 * Render results page
 */
async function renderResults() {
  document.getElementById('pageTitle').textContent = 'Results';

  try {
    const results = await getResults();

    let html = '<div class="card"><div class="card-title"><i class="fas fa-chart-line"></i> Assessment Results</div>';

    if (!Array.isArray(results) || results.length === 0) {
      html += '<p style="color: var(--text-secondary);">No results yet</p>';
    } else {
      html += '<table class="table"><thead><tr><th>User</th><th>Assessment</th><th>Score</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      results.forEach(r => {
        html += `
          <tr>
            <td>${r.user_id ? r.user_id.substring(0, 8) : '-'}...</td>
            <td>${r.assessment_id || '-'}</td>
            <td>${r.total_score ? r.total_score + '%' : '-'}</td>
            <td>${r.passed ? '<span class="badge badge-success">✓ Passed</span>' : r.submitted_at ? '<span class="badge badge-danger">✗ Failed</span>' : '<span class="badge badge-warning">⏳ Pending</span>'}</td>
            <td>${formatDate(r.submitted_at || r.created_at)}</td>
          </tr>
        `;
      });
      html += '</tbody></table>';
    }

    html += '</div>';
    document.getElementById('page').innerHTML = html;
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error loading results</p></div>';
  }
}
