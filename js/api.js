// BECA Assessment Platform - API Module (Supabase)

const SUPABASE_URL = 'https://fgzqgqwlyeubudnbxsmx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnenFncXdseWV1YnVkbmJ4c214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTc5NTIsImV4cCI6MjA5NDk5Mzk1Mn0.J6lWx23ukNGihKgLtdCeoq4WOR75eSFyGYrb6_YS9q0';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Check if token is expired
 * @returns {boolean} Is token expired
 */
function isTokenExpired() {
  const expiry = localStorage.getItem('tokenExpiry');
  if (!expiry) return true;
  return Date.now() > parseInt(expiry);
}

/**
 * Refresh authentication token
 * @returns {Promise<boolean>} Success flag
 */
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    localStorage.setItem('token', data.access_token);
    localStorage.setItem('tokenExpiry', Date.now() + (3600 * 1000));
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

/**
 * Make API call to Supabase
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {string} table - Table name
 * @param {object} data - Request body data
 * @param {string} filter - Query filter string
 * @returns {Promise<array|object>} API response
 * @throws {Error} API error
 */
async function apiCall(method, table, data = null, filter = null) {
  // Check if token is expired and refresh
  if (isTokenExpired()) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      throw new Error('Session expired. Please login again.');
    }
  }

  const token = localStorage.getItem('token');
  let url = `${SUPABASE_URL}/rest/v1/${table}`;

  const options = {
    method,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    }
  };

  if (data) options.body = JSON.stringify(data);
  if (filter) url += filter;

  try {
    const response = await fetch(url, options);

    // Handle 401 Unauthorized (token issue)
    if (response.status === 401) {
      console.error('Unauthorized - refreshing token');
      const refreshed = await refreshToken();
      if (!refreshed) {
        throw new Error('Session expired. Please login again.');
      }
      // Retry the request with new token
      return apiCall(method, table, data, filter);
    }

    // Handle empty response
    if (response.status === 204) {
      return [];
    }

    // Get response text first
    const text = await response.text();

    // Try to parse as JSON
    let result = [];
    try {
      result = text ? JSON.parse(text) : [];
    } catch (e) {
      console.error('Failed to parse JSON:', text, 'Error:', e);
      console.error('URL:', url);
      console.error('Status:', response.status);
    }

    if (!response.ok) {
      console.error('API Error:', result);
      throw new Error(result.message || `API Error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
}

/**
 * Get assessments
 * @returns {Promise<array>} Assessments list
 */
async function getAssessments() {
  return await apiCall('GET', 'assessments');
}

/**
 * Get assessment by ID
 * @param {string} id - Assessment ID
 * @returns {Promise<object>} Assessment data
 */
async function getAssessment(id) {
  const result = await apiCall('GET', `assessments?id=eq.${id}`);
  return Array.isArray(result) ? result[0] : result;
}

/**
 * Create assessment
 * @param {object} data - Assessment data
 * @returns {Promise<object>} Created assessment
 */
async function createAssessment(data) {
  return await apiCall('POST', 'assessments', data);
}

/**
 * Update assessment
 * @param {string} id - Assessment ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated assessment
 */
async function updateAssessment(id, data) {
  return await apiCall('PATCH', 'assessments', data, `?id=eq.${id}`);
}

/**
 * Delete assessment
 * @param {string} id - Assessment ID
 * @returns {Promise<void>}
 */
async function deleteAssessment(id) {
  return await apiCall('DELETE', 'assessments', null, `?id=eq.${id}`);
}

/**
 * Get assessment modules
 * @param {string} assessmentId - Assessment ID
 * @returns {Promise<array>} Modules list
 */
async function getAssessmentModules(assessmentId) {
  return await apiCall('GET', `assessment_modules?assessment_id=eq.${assessmentId}`);
}

/**
 * Create module
 * @param {object} data - Module data
 * @returns {Promise<object>} Created module
 */
async function createModule(data) {
  return await apiCall('POST', 'assessment_modules', data);
}

/**
 * Update module
 * @param {string} id - Module ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated module
 */
async function updateModule(id, data) {
  return await apiCall('PATCH', 'assessment_modules', data, `?id=eq.${id}`);
}

/**
 * Delete module
 * @param {string} id - Module ID
 * @returns {Promise<void>}
 */
async function deleteModule(id) {
  return await apiCall('DELETE', 'assessment_modules', null, `?id=eq.${id}`);
}

/**
 * Get assessment questions
 * @param {string} moduleId - Module ID
 * @returns {Promise<array>} Questions list
 */
async function getAssessmentQuestions(moduleId) {
  return await apiCall('GET', `assessment_questions?module_id=eq.${moduleId}`);
}

/**
 * Create question
 * @param {object} data - Question data
 * @returns {Promise<object>} Created question
 */
async function createQuestion(data) {
  return await apiCall('POST', 'assessment_questions', data);
}

/**
 * Update question
 * @param {string} id - Question ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated question
 */
async function updateQuestion(id, data) {
  return await apiCall('PATCH', 'assessment_questions', data, `?id=eq.${id}`);
}

/**
 * Delete question
 * @param {string} id - Question ID
 * @returns {Promise<void>}
 */
async function deleteQuestion(id) {
  return await apiCall('DELETE', 'assessment_questions', null, `?id=eq.${id}`);
}

/**
 * Get users
 * @returns {Promise<array>} Users list
 */
async function getUsers() {
  return await apiCall('GET', 'profiles');
}

/**
 * Get assessment results
 * @returns {Promise<array>} Results list
 */
async function getResults() {
  return await apiCall('GET', 'assessment_results');
}

/**
 * Get assessment taker by token
 * @param {string} token - Taker token
 * @returns {Promise<object|null>} Taker assignment
 */
async function getAssessmentTakerByToken(token) {
  const result = await apiCall('GET', `assessment_takers?token=eq.${token}`);
  return Array.isArray(result) && result.length > 0 ? result[0] : null;
}

/**
 * Create assessment taker
 * @param {object} data - Taker data
 * @returns {Promise<object>} Created taker
 */
async function createAssessmentTaker(data) {
  return await apiCall('POST', 'assessment_takers', data);
}

/**
 * Update assessment taker
 * @param {string} id - Taker ID
 * @param {object} data - Update data
 * @returns {Promise<object>} Updated taker
 */
async function updateAssessmentTaker(id, data) {
  return await apiCall('PATCH', 'assessment_takers', data, `?id=eq.${id}`);
}

/**
 * Save audit log
 * @param {object} logEntry - Log entry data
 * @returns {Promise<object>} Saved log entry
 */
async function saveAuditLog(logEntry) {
  try {
    return await apiCall('POST', 'user_audit_log', logEntry);
  } catch (e) {
    console.log('Audit log table not available:', e);
    return null;
  }
}
