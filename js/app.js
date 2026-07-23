// BECA Assessment Platform - Main Application Router

let currentPage = 'dashboard';

/**
 * Show page
 */
function showPage(page) {
  currentPage = page;

  // Update active menu item
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('active');
  });
  event?.target?.closest('.menu-item')?.classList.add('active');

  // Clear page content
  const pageElement = document.getElementById('page');
  if (pageElement) {
    pageElement.innerHTML = '';
  }

  // Render requested page
  switch(page) {
    case 'dashboard':
      return renderDashboard();
    case 'questions':
      return renderQuestions();
    case 'modules':
      return renderModules();
    case 'assessments':
      return renderAssessments();
    case 'assessment-takers':
      return renderAssessmentTakers();
    case 'users':
      return renderUsers();
    case 'permissions':
      return renderPermissionEditor();
    case 'results':
      return renderResults();
    case 'reports':
      return renderReports();
    case 'students':
      return renderStudents();
    case 'send-trainees':
      return renderSendTrainees();
    default:
      return renderDashboard();
  }
}

/**
 * Initialize application
 */
async function initializeApp() {
  try {
    // Check authentication
    const isAuthenticated = await initializeAuth();

    if (!isAuthenticated) {
      // Not logged in - show login page
      document.getElementById('loginContainer').style.display = 'flex';
      document.getElementById('dashboardContainer').style.display = 'none';
      return;
    }

    // Logged in - show dashboard
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'flex';

    // Load user profile and show dashboard
    await updateUserProfile();
    showPage('dashboard');
  } catch (error) {
    console.error('Initialize app error:', error);
  }
}
