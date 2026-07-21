// Supabase Configuration
// Get these from: https://app.supabase.com → Settings → API

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL ||
                     localStorage.getItem('SUPABASE_URL') ||
                     'https://your-project.supabase.co';

const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY ||
                          localStorage.getItem('SUPABASE_ANON_KEY') ||
                          'your-anon-key-here';

// Initialize Supabase
const { createClient } = window.supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: Check if user is logged in
async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper: Sign out
async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Sign out error:', error);
  return !error;
}

// Helper: Get user role
async function getUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.role || 'student';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'student';
  }
}

// Export for use in app.js
window.supabaseClient = {
  supabase,
  getCurrentUser,
  signOut,
  getUserRole
};
