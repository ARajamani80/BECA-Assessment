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
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error('Authentication failed');

    currentUser = data.user;
    localStorage.setItem('token', data.session?.access_token || '');
    localStorage.setItem('refreshToken', data.session?.refresh_token || '');
    localStorage.setItem('userId', data.user.id);
    console.log('✓ User signed in:', email);
    return true;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
}

/**
 * Sign out user
 * @returns {Promise<void>}
 */
async function signOut() {
  try {
    const client = await getSupabaseClient();
    await client.auth.signOut();
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    console.log('✓ User signed out');
  } catch (error) {
    console.error('Sign out error:', error);
    currentUser = null;
    localStorage.clear();
  }
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
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('Profile fetch error (expected for new users):', error.message);
      return null;
    }
    return data;
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
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client.auth.getSession();

    if (error) {
      console.log('Session retrieval error:', error.message);
      return false;
    }

    if (data?.session?.user) {
      currentUser = data.session.user;
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('userId', data.session.user.id);
      console.log('✓ Session restored for:', data.session.user.email);
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
 * Logout function - called from UI
 */
async function logout() {
  try {
    await signOut();
    // Reload page to show login screen
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } catch (error) {
    console.error('Logout error:', error);
    window.location.reload();
  }
}
