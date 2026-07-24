// ============================================================================
// BECA Assessment Platform - Assessment Taker Interface
// ============================================================================
// Core module for handling assessment taking via unique token
// Supports all 7 question types with auto-save and timer management

// Global state
let assessmentState = {
  token: null,
  taker: null,
  assessment: null,
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  startTime: null,
  endTime: null,
  timeElapsed: 0,
  timerInterval: null,
  isSubmitted: false,
  submissionId: null,
  autoSaveInterval: null,
  lastSavedAt: null
};

/**
 * Initialize the Assessment Taker Interface
 * Checks for token in URL and loads assessment
 */
async function initializeAssessmentTaker() {
  try {
    console.log('Initializing Assessment Taker...');

    // Check if in taker mode (has token parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      console.log('No token found, showing standard interface');
      return false;
    }

    console.log('Token found:', token.substring(0, 10) + '...');
    assessmentState.token = token;

    // Hide dashboard and show taker interface
    document.getElementById('dashboardContainer').style.display = 'none';
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('takerContainer').style.display = 'flex';

    // Load assessment data
    await loadAssessmentForTaker();

    return true;
  } catch (error) {
    console.error('Error initializing assessment taker:', error);
    showTakerError('Failed to load assessment. Please check your access link.');
    return false;
  }
}

/**
 * Load assessment data using token
 */
async function loadAssessmentForTaker() {
  try {
    console.log('🔍 Step 1: Loading assessment for token:', assessmentState.token);

    // Get taker record by token
    let takerData;
    try {
      takerData = await getAssessmentTakerByToken(assessmentState.token);
      console.log('✅ Step 1 passed - Taker found:', takerData);
    } catch (e) {
      console.error('❌ Step 1 failed - Error finding taker:', e);
      throw new Error(`Token lookup failed: ${e.message}`);
    }

    if (!takerData) {
      throw new Error('Invalid or expired access token');
    }

    assessmentState.taker = takerData;

    // Get assessment details
    console.log('🔍 Step 2: Loading assessment ID:', takerData.assessment_id);
    let assessment;
    try {
      assessment = await getAssessment(takerData.assessment_id);
      console.log('✅ Step 2 passed - Assessment found:', assessment);
    } catch (e) {
      console.error('❌ Step 2 failed - Error loading assessment:', e);
      throw new Error(`Assessment lookup failed: ${e.message}`);
    }

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    assessmentState.assessment = assessment;
    console.log('Assessment loaded:', assessment.title);

    // Get assessment questions (all modules and their questions)
    console.log('🔍 Step 3: Loading modules for assessment:', assessment.id);
    let modules;
    try {
      modules = await getAssessmentModules(assessment.id);
      console.log('✅ Step 3 passed - Modules loaded:', modules.length);
    } catch (e) {
      console.error('❌ Step 3 failed - Error loading modules:', e);
      throw new Error(`Module lookup failed: ${e.message}`);
    }

    // Fetch all questions for the assessment
    console.log('🔍 Step 4: Loading questions from', modules.length, 'modules');
    let allQuestions = [];
    try {
      for (const module of modules) {
        const moduleQuestions = await getAssessmentQuestions(module.id);
        allQuestions = allQuestions.concat(moduleQuestions);
      }
      console.log('✅ Step 4 passed - Total questions loaded:', allQuestions.length);
    } catch (e) {
      console.error('❌ Step 4 failed - Error loading questions:', e);
      throw new Error(`Question lookup failed: ${e.message}`);
    }

    assessmentState.questions = allQuestions;

    // Load any existing answers from localStorage
    loadAnswersFromLocalStorage();

    // Render the assessment interface
    renderAssessmentInterface();

    // Start the timer
    startAssessmentTimer(assessment.duration || 60);

    // Setup auto-save
    setupAutoSave();

    // Setup unsaved changes warning
    setupUnloadWarning();
  } catch (error) {
    console.error('🔴 FATAL ERROR loading assessment:', error);
    throw error;
  }
}

/**
 * Render the main assessment interface
 */
