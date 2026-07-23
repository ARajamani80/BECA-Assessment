// BECA Assessment Platform - Results Module

let resultsData = [];

/**
 * Render results page
 */
async function renderResults() {
  document.getElementById('pageTitle').textContent = 'Results';

  try {
    resultsData = await getResults();

    let html = `<div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div class="card-title" style="margin: 0;"><i class="fas fa-award"></i> Assessment Results</div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-info btn-sm" id="exportResultsBtn" onclick="exportResultsToExcel(resultsData)" title="Export all results to Excel">
            <i class="fas fa-download"></i> Export
          </button>
          <button class="btn btn-secondary btn-sm" id="refreshResultsBtn" onclick="refreshResultsPage()" title="Refresh results list">
            <i class="fas fa-redo"></i> Refresh
          </button>
        </div>
      </div>`;

    if (!Array.isArray(resultsData) || resultsData.length === 0) {
      html += '<p style="color: var(--text-secondary);">No results yet</p>';
    } else {
      html += '<table class="table"><thead><tr><th>User</th><th>Assessment</th><th>Score</th><th>Status</th><th>Date</th></tr></thead><tbody>';
      resultsData.forEach(r => {
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

/**
 * Refresh results page
 */
async function refreshResultsPage() {
  const btn = document.getElementById('refreshResultsBtn');
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

  try {
    await renderResults();
    showMessage('Data refreshed successfully', 'success');
  } catch (error) {
    showMessage('Error refreshing data: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}

/**
 * Format date utility function
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}
