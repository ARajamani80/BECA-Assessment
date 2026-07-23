// BECA Assessment Platform - API Module (Supabase)
// Uses global getSupabaseClient from index.html HEAD script
// This file just provides API functions that use the global client
// Updated: 2026-07-23 - Supabase initialization fix

// Note: getSupabaseClient() is defined in index.html HEAD script
// If it doesn't exist, create a fallback
if (typeof getSupabaseClient !== 'function') {
  console.warn('⚠ getSupabaseClient not found in global scope, creating fallback');

  const SUPABASE_URL = 'https://fgzqgqwlyeubudnbxsmx.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnenFncXdseWV1YnVkbmJ4c214Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0MTc5NTIsImV4cCI6MjA5NDk5Mzk1Mn0.J6lWx23ukNGihKgLtdCeoq4WOR75eSFyGYrb6_YS9q0';

  let supabase = null;
  let supabaseReady = false;

  async function initSupabase() {
    let attempts = 0;
    while (!window.supabase && attempts < 100) {
      await new Promise(r => setTimeout(r, 50));
      attempts++;
    }
    if (window.supabase) {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      supabaseReady = true;
      console.log('✓ Supabase initialized in api.js fallback');
    } else {
      console.error('✗ Supabase library failed to load');
    }
  }

  window.getSupabaseClient = async function() {
    if (!supabaseReady) await initSupabase();
    return supabase;
  };

  initSupabase();
}


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

/**
 * Upload question dataset to Supabase storage
 * @param {string} questionId - Question ID
 * @param {File} file - File to upload
 * @returns {Promise<string>} File path in storage
 */
async function uploadQuestionDataset(questionId, file) {
  try {
    const client = await getSupabaseClient();

    if (!file) {
      throw new Error('No file provided');
    }

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const filePath = `questions/${questionId}/${fileName}`;

    // Upload file to storage
    const { data, error } = await client.storage
      .from('assessment-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = client.storage
      .from('assessment-files')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading dataset:', error);
    throw error;
  }
}

/**
 * Delete question dataset from storage
 * @param {string} questionId - Question ID
 * @param {string} fileName - File name to delete
 * @returns {Promise<void>}
 */
async function deleteQuestionDataset(questionId, fileName) {
  try {
    const client = await getSupabaseClient();
    const filePath = `questions/${questionId}/${fileName}`;

    const { error } = await client.storage
      .from('assessment-files')
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting dataset:', error);
    throw error;
  }
}

/**
 * Get public URL for question dataset
 * @param {string} questionId - Question ID
 * @param {string} fileName - File name
 * @returns {string} Public URL
 */
function getQuestionDatasetUrl(questionId, fileName) {
  const filePath = `questions/${questionId}/${fileName}`;
  return `https://fgzqgqwlyeubudnbxsmx.supabase.co/storage/v1/object/public/assessment-files/${filePath}`;
}

/**
 * Delete assessment taker
 * @param {string} id - Taker ID
 * @returns {Promise<void>}
 */
async function deleteAssessmentTaker(id) {
  try {
    const client = await getSupabaseClient();
    const { error } = await client
      .from('assessment_takers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting taker:', error);
    throw error;
  }
}

// ============================================================================
// EXPORT TO EXCEL FUNCTIONS (NEW)
// ============================================================================

/**
 * Supported Autodesk file formats
 */
const AUTODESK_FILE_FORMATS = {
  autocad: ['.dwg', '.dwt'],
  revit: ['.rvt', '.rfa', '.rte', '.rft'],
  inventor: ['.iam', '.ipt', '.ipj'],
  fusion: ['.f3d', '.f3z'],
};

const ALL_AUTODESK_FORMATS = Object.values(AUTODESK_FILE_FORMATS)
  .flat()
  .map(ext => ext.substring(1).toUpperCase())
  .join(', ');

/**
 * Validate if file is a supported Autodesk format
 * @param {File} file - File to validate
 * @returns {boolean} True if file is supported format
 */
function isValidAutodeskFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return Object.values(AUTODESK_FILE_FORMATS).flat().includes(ext);
}

/**
 * Validate file size (max 100MB for CAD files)
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default 100)
 * @returns {object} {valid: boolean, message: string}
 */