function renderAssessmentInterface() {
  const container = document.getElementById('takerContainer');

  const html = `
    <div class="assessment-taker">
      <!-- Instructions Banner -->
      <div class="taker-instructions-banner">
        <div class="instructions-content">
          <h2>${escapeHtml(assessmentState.assessment.title)}</h2>
          <p>${escapeHtml(assessmentState.assessment.instructions || 'Please answer all questions to the best of your ability.')}</p>
          <div class="instructions-meta">
            <span><i class="fas fa-file-alt"></i> ${assessmentState.questions.length} Questions</span>
            <span><i class="fas fa-clock"></i> <span id="timerDisplay">Loading...</span></span>
            <span><i class="fas fa-star"></i> ${assessmentState.questions.reduce((sum, q) => sum + (q.points || 0), 0)} Total Points</span>
          </div>
        </div>
        ${assessmentState.assessment.dataset_url ? `
          <div class="instructions-download">
            <a href="${assessmentState.assessment.dataset_url}" download class="btn btn-secondary btn-sm">
              <i class="fas fa-download"></i> Download Dataset
            </a>
          </div>
        ` : ''}
      </div>

      <!-- Main Assessment Area -->
      <div class="assessment-main">
        <!-- Left Sidebar - Question Navigator -->
        <div class="question-navigator">
          <div class="navigator-header">Question Navigator</div>
          <div class="navigator-buttons">
            ${assessmentState.questions.map((q, idx) => `
              <button
                class="navigator-btn ${idx === assessmentState.currentQuestionIndex ? 'active' : ''} ${assessmentState.answers[q.id] ? 'answered' : 'unanswered'}"
                data-question-index="${idx}"
                onclick="goToQuestion(${idx})">
                <span class="btn-number">${idx + 1}</span>
                ${assessmentState.answers[q.id] ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-circle"></i>'}
              </button>
            `).join('')}
          </div>
          <div class="navigator-stats">
            <div class="stat">
              <div class="stat-label">Answered</div>
              <div class="stat-value" id="answeredCount">0</div>
            </div>
            <div class="stat">
              <div class="stat-label">Total</div>
              <div class="stat-value">${assessmentState.questions.length}</div>
            </div>
          </div>
        </div>

        <!-- Center Content - Question Display -->
        <div class="question-content">
          <div id="questionContainer"></div>

          <!-- Navigation Buttons -->
          <div class="question-navigation">
            <button class="btn btn-secondary" onclick="previousQuestion()" id="prevBtn" style="display: none;">
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <div class="nav-spacer"></div>
            <button class="btn btn-secondary" onclick="nextQuestion()" id="nextBtn">
              <i class="fas fa-chevron-right"></i> Next
            </button>
            <button class="btn btn-primary" onclick="openSubmitDialog()" id="submitBtn" style="display: none;">
              <i class="fas fa-paper-plane"></i> Submit Assessment
            </button>
          </div>
        </div>
      </div>

      <!-- Auto-save Indicator -->
      <div class="autosave-indicator" id="autosaveIndicator" style="display: none;">
        <i class="fas fa-spinner fa-spin"></i> Saving...
      </div>
    </div>

    <!-- Submit Confirmation Modal -->
    <div id="submitModal" class="modal" style="display: none;">
      <div class="modal-content" style="max-width: 600px;">
        <h2 style="margin-top: 0;">Submit Assessment</h2>
        <p>Are you sure you want to submit your assessment? Once submitted, you cannot make any changes.</p>

        <div class="review-summary">
          <h3>Summary:</h3>
          <div class="summary-item">
            <span>Total Questions:</span>
            <strong>${assessmentState.questions.length}</strong>
          </div>
          <div class="summary-item">
            <span>Answered:</span>
            <strong id="reviewAnswered">0</strong>
          </div>
          <div class="summary-item">
            <span>Unanswered:</span>
            <strong id="reviewUnanswered">0</strong>
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-danger" onclick="submitAssessment()" style="flex: 1;">
            <i class="fas fa-check"></i> Submit Assessment
          </button>
          <button class="btn btn-secondary" onclick="closeModal('submitModal')" style="flex: 1;">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div id="successModal" class="modal" style="display: none;">
      <div class="modal-content" style="max-width: 500px; text-align: center;">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <h2>Assessment Submitted Successfully!</h2>
        <p>Thank you for completing the assessment.</p>
        <div class="submission-info">
          <div><strong>Submission ID:</strong> <code id="submissionId">---</code></div>
          <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
            Your answers have been saved. You can view your results after evaluation.
          </div>
        </div>
        <button class="btn btn-primary" onclick="redirectAfterSubmission()" style="margin-top: 20px;">
          Done
        </button>
      </div>
    </div>

    <!-- Offline Warning -->
    <div id="offlineWarning" class="offline-banner" style="display: none;">
      <i class="fas fa-wifi-slash"></i>
      <span>You are offline. Your answers are being saved locally and will sync when you reconnect.</span>
    </div>
  `;

  container.innerHTML = html;
  renderCurrentQuestion();
  updateNavigatorStats();
}

/**
 * Render the current question
 */
function renderCurrentQuestion() {
  const question = assessmentState.questions[assessmentState.currentQuestionIndex];
  if (!question) return;

  const container = document.getElementById('questionContainer');
  const questionNumber = assessmentState.currentQuestionIndex + 1;
  const totalQuestions = assessmentState.questions.length;

  // Build question header
  let html = `
    <div class="question-header">
      <div class="question-info">
        <div class="question-number">Question ${questionNumber} of ${totalQuestions}</div>
        <div class="question-points">${question.points || 0} points</div>
      </div>
      <div class="question-type-badge">${getQuestionTypeLabel(question.question_type)}</div>
    </div>

    <div class="question-body">
      <div class="question-text">${escapeHtml(question.question_text)}</div>
  `;

  // Add image if present
  if (question.image_url) {
    html += `
      <div class="question-image">
        <img src="${question.image_url}" alt="Question Image" />
      </div>
    `;
  }

  // Render question based on type
  const answerHtml = renderQuestionType(question);
  html += answerHtml;

  html += `
    </div>
  `;

  container.innerHTML = html;

  // Update navigation buttons
  updateNavigationButtons();
}

/**
 * Render question based on type
 */
function renderQuestionType(question) {
  const savedAnswer = assessmentState.answers[question.id] || null;

  switch (question.question_type) {
    case 'mcq':
    case 'multiple_choice':
      return renderMCQ(question, savedAnswer);

    case 'true_false':
    case 'tf':
    case 'truefalse':
      return renderTrueFalse(question, savedAnswer);

    case 'pick_list':
    case 'picklist':
    case 'dropdown':
      return renderPickList(question, savedAnswer);

    case 'free_text':
    case 'freetext':
    case 'ft':
      return renderFreeText(question, savedAnswer);

    case 'ordered_list':
    case 'orderedlist':
    case 'ranking':
      return renderOrderedList(question, savedAnswer);

    case 'short_answer':
    case 'shortanswer':
    case 'sa':
      return renderShortAnswer(question, savedAnswer);

    case 'essay':
    case 'ea':
      return renderEssay(question, savedAnswer);

    default:
      return `<div class="error-message">Unknown question type: ${question.question_type}</div>`;
  }
}

/**
 * Render MCQ (Multiple Choice Question)
 */
function renderMCQ(question, savedAnswer) {
  const options = question.options || [];
  const selectedOption = savedAnswer?.selected || null;

  let html = `<div class="question-options mcq-options">`;

  options.forEach((option, idx) => {
    const letter = String.fromCharCode(65 + idx); // A, B, C, D, E
    const isSelected = selectedOption === letter;

    html += `
      <label class="option-label mcq-label">
        <input
          type="radio"
          name="option-${question.id}"
          value="${letter}"
          ${isSelected ? 'checked' : ''}
          onchange="saveAnswer('${question.id}', {selected: '${letter}'})"
        />
        <span class="option-letter">${letter}</span>
        <span class="option-text">${escapeHtml(option.text || option)}</span>
      </label>
    `;
  });

  html += `</div>`;
  return html;
}

/**
 * Render True/False question
 */
function renderTrueFalse(question, savedAnswer) {
  const selectedValue = savedAnswer?.selected || null;

  return `
    <div class="question-options tf-options">
      <label class="option-label tf-button-label">
        <input
          type="radio"
          name="option-${question.id}"
          value="true"
          ${selectedValue === 'true' ? 'checked' : ''}
          onchange="saveAnswer('${question.id}', {selected: 'true'})"
        />
        <span class="tf-button true-btn">True</span>
      </label>
      <label class="option-label tf-button-label">
        <input
          type="radio"
          name="option-${question.id}"
          value="false"
          ${selectedValue === 'false' ? 'checked' : ''}
          onchange="saveAnswer('${question.id}', {selected: 'false'})"
        />
        <span class="tf-button false-btn">False</span>
      </label>
    </div>
  `;
}

/**
 * Render Pick List (Dropdown)
 */
function renderPickList(question, savedAnswer) {
  const options = question.list_options || [];
  const selectedOption = savedAnswer?.selected || '';

  let html = `
    <div class="question-options pick-list-options">
      <select
        class="form-control form-select"
        onchange="saveAnswer('${question.id}', {selected: this.value})"
      >
        <option value="">-- Select an option --</option>
  `;

  options.forEach(option => {
    const isSelected = selectedOption === option;
    html += `<option value="${escapeHtml(option)}" ${isSelected ? 'selected' : ''}>${escapeHtml(option)}</option>`;
  });

  html += `</select></div>`;
  return html;
}

/**
 * Render Free Text (File Upload)
 */
function renderFreeText(question, savedAnswer) {
  const allowedTypes = question.allowed_file_types?.join(', ') || 'All files';
  const maxSize = question.max_file_size_mb || 50;

  return `
    <div class="question-options free-text-options">
      <div class="file-upload-area">
        <div class="upload-zone" id="uploadZone-${question.id}" ondrop="handleFileDrop(event, '${question.id}')" ondragover="handleDragOver(event)">
          <i class="fas fa-cloud-upload-alt"></i>
          <p>Drag and drop your file here or click to browse</p>
          <p class="upload-hint">Allowed: ${allowedTypes} (Max ${maxSize}MB)</p>
          <input
            type="file"
            id="fileInput-${question.id}"
            style="display: none;"
            onchange="handleFileSelect(event, '${question.id}')"
            accept="${getAcceptFileTypes(question.allowed_file_types)}"
          />
        </div>
        <div id="filePreview-${question.id}" class="file-preview" style="display: none; margin-top: 15px;"></div>
      </div>
      <button class="btn btn-secondary" onclick="document.getElementById('fileInput-${question.id}').click()">
        <i class="fas fa-folder-open"></i> Choose File
      </button>
    </div>
  `;
}

/**
 * Render Ordered List (Drag and Drop)
 */
function renderOrderedList(question, savedAnswer) {
  const items = question.list_items || [];
  const currentOrder = savedAnswer?.order || Array.from({length: items.length}, (_, i) => i);

  let html = `
    <div class="question-options ordered-list-options">
      <div class="ordered-items" id="orderedList-${question.id}">
  `;

  currentOrder.forEach((idx, position) => {
    const item = items[idx];
    if (item) {
      html += `
        <div class="ordered-item" draggable="true" data-index="${idx}" ondragstart="handleDragStart(event)" ondragend="handleDragEnd(event)">
          <span class="item-number">${position + 1}</span>
          <span class="item-text">${escapeHtml(item)}</span>
          <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
        </div>
      `;
    }
  });

  html += `
      </div>
      <p class="help-text"><i class="fas fa-info-circle"></i> Drag items to reorder them</p>
    </div>
  `;
  return html;
}

/**
 * Render Short Answer
 */
function renderShortAnswer(question, savedAnswer) {
  const answer = savedAnswer?.text || '';

  return `
    <div class="question-options short-answer-options">
      <textarea
        class="form-control"
        placeholder="Enter your answer..."
        onchange="saveAnswer('${question.id}', {text: this.value})"
        style="min-height: 100px; resize: vertical;"
      >${escapeHtml(answer)}</textarea>
      <p class="help-text"><i class="fas fa-lightbulb"></i> Provide a clear and concise answer</p>
    </div>
  `;
}

/**
 * Render Essay
 */
function renderEssay(question, savedAnswer) {
  const answer = savedAnswer?.text || '';
  const minWords = question.min_words || 50;
  const maxWords = question.max_words || 1000;

  return `
    <div class="question-options essay-options">
      <div class="essay-controls">
        <div class="essay-limits">
          <span>Word count: <strong id="wordCount-${question.id}">0</strong> / ${maxWords}</span>
          <span class="essay-hint">(Minimum: ${minWords} words)</span>
        </div>
      </div>
      <textarea
        class="form-control essay-textarea"
        placeholder="Write your essay here..."
        onchange="saveAnswer('${question.id}', {text: this.value})"
        oninput="updateWordCount('${question.id}')"
        style="min-height: 250px; resize: vertical;"
      >${escapeHtml(answer)}</textarea>
      <p class="help-text"><i class="fas fa-info-circle"></i> Write a comprehensive response to the question above</p>
    </div>
  `;
}

/**
 * Save answer to state and localStorage
 */
function saveAnswer(questionId, answer) {
  assessmentState.answers[questionId] = answer;
  console.log('Answer saved for question:', questionId, answer);

  // Save to localStorage
  saveAnswersToLocalStorage();

  // Update navigator stats
  updateNavigatorStats();

  // Mark for auto-save
  showAutoSaveIndicator();
}

/**
 * Navigate to specific question
 */
function goToQuestion(index) {
  if (assessmentState.isSubmitted) return;

  assessmentState.currentQuestionIndex = index;
  renderCurrentQuestion();

  // Update navigator
  document.querySelectorAll('.navigator-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx === index);
  });

  // Scroll question content into view
  const container = document.querySelector('.question-content');
  if (container) {
    container.scrollTop = 0;
  }
}

