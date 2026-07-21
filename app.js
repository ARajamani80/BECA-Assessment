// BECA Assessment App - Main Logic

// Current state
let currentUser = null;
let currentPage = 'login';

// Get Supabase instance
function getSupabase() {
  return window.supabaseClient?.getSupabase?.();
}

// Initialize app
async function initApp() {
  if (window.supabaseClient?.init) {
    window.supabaseClient.init();
  }

  const user = await window.supabaseClient?.getCurrentUser?.();

  if (user) {
    currentUser = user;
    showPage('dashboard');
  } else {
    showPage('login');
  }

  const sb = getSupabase();
  if (sb) {
    sb.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        currentUser = session.user;
        showPage('dashboard');
      } else {
        currentUser = null;
        showPage('login');
      }
    });
  }
}

// Router
function showPage(page) {
  currentPage = page;
  const app = document.getElementById('app');

  switch (page) {
    case 'login':
      app.innerHTML = renderLoginPage();
      attachLoginListeners();
      break;
    case 'dashboard':
      renderDashboard();
      break;
    case 'assessment':
      renderAssessmentPage();
      break;
    case 'results':
      renderResultsPage();
      break;
    case 'trainer':
      renderTrainerDashboard();
      break;
    default:
      app.innerHTML = '<h1>404 - Page not found</h1>';
  }
}

// ============================================================
// LOGIN PAGE
// ============================================================

function renderLoginPage() {
  return `
    <div class="auth-container">
      <div class="auth-box">
        <h1>BECA Assessment</h1>
        <p class="subtitle">Skills Assessment Platform</p>

        <form id="loginForm">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="email" required placeholder="your@email.com">
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" id="password" required placeholder="Password">
          </div>

          <button type="submit" class="btn btn-primary btn-full">Login</button>

          <div class="or-divider">OR</div>

          <button type="button" class="btn btn-secondary btn-full" onclick="showSignupForm()">
            Create Account
          </button>
        </form>

        <div id="signupForm" style="display:none;">
          <h2>Create Account</h2>
          <form id="registerForm">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="signupEmail" required placeholder="your@email.com">
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" id="signupPassword" required placeholder="Minimum 6 characters">
            </div>

            <div class="form-group">
              <label>Full Name</label>
              <input type="text" id="fullName" required placeholder="John Doe">
            </div>

            <button type="submit" class="btn btn-primary btn-full">Sign Up</button>
            <button type="button" class="btn btn-secondary btn-full" onclick="showLoginForm()">
              Back to Login
            </button>
          </form>
        </div>

        <div id="message" class="message"></div>
      </div>
    </div>
  `;
}

function attachLoginListeners() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
        const sb = getSupabase();
        if (!sb) throw new Error('Supabase not initialized');

        const { data, error } = await sb.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        showMessage('Login successful!', 'success');
        currentUser = data.user;
        setTimeout(() => showPage('dashboard'), 1000);
      } catch (error) {
        showMessage(`Login failed: ${error.message}`, 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value;
      const password = document.getElementById('signupPassword').value;
      const fullName = document.getElementById('fullName').value;

      try {
        const sb = getSupabase();
        if (!sb) throw new Error('Supabase not initialized');

        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });

        if (error) throw error;
        showMessage('Account created! Please check your email to confirm.', 'success');
        setTimeout(() => showLoginForm(), 2000);
      } catch (error) {
        showMessage(`Sign up failed: ${error.message}`, 'error');
      }
    });
  }
}

function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
}

function showSignupForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

// ============================================================
// DASHBOARD PAGE
// ============================================================

async function renderDashboard() {
  const app = document.getElementById('app');
  const user = await window.supabaseClient?.getCurrentUser?.();
  const userRole = await window.supabaseClient?.getUserRole?.(user.id);

  let content = `
    <div class="dashboard-container">
      <header class="navbar">
        <h1>BECA Assessment</h1>
        <div class="user-menu">
          <span>Welcome, ${user.email}</span>
          <button class="btn btn-small" onclick="handleLogout()">Logout</button>
        </div>
      </header>

      <div class="dashboard-content">
  `;

  if (userRole === 'trainer' || userRole === 'admin') {
    content += `
      <div class="role-badge">Trainer Dashboard</div>
      <button