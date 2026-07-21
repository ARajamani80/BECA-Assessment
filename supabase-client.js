var SUPABASE_URL = window.SUPABASE_URL || 'https://your-project.supabase.co';
var SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || 'your-anon-key-here';
var supabase = null;

function initSupabase() {
  if (window.supabase && !supabase) {
    var SC = window.supabase;
    supabase = SC.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase initialized');
  }
}

async function getCurrentUser() {
  var sb = supabase;
  if (!sb) return null;
  var result = await sb.auth.getUser();
  return result.data?.user;
}

async function signOut() {
  if (!supabase) return false;
  var result = await supabase.auth.signOut();
  return !result.error;
}

async function getUserRole(userId) {
  try {
    if (!supabase) return 'student';
    var result = await supabase.from('profiles').select('role').eq('id', userId).single();
    return result.data?.role || 'student';
  } catch (error) {
    return 'student';
  }
}

window.supabaseClient = {
  getSupabase: function() { return supabase; },
  getCurrentUser: getCurrentUser,
  signOut: signOut,
  getUserRole: getUserRole,
  init: initSupabase
};
