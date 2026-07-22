// BECA Assessment Platform - Assessment Taker Module

let assessmentTakerMode = false;
let takerToken = null;
let takerAssignmentId = null;
let takerAssessmentData = null;
let takerAnswers = {};
let timerInterval = null;
let remainingSeconds = 0;

/**
 * Validate taker token
 * @param {string} token - Taker token
 * @returns {Promise<object|null>} Assignment data
 */
async function validateTakerToken(token) {
  return await getAssessmentTakerByToken(token);
}

/**
 * Render assessment taker interface
 */
async function renderAssessmentTaker() {
  assessmentTakerMode = true;

  try {
    // Validate token
    const assignment = await validateTakerToken(takerToken);
    if (!assignment) {
      showTakerError('Invalid or expired assessment token');
      return;
    }

    takerAssignmentId = assignment.id;

    // Load assessment
    const assessmentData = await getAssessment(assignment.assessment_id);
    if (!assessmentData) {
      showTakerError('Assessment not found');
      return;
    }

    takerAssessmentData = assessmentData;

    // Update status to started
    if (assignment.status === 'assigned') {
      await updateAssessmentTaker(takerAssignmentId, { status: 'started' });
    }

    // Load modules and questions
    const modulesData = await getAssessmentModules(assignment.assessment_id);
    let allQuestions = [];

    if (Array.isArray(modulesData)) {
      for (const module of modulesData) {
        const questions = await getAssessmentQuestions(module.id);
        if (Array.isArray(questions)) {
          allQuestions = allQuestions.concat(questions.map(q => ({ ...q, module_name: module.name })));
        }
      }
    }

    // Initialize answers object
    takerAnswers = {};
    allQuestions.forEach(q => {
      takerAnswers[q.id] = '';
    });

    // Render UI
    renderTakerInterface(takerAssessmentData, allQuestions);

    // Start timer if duration is set
    if (takerAssessmentData.duration) {
      remainingSeconds = takerAssessmentData.duration * 60;
      startTakerTimer();
    }
  } catch (error) {
    console.error('Error rendering assessment taker:', error);
    showTakerError('Failed to load assessment: ' + error.message);
  }
}

/**
 * Render taker interface
 * @param {object} assessment - Assessment data
 * @param {array} questions - Questions list
 */
function renderTakerInterface(assessment, questions) {
  let html = `
    <div class="taker-layout">
      <div class="taker-header">
        <div class="taker-header-content">
          <div class="taker-title">${assessment.title || 'Assessment'}</div>
          ${assessment.duration ? `<div class="taker-timer" id="takerTimer">${formatTime(remainingSeconds)}</div>` : ''}
        </div>
      </div>

      <div class="taker-content">
  `;

  if (assessment.description) {
    html += `
      <div class="taker-card">
        <p style="color: var(--text-secondary); line-height: 1.6;">${assessment.description}</p>
      </div>
    `;
  }

  html += `<form id="takerForm" onsubmit="submitTakerAssessment(event)">`;

  questions.forEach((q, idx) => {
    html += `
      <div class="question-card">
        <div class="question-number">Question ${idx + 1} of ${questions.length}</div>
        <div class="question-text">${q.question_text || 'Question'}</div>
    `;

    if (q.question_type === 'mcq') {
      html += `
        <div class="question-options">
      `;
      const options = q.options || [];
      options.forEach((opt, optIdx) => {
        html += `
          <label class="option-input">
            <input type="radio" name="question_${q.id}" value="${optIdx}" onchange="takerAnswers['${q.id}'] = '${optIdx}'">
            <span class="option-text">${opt.text || ''}</span>
          </label>
        `;
      });
      html += `</div>`;
    } else if (q.question_type === 'essay') {
      html += `
        <textarea class="taker-textarea" name="question_${q.id}" placeholder="Enter your answer..." onchange="takerAnswers['${q.id}'] = this.value"></textarea>
      `;
    } else if (q.question_type === 'truefalse') {
      html += `
        <div class="question-options">
          <label class="option-input">
            <input type="radio" name="question_${q.id}" value="true" onchange="takerAnswers['${q.id}'] = 'true'">
            <span class="option-text">True</span>
          </label>
          <label class="option-input">
            <input type="radio" name="question_${q.id}" value="false" onchange="takerAnswers['${q.id}'] = 'false'">
            <span class="option-text">False</span>
          </label>
        </div>
      `;
    } else if (q.question_type === 'fileupload') {
      html += `
        <div style="border: 2px dashed var(--border); border-radius: 8px; padding: 20px; text-align: center; background: #f8fafc;">
          <input type="file" name="question_${q.id}" id="file_${q.id}" style="display: none;" onchange="takerAnswers['${q.id}'] = this.files[0]?.name || ''">
          <button type="button" onclick="document.getElementById('file_${q.id}').click()" class="btn btn-primary btn-sm">
            <i class="fas fa-upload"></i> Choose File
          </button>
          <p style="color: var(--text-secondary); font-size: 12px; margin-top: 8px;" id="fileName_${q.id}">No file selected</p>
        </div>
      `;
    }

    html += `</div>`;
  });

  html += `
        <div class="taker-card">
          <div class="taker-actions">
            <button type="submit" class="taker-submit-btn"><i class="fas fa-check"></i> Submit Assessment</button>
          </div>
        </div>
      </form>
      </div>
    </div>
  `;

  document.body.innerHTML = html;
}

