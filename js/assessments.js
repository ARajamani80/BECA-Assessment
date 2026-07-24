// ============================================================================
// BECA Assessment Platform - Assessments Module (FIXED WORKFLOW)
//
// CORRECT WORKFLOW:
// Step 1: Create Assessment (title, duration, pass score)
// Step 2: Select Modules (from Module Bank)
// Step 3: Questions auto-load from selected modules
// Step 4: Publish Assessment
//
// NO INLINE QUESTION CREATION - Use Module Bank instead
// ============================================================================

let allAssessments = [];
let currentAssessmentEdit = null;
let selectedModulesForAssessment = [];
let availableModulesForAssessment = [];

/**
 * Render assessments list
 */
async function renderAssessments() {
  document.getElementById('pageTitle').textContent = 'Assessments';

  try {
    allAssessments = await getAssessments();

    let html = `<div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div class="card-title" style="margin: 0;"><i class="fas fa-list-check"></i> All Assessments</div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button class="btn btn-info btn-sm" id="exportAssessmentsBtn" onclick="exportAssessmentsToExcel(allAssessments)" title="Export all assessments to Excel">
            <i class="fas fa-download"></i> Export
          </button>
          <button class="btn btn-secondary btn-sm" id="refreshAssessmentsBtn" onclick="refreshAssessmentsList()" title="Refresh assessments list">
            <i class="fas fa-redo"></i> Refresh
          </button>
        </div>
      </div>`;

    if (!Array.isArray(allAssessments) || allAssessments.length === 0) {
      html += '<p style="color: var(--text-secondary);">No assessments yet. <a href="#" onclick="openCreateAssessmentModal()" style="color: var(--primary);">Create one</a></p>';
    } else {
      allAssessments.forEach(a => {
        const moduleCount = (a.modules || []).length;
        const questionCount = (a.questions || []).length;

        html += `
          <div class="assessment-item" style="padding: 15px; border: 1px solid #e0e0e0; border-radius: 4px; margin-bottom: 15px;">
            <div class="assessment-info" style="flex: 1;">
              <h3 style="margin: 0 0 8px 0;">${a.title || a.name || 'Untitled'}</h3>
              <p style="margin: 0 0 10px 0; color: var(--text-secondary);">${a.description || 'No description'}</p>
              <p style="font-size: 12px; color: var(--text-secondary); margin: 8px 0;">
                <i class="fas fa-clock"></i> ${a.duration || a.time_limit_minutes || '60'} min |
                <i class="fas fa-percent"></i> Pass: ${a.passing_score || '60'}% |
                <i class="fas fa-book"></i> ${moduleCount} modules |
                <i class="fas fa-comments"></i> ${questionCount} questions
              </p>
            </div>
            <div class="assessment-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="editAssessment('${a.id}')"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-info btn-sm" onclick="viewAssessmentDetails('${a.id}')"><i class="fas fa-eye"></i> View</button>
              <button class="btn btn-danger btn-sm" onclick="deleteAssessmentConfirm('${a.id}')"><i class="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        `;
      });
    }

    html += '</div>';
    document.getElementById('page').innerHTML = html;

    // Add floating action button
    const fab = document.createElement('button');
    fab.className = 'btn btn-primary';
    fab.style.cssText = 'position: fixed; bottom: 30px; right: 30px; width: 60px; height: 60px; border-radius: 50%; font-size: 24px; z-index: 1000;';
    fab.innerHTML = '<i class="fas fa-plus"></i>';
    fab.onclick = openCreateAssessmentModal;
    document.querySelector('.container') && document.querySelector('.container').appendChild(fab);
  } catch (error) {
    showMessage('Error loading assessments: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error: ' + error.message + '</p></div>';
  }
}

/**
 * Open create assessment modal
 */
async function openCreateAssessmentModal() {
  currentAssessmentEdit = null;
  selectedModulesForAssessment = [];

  // Load available modules
  try {
    availableModulesForAssessment = await getModules();
  } catch (error) {
    console.error('Error loading modules:', error);
    availableModulesForAssessment = [];
  }

  document.getElementById('assessmentModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Create New Assessment</h2>
      <button onclick="closeModal('assessmentModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <form id="assessmentForm" onsubmit="handleAssessmentSave(event)">
      <!-- STEP 1: Assessment Details -->
      <fieldset style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <legend style="font-weight: bold; font-size: 14px;">Step 1: Assessment Details</legend>

        <div class="form-group">
          <label>Assessment Title *</label>
          <input type="text" id="assessmentTitle" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea id="assessmentDescription" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 60px;"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label>Duration (minutes) *</label>
            <input type="number" id="assessmentDuration" value="60" min="1" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div class="form-group">
            <label>Passing Score (%) *</label>
            <input type="number" id="assessmentPassScore" value="60" min="0" max="100" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>
        </div>
      </fieldset>

      <!-- STEP 2: Select Modules -->
      <fieldset style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <legend style="font-weight: bold; font-size: 14px;">Step 2: Select Modules</legend>

        <p style="color: var(--text-secondary); margin: 0 0 15px 0; font-size: 13px;">
          <i class="fas fa-info-circle"></i> Select modules from the Module Bank. Questions will auto-load from selected modules.
        </p>

        <div id="modulesSelectionContainer" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
          ${loadModulesSelection()}
        </div>
      </fieldset>

      <!-- STEP 3: Questions Preview -->
      <fieldset style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <legend style="font-weight: bold; font-size: 14px;">Step 3: Questions Preview</legend>

        <div id="questionsPreviewContainer" style="max-height: 300px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 4px;">
          <p style="color: #999; text-align: center; margin: 20px 0;">Select modules to preview questions</p>
        </div>
      </fieldset>

      <!-- STEP 4: Actions -->
      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-success" style="flex: 1;">
          <i class="fas fa-save"></i> Create Assessment
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('assessmentModal')" style="flex: 1;">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
  `;

  // Add event listeners for module selection
  setTimeout(() => {
    document.querySelectorAll('.assessment-module-checkbox').forEach(cb => {
      cb.addEventListener('change', updateQuestionsPreview);
    });
  }, 100);

  showModal('assessmentModal');
}

/**
 * Load modules selection
 */
function loadModulesSelection() {
  if (availableModulesForAssessment.length === 0) {
    return '<p style="color: #999; text-align: center;">No modules available. Create modules in the Module Bank first.</p>';
  }

  let html = '';
  availableModulesForAssessment.forEach(m => {
    const questionCount = (m.questions || []).length;
    const totalPoints = (m.questions || []).reduce((sum, q) => sum + (q.points || 0), 0);

    html += `
      <div style="display: flex; align-items: flex-start; padding: 10px; border-bottom: 1px solid #eee;">
        <input type="checkbox" class="assessment-module-checkbox" value="${m.id}" style="margin-right: 10px; margin-top: 4px;">
        <div style="flex: 1;">
          <div style="font-weight: bold;">${m.name}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            ${m.description ? `<div>${m.description}</div>` : ''}
            <div><i class="fas fa-comments"></i> ${questionCount} questions | <i class="fas fa-star"></i> ${totalPoints} points</div>
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

/**
 * Update questions preview when modules change
 */
function updateQuestionsPreview() {
  const selectedModuleIds = Array.from(document.querySelectorAll('.assessment-module-checkbox:checked'))
    .map(cb => cb.value);

  const selectedModules = availableModulesForAssessment.filter(m => selectedModuleIds.includes(m.id));
  const allQuestions = [];

  selectedModules.forEach(m => {
    if (m.questions && Array.isArray(m.questions)) {
      allQuestions.push(...m.questions);
    }
  });

  selectedModulesForAssessment = selectedModuleIds;

  let html = '';
  if (allQuestions.length === 0) {
    html = '<p style="color: #999; text-align: center; margin: 20px 0;">No questions. Select modules to preview.</p>';
  } else {
    html = `<div style="font-size: 13px;">`;
    allQuestions.forEach((q, idx) => {
      html += `
        <div style="padding: 8px; border-bottom: 1px solid #e0e0e0;">
          <div style="font-weight: bold;">${idx + 1}. ${truncateText(q.question_text, 80)}</div>
          <div style="color: var(--text-secondary); font-size: 11px; margin-top: 3px;">
            <span class="badge" style="font-size: 10px;">${q.question_type}</span>
            <span style="margin-left: 8px;"><i class="fas fa-star"></i> ${q.points} pts</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;
  }

  document.getElementById('questionsPreviewContainer').innerHTML = html;
}

/**
 * Handle assessment save
 */
async function handleAssessmentSave(e) {
  e.preventDefault();

  try {
    const title = document.getElementById('assessmentTitle').value;
    const description = document.getElementById('assessmentDescription').value;
    const duration = parseInt(document.getElementById('assessmentDuration').value);
    const passingScore = parseInt(document.getElementById('assessmentPassScore').value);

    if (selectedModulesForAssessment.length === 0) {
      showMessage('Please select at least one module', 'error');
      return;
    }

    // Get selected modules with their questions
    const selectedModules = availableModulesForAssessment.filter(m =>
      selectedModulesForAssessment.includes(m.id)
    );

    const allQuestions = [];
    selectedModules.forEach(m => {
      if (m.questions && Array.isArray(m.questions)) {
        allQuestions.push(...m.questions);
      }
    });

    const totalPoints = allQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

    const assessmentData = {
      title: title,
      description: description,
      duration: duration,
      passing_score: passingScore,
      modules: selectedModules,
      questions: allQuestions,
      total_points: totalPoints,
      status: 'draft'
    };

    if (currentAssessmentEdit) {
      // Update existing assessment
      await updateAssessment(currentAssessmentEdit, assessmentData);
      showMessage('Assessment updated successfully!', 'success');
    } else {
      // Create new assessment
      await createAssessment(assessmentData);
      showMessage('Assessment created successfully!', 'success');
    }

    closeModal('assessmentModal');
    await renderAssessments();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Edit assessment
 */
async function editAssessment(assessmentId) {
  const assessment = allAssessments.find(a => a.id === assessmentId);
  if (!assessment) return;

  currentAssessmentEdit = assessmentId;

  // Load available modules
  try {
    availableModulesForAssessment = await getModules();
  } catch (error) {
    console.error('Error loading modules:', error);
    availableModulesForAssessment = [];
  }

  selectedModulesForAssessment = (assessment.modules || []).map(m => m.id);

  document.getElementById('assessmentModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Edit Assessment</h2>
      <button onclick="closeModal('assessmentModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <form id="assessmentForm" onsubmit="handleAssessmentSave(event)">
      <fieldset style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <legend style="font-weight: bold; font-size: 14px;">Step 1: Assessment Details</legend>

        <div class="form-group">
          <label>Assessment Title *</label>
          <input type="text" id="assessmentTitle" value="${assessment.title}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea id="assessmentDescription" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 60px;">${assessment.description || ''}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          <div class="form-group">
            <label>Duration (minutes) *</label>
            <input type="number" id="assessmentDuration" value="${assessment.duration || 60}" min="1" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>

          <div class="form-group">
            <label>Passing Score (%) *</label>
            <input type="number" id="assessmentPassScore" value="${assessment.passing_score || 60}" min="0" max="100" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
          </div>
        </div>
      </fieldset>

      <fieldset style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <legend style="font-weight: bold; font-size: 14px;">Step 2: Select Modules</legend>

        <p style="color: var(--text-secondary); margin: 0 0 15px 0; font-size: 13px;">
          <i class="fas fa-info-circle"></i> Select modules from the Module Bank. Questions will auto-load from selected modules.
        </p>

        <div id="modulesSelectionContainer" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
          ${loadModulesSelectionForEdit(assessment)}
        </div>
      </fieldset>

      <fieldset style="border: 1px solid #ddd; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <legend style="font-weight: bold; font-size: 14px;">Step 3: Questions Preview</legend>

        <div id="questionsPreviewContainer" style="max-height: 300px; overflow-y: auto; background: #f9f9f9; padding: 10px; border-radius: 4px;">
          ${loadQuestionsPreview(assessment)}
        </div>
      </fieldset>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-success" style="flex: 1;">
          <i class="fas fa-save"></i> Update Assessment
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('assessmentModal')" style="flex: 1;">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
  `;

  setTimeout(() => {
    document.querySelectorAll('.assessment-module-checkbox').forEach(cb => {
      cb.addEventListener('change', updateQuestionsPreview);
    });
  }, 100);

  showModal('assessmentModal');
}

/**
 * Load modules selection for edit
 */
function loadModulesSelectionForEdit(assessment) {
  if (availableModulesForAssessment.length === 0) {
    return '<p style="color: #999; text-align: center;">No modules available.</p>';
  }

  const selectedIds = (assessment.modules || []).map(m => m.id);

  let html = '';
  availableModulesForAssessment.forEach(m => {
    const questionCount = (m.questions || []).length;
    const totalPoints = (m.questions || []).reduce((sum, q) => sum + (q.points || 0), 0);
    const isSelected = selectedIds.includes(m.id);

    html += `
      <div style="display: flex; align-items: flex-start; padding: 10px; border-bottom: 1px solid #eee;">
        <input type="checkbox" class="assessment-module-checkbox" value="${m.id}" ${isSelected ? 'checked' : ''} style="margin-right: 10px; margin-top: 4px;">
        <div style="flex: 1;">
          <div style="font-weight: bold;">${m.name}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            ${m.description ? `<div>${m.description}</div>` : ''}
            <div><i class="fas fa-comments"></i> ${questionCount} questions | <i class="fas fa-star"></i> ${totalPoints} points</div>
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

/**
 * Load questions preview for edit
 */
function loadQuestionsPreview(assessment) {
  const allQuestions = assessment.questions || [];

  if (allQuestions.length === 0) {
    return '<p style="color: #999; text-align: center; margin: 20px 0;">No questions in this assessment.</p>';
  }

  let html = `<div style="font-size: 13px;">`;
  allQuestions.forEach((q, idx) => {
    html += `
      <div style="padding: 8px; border-bottom: 1px solid #e0e0e0;">
        <div style="font-weight: bold;">${idx + 1}. ${truncateText(q.question_text, 80)}</div>
        <div style="color: var(--text-secondary); font-size: 11px; margin-top: 3px;">
          <span class="badge" style="font-size: 10px;">${q.question_type}</span>
          <span style="margin-left: 8px;"><i class="fas fa-star"></i> ${q.points} pts</span>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  return html;
}

/**
 * View assessment details
 */
function viewAssessmentDetails(assessmentId) {
  const assessment = allAssessments.find(a => a.id === assessmentId);
  if (!assessment) return;

  const questions = assessment.questions || [];
  const modules = assessment.modules || [];

  document.getElementById('viewAssessmentModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">${assessment.title}</h2>
      <button onclick="closeModal('viewAssessmentModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px;">
      <div style="background: #e3f2fd; padding: 15px; border-radius: 4px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #1976d2;">${modules.length}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Modules</div>
      </div>
      <div style="background: #e8f5e9; padding: 15px; border-radius: 4px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #388e3c;">${questions.length}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Questions</div>
      </div>
      <div style="background: #fff3e0; padding: 15px; border-radius: 4px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #f57c00;">${assessment.duration || 60}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Minutes</div>
      </div>
      <div style="background: #f3e5f5; padding: 15px; border-radius: 4px; text-align: center;">
        <div style="font-size: 24px; font-weight: bold; color: #7b1fa2;">${assessment.passing_score || 60}%</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Pass Score</div>
      </div>
    </div>

    <p style="color: var(--text-secondary);">${assessment.description || 'No description'}</p>

    <h3>Questions (${questions.length})</h3>
    <div style="overflow-x: auto;">
      <table class="table" style="font-size: 13px;">
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Type</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          ${questions.map((q, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${truncateText(q.question_text, 60)}</td>
              <td><span class="badge">${q.question_type}</span></td>
              <td>${q.points}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: right;">
      <button class="btn btn-secondary" onclick="closeModal('viewAssessmentModal')">Close</button>
    </div>
  `;

  showModal('viewAssessmentModal');
}

/**
 * Delete assessment with confirmation
 */
function deleteAssessmentConfirm(assessmentId) {
  const assessment = allAssessments.find(a => a.id === assessmentId);
  if (!assessment) return;

  if (confirm(`Delete assessment "${assessment.title}"?`)) {
    deleteAssessmentAction(assessmentId);
  }
}

/**
 * Delete assessment from database
 */
async function deleteAssessmentAction(assessmentId) {
  try {
    await deleteAssessment(assessmentId);
    showMessage('Assessment deleted successfully!', 'success');
    await renderAssessments();
  } catch (error) {
    showMessage('Error deleting assessment: ' + error.message, 'error');
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Truncate text to specified length
 */
function truncateText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

/**
 * Refresh assessments list
 */
async function refreshAssessmentsList() {
  const btn = document.getElementById('refreshAssessmentsBtn');
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

  try {
    await renderAssessments();
    showMessage('Data refreshed successfully', 'success');
  } catch (error) {
    showMessage('Error refreshing data: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}