/**
 * Navigate to previous question
 */
function previousQuestion() {
  if (assessmentState.currentQuestionIndex > 0) {
    goToQuestion(assessmentState.currentQuestionIndex - 1);
  }
}

/**
 * Navigate to next question
 */
function nextQuestion() {
  if (assessmentState.currentQuestionIndex < assessmentState.questions.length - 1) {
    goToQuestion(assessmentState.currentQuestionIndex + 1);
  } else {
    // On last question, show submit button
    openSubmitDialog();
  }
}

/**
 * Update navigation buttons visibility
 */
function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');

  const isFirst = assessmentState.currentQuestionIndex === 0;
  const isLast = assessmentState.currentQuestionIndex === assessmentState.questions.length - 1;

  if (prevBtn) prevBtn.style.display = isFirst ? 'none' : 'block';
  if (nextBtn) nextBtn.style.display = isLast ? 'none' : 'block';
  if (submitBtn) submitBtn.style.display = isLast ? 'block' : 'none';
}

/**
 * Update navigator stats
 */
function updateNavigatorStats() {
  const answeredCount = Object.keys(assessmentState.answers).length;
  const answeredElement = document.getElementById('answeredCount');
  if (answeredElement) {
    answeredElement.textContent = answeredCount;
  }

  // Update navigator buttons
  document.querySelectorAll('.navigator-btn').forEach((btn) => {
    const idx = parseInt(btn.dataset.questionIndex);
    const question = assessmentState.questions[idx];
    if (assessmentState.answers[question.id]) {
      btn.classList.add('answered');
      btn.classList.remove('unanswered');
    } else {
      btn.classList.remove('answered');
      btn.classList.add('unanswered');
    }
  });
}