function validateFileSize(file, maxSizeMB = 100) {
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      message: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum of ${maxSizeMB}MB`
    };
  }
  if (file.size > 50 * 1024 * 1024) {
    return {
      valid: true,
      warning: `File is ${(file.size / (1024 * 1024)).toFixed(2)}MB. Large files may take longer to upload.`
    };
  }
  return { valid: true };
}

/**
 * Get MIME type for Autodesk file format
 * @param {string} fileName - File name with extension
 * @returns {string} MIME type
 */
function getAutodeskMimeType(fileName) {
  const ext = '.' + fileName.split('.').pop().toLowerCase();
  const mimeTypes = {
    '.dwg': 'application/vnd.autodesk.autocad.drawing',
    '.dwt': 'application/vnd.autodesk.autocad.template',
    '.rvt': 'application/vnd.autodesk.revit.project',
    '.rfa': 'application/vnd.autodesk.revit.family',
    '.rte': 'application/vnd.autodesk.revit.template',
    '.rft': 'application/vnd.autodesk.revit.family.template',
    '.iam': 'application/vnd.autodesk.inventor.assembly',
    '.ipt': 'application/vnd.autodesk.inventor.part',
    '.ipj': 'application/vnd.autodesk.inventor.project',
    '.f3d': 'application/vnd.autodesk.fusion360.project',
    '.f3z': 'application/vnd.autodesk.fusion360.archive'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

/**
 * Get all supported file MIME types for file input
 * @returns {string} Comma-separated MIME types
 */
function getSupportedMimeTypes() {
  return [
    'application/vnd.autodesk.autocad.drawing',
    'application/vnd.autodesk.autocad.template',
    'application/vnd.autodesk.revit.project',
    'application/vnd.autodesk.revit.family',
    'application/vnd.autodesk.revit.template',
    'application/vnd.autodesk.revit.family.template',
    'application/vnd.autodesk.inventor.assembly',
    'application/vnd.autodesk.inventor.part',
    'application/vnd.autodesk.inventor.project',
    'application/vnd.autodesk.fusion360.project',
    'application/vnd.autodesk.fusion360.archive',
    'application/zip',
    'application/pdf',
    'image/jpeg',
    'image/png'
  ].join(',');
}

/**
 * Export data to Excel file
 * @param {array} data - Array of objects to export
 * @param {string} fileName - File name without extension
 * @param {string} sheetName - Sheet name (default: 'Data')
 * @returns {void}
 */
function exportToExcel(data, fileName, sheetName = 'Data') {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Ensure XLSX library is available
  if (typeof XLSX === 'undefined') {
    console.error('XLSX library not loaded');
    return;
  }

  // Create workbook and worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Auto-adjust column widths
  const colWidths = [];
  if (data.length > 0) {
    const firstRow = data[0];
    Object.keys(firstRow).forEach((key, i) => {
      const maxLength = Math.max(
        key.length,
        ...data.map(row => {
          const val = row[key];
          return val ? String(val).length : 0;
        })
      );
      colWidths[i] = { wch: Math.min(maxLength + 2, 50) };
    });
  }
  ws['!cols'] = colWidths;

  // Generate file name with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFileName = `${fileName}-${timestamp}.xlsx`;

  // Write file
  XLSX.writeFile(wb, finalFileName);
  console.log('✓ Exported to', finalFileName);
}

/**
 * Export questions to Excel
 * @param {array} questionsData - Questions array
 * @returns {void}
 */
function exportQuestionsToExcel(questionsData) {
  const exportData = questionsData.map(q => ({
    'Question ID': q.id,
    'Type Code': getQuestionTypeCode(q.question_type),
    'Type': getQuestionTypeLabel(q.question_type),
    'Text': q.question_text,
    'Points': q.points || 0,
    'Category': q.category || '',
    'Difficulty': q.difficulty || '',
    'Description': q.question_description || '',
    'Dataset File': q.dataset_file || '',
    'Created': q.created_at ? new Date(q.created_at).toISOString().split('T')[0] : ''
  }));

  exportToExcel(exportData, 'BECA-Questions', 'Questions');
}

/**
 * Export modules to Excel
 * @param {array} modulesData - Modules array
 * @returns {void}
 */
function exportModulesToExcel(modulesData) {
  const exportData = modulesData.map(m => ({
    'Module ID': m.id,
    'Name': m.name,
    'Description': m.description || '',
    'Questions Count': m.questions_count || 0,
    'Created': m.created_at ? new Date(m.created_at).toISOString().split('T')[0] : ''
  }));

  exportToExcel(exportData, 'BECA-Modules', 'Modules');
}

/**
 * Export assessments to Excel
 * @param {array} assessmentsData - Assessments array
 * @returns {void}
 */
function exportAssessmentsToExcel(assessmentsData) {
  const exportData = assessmentsData.map(a => ({
    'Assessment ID': a.id,
    'Name': a.name,
    'Description': a.description || '',
    'Status': a.status || 'draft',
    'Created': a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '',
    'Updated': a.updated_at ? new Date(a.updated_at).toISOString().split('T')[0] : ''
  }));

  exportToExcel(exportData, 'BECA-Assessments', 'Assessments');
}

/**
 * Export assessment takers to Excel
 * @param {array} takersData - Takers array
 * @returns {void}
 */
function exportTakersToExcel(takersData) {
  const exportData = takersData.map(t => ({
    'Taker ID': t.id,
    'Name': t.name,
    'Email': t.email,
    'Assessment': t.assessment_name || '',
    'Status': t.status || 'pending',
    'Score': t.score !== null ? t.score : '',
    'Assigned': t.created_at ? new Date(t.created_at).toISOString().split('T')[0] : '',
    'Submitted': t.submitted_at ? new Date(t.submitted_at).toISOString().split('T')[0] : ''
  }));

  exportToExcel(exportData, 'BECA-Takers', 'Assessment Takers');
}

/**
 * Export results to Excel
 * @param {array} resultsData - Results array
 * @returns {void}
 */
function exportResultsToExcel(resultsData) {
  const exportData = resultsData.map(r => ({
    'Result ID': r.id,
    'Taker': r.taker_name || '',
    'Assessment': r.assessment_name || '',
    'Score': r.score || 0,
    'Total Points': r.total_points || 0,
    'Percentage': r.percentage ? `${r.percentage.toFixed(2)}%` : '',
    'Status': r.status || 'pending',
    'Submitted': r.submitted_at ? new Date(r.submitted_at).toISOString().split('T')[0] : ''
  }));

  exportToExcel(exportData, 'BECA-Results', 'Results');
}

/**
 * Get question type code (MCQ, T/F, PL, FT, OL)
 * @param {string} type - Question type
 * @returns {string} Type code
 */
function getQuestionTypeCode(type) {
  const codes = {
    'mcq': 'MCQ',
    'multiple_choice': 'MCQ',
    'truefalse': 'T/F',
    'true_false': 'T/F',
    'tf': 'T/F',
    'picklist': 'PL',
    'pick_list': 'PL',
    'dropdown': 'PL',
    'fileupload': 'FT',
    'file_upload': 'FT',
    'orderedlist': 'OL',
    'ordered_list': 'OL',
    'ranking': 'OL',
    'shortanswer': 'SA',
    'short_answer': 'SA',
    'essay': 'EA',
    'freetext': 'FT',
    'free_text': 'FT'
  };
  return codes[type?.toLowerCase()] || type || 'UNKNOWN';
}

/**
 * Get question type label
 * @param {string} type - Question type
 * @returns {string} Type label
 */
function getQuestionTypeLabel(type) {
  const labels = {
    'mcq': 'Multiple Choice Question',
    'multiple_choice': 'Multiple Choice Question',
    'truefalse': 'True/False',
    'true_false': 'True/False',
    'tf': 'True/False',
    'picklist': 'Pick List',
    'pick_list': 'Pick List',
    'dropdown': 'Pick List',
    'fileupload': 'File Upload',
    'file_upload': 'File Upload',
    'orderedlist': 'Ordered List',
    'ordered_list': 'Ordered List',
    'ranking': 'Ordered List',
    'shortanswer': 'Short Answer',
    'short_answer': 'Short Answer',
    'essay': 'Essay',
    'freetext': 'Free Text',
    'free_text': 'Free Text'
  };
  return labels[type?.toLowerCase()] || type || 'Unknown';
}
