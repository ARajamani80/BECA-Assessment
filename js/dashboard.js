// BECA Assessment Platform - Dashboard Module

let dashboardCharts = {};

/**
 * Render dashboard
 */
async function renderDashboard() {
  document.getElementById('pageTitle').textContent = 'Dashboard';

  try {
    const assessments = await getAssessments();
    const results = await getResults();
    const questions = await getAllQuestions();
    const takers = await getAssessmentTakers();

    // Calculate statistics
    let passRate = 0;
    const submitted = results.filter(r => r.submitted_at);
    const pending = results.filter(r => !r.submitted_at);

    if (submitted.length > 0) {
      const passed = submitted.filter(r => r.passed || r.total_score >= 60).length;
      passRate = Math.round((passed / submitted.length) * 100);
    }

    const activeThisMonth = assessments.filter(a => {
      const created = new Date(a.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;

    const completionRate = submitted.length + pending.length > 0
      ? Math.round((submitted.length / (submitted.length + pending.length)) * 100)
      : 0;

    const questionsByType = {};
    if (Array.isArray(questions)) {
      questions.forEach(q => {
        const type = q.question_type || 'other';
        questionsByType[type] = (questionsByType[type] || 0) + 1;
      });
    }

    const uniqueStudents = new Set(
      results && results.length > 0 ? results.map(r => r.user_id).filter(Boolean) : []
    ).size;

    const assessmentCount = assessments && assessments.length > 0 ? assessments.length : 0;
    const resultCount = results && results.length > 0 ? results.length : 0;
    const questionCount = questions && questions.length > 0 ? questions.length : 0;

    document.getElementById('page').innerHTML = `
      <!-- Quick Action Buttons -->
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="showPage('assessments')">
            <i class="fas fa-plus"></i> Create Assessment
          </button>
          <button class="btn btn-primary" onclick="showPage('questions')">
            <i class="fas fa-plus"></i> Add Questions
          </button>
          <button class="btn btn-primary" onclick="showPage('send-trainees')">
            <i class="fas fa-paper-plane"></i> Send Assessment
          </button>
        </div>
        <button class="btn btn-secondary btn-sm" id="refreshDashboardBtn" onclick="refreshDashboard()" title="Refresh dashboard statistics">
          <i class="fas fa-redo"></i> Refresh
        </button>
      </div>

      <!-- Primary Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card" style="--stat-color: #3b82f6; cursor: pointer;" onclick="showPage('assessments')">
          <div class="stat-value" style="color: #2563eb;">${assessmentCount}</div>
          <div class="stat-label">Total Assessments</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">${activeThisMonth} this month</div>
        </div>
        <div class="stat-card" style="--stat-color: #10b981; cursor: pointer;" onclick="showPage('send-trainees')">
          <div class="stat-value" style="color: #059669;">${resultCount}</div>
          <div class="stat-label">Total Submissions</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">${submitted.length} completed, ${pending.length} pending</div>
        </div>
        <div class="stat-card" style="--stat-color: #f59e0b; cursor: pointer;" onclick="showPage('results')">
          <div class="stat-value" style="color: #d97706;">${passRate}%</div>
          <div class="stat-label">Pass Rate</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">${completionRate}% completion</div>
        </div>
        <div class="stat-card" style="--stat-color: #7c3aed; cursor: pointer;" onclick="showPage('users')">
          <div class="stat-value" style="color: #6d28d9;">${uniqueStudents}</div>
          <div class="stat-label">Assessment Takers</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">${takers ? takers.length : 0} registered</div>
        </div>
      </div>

      <!-- Secondary Stats -->
      <div class="stats-grid">
        <div class="stat-card" style="--stat-color: #06b6d4;">
          <div class="stat-value" style="color: #0891b2;">${questionCount}</div>
          <div class="stat-label">Total Questions</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 20px; margin: 20px 0;">
        <!-- Question Types Distribution -->
        <div class="card">
          <div class="card-title">Question Types Distribution</div>
          <canvas id="questionTypesChart" height="300"></canvas>
        </div>

        <!-- Submission Trends -->
        <div class="card">
          <div class="card-title">Submission Status</div>
          <canvas id="submissionStatusChart" height="300"></canvas>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-title">Recent Submissions</div>
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
      tbody.innerHTML = submissionsHtml || '<tr><td colspan="5" style="text-align: center; color: #999;">No submissions yet</td></tr>';
    }

    // Initialize charts after DOM is ready
    setTimeout(() => {
      createQuestionTypesChart(questionsByType);
      createSubmissionStatusChart(submitted.length, pending.length);
    }, 100);

  } catch (error) {
    console.error('Dashboard error:', error);
    showMessage('Error loading dashboard: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: var(--text-secondary);">Failed to load dashboard data</p></div>';
  }
}

/**
 * Create question types pie chart
 */
function createQuestionTypesChart(questionsByType) {
  const ctx = document.getElementById('questionTypesChart');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (dashboardCharts.questionTypes) {
    dashboardCharts.questionTypes.destroy();
  }

  const labels = Object.keys(questionsByType);
  const data = Object.values(questionsByType);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  dashboardCharts.questionTypes = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.map(l => l.toUpperCase()),
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

/**
 * Create submission status chart
 */
function createSubmissionStatusChart(completed, pending) {
  const ctx = document.getElementById('submissionStatusChart');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (dashboardCharts.submissionStatus) {
    dashboardCharts.submissionStatus.destroy();
  }

  dashboardCharts.submissionStatus = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Completed', 'Pending'],
      datasets: [{
        label: 'Submissions',
        data: [completed, pending],
        backgroundColor: ['#10b981', '#f59e0b'],
        borderColor: ['#059669', '#d97706'],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      }
    }
  });
}

/**
 * Refresh dashboard statistics
 */
async function refreshDashboard() {
  const btn = document.getElementById('refreshDashboardBtn');
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

  try {
    await renderDashboard();
    showMessage('Dashboard refreshed successfully', 'success');
  } catch (error) {
    showMessage('Error refreshing dashboard: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}