/**
 * Open submit confirmation dialog
 */
function openSubmitDialog() {
  const answeredCount = Object.keys(assessmentState.answers).length;
  const unansweredCount = assessmentState.questions.length - answeredCount;

  document.getElementById('reviewAnswered').textContent = answeredCount;
  document.getElementById('reviewUnanswered').textContent = unansweredCount;

  showModal('submitModal');
}

/**
 * Submit the assessment
 */
async function submitAssessment() {
  try {
    closeModal('submitModal');
    showAutoSaveIndicator();

    // Prepare submission data
    const submissionData = {
      assessment_id: assessmentState.assessment.id,
      taker_id: assessmentState.taker.id,
      token: assessmentState.token,
      answers: assessmentState.answers,
      submitted_at: new Date().toISOString(),
      time_taken_seconds: Math.floor((Date.now() - assessmentState.startTime) / 1000)
    };

    console.log('Submitting assessment:', submissionData);

    // Save to database
    const result = await submitAssessmentToDatabase(submissionData);

    if (result && result.id) {
      assessmentState.submissionId = result.id;
      assessmentState.isSubmitted = true;

      // Clear auto-save interval
      if (assessmentState.autoSaveInterval) {
        clearInterval(assessmentState.autoSaveInterval);
      }

      // Show success modal
      document.getElementById('submissionId').textContent = result.id;
      showModal('successModal');

      // Clear answers from localStorage after successful submission
      clearAnswersFromLocalStorage();
    } else {
      throw new Error('Failed to submit assessment');
    }
  } catch (error) {
    console.error('Error submitting assessment:', error);
    alert('Error submitting assessment: ' + error.message);
  }
}

