// ============================================================================
// BECA Assessment Platform - Grading Interface
// ============================================================================
// Handles viewing submissions, grading answers, and assigning scores

let submissionsData = [];
let gradingSubmissionsPerPage = 10;
let filterStatus = 'all'; // all, submitted, graded, in_progress
let currentGradingSubmission = null;
let gradingState = {
  submissionId: null,
  answers: {},
  scores: {},
  feedback: {},
  totalScore: 0,
  passingScore: 60
};

/**
 * Render submissions list page
 */
async function renderSubmissions(selectedAssessmentId = null) {
  const page = document.getElementById('page');
  if (!page) return;

  try {
    // Get assessments for selection
    const assessments = await getAssessments();

    // Use selected assessment or first one
    const assessmentId = selectedAssessmentId || (assessments[0]?.id);

    if (!assessmentId) {
      page.innerHTML = '<div class="alert alert-warning">No assessments found</div>';
      return;
    }

    // Load submissions
    const submissions = await getAssessmentSubmissionsWithDetails(assessmentId);
    submissionsData = submissions;

    // Filter submissions
    let filtered = submissions;
    if (filterStatus !== 'all') {
      filtered = submissions.filter(s => s.status === filterStatus);
    }

    // Get current assessment name
    const currentAssessment = assessments.find(a => a.id === assessmentId);

    // Render UI
    page.innerHTML = `
      <div class="submissions-container">
        <!-- Header -->
        <div style="display: flex; gap: 15px; margin-bottom: 20px; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="margin: 0;">Assessment Submissions</h2>
            <p style="margin: 5px 0 0 0; color: #666;">
              Assessment: <strong>${currentAssessment?.title || 'Unknown'}</strong>
            </p>
          </div>
          <div style="display: flex; gap: 10px;">
            <select id="assessmentSelect" onchange="renderSubmissions(this.value)"
                    style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
              ${assessments.map(a => `
                <option value="${a.id}" ${a.id === assessmentId ? 'selected' : ''}>
                  ${a.title}
                </option>
              `).join('')}
            </select>
            <button class="btn btn-small btn-secondary" onclick="exportSubmissionsToExcel(submissionsData)">
              📥 Export
            </button>
          </div>
        </div>

        <!-- Filter buttons -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button class="btn btn-small ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="filterSubmissions('all')">
            All (${submissions.length})
          </button>
          <button class="btn btn-small ${filterStatus === 'submitted' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="filterSubmissions('submitted')">
            Submitted (${submissions.filter(s => s.status === 'submitted').length})
          </button>
          <button class="btn btn-small ${filterStatus === 'graded' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="filterSubmissions('graded')">
            Graded (${submissions.filter(s => s.status === 'graded').length})
          </button>
          <button class="btn btn-small ${filterStatus === 'in_progress' ? 'btn-primary' : 'btn-secondary'}"
                  onclick="filterSubmissions('in_progress')">
            In Progress (${submissions.filter(s => s.status === 'in_progress').length})
          </button>
        </div>

        <!-- Submissions table -->
        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead style="background: #f5f5f5; border-bottom: 2px solid #ddd;">
              <tr>
                <th style="padding: 12px; text-align: left; font-weight: 600;">Trainee</th>
                <th style="padding: 12px; text-align: left; font-weight: 600;">Email</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Status</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Score</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Result</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Submitted</th>
                <th style="padding: 12px; text-align: center; font-weight: 600;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(submission => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 12px;">
                    <strong>${submission.assessment_takers?.full_name || 'Unknown'}</strong>
                  </td>
                  <td style="padding: 12px;">
                    ${submission.assessment_takers?.email || 'N/A'}
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span class="status-badge status-${submission.status}">
                      ${submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    ${submission.score ? submission.score.toFixed(2) : '—'}
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    ${submission.pass_fail ? `
                      <span style="padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; ${
                        submission.pass_fail === 'pass'
                          ? 'background: #d4edda; color: #155724;'
                          : 'background: #f8d7da; color: #721c24;'
                      }">
                        ${submission.pass_fail.toUpperCase()}
                      </span>
                    ` : '—'}
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : '—'}
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <button class="btn btn-small btn-primary" onclick="openGradingModal('${submission.id}')">
                      ${submission.status === 'graded' ? '✏️ Edit' : '✓ Grade'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 40px; color: #666;">
            <p>No submissions found</p>
          </div>
        ` : ''}
      </div>
    `;

    // Add styles
    addGradingStyles();
  } catch (error) {
    console.error('Error rendering submissions:', error);
    page.innerHTML = `<div class="alert alert-danger">Error loading submissions: ${error.message}</div>`;
  }
}

/**
 * Filter submissions by status
 */
function filterSubmissions(status) {
  filterStatus = status;
  renderSubmissions();
}

/**
 * Open grading modal for a submission
 */
async function openGradingModal(submissionId) {
  try {
    console.log('Opening grading modal for:', submissionId);

    // Load submission details
    const submission = await getSubmissionDetails(submissionId);
    currentGradingSubmission = submission;

    // Initialize grading state
    gradingState.submissionId = submissionId;
    gradingState.passingScore = submission.assessments?.passing_score || 60;
    gradingState.scores = {};
    gradingState.feedback = {};

    // Show modal
    showModal('confirmModal');

    // Render grading interface in modal
    const modal = document.getElementById('confirmModal');
    if (!modal) return;

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 900px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0;">Grade Submission</h2>
          <button onclick="closeModal('confirmModal')" style="font-size: 24px; background: none; border: none; cursor: pointer;">×</button>
        </div>

        <!-- Taker info -->
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong>Trainee:</strong> ${submission.assessment_takers?.full_name || 'Unknown'}
            </div>
            <div>
              <strong>Email:</strong> ${submission.assessment_takers?.email || 'N/A'}
            </div>
            <div>
              <strong>Department:</strong> ${submission.assessment_takers?.department || 'N/A'}
            </div>
            <div>
              <strong>Time Taken:</strong> ${submission.time_taken_seconds ? (submission.time_taken_seconds / 60).toFixed(1) + ' minutes' : 'N/A'}
            </div>
            <div>
              <strong>Submitted:</strong> ${submission.submitted_at ? new Date(submission.submitted_at).toLocaleString() : 'Not submitted'}
            </div>
            <div>
              <strong>Status:</strong> ${submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
            </div>
          </div>
        </div>

        <!-- Assessment info -->
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0;">${submission.assessments?.title}</h4>
          <p style="margin: 0; color: #555;">${submission.assessments?.description}</p>
          <p style="margin: 5px 0 0 0; font-weight: 600;">Passing Score: ${submission.assessments?.passing_score}%</p>
        </div>

        <!-- Answers review -->
        <div id="answersContainer" style="margin-bottom: 20px;">
          <!-- Answers will be rendered here -->
        </div>

        <!-- Score summary -->
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
            <div>
              <label>Total Score:</label>
              <input type="number" id="totalScore" min="0" max="100" value="${submission.score || ''}"
                     style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" />
            </div>
            <div>
              <label>Result:</label>
              <select id="passFailSelect" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">Select...</option>
                <option value="pass" ${submission.pass_fail === 'pass' ? 'selected' : ''}>Pass</option>
                <option value="fail" ${submission.pass_fail === 'fail' ? 'selected' : ''}>Fail</option>
              </select>
            </div>
            <div>
              <label>Grade Notes:</label>
              <textarea id="gradeNotes" placeholder="Overall feedback..."
                        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 38px; font-family: inherit;">${submission.grading_notes || ''}</textarea>
            </div>
          </div>
        </div>

        <!-- Action buttons -->
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-secondary" onclick="closeModal('confirmModal')">Cancel</button>
          <button class="btn btn-primary" onclick="submitGrade('${submissionId}')">Save Grade</button>
        </div>
      </div>
    `;

    // Render answers
    renderAnswersForGrading(submission);

  } catch (error) {
    console.error('Error opening grading modal:', error);
    showTakerError('Failed to load submission for grading');
  }
}

