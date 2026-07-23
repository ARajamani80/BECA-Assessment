// BECA Assessment Platform - Modal Management Module

/**
 * Show a modal
 * @param {string} modalId - Modal element ID
 */
function showModal(modalId) {
  try {
    console.log('📋 showModal() called with ID:', modalId);
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error('❌ Modal not found:', modalId);
      console.error('Available modals:', Array.from(document.querySelectorAll('.modal')).map(m => m.id));
      alert('Modal element not found: ' + modalId);
      return false;
    }
    modal.style.display = 'flex';
    console.log('✅ Modal shown successfully:', modalId);
    return true;
  } catch (error) {
    console.error('🔴 Error showing modal:', error);
    return false;
  }
}

/**
 * Close a modal
 * @param {string} modalId - Modal element ID
 */
function closeModal(modalId) {
  try {
    console.log('📋 closeModal() called with ID:', modalId);
    const modal = document.getElementById(modalId);
    if (!modal) {
      console.error('❌ Modal not found:', modalId);
      return false;
    }
    modal.style.display = 'none';
    console.log('✅ Modal closed successfully:', modalId);
    return true;
  } catch (error) {
    console.error('🔴 Error closing modal:', error);
    return false;
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
  try {
    console.log('📌 openQuestionModal() called with ID:', questionId);
    const result = showModal('questionModal');
    if (result && questionId) {
      console.log('✏️ Editing question:', questionId);
    }
    return result;
  } catch (error) {
    console.error('🔴 Error opening Question Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Open Module Modal
 */
function openModuleModal(moduleId = null) {
  try {
    console.log('📌 openModuleModal() called with ID:', moduleId);
    const result = showModal('moduleModal');
    if (result && moduleId) {
      console.log('✏️ Editing module:', moduleId);
    }
    return result;
  } catch (error) {
    console.error('🔴 Error opening Module Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Open Assessment Modal
 */
function openAssessmentModal(assessmentId = null) {
  try {
    console.log('📌 openAssessmentModal() called with ID:', assessmentId);
    const result = showModal('assessmentModal');
    if (result && assessmentId) {
      console.log('✏️ Editing assessment:', assessmentId);
    }
    return result;
  } catch (error) {
    console.error('🔴 Error opening Assessment Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Open Excel Import Modal
 */
function openExcelImportModal() {
  try {
    console.log('📌 openExcelImportModal() called');
    return showModal('excelImportModal');
  } catch (error) {
    console.error('🔴 Error opening Excel Import Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Open Assessment Taker Modal (Alternative Name)
 */
function openAddTakerModal() {
  try {
    console.log('📌 openAddTakerModal() called');
    return showModal('takerModal');
  } catch (error) {
    console.error('🔴 Error opening Add Taker Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Open Assessment Taker Modal
 */
function openTakerModal(takerId = null) {
  try {
    console.log('📌 openTakerModal() called with ID:', takerId);
    const result = showModal('takerModal');
    if (result && takerId) {
      console.log('✏️ Editing taker:', takerId);
    }
    return result;
  } catch (error) {
    console.error('🔴 Error opening Taker Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Open Permission Editor Modal
 */
function openPermissionEditor(userId = null) {
  try {
    console.log('📌 openPermissionEditor() called with ID:', userId);
    const result = showModal('userModal');
    if (result && userId) {
      console.log('✏️ Editing permissions for:', userId);
    }
    return result;
  } catch (error) {
    console.error('🔴 Error opening Permission Editor:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Open Role Permissions Modal
 */
function openRolePermissionsModal(role) {
  try {
    console.log('📌 openRolePermissionsModal() called for role:', role);
    return showModal('userModal');
  } catch (error) {
    console.error('🔴 Error opening Role Permissions Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
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