/**
 * Redirect after successful submission
 */
function redirectAfterSubmission() {
  // Close modal
  closeModal('successModal');

  // Redirect to results page or home
  setTimeout(() => {
    window.location.href = '/?submission=' + assessmentState.submissionId;
  }, 500);
}

/**
 * Setup auto-save functionality
 */
function setupAutoSave() {
  // Auto-save every 30 seconds
  assessmentState.autoSaveInterval = setInterval(async () => {
    try {
      if (!assessmentState.isSubmitted && Object.keys(assessmentState.answers).length > 0) {
        console.log('Auto-saving answers...');
        await autoSaveAnswers();
        assessmentState.lastSavedAt = new Date();
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, 30000); // 30 seconds
}

/**
 * Setup unsaved changes warning
 */
function setupUnloadWarning() {
  window.addEventListener('beforeunload', (e) => {
    if (!assessmentState.isSubmitted && Object.keys(assessmentState.answers).length > 0) {
      e.preventDefault();
      e.returnValue = 'You have unsaved answers. Are you sure you want to leave?';
      return e.returnValue;
    }
  });
}

/**
 * Show auto-save indicator briefly
 */
function showAutoSaveIndicator() {
  const indicator = document.getElementById('autosaveIndicator');
  if (indicator) {
    indicator.style.display = 'flex';
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 1500);
  }
}

/**
 * Show taker error message
 */
function showTakerError(message) {
  const container = document.getElementById('takerContainer');
  container.innerHTML = `
    <div class="taker-error">
      <div class="error-box">
        <i class="fas fa-exclamation-circle"></i>
        <h2>Access Error</h2>
        <p>${message}</p>
        <button class="btn btn-primary" onclick="window.location.href='/'">Return to Home</button>
      </div>
    </div>
  `;
}

/**
 * Helper: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Helper: Get accept file types attribute
 */
function getAcceptFileTypes(allowedTypes) {
  if (!allowedTypes || !Array.isArray(allowedTypes)) return '*';
  return allowedTypes.join(',');
}

/**
 * Helper: Update word count for essay
 */
function updateWordCount(questionId) {
  const textarea = event?.target;
  if (!textarea) return;

  const text = textarea.value || '';
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  const counter = document.getElementById(`wordCount-${questionId}`);
  if (counter) {
    counter.textContent = wordCount;
    saveAnswer(questionId, {text: text});
  }
}

/**
 * Handle file drag and drop
 */
function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.style.backgroundColor = '#f0f9ff';
}

/**
 * Handle file drop
 */
function handleFileDrop(event, questionId) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    handleFileSelect({target: {files: files}}, questionId);
  }
}

