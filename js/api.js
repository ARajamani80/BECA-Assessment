// BECA Assessment Platform - API Module (Supabase)
// Properly initializes and manages Supabase client with proper error handling

const SUPABASE_URL = 'https://fgzqgqwlyeubudnbxsmx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnenFncXdseWV1YnVkbmJ4c214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTc5NTIsImV4cCI6MjA5NDk5Mzk1Mn0.J6lWx23ukNGihKgLtdCeoq4WOR75eSFyGYrb6_YS9q0';

// Initialize Supabase client - make it globally accessible
let supabase = null;
let supabaseInitializing = false;
let supabaseInitialized = false;
const supabaseCallbacks = [];

/**
 * Properly initialize Supabase client
 * @returns {Promise<void>}
 */
async function initializeSupabaseClient() {
  if (supabaseInitialized || supabaseInitializing) return;

  supabaseInitializing = true;

  try {
    // Wait for the Supabase library to be available
    let attempts = 0;
    while (!window.supabase && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.supabase) {
      throw new Error('Supabase library failed to load');
    }

    // Create client
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    supabaseInitialized = true;
    console.log('✓ Supabase client initialized successfully');

    // Call any waiting callbacks
    supabaseCallbacks.forEach(cb => cb());
    supabaseCallbacks.length = 0;
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    supabaseInitializing = false;
    throw error;
  }
}

/**
 * Get Supabase client (wait if not ready)
 * @returns {Promise<object>} Supabase client
 */
async function getSupabaseClient() {
  if (!supabaseInitialized) {
    if (!supabaseInitializing) {
      await initializeSupabaseClient();
    } else {
      // Wait for initialization to complete
      return new Promise(resolve => {
        supabaseCallbacks.push(() => resolve(supabase));
      });
    }
  }
  return supabase;
}

// Start initialization immediately when script loads
initializeSupabaseClient().catch(err => console.error('Supabase init error:', err));


/**
 * Get assessments
 * @returns {Promise<array>} Assessments list
 */
async function getAssessments() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching assessments:', error);
    throw error;
  }
}

/**
 * Get assessment by ID
 * @param {string} id - Assessment ID
 * @returns {Promise<object>} Assessment data
 */
async function getAssessment(id) {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching assessment:', error);
    throw error;
  }
}

/**
 * Create assessment
 * @param {object} data - Assessment data
 * @returns {Promise<object>} Created assessment
 */
async function createAssessment(data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessments')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating assessment:', error);
    throw error;
  }
}

/**
 * Update assessment
 * @param {string} id - Assessment ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated assessment
 */
async function updateAssessment(id, data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating assessment:', error);
    throw error;
  }
}

/**
 * Delete assessment
 * @param {string} id - Assessment ID
 * @returns {Promise<void>}
 */
async function deleteAssessment(id) {
  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting assessment:', error);
    throw error;
  }
}

/**
 * Get assessment modules
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<array>} Modules list
 */
async function getAssessmentModules(assessmentId) {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessment_modules')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
}

/**
 * Create module
 * @param {object} data - Module data
 * @returns {Promise<object>} Created module
 */
async function createModule(data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessment_modules')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
}

/**
 * Update module
 * @param {string} id - Module ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated module
 */
async function updateModule(id, data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessment_modules')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
}

/**
 * Delete module
 * @param {string} id - Module ID
 * @returns {Promise<void>}
 */
async function deleteModule(id) {
  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('assessment_modules')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
}

/**
 * Get all modules
 * @returns {Promise<array>} All modules
 */
async function getModules() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessment_modules')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
}

/**
 * Get assessment questions
 * @param {string} moduleId - Module ID
 * @returns {Promise<array>} Questions list
 */
async function getAssessmentQuestions(moduleId) {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessment_questions')
      .select('*')
      .eq('module_id', moduleId)
      .order('order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Get all questions
 * @returns {Promise<array>} All questions
 */
async function getAllQuestions() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessment_questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
}

/**
 * Create question
 * @param {object} data - Question data
 * @returns {Promise<object>} Created question
 */
async function createQuestion(data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessment_questions')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
}

/**
 * Update question
 * @param {string} id - Question ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated question
 */
async function updateQuestion(id, data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessment_questions')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
}

/**
 * Delete question
 * @param {string} id - Question ID
 * @returns {Promise<void>}
 */
async function deleteQuestion(id) {
  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('assessment_questions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
}

/**
 * Get users
 * @returns {Promise<array>} Users list
 */
async function getUsers() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get assessment results
 * @returns {Promise<array>} Results list
 */
async function getResults() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessment_results')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching results:', error);
    throw error;
  }
}

/**
 * Get assessment taker by token
 * @param {string} token - Taker token
 * @returns {Promise<object|null>} Taker assignment
 */
async function getAssessmentTakerByToken(token) {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessment_takers')
      .select('*')
      .eq('token', token)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data || null;
  } catch (error) {
    console.error('Error fetching taker:', error);
    throw error;
  }
}

/**
 * Create assessment taker
 * @param {object} data - Taker data
 * @returns {Promise<object>} Created taker
 */
async function createAssessmentTaker(data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessment_takers')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error creating taker:', error);
    throw error;
  }
}

/**
 * Update assessment taker
 * @param {string} id - Taker ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated taker
 */
async function updateAssessmentTaker(id, data) {
  try {
    const client = await getSupabaseClient();
    const { data: result, error } = await client
      .from('assessment_takers')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('Error updating taker:', error);
    throw error;
  }
}

/**
 * Get assessment takers
 * @returns {Promise<array>} Assessment takers
 */
async function getAssessmentTakers() {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('assessment_takers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching takers:', error);
    throw error;
  }
}

/**
 * Save audit log
 * @param {object} logEntry - Log entry data
 * @returns {Promise<object|null>} Saved log entry
 */
async function saveAuditLog(logEntry) {
  try {
    const client = await getSupabaseClient();
    const { data, error } = await client
      .from('user_audit_log')
      .insert([logEntry])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.log('Audit log not available:', error.message);
    return null;
  }
}
