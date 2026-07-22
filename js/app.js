// BECA Assessment Platform - Main Application

let currentPage = 'dashboard';

/**
 * Show page
 * @param {string} page - Page name
 */
function showPage(page) {
  currentPage = page;
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => item.classList.remove('active'));
  event?.target?.closest('.menu-item')?.classList.add('active');

  const pageElement = document.getElementById('page');
  if (pageElement) pageElement.innerHTML = '';

  switch(page) {
    case 'dashboard': return renderDashboard();
    case 'assessments': return renderAssessments();
    case 'create-assessment': return renderCreateAssessment();
    case 'send-trainees': return renderSendTrainees();
    case 'results': return renderResults();
    case 'users': return renderUsers();
    case 'students': return renderStudents();
    case 'reports': return renderReports();
    case 'questions': return renderQuestions();
    case 'modules': return renderModules();
    default: return renderDashboard();
  }
}

/**
 * Initialize application
 */
async function initializeApp() {
  // Check for assessment taker token in URL
  const takerToken = getUrlParameter('take');

  if (takerToken) {
    // Assessment Taker Mode - no login needed
    window.takerToken = takerToken;
    await renderAssessmentTaker();
  } else {
    // Admin Mode - requires login
    const isAuthenticated = await initializeAuth();

    if (!isAuthenticated) {
      showLoginPage();
    } else {
      await updateUserProfile();
      showPage('dashboard');
    }
  }
}

// Inject taker styles into document
function injectTakerStyles() {
  if (!document.getElementById('takerStyles')) {
    const style = document.createElement('style');
    style.id = 'takerStyles';
    style.textContent = TAKER_STYLES;
    document.head.appendChild(style);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
  injectTakerStyles();
  setTimeout(initializeApp, 500);
});