/**
 * Render answers for grading review
 */
function renderAnswersForGrading(submission) {
  const container = document.getElementById('answersContainer');
  if (!container) return;

  const answers = submission.answers || {};
  let html = '<h4>Answers Review</h4>';

  // This is a simplified view - shows all answers
  html += '<div style="background: white; border: 1px solid #ddd; border-radius: 8px; padding: 15px;">';

  if (Object.keys(answers).length === 0) {
    html += '<p style="color: #999;">No answers submitted</p>';
  } else {
    html += '<pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto;">';
    html += JSON.stringify(answers, null, 2);
    html += '</pre>';
  }

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Submit grade for submission
 */
async function submitGrade(submissionId) {
  try {
    const score = parseFloat(document.getElementById('totalScore').value);
    const passFail = document.getElementById('passFailSelect').value;
    const notes = document.getElementById('gradeNotes').value;

    if (isNaN(score)) {
      showMessage('Please enter a valid score', 'error');
      return;
    }

    if (!passFail) {
      showMessage('Please select Pass or Fail', 'error');
      return;
    }

    // Get current user ID
    const userProfile = await fetchUserProfile(localStorage.getItem('userId'));

    // Update submission with grade
    await updateSubmissionGrade(submissionId, {
      score: score,
      pass_fail: passFail,
      grading_notes: notes,
      grader_id: userProfile?.id || null
    });

    showMessage('Grade saved successfully!', 'success');
    closeModal('confirmModal');

    // Refresh submissions list
    await renderSubmissions();

  } catch (error) {
    console.error('Error submitting grade:', error);
    showMessage('Error saving grade: ' + error.message, 'error');
  }
}

/**
 * Add grading styles
 */
function addGradingStyles() {
  // Check if styles already added
  if (document.getElementById('gradingStyles')) return;

  const style = document.createElement('style');
  style.id = 'gradingStyles';
  style.textContent = `
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-submitted {
      background: #fff3cd;
      color: #856404;
    }

    .status-graded {
      background: #d4edda;
      color: #155724;
    }

    .status-in_progress {
      background: #cce5ff;
      color: #004085;
    }

    .data-table {
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 8px;
      overflow: hidden;
    }

    .data-table tr:hover {
      background: #f9f9f9;
    }

    .submissions-container {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
}

/**
 * Initialize grading page
 */
function initializeGradingPage() {
  console.log('Initializing grading page');
  renderSubmissions();
}
