let currentUser = null;
let currentPage = 'login';

function getSupabase() {
  return window.supabaseClient?.getSupabase?.();
}

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
      currentUser = session?.user || null;
      showPage(currentUser ? 'dashboard' : 'login');
    });
  }
}

function showPage(page) {
  currentPage = page;
  const app = document.getElementById('app');
  if (page === 'login') {
    app.innerHTML = `<div class="auth-container"><div class="auth-box"><h1>BECA Assessment</h1><p class="subtitle">Skills Assessment Platform</p><form id="loginForm"><div class="form-group"><label>Email</label><input type="email" id="email" required></div><div class="form-group"><label>Password</label><input type="password" id="password" required></div><button type="submit" class="btn btn-primary btn-full">Login</button></form><div id="message" class="message"></div></div></div>`;
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const sb = getSupabase();
        const { data, error } = await sb.auth.signInWithPassword({email: document.getElementById('email').value, password: document.getElementById('password').value});
        if (error) throw error;
        currentUser = data.user;
        showPage('dashboard');
      } catch (error) {
        document.getElementById('message').textContent = 'Login failed: ' + error.message;
      }
    });
  } else if (page === 'dashboard') {
    app.innerHTML = `<div class="dashboard-container"><header class="navbar"><h1>BECA Assessment</h1><div class="user-menu"><span>Welcome, ${currentUser?.email}</span><button class="btn btn-small" onclick="handleLogout()">Logout</button></div></header><div class="dashboard-content"><h2>Available Assessments</h2><div id="assessmentList"></div></div></div>`;
    loadAssessments();
  }
}

async function loadAssessments() {
  try {
    const sb = getSupabase();
    const { data: assessments, error } = await sb.from('assessments').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    const html = assessments.map(a => `<div class="assessment-card"><h3>${a.title}</h3><p>${a.description || ''}</p></div>`).join('');
    document.getElementById('assessmentList').innerHTML = html || '<p>No assessments</p>';
  } catch (error) {
    console.error('Error:', error);
  }
}

async function handleLogout() {
  await window.supabaseClient?.signOut?.();
  showPage('login');
}

document.addEventListener('DOMContentLoaded', initApp);
