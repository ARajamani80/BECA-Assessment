// BECA Assessment Platform - Modal Management

let currentEditingModalData = {};

/**
 * Open module modal
 * @param {string} moduleId - Module ID (empty for new)
 * @param {string} moduleName - Module name (empty for new)
 */
function openModuleModal(moduleId, moduleName) {
  document.getElementById('moduleName').value = moduleName || '';
  document.getElementById('moduleDescription').value = '';
  document.getElementById('moduleModalTitle').textContent = moduleId ? 'Edit Module' : 'Add Module';
  document.getElementById('moduleModal').classList.add('active');
  document.getElementById('moduleModal').dataset.moduleId = moduleId || '';
}

/**
 * Open question modal
 * @param {string} questionId - Question ID (empty for new)
 * @param {string} moduleId - Module ID
 */
function openQuestionModal(questionId, moduleId) {
  document.getElementById('questionText').value = '';
  document.getElementById('questionType').value = '';
  document.getElementById('questionPoints').value = '10';
  document.getElementById('optionsList').innerHTML = '';
  tempOptions = {};
  updateQuestionTypeFields();
  document.getElementById('questionModalTitle').textContent = questionId ? 'Edit Question' : 'Add Question';
  document.getElementById('questionModal').classList.add('active');
  document.getElementById('questionModal').dataset.questionId = questionId || '';
  document.getElementById('questionModal').dataset.moduleId = moduleId || '';
}

/**
 * Update question type fields visibility
 */
function updateQuestionTypeFields() {
  const type = document.getElementById('questionType').value;
  const mcqOptions = document.getElementById('mcqOptions');
  const fileUploadOptions = document.getElementById('fileUploadOptions');

  if (mcqOptions) mcqOptions.style.display = type === 'mcq' ? 'block' : 'none';
  if (fileUploadOptions) fileUploadOptions.style.display = type === 'fileupload' ? 'block' : 'none';

  if (type === 'mcq' && !tempOptions[type]) {
    tempOptions[type] = [];
    addOption();
  }
}

/**
 * Add MCQ option
 */
function addOption() {
  const type = document.getElementById('questionType').value;
  if (!tempOptions[type]) tempOptions[type] = [];

  const index = tempOptions[type].length;
  const optionsList = document.getElementById('optionsList');

  const optionDiv = document.createElement('div');
  optionDiv.style.cssText = 'display: flex; gap: 8px; margin-bottom: 10px; align-items: center;';
  optionDiv.innerHTML = `
    <input type="text" placeholder="Option text" style="flex: 1; padding: 8px; border: 1px solid var(--border); border-radius: 6px;" data-option-index="${index}" class="option-input">
    <label style="display: flex; align-items: center; gap: 6px;">
      <input type="radio" name="correctOption" value="${index}" data-option-index="${index}" class="correct-option">
      Correct
    </label>
    <button type="button" class="btn btn-danger btn-sm" onclick="removeOption(${index})">Remove</button>
  `;

  optionsList.appendChild(optionDiv);
  tempOptions[type][index] = { text: '', correct: false };
}

/**
 * Remove MCQ option
 * @param {number} index - Option index
 */
function removeOption(index) {
  document.querySelector(`[data-option-index="${index}"]`)?.parentElement?.remove();
}

/**
 * Open password reset modal
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 */
function openPasswordResetModal(userId, userEmail) {
  document.getElementById('resetUserEmail').value = userEmail;
  document.getElementById('tempPassword').value = '';
  document.getElementById('sendResetEmail').checked = false;
  document.getElementById('passwordResetModal').dataset.userId = userId;
  document.getElementById('passwordResetModal').dataset.userEmail = userEmail;
  generateAndSetPassword();
  document.getElementById('passwordResetModal').classList.add('active');
}

/**
 * Generate and set temporary password
 */
function generateAndSetPassword() {
  const password = generateTempPassword();
  const tempPasswordEl = document.getElementById('tempPassword');
  if (tempPasswordEl) {
    tempPasswordEl.value = password;
  }
}

/**
 * Open deactivate modal
 * @param {string} userId - User ID
 * @param {string} userEmail - User email
 */
function openDeactivateModal(userId, userEmail) {
  document.getElementById('deactivateUserEmail').value = userEmail;
  document.getElementById('deactivationReason').value = '';
  document.getElementById('deactivateModal').dataset.userId = userId;
  document.getElementById('deactivateModal').dataset.userEmail = userEmail;
  document.getElementById('deactivateModal').classList.add('active');
}

/**
 * Open role permissions modal
 */
function openRolePermissionsModal() {
  document.getElementById('rolePermissionsModal').classList.add('active');
}

/**
 * Load assessment details in modal
 */
async function loadAssessmentDetails() {
  const assessmentId = document.getElementById('assessmentSelect').value;
  const detailsEl = document.getElementById('assessmentDetails');

  if (!assessmentId) {
    if (detailsEl) detailsEl.style.display = 'none';
    return;
  }

  try {
    const assessment = await getAssessment(assessmentId);
    const modules = await getAssessmentModules(assessmentId);

    if (assessment && detailsEl) {
      document.getElementById('detailDuration').textContent = assessment.duration || 60;
      document.getElementById('detailPassingScore').textContent = assessment.passing_score || 60;
      document.getElementById('detailModules').textContent = Array.isArray(modules) ? modules.length : 0;
      detailsEl.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading details:', error);
  }
}

/**
 * Set password generation button handler
 */
document.addEventListener('DOMContentLoaded', function() {
  // Hook up password generation button if it exists
  const genBtn = document.querySelector('button.btn[onclick*="generateTempPassword"]');
  if (genBtn) {
    genBtn.addEventListener('click', function() {
      generateAndSetPassword();
    });
  }
});
