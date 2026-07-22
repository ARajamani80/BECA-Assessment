// BECA Assessment Platform - Authentication Module

let currentUser = null;

/**
 * Sign in user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<boolean>} Success flag
 * @throws {Error} Authentication error
 */
async function signIn(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY
    },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error_description || data.error);

  currentUser = data.user;
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('refreshToken', data.refresh_token);
  localStorage.setItem('tokenExpiry', Date.now() + (3600 * 1000)); // 1 hour
  return true;
}

/**
 * Sign out user
 * @returns {Promise<void>}
 */
async function signOut() {
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenExpiry');
}

/**
 * Get current user
 * @returns {object|null} Current user
 */
function getCurrentUser() {
  return currentUser;
}

/**
 * Fetch user profile
 * @param {string} userId - User ID
 * @returns {Promise<object>} User profile
 */
async function fetchUserProfile(userId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=user_role,full_name`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Initialize authentication
 * @returns {Promise<boolean>} Is authenticated
 */
async function initializeAuth() {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    const user = await response.json();
    if (user && user.email) {
      currentUser = user;
      return true;
    }
  } catch (error) {
    console.error('Auth initialization failed:', error);
  }

  return false;
}

/**
 * Update user profile display
 * @returns {Promise<void>}
 */
async function updateUserProfile() {
  if (!currentUser) return;

  const emailParts = (currentUser.email || '').split('@');
  const initial = emailParts[0] ? emailParts[0][0].toUpperCase() : 'U';

  const userAvatarEl = document.getElementById('userAvatarSidebar');
  const userNameEl = document.getElementById('userNameSidebar');
  const userRoleEl = document.getElementById('userRoleSidebar');

  if (userAvatarEl) userAvatarEl.textContent = initial;
  if (userNameEl) userNameEl.textContent = currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User';

  // Fetch role from database
  const profile = await fetchUserProfile(currentUser.id);
  if (profile && userRoleEl) {
    userRoleEl.textContent = profile.user_role || 'user';
    console.log('User role from DB:', profile.user_role);
  } else if (userRoleEl) {
    userRoleEl.textContent = currentUser.user_metadata?.role || 'user';
  }

  console.log('User profile updated:', currentUser.email);
}

/**
 * Render login page
 */
function showLoginPage() {
  document.body.innerHTML = `
    <div style="background: linear-gradient(135deg, #1e293b, #0f172a); min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="background: white; padding: 48px; border-radius: 16px; width: 100%; max-width: 420px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 44px; font-weight: 700; background: linear-gradient(135deg, #3b82f6, #2563eb); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px;">BECA</div>
          <p style="color: #64748b; font-size: 16px;">Assessment Platform</p>
        </div>
        <form id="loginForm" onsubmit="handleLogin(event)">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1e293b;">Email</label>
            <input type="email" id="loginEmail" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;" required>
          </div>
          <div style="margin-bottom: 28px;">
            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #1e293b;">Password</label>
            <input type="password" id="loginPassword" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px;" required>
          </div>
          <button type="submit" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 16px;">Login</button>
        </form>
        <div id="loginMessage" style="margin-top: 20px; padding: 12px; border-radius: 8px; display: none;"></div>
      </div>
    </div>
  `;
}

/**
 * Handle login
 * @param {Event} e - Form event
 */
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const msg = document.getElementById('loginMessage');

  try {
    console.log('Attempting login with:', email);
    await signIn(email, password);
    console.log('Login successful, token stored');

    // Wait a moment for token to be stored, then reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('Login error:', error);
    if (msg) {
      msg.textContent = 'Error: ' + error.message;
      msg.style.background = '#fef2f2';
      msg.style.color = '#991b1b';
      msg.style.borderLeft = '4px solid #ef4444';
      msg.style.display = 'block';
    }
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  await signOut();
  showLoginPage();
}
