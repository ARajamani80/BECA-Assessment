// BECA Assessment App - Main Logic
const { supabase, getCurrentUser, signOut, getUserRole } = window.supabaseClient;

// Current state
let currentUser = null;
let currentPage = 'login';

// Initialize app
async function initApp() {
  const user = await getCurrentUser();

  if (user) {
    currentUser = user;
    showPage('dashboard');
  } else {
    showPage('login');
  }

  // Listen for auth changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
      currentUser = session.user;
      showPage('dashboard');
    } else {
      currentUser = null;
      showPage('login');
    }
  });
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
        const { data, error } = await supabase.auth.signInWithPassword({
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
        const { data, error } = await supabase.auth.signUp({
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
  const user = await getCurrentUser();
  const userRole = await getUserRole(user.id);

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
      <button class="btn btn-primary" onclick="showPage('trainer')">
        View Submissions
      </button>
    `;
  } else {
    content += `
      <div class="role-badge">Student Dashboard</div>
      <h2>Available Assessments</h2>
      <div id="assessmentList"></div>
    `;
  }

  content += `
      </div>
    </div>
  `;

  app.innerHTML = content;

  if (userRole !== 'trainer' && userRole !== 'admin') {
    await loadAssessments();
  }
}

async function loadAssessments() {
  try {
    const { data: assessments, error } = await supabase
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const listHTML = assessments.map(a => `
      <div class="assessment-card">
        <h3>${a.title}</h3>
        <p>${a.description || 'No description'}</p>
        <button class="btn btn-primary" onclick="startAssessment('${a.id}', '${a.title}')">
          Take Assessment
        </button>
      </div>
    `).join('');

    document.getElementById('assessmentList').innerHTML = listHTML || '<p>No assessments available</p>';
  } catch (error) {
    console.error('Error loading assessments:', error);
  }
}

function startAssessment(assessmentId, title) {
  localStorage.setItem('currentAssessmentId', assessmentId);
  localStorage.setItem('currentAssessmentTitle', title);
  showPage('assessment');
}

// ============================================================
// ASSESSMENT PAGE
// ============================================================

async function renderAssessmentPage() {
  const app = document.getElementById('app');
  const assessmentId = localStorage.getItem('currentAssessmentId');
  const assessmentTitle = localStorage.getItem('currentAssessmentTitle');

  app.innerHTML = `
    <div class="assessment-container">
      <header class="navbar">
        <h1>${assessmentTitle}</h1>
        <button class="btn btn-small" onclick="goBack()">Back</button>
      </header>

      <div class="assessment-content">
        <div id="questionsContainer"></div>
        <button class="btn btn-primary btn-large" onclick="submitAssessment()">
          Submit Assessment
        </button>
      </div>
    </div>
  `;

  await loadQuestions(assessmentId);
}

async function loadQuestions(assessmentId) {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (error) throw error;

    const questionsHTML = questions.map((q, index) => `
      <div class="question-card">
        <h3>${index + 1}. ${q.question_text}</h3>
        <textarea
          id="answer_${q.id}"
          class="question-input"
          placeholder="Your answer..."
        ></textarea>
      </div>
    `).join('');

    document.getElementById('questionsContainer').innerHTML = questionsHTML || '<p>No questions</p>';
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

async function submitAssessment() {
  try {
    const user = await getCurrentUser();
    const assessmentId = localStorage.getItem('currentAssessmentId');

    // Create attempt record
    const { data: attempt, error: attemptError } = await supabase
      .from('attempts')
      .insert({
        assessment_id: assessmentId,
        user_id: user.id,
        status: 'submitted',
        submitted_at: new Date()
      })
      .select()
      .single();

    if (attemptError) throw attemptError;

    // Get all answers
    const answers = document.querySelectorAll('[id^="answer_"]');
    const answerRecords = Array.from(answers).map(input => ({
      attempt_id: attempt.id,
      question_id: input.id.replace('answer_', ''),
      answer_text: input.value
    }));

    // Save answers
    const { error: answerError } = await supabase
      .from('attempt_answers')
      .insert(answerRecords);

    if (answerError) throw answerError;

    // Create result record
    await supabase
      .from('assessment_results')
      .insert({
        attempt_id: attempt.id,
        user_id: user.id,
        assessment_id: assessmentId,
        submitted_at: new Date()
      });

    showMessage('Assessment submitted successfully!', 'success');
    setTimeout(() => showPage('dashboard'), 2000);
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'error');
  }
}

// ============================================================
// RESULTS PAGE
// ============================================================

async function renderResultsPage() {
  const app = document.getElementById('app');
  const user = await getCurrentUser();

  app.innerHTML = `
    <div class="results-container">
      <header class="navbar">
        <h1>My Assessment Results</h1>
        <button class="btn btn-small" onclick="showPage('dashboard')">Back</button>
      </header>

      <div class="results-content">
        <div id="resultsList"></div>
      </div>
    </div>
  `;

  try {
    const { data: results, error } = await supabase
      .from('assessment_results')
      .select('*, attempts(*), assessments(*)')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    const resultsHTML = results.map(r => `
      <div class="result-card">
        <h3>${r.assessments.title}</h3>
        <p>Submitted: ${new Date(r.submitted_at).toLocaleDateString()}</p>
        <p>Status: ${r.submitted_at ? 'Submitted' : 'In Progress'}</p>
        ${r.total_score ? `<p class="score">Score: ${r.total_score}%</p>` : '<p>Pending Review</p>'}
      </div>
    `).join('');

    document.getElementById('resultsList').innerHTML = resultsHTML || '<p>No results yet</p>';
  } catch (error) {
    console.error('Error loading results:', error);
  }
}

// ============================================================
// TRAINER DASHBOARD
// ============================================================

async function renderTrainerDashboard() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="trainer-container">
      <header class="navbar">
        <h1>Trainer Dashboard</h1>
        <button class="btn btn-small" onclick="showPage('dashboard')">Back</button>
      </header>

      <div class="trainer-content">
        <h2>Pending Submissions</h2>
        <div id="submissionsList"></div>
      </div>
    </div>
  `;

  try {
    const { data: submissions, error } = await supabase
      .from('assessment_results')
      .select('*, attempts(*, users(*)), assessments(*)')
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    const submissionsHTML = submissions.map(s => `
      <div class="submission-card">
        <h3>${s.assessments.title}</h3>
        <p>Student: ${s.attempts.user_id}</p>
        <p>Submitted: ${new Date(s.submitted_at).toLocaleDateString()}</p>
        <button class="btn btn-primary" onclick="gradeSubmission('${s.id}')">
          Grade
        </button>
      </div>
    `).join('');

    document.getElementById('submissionsList').innerHTML = submissionsHTML || '<p>No submissions</p>';
  } catch (error) {
    console.error('Error loading submissions:', error);
  }
}

async function gradeSubmission(resultId) {
  const score = prompt('Enter score (0-100):');
  if (score === null) return;

  try {
    const { error } = await supabase
      .from('assessment_results')
      .update({
        total_score: parseFloat(score),
        percentage: parseFloat(score),
        passed: parseFloat(score) >= 60,
        graded_at: new Date(),
        graded_by: (await getCurrentUser()).id
      })
      .eq('id', resultId);

    if (error) throw error;
    showMessage('Grade saved!', 'success');
    renderTrainerDashboard();
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'error');
  }
}

// ============================================================
// UTILITIES
// ============================================================

function goBack() {
  showPage('dashboard');
}

async function handleLogout() {
  const success = await signOut();
  if (success) {
    showPage('login');
  }
}

function showMessage(message, type = 'info') {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = message;
    messageDiv.className = `message message-${type}`;
    setTimeout(() => {
      messageDiv.textContent = '';
    }, 5000);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);
