// BECA Assessment Platform - Modal Management Module

/**
 * Show a modal
 * @param {string} modalId - Modal element ID
 */
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    console.log('✓ Modal shown:', modalId);
  } else {
    console.error('❌ Modal not found:', modalId);
  }
}

/**
 * Close a modal
 * @param {string} modalId - Modal element ID
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    console.log('✓ Modal closed:', modalId);
  } else {
    console.error('❌ Modal not found:', modalId);
  }
}

/**
 * Close modal when clicking outside content
 */
document.addEventListener('click', function(e) {
  if (e.target.classList && e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});

/**
 * Open Question Modal
 */
function openQuestionModal(questionId = null) {
  showModal('questionModal');
  if (questionId) {
    console.log('Editing question:', questionId);
  }
}

/**
 * Open Module Modal
 */
function openModuleModal(moduleId = null) {
  showModal('moduleModal');
  if (moduleId) {
    console.log('Editing module:', moduleId);
  }
}

/**
 * Open Assessment Modal
 */
function openAssessmentModal(assessmentId = null) {
  showModal('assessmentModal');
  if (assessmentId) {
    console.log('Editing assessment:', assessmentId);
  }
}

/**
 * Open Excel Import Modal
 */
function openExcelImportModal() {
  showModal('excelImportModal');
}

/**
 * Open Assessment Taker Modal
 */
function openTakerModal(takerId = null) {
  showModal('takerModal');
  if (takerId) {
    console.log('Editing taker:', takerId);
  }
}

/**
 * Open Permission Editor Modal
 */
function openPermissionEditor(userId = null) {
  showModal('userModal');
  if (userId) {
    console.log('Editing permissions for:', userId);
  }
}

/**
 * Open Role Permissions Modal
 */
function openRolePermissionsModal(role) {
  showModal('userModal');
  console.log('Managing permissions for role:', role);
}

/**
 * Show confirmation dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {function} callback - Callback when confirmed
 */
function showConfirmation(title, message, callback) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMessage').textContent = message;
  document.getElementById('confirmBtn').onclick = callback;
  showModal('confirmModal');
}

console.log('✓ Modals module loaded');