/**
 * Handle file selection
 */
function handleFileSelect(event, questionId) {
  const file = event.target.files[0];
  if (!file) return;

  const question = assessmentState.questions.find(q => q.id === questionId);
  const maxSize = (question?.max_file_size_mb || 50) * 1024 * 1024;

  if (file.size > maxSize) {
    alert(`File size exceeds maximum of ${question.max_file_size_mb}MB`);
    return;
  }

  // Save file reference
  saveAnswer(questionId, {
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }
  });

  // Show preview
  const preview = document.getElementById(`filePreview-${questionId}`);
  if (preview) {
    preview.innerHTML = `
      <div class="file-item">
        <i class="fas fa-file"></i>
        <div>
          <div class="file-name">${file.name}</div>
          <div class="file-size">${(file.size / 1024 / 1024).toFixed(2)}MB</div>
        </div>
        <button class="btn-icon" onclick="clearFile('${questionId}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    preview.style.display = 'block';
  }
}

/**
 * Clear selected file
 */
function clearFile(questionId) {
  saveAnswer(questionId, {file: null});
  const preview = document.getElementById(`filePreview-${questionId}`);
  if (preview) preview.style.display = 'none';
}

/**
 * Handle drag start for ordered list
 */
function handleDragStart(event) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target);
  event.target.style.opacity = '0.5';
}

/**
 * Handle drag end for ordered list
 */
function handleDragEnd(event) {
  event.target.style.opacity = '1';

  // Get the ordered list container
  const container = event.target.parentElement;
  if (!container) return;

  // Get the question ID from container
  const questionId = container.id.replace('orderedList-', '');
  const question = assessmentState.questions.find(q => q.id === questionId);

  if (!question) return;

  // Get new order
  const items = container.querySelectorAll('.ordered-item');
  const newOrder = Array.from(items).map(item => parseInt(item.dataset.index));

  // Save new order
  saveAnswer(questionId, {order: newOrder});
}

// Export functions used by HTML
window.initializeAssessmentTaker = initializeAssessmentTaker;
window.goToQuestion = goToQuestion;
window.previousQuestion = previousQuestion;
window.nextQuestion = nextQuestion;
window.saveAnswer = saveAnswer;
window.openSubmitDialog = openSubmitDialog;
window.submitAssessment = submitAssessment;
window.redirectAfterSubmission = redirectAfterSubmission;
window.updateWordCount = updateWordCount;
window.handleFileDrop = handleFileDrop;
window.handleDragOver = handleDragOver;
window.handleFileSelect = handleFileSelect;
window.clearFile = clearFile;
window.handleDragStart = handleDragStart;
window.handleDragEnd = handleDragEnd;

console.log('Assessment Taker module loaded');
