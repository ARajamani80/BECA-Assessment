// BECA Assessment Platform - Assessments Module

let currentAssessmentEdit = null;
let modules = [];
let tempOptions = {};

/**
 * Render assessments list
 */
async function renderAssessments() {
  document.getElementById('pageTitle').textContent = 'Assessments';

  try {
    const assessments = await getAssessments();

    let html = '<div class="card"><div class="card-title"><i class="fas fa-list-check"></i> All Assessments</div>';

    if (!Array.isArray(assessments) || assessments.length === 0) {
      html += '<p style="color: var(--text-secondary);">No assessments yet. <a href="#" onclick="showPage(\'create-assessment\')" style="color: var(--primary);">Create one</a></p>';
    } else {
      assessments.forEach(a => {
        html += `
          <div class="assessment-item">
            <div class="assessment-info">
              <h3>${a.title || a.name || 'Untitled'}</h3>
              <p>${a.description || 'No description'}</p>
              <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                <i class="fas fa-clock"></i> ${a.duration || a.time_limit_minutes || '60'} min |
                <i class="fas fa-percent"></i> Pass: ${a.passing_score || '60'}%
              </p>
            </div>
            <div class="assessment-actions">
              <button class="btn btn-primary btn-sm" onclick="editAssessmentBuilder('${a.id}')"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-warning btn-sm" onclick="viewAssessmentDetails('${a.id}')"><i class="fas fa-eye"></i> View</button>
              <button class="btn btn-danger btn-sm" onclick="deleteAssessmentConfirm('${a.id}')"><i class="fas fa-trash"></i></button>
            </div>
          </div>
        `;
      });
    }

    html += '</div>';
    document.getElementById('page').innerHTML = html;
  } catch (error) {
    showMessage('Error loading assessments: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error: ' + error.message + '</p></div>';
  }
}

/**
 * Render create assessment form
 */
function renderCreateAssessment() {
  document.getElementById('pageTitle').textContent = 'Create Assessment';
  modules = [];

  document.getElementById('page').innerHTML = `
    <div class="grid-2">
      <div class="card">
        <div class="card-title"><i class="fas fa-plus"></i> Assessment Details</div>
        <form id="assessmentForm" onsubmit="handleCreateAssessment(event)">
          <div class="form-group">
            <label>Title *</label>
            <input type="text" id="title" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Duration (minutes)</label>
            <input type="number" id="duration" value="60" min="1">
          </div>
          <div class="form-group">
            <label>Passing Score (%)</label>
            <input type="number" id="passingScore" value="60" min="0" max="100">
          </div>
          <button type="submit" class="btn btn-success btn-full"><i class="fas fa-save"></i> Create Assessment</button>
        </form>
      </div>

      <div class="card">
        <div class="card-title"><i class="fas fa-book"></i> Modules & Questions</div>
        <p style="color: var(--text-secondary); margin-bottom: 16px;">Create the assessment first, then add modules and questions.</p>
        <div id="modulesPreview" style="min-height: 200px;">
          <p style="text-align: center; color: #999;">No modules yet</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Handle create assessment
 * @param {Event} e - Form event
 */
async function handleCreateAssessment(e) {
  e.preventDefault();

  try {
    const assessment = {
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      duration: parseInt(document.getElementById('duration').value),
      passing_score: parseInt(document.getElementById('passingScore').value),
      created_by: currentUser.id,
      status: 'draft'
    };

    const result = await createAssessment(assessment);
    showMessage('Assessment created successfully!', 'success');

    if (result && result.id) {
      currentAssessmentEdit = result.id;
      setTimeout(() => editAssessmentBuilder(result.id), 1500);
    } else {
      setTimeout(() => showPage('assessments'), 1500);
    }
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Edit assessment
 * @param {string} assessmentId - Assessment ID
 */
async function editAssessmentBuilder(assessmentId) {
  document.getElementById('pageTitle').textContent = 'Edit Assessment';
  currentAssessmentEdit = assessmentId;
  modules = [];

  try {
    const assessmentData = await getAssessment(assessmentId);

    if (!assessmentData) {
      showMessage('Assessment not found', 'error');
      return showPage('assessments');
    }

    let html = `
      <div class="card">
        <div class="card-title"><i class="fas fa-edit"></i> ${assessmentData.title || 'Assessment'}</div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <p><strong>Duration:</strong> ${assessmentData.duration || 60} minutes</p>
          <p><strong>Passing Score:</strong> ${assessmentData.passing_score || 60}%</p>
          <p><strong>Status:</strong> <span class="badge badge-warning">${assessmentData.status || 'draft'}</span></p>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <button class="btn btn-primary" onclick="openModuleModal('', '')">
            <i class="fas fa-plus"></i> Add Module
          </button>
          <button class="btn btn-success" onclick="publishAssessmentConfirm('${assessmentId}')">
            <i class="fas fa-check"></i> Publish Assessment
          </button>
        </div>

        <div id="modulesContainer"></div>
      </div>
    `;

    document.getElementById('page').innerHTML = html;
    await loadModules(assessmentId);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
    showPage('assessments');
  }
}

/**
 * Load modules for assessment
 * @param {string} assessmentId - Assessment ID
 */
async function loadModules(assessmentId) {
  try {
    const modulesData = await getAssessmentModules(assessmentId);
    modules = Array.isArray(modulesData) ? modulesData : [];

    let html = '';
    for (const module of modules) {
      const questions = await getAssessmentQuestions(module.id);

      html += `
        <div class="module-card">
          <div class="module-header">
            <div>
              <div class="module-title">${module.name || 'Module'}</div>
              <p style="color: var(--text-secondary); font-size: 12px;">${module.description || ''}</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-primary btn-sm" onclick="openQuestionModal('', '${module.id}')">
                <i class="fas fa-plus"></i> Add Question
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteModuleConfirm('${module.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div id="questions_${module.id}">
            ${questions && questions.length > 0 ? questions.map(q => `
              <div class="question-item">
                <div>
                  <span class="question-type-badge">${q.question_type || 'MCQ'}</span>
                  <p style="margin-top: 6px; color: var(--text-primary);">${q.question_text || 'Question'}</p>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteQuestionConfirm('${q.id}')">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            `).join('') : '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No questions yet</p>'}
          </div>
        </div>
      `;
    }

    document.getElementById('modulesContainer').innerHTML = html;
  } catch (error) {
    console.error('Error loading modules:', error);
    document.getElementById('modulesContainer').innerHTML = '<p style="color: red;">Error loading modules</p>';
  }
}

/**
 * Delete assessment with confirmation
 * @param {string} id - Assessment ID
 */
async function deleteAssessmentConfirm(id) {
  if (!confirm('Delete this assessment?')) return;
  await deleteAssessmentWithId(id);
}

/**
 * Delete assessment
 * @param {string} id - Assessment ID
 */
async function deleteAssessmentWithId(id) {
  try {
    await deleteAssessment(id);
    showMessage('Assessment deleted', 'success');
    renderAssessments();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Delete module with confirmation
 * @param {string} moduleId - Module ID
 */
async function deleteModuleConfirm(moduleId) {
  if (!confirm('Delete this module and all its questions?')) return;

  try {
    await deleteModule(moduleId);
    showMessage('Module deleted', 'success');
    loadModules(currentAssessmentEdit);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Delete question with confirmation
 * @param {string} questionId - Question ID
 */
async function deleteQuestionConfirm(questionId) {
  if (!confirm('Delete this question?')) return;

  try {
    await deleteQuestion(questionId);
    showMessage('Question deleted', 'success');
    loadModules(currentAssessmentEdit);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Publish assessment with confirmation
 * @param {string} assessmentId - Assessment ID
 */
async function publishAssessmentConfirm(assessmentId) {
  if (!confirm('Publish this assessment? It will be available for trainees to take.')) return;

  try {
    await updateAssessment(assessmentId, { status: 'published' });
    showMessage('Assessment published!', 'success');
    setTimeout(() => showPage('assessments'), 1500);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * View assessment details
 * @param {string} id - Assessment ID
 */
async function viewAssessmentDetails(id) {
  showMessage('View assessment feature coming soon', 'success');
}