/**
 * Start taker timer
 */
function startTakerTimer() {
  const timerEl = document.getElementById('takerTimer');

  timerInterval = setInterval(() => {
    remainingSeconds--;

    if (timerEl) {
      timerEl.textContent = formatTime(remainingSeconds);

      // Update styles based on remaining time
      if (remainingSeconds <= 60) {
        timerEl.classList.add('critical');
        timerEl.classList.remove('warning');
      } else if (remainingSeconds <= 300) {
        timerEl.classList.add('warning');
        timerEl.classList.remove('critical');
      }
    }

    // Auto-submit when time runs out
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      showTakerMessage('Time is up! Submitting your assessment...', 'warning');
      setTimeout(() => {
        const form = document.getElementById('takerForm');
        if (form) {
          form.dispatchEvent(new Event('submit'));
        }
      }, 2000);
    }
  }, 1000);
}

/**
 * Submit taker assessment
 * @param {Event} e - Form event
 */
async function submitTakerAssessment(e) {
  e.preventDefault();

  if (timerInterval) clearInterval(timerInterval);

  try {
    const formData = new FormData(document.getElementById('takerForm'));
    const answers = {};

    // Extract answers from form
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('question_')) {
        const questionId = key.replace('question_', '');
        answers[questionId] = value;
      }
    }

    // Update assignment with answers and status
    await updateAssessmentTaker(takerAssignmentId, {
      status: 'submitted',
      answers: answers,
      submitted_at: new Date().toISOString()
    });

    // Show completion message
    showCompletionMessage();
  } catch (error) {
    console.error('Error submitting assessment:', error);
    showTakerError('Failed to submit assessment: ' + error.message);
  }
}

/**
 * Show completion message
 */
function showCompletionMessage() {
  document.body.innerHTML = `
    <div class="taker-layout">
      <div class="taker-header">
        <div class="taker-header-content">
          <div class="taker-title">Assessment Submission</div>
        </div>
      </div>

      <div class="taker-content">
        <div class="completion-card">
          <div class="completion-icon">✓</div>
          <div class="completion-title">Assessment Submitted</div>
          <div class="completion-message">
            Your assessment has been successfully submitted. Thank you for completing the assessment. Your results will be reviewed shortly.
          </div>
          <div style="color: var(--text-secondary); font-size: 14px;">
            Submitted at: ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Show taker error
 * @param {string} message - Error message
 */
function showTakerError(message) {
  document.body.innerHTML = `
    <div class="taker-layout">
      <div class="taker-header">
        <div class="taker-header-content">
          <div class="taker-title">Assessment</div>
        </div>
      </div>

      <div class="taker-content">
        <div class="taker-card" style="text-align: center; padding: 48px;">
          <div style="font-size: 48px; margin-bottom: 24px; color: var(--danger);">✗</div>
          <div style="font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px;">Error</div>
          <p style="color: var(--text-secondary); font-size: 16px; margin-bottom: 24px;">${message}</p>
          <button class="btn btn-primary" onclick="window.location.href = '/'">
            <i class="fas fa-home"></i> Return Home
          </button>
        </div>
      </div>
    </div>
  `;
}

/* Taker Layout Styles (CSS needed) */
const TAKER_STYLES = `
.taker-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--light);
}

.taker-header {
  background: white;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border-bottom: 1px solid var(--border);
}

.taker-header-content {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.taker-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.taker-timer {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary);
  padding: 12px 24px;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 8px;
  border: 2px solid var(--primary);
  min-width: 160px;
  text-align: center;
}

.taker-timer.warning {
  color: var(--warning);
  border-color: var(--warning);
  background: rgba(245, 158, 11, 0.1);
}

.taker-timer.critical {
  color: var(--danger);
  border-color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  animation: pulse 1s infinite;
}

.taker-content {
  flex: 1;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 24px;
}

.taker-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 24px;
  border: 1px solid var(--border);
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-left: 4px solid var(--primary);
}

.question-number {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  margin-bottom: 8px;
}

.question-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-input {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 2px solid var(--border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-input:hover {
  border-color: var(--primary);
  background: rgba(37, 99, 235, 0.05);
}

.option-input input {
  margin-top: 2px;
  cursor: pointer;
}

.option-text {
  flex: 1;
  color: var(--text-primary);
}

.taker-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
}

.taker-textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.taker-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
}

.taker-submit-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s;
}

.taker-submit-btn:hover {
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  transform: translateY(-2px);
}

.taker-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.completion-card {
  background: white;
  border-radius: 12px;
  padding: 48px 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  border: 1px solid var(--border);
  text-align: center;
}

.completion-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.completion-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.completion-message {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}
`;
