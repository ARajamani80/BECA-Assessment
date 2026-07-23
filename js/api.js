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

    // Ensure email is always included
    if (!data.email) {
      throw new Error('Email is required for assessment taker');
    }

    // Prepare clean data with only valid fields
    const cleanData = {
      email: data.email,
      full_name: data.full_name || null,
      department: data.department || null,
      token: data.token || null,
      status: data.status || 'pending',
      created_at: data.created_at || new Date().toISOString()
    };

    console.log('📤 Inserting taker data:', cleanData);

    const { data: result, error } = await client
      .from('assessment_takers')
      .insert([cleanData])
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('✅ Taker created:', result);
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
// EXPORT TO EXCEL FUNCTIONS (COMPREHENSIVE)
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
  console.log('Exported to', finalFileName);
}

/**
 * Create comprehensive Excel question import template
 * @returns {void}
 */
function downloadQuestionTemplate() {
  if (typeof XLSX === 'undefined') {
    alert('XLSX library not loaded. Please refresh the page.');
    return;
  }

  const wb = XLSX.utils.book_new();

  // ========== INSTRUCTIONS SHEET ==========
  const instructionsData = [
    ['BECA Assessment Question Bank - Excel Import Template'],
    ['Version: 1.0', 'Updated: 2026-07-23'],
    [],
    ['OVERVIEW'],
    ['This template allows you to create or import questions into the BECA Assessment Platform.'],
    ['Each sheet contains a different question type with all required and optional fields.'],
    [],
    ['QUESTION TYPES:'],
    ['MCQ', 'Multiple Choice Question - 4-5 options with one correct answer'],
    ['T/F', 'True/False - Single boolean answer'],
    ['PL', 'Pick List/Dropdown - Select from predefined list'],
    ['FT', 'Free Text with File Upload - Upload files (CAD, PDF, etc.)'],
    ['OL', 'Ordered List/Ranking - Arrange items in correct sequence'],
    ['SA', 'Short Answer - Text response with keyword matching'],
    ['EA', 'Essay Answer - Long-form response with rubric scoring'],
    [],
    ['FIELD DEFINITIONS:'],
    ['Question ID', 'Unique identifier (UUID format) - AUTO-GENERATED if blank'],
    ['Title', 'Question title/name (VARCHAR, max 255 characters)'],
    ['Type', 'Question type code: MCQ, T/F, PL, FT, OL, SA, EA'],
    ['Points', 'Score value for correct answer (INTEGER, 1-100)'],
    ['Category', 'Topic/subject category (VARCHAR, e.g., AutoCAD, Revit, General)'],
    ['Difficulty', 'Easy, Medium, or Hard'],
    ['Question Text', 'Full question prompt (TEXT, detailed description)'],
    ['Question Description', 'Additional context or instructions'],
    ['Image URL', 'URL to question image/diagram (optional)'],
    ['Dataset URL', 'URL or path to reference dataset file'],
    ['Time Limit (seconds)', 'Optional time limit for answering (INTEGER)'],
    [],
    ['HOW TO FILL EACH COLUMN:'],
    ['1. Use appropriate sheet for your question type'],
    ['2. Fill required fields (marked with *)'],
    ['3. Leave optional fields blank if not needed'],
    ['4. For MCQ: List options in Option 1-5 columns'],
    ['5. For T/F: Enter True or False in Correct Answer'],
    ['6. For PL: List dropdown options separated by semicolons'],
    ['7. For OL: List items in Item 1-5, then order (e.g., 2,4,1,3)'],
    ['8. For SA: Provide expected answer and keywords'],
    ['9. For EA: Provide rubric criteria with points'],
    ['10. Copy sample rows and modify as needed'],
    [],
    ['EXAMPLE USAGE:'],
    ['MCQ: Which CAD command opens the file dialog?', 'MCQ', '5', 'AutoCAD', 'Medium', 'Q-001'],
    ['T/F: Revit is parametric', 'T/F', '3', 'Revit', 'Easy', 'True'],
    ['SA: Autocad shortcut for zoom', 'SA', '2', 'AutoCAD', 'Easy', 'Z'],
    [],
    ['SUPPORTED FILE FORMATS:'],
    ['AutoCAD:', '.DWG, .DWT'],
    ['Revit:', '.RVT, .RFA, .RTE, .RFT'],
    ['Inventor:', '.IAM, .IPT, .IPJ'],
    ['Fusion 360:', '.F3D, .F3Z'],
    ['General:', '.PDF, .CSV, .XLSX, .JSON, .JPG, .PNG, .ZIP'],
    [],
    ['TIPS:'],
    ['• Leave Question ID blank for new questions (auto-generated)'],
    ['• Use consistent category names for better organization'],
    ['• Add dataset files for practical, hands-on questions'],
    ['• Review sample rows in each sheet before creating your own'],
    ['• Export existing questions to see the data format'],
    ['• Contact support for format validation or troubleshooting']
  ];

  const wsInstructions = XLSX.utils.aoa_to_sheet(instructionsData);
  wsInstructions['!cols'] = [{ wch: 50 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, wsInstructions, 'INSTRUCTIONS');

  // ========== MCQ SHEET ==========
  const mcqHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL', 'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5',
    'Correct Answer', 'Explanation', 'Dataset URL', 'Time Limit (seconds)', 'Shuffle Options', 'Show All Options'
  ];

  const mcqSamples = [
    [
      'Q-MCQ-001', 'AutoCAD File Dialog Command', 'MCQ', 5, 'AutoCAD', 'Medium',
      'Which command opens the file dialog in AutoCAD?',
      '', 'OPEN', 'NEW', 'SAVE', 'EXIT', '',
      'OPEN', 'The OPEN command is the standard AutoCAD command for opening files. It displays the file selection dialog.',
      '', 30, 'Yes', 'Yes'
    ],
    [
      'Q-MCQ-002', 'Revit Element Type Identification', 'MCQ', 5, 'Revit', 'Medium',
      'Which of the following is a structural element in Revit?',
      '', 'Wall', 'Column', 'Door', 'Window', 'Ceiling',
      'Column', 'Columns are primary structural elements that support loads. While walls can also be structural, columns are specifically designed for vertical load transfer.',
      '', 45, 'Yes', 'Yes'
    ]
  ];

  const mcqData = [mcqHeaders, ...mcqSamples];
  const wsMCQ = XLSX.utils.aoa_to_sheet(mcqData);
  wsMCQ['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
    { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsMCQ, 'MCQ');

  // ========== TRUE/FALSE SHEET ==========
  const tfHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL', 'Correct Answer', 'Explanation', 'Dataset URL', 'Time Limit (seconds)', 'Show Explanation'
  ];

  const tfSamples = [
    [
      'Q-TF-001', 'Revit BIM Basics', 'T/F', 3, 'Revit', 'Easy',
      'Revit is a parametric modeling tool.',
      '', 'True', 'Revit is built on parametric and associative design principles, allowing intelligent relationships between building elements.',
      '', 20, 'Yes'
    ],
    [
      'Q-TF-002', 'AutoCAD 3D Modeling', 'T/F', 3, 'AutoCAD', 'Medium',
      'AutoCAD blocks can contain both 2D and 3D geometry.',
      '', 'True', 'AutoCAD blocks are containers that can hold multiple types of geometry including 2D entities (lines, circles) and 3D solids.',
      '', 25, 'Yes'
    ]
  ];

  const tfData = [tfHeaders, ...tfSamples];
  const wsTF = XLSX.utils.aoa_to_sheet(tfData);
  wsTF['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
    { wch: 40 }, { wch: 25 }, { wch: 12 }, { wch: 40 }, { wch: 25 }, { wch: 12 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTF, 'T/F');

  // ========== PICK LIST SHEET ==========
  const plHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL', 'List Option 1', 'List Option 2', 'List Option 3', 'List Option 4', 'List Option 5',
    'Correct Answer', 'Explanation', 'Dataset URL', 'Time Limit (seconds)'
  ];

  const plSamples = [
    [
      'Q-PL-001', 'Revit Element Type Selection', 'PL', 4, 'Revit', 'Medium',
      'Which element type is primarily used for structural support?',
      '', 'Wall', 'Column', 'Door', 'Window', 'Beam',
      'Column', 'Columns are primary structural elements designed to support vertical loads and transfer them to the foundation.',
      '', 30
    ],
    [
      'Q-PL-002', 'CAD Tool Selection', 'PL', 3, 'AutoCAD', 'Easy',
      'Which tool is used to measure distance in AutoCAD?',
      '', 'Distance', 'Measure', 'Length', 'Dimension', 'Scale',
      'Measure', 'The MEASURE command provides accurate distance measurement between points in AutoCAD drawings.',
      '', 20
    ]
  ];

  const plData = [plHeaders, ...plSamples];
  const wsPL = XLSX.utils.aoa_to_sheet(plData);
  wsPL['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
    { wch: 40 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 30 }, { wch: 25 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsPL, 'PL');

  // ========== FILE UPLOAD SHEET ==========
  const ftHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL', 'Allowed File Types', 'Max File Size (MB)', 'Expected Answer',
    'Dataset URL', 'Time Limit (seconds)', 'Instructions'
  ];

  const ftSamples = [
    [
      'Q-FT-001', 'Upload CAD Site Plan', 'FT', 10, 'AutoCAD', 'Hard',
      'Upload your site plan drawing in AutoCAD format.',
      '', '.DWG, .PDF', 50, 'Detailed site plan with property boundaries, buildings, and landscaping',
      'sample-site-plan.dwg', 300, 'Include all major site features and dimensions'
    ],
    [
      'Q-FT-002', 'Upload Revit Project Model', 'FT', 15, 'Revit', 'Hard',
      'Upload your building information model for analysis.',
      '', '.RVT', 100, 'Complete BIM model with all building systems documented',
      'sample-building.rvt', 600, 'Ensure all parameters and properties are filled in'
    ]
  ];

  const ftData = [ftHeaders, ...ftSamples];
  const wsFT = XLSX.utils.aoa_to_sheet(ftData);
  wsFT['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
    { wch: 40 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 35 },
    { wch: 25 }, { wch: 12 }, { wch: 35 }
  ];
  XLSX.utils.book_append_sheet(wb, wsFT, 'FT');

  // ========== ORDERED LIST SHEET ==========
  const olHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL', 'Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5',
    'Correct Order', 'Explanation', 'Dataset URL', 'Time Limit (seconds)'
  ];

  const olSamples = [
    [
      'Q-OL-001', 'CAD Workflow Steps', 'OL', 6, 'AutoCAD', 'Medium',
      'Order these steps in the correct sequence for creating a technical drawing:',
      '', 'Draw geometry', 'Apply constraints', 'Add dimensions', 'Export to PDF', '',
      '1,2,3,4', 'First draw the base geometry, then apply constraints, add dimensions for clarity, and finally export the completed drawing.',
      '', 60
    ],
    [
      'Q-OL-002', 'BIM Project Setup Steps', 'OL', 8, 'Revit', 'Medium',
      'Arrange these BIM project setup steps in correct order:',
      '', 'Create project template', 'Set coordinate system', 'Configure levels', 'Add building systems', 'Coordinate with consultants',
      '1,2,3,4,5', 'Start with template selection, establish coordinate systems, define floor levels, add mechanical/electrical systems, and finally coordinate between disciplines.',
      '', 90
    ]
  ];

  const olData = [olHeaders, ...olSamples];
  const wsOL = XLSX.utils.aoa_to_sheet(olData);
  wsOL['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
    { wch: 40 }, { wch: 25 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    { wch: 15 }, { wch: 40 }, { wch: 25 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsOL, 'OL');

  // ========== SHORT ANSWER SHEET ==========
  const saHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL', 'Expected Answer', 'Keyword 1', 'Keyword 2', 'Keyword 3', 'Keyword 4', 'Keyword 5',
    'Explanation', 'Case Sensitive', 'Dataset URL', 'Time Limit (seconds)'
  ];

  const saSamples = [
    [
      'Q-SA-001', 'AutoCAD Zoom Shortcut', 'SA', 2, 'AutoCAD', 'Easy',
      'What is the keyboard shortcut for the ZOOM command in AutoCAD?',
      '', 'Z', 'Z', 'zoom', 'shortcut', '', '',
      'The keyboard shortcut Z activates the ZOOM command in AutoCAD. You can also type ZOOM in the command line.',
      'No', '', 15
    ],
    [
      'Q-SA-002', 'BIM Coordination Challenge', 'SA', 5, 'Revit', 'Medium',
      'Name the Revit tool used to detect clashes between building systems.',
      '', 'Interference Check', 'Interference', 'Clash', 'Check', 'Detection', '',
      'The Interference Check tool in Revit identifies overlapping elements and conflicts between MEP and structural systems.',
      'No', '', 30
    ]
  ];

  const saData = [saHeaders, ...saSamples];
  const wsSA = XLSX.utils.aoa_to_sheet(saData);
  wsSA['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
    { wch: 40 }, { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 35 }, { wch: 12 }, { wch: 25 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsSA, 'SA');

  // ========== ESSAY SHEET ==========
  const eaHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL', 'Min Words', 'Max Words',
    'Rubric Criteria 1', 'Rubric Points 1', 'Rubric Criteria 2', 'Rubric Points 2', 'Rubric Criteria 3', 'Rubric Points 3',
    'Explanation', 'Dataset URL', 'Time Limit (seconds)'
  ];

  const eaSamples = [
    [
      'Q-EA-001', 'CAD Drawing Analysis', 'EA', 15, 'AutoCAD', 'Hard',
      'Analyze the provided CAD drawing and describe the design intent, building components, and technical requirements.',
      '', 100, 500,
      'Understanding and Technical Knowledge', 5, 'Clarity and Organization', 5, 'Detail and Completeness', 5,
      'Comprehensive analysis should address design purpose, structural elements, spatial relationships, and any special requirements.',
      'sample-drawing.dwg', 600
    ],
    [
      'Q-EA-002', 'BIM Implementation Strategy', 'EA', 20, 'Revit', 'Hard',
      'Develop and explain a BIM implementation strategy for a large-scale construction project including team roles, workflow, and deliverables.',
      '', 150, 750,
      'Strategic Planning and Feasibility', 7, 'BIM Expertise and Standards', 7, 'Implementation Detail and Timeline', 6,
      'Answer should demonstrate understanding of BIM workflows, collaborative processes, required software, and project delivery methods.',
      'sample-bim-project.rvt', 900
    ]
  ];

  const eaData = [eaHeaders, ...eaSamples];
  const wsEA = XLSX.utils.aoa_to_sheet(eaData);
  wsEA['!cols'] = [
    { wch: 15 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 15 }, { wch: 12 },
    { wch: 40 }, { wch: 25 }, { wch: 10 }, { wch: 10 },
    { wch: 25 }, { wch: 10 }, { wch: 25 }, { wch: 10 }, { wch: 25 }, { wch: 10 },
    { wch: 40 }, { wch: 25 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, wsEA, 'EA');

  // ========== BULK IMPORT SHEET ==========
  const bulkHeaders = [
    'Question ID', 'Title', 'Type', 'Points', 'Category', 'Difficulty',
    'Question Text', 'Image URL',
    'Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5',
    'List Option 1', 'List Option 2', 'List Option 3',
    'Item 1', 'Item 2', 'Item 3',
    'Expected Answer', 'Keywords',
    'Correct Answer', 'Explanation',
    'File Types', 'Max File Size (MB)',
    'Min Words', 'Max Words', 'Rubric',
    'Dataset URL', 'Time Limit (seconds)'
  ];

  const bulkSamples = [
    [
      'Q-MCQ-BULK-001', 'MCQ Example', 'MCQ', 5, 'AutoCAD', 'Medium',
      'Which command opens the file dialog?', '',
      'OPEN', 'NEW', 'SAVE', 'EXIT', '',
      '', '', '',
      '', '', '',
      '', '',
      'OPEN', 'OPEN is the standard command to open files in AutoCAD.',
      '', '',
      '', '', '',
      '', 30
    ],
    [
      'Q-TF-BULK-001', 'T/F Example', 'T/F', 3, 'Revit', 'Easy',
      'Revit uses parametric design.', '',
      '', '', '', '', '',
      '', '', '',
      '', '', '',
      '', '',
      'True', 'Revit is built on parametric design principles.',
      '', '',
      '', '', '',
      '', 20
    ],
    [
      'Q-PL-BULK-001', 'Pick List Example', 'PL', 4, 'Revit', 'Medium',
      'Which is a structural element?', '',
      '', '', '', '', '',
      'Wall', 'Column', 'Door', '', '',
      '', '', '',
      '', '',
      'Column', 'Columns provide vertical structural support.',
      '', '',
      '', '', '',
      '', 30
    ],
    [
      'Q-SA-BULK-001', 'Short Answer Example', 'SA', 2, 'AutoCAD', 'Easy',
      'Keyboard shortcut for zoom?', '',
      '', '', '', '', '',
      '', '', '',
      '', '', '',
      'Z', 'zoom; Z shortcut',
      '', 'The Z key activates ZOOM in AutoCAD.',
      '', '',
      '', '', '',
      '', 15
    ],
    [
      'Q-OL-BULK-001', 'Ordered List Example', 'OL', 6, 'AutoCAD', 'Medium',
      'Order the CAD workflow steps:', '',
      '', '', '', '', '',
      '', '', '',
      'Draw geometry', 'Apply constraints', 'Add dimensions',
      '', '',
      '1,2,3', 'Follow the standard workflow: geometry, constraints, then dimensions.',
      '', '',
      '', '', '',
      '', 60
    ],
    [
      'Q-EA-BULK-001', 'Essay Example', 'EA', 15, 'Revit', 'Hard',
      'Analyze the BIM model and explain the design strategy.', '',
      '', '', '', '', '',
      '', '', '',
      '', '', '',
      '', '',
      '', 'Analysis should address design purpose and coordination.',
      '', '',
      100, 500, 'Understanding(5);Clarity(5);Detail(5)',
      'sample-model.rvt', 600
    ],
    [
      'Q-FT-BULK-001', 'File Upload Example', 'FT', 10, 'AutoCAD', 'Hard',
      'Upload your CAD drawing:', '',
      '', '', '', '', '',
      '', '', '',
      '', '', '',
      '', '',
      '', '',
      '.DWG,.PDF', 50,
      '', '', '',
      '', 300
    ]
  ];

  const bulkData = [bulkHeaders, ...bulkSamples];
  const wsBulk = XLSX.utils.aoa_to_sheet(bulkData);
  wsBulk['!cols'] = Array(bulkHeaders.length).fill({ wch: 15 });
  XLSX.utils.book_append_sheet(wb, wsBulk, 'BULK IMPORT');

  // Write file
  XLSX.writeFile(wb, 'BECA-Questions-Complete-Template.xlsx');
  console.log('Downloaded question template successfully');
}

/**
 * Export questions to Excel with comprehensive fields
 * @param {array} questionsData - Questions array
 * @returns {void}
 */
function exportQuestionsToExcel(questionsData) {
  if (typeof XLSX === 'undefined') {
    alert('XLSX library not loaded. Please refresh the page.');
    return;
  }

  if (!questionsData || questionsData.length === 0) {
    alert('No questions to export');
    return;
  }

  const wb = XLSX.utils.book_new();

  // Group questions by type
  const groupedByType = {};
  questionsData.forEach(q => {
    const type = q.question_type || 'unknown';
    if (!groupedByType[type]) {
      groupedByType[type] = [];
    }
    groupedByType[type].push(q);
  });

  // Create MCQ sheet
  if (groupedByType['mcq']) {
    const mcqData = groupedByType['mcq'].map(q => ({
      'Question ID': q.id || '',
      'Title': q.title || '',
      'Type': 'MCQ',
      'Points': q.points || 0,
      'Category': q.category || '',
      'Difficulty': q.difficulty || '',
      'Question Text': q.question_text || '',
      'Image URL': q.image_url || '',
      'Option 1': q.options?.[0]?.text || '',
      'Option 2': q.options?.[1]?.text || '',
      'Option 3': q.options?.[2]?.text || '',
      'Option 4': q.options?.[3]?.text || '',
      'Option 5': q.options?.[4]?.text || '',
      'Correct Answer': q.options?.find(o => o.correct)?.text || '',
      'Explanation': q.explanation || '',
      'Dataset URL': q.dataset_url || '',
      'Time Limit (seconds)': q.time_limit_seconds || '',
      'Shuffle Options': q.shuffle_options ? 'Yes' : 'No',
      'Show All Options': 'Yes'
    }));
    const wsMCQ = XLSX.utils.json_to_sheet(mcqData);
    XLSX.utils.book_append_sheet(wb, wsMCQ, 'MCQ');
  }

  // Create T/F sheet
  if (groupedByType['true_false']) {
    const tfData = groupedByType['true_false'].map(q => ({
      'Question ID': q.id || '',
      'Title': q.title || '',
      'Type': 'T/F',
      'Points': q.points || 0,
      'Category': q.category || '',
      'Difficulty': q.difficulty || '',
      'Question Text': q.question_text || '',
      'Image URL': q.image_url || '',
      'Correct Answer': q.correct_answer || '',
      'Explanation': q.explanation || '',
      'Dataset URL': q.dataset_url || '',
      'Time Limit (seconds)': q.time_limit_seconds || '',
      'Show Explanation': 'Yes'
    }));
    const wsTF = XLSX.utils.json_to_sheet(tfData);
    XLSX.utils.book_append_sheet(wb, wsTF, 'T/F');
  }

  // Create PL sheet
  if (groupedByType['pick_list']) {
    const plData = groupedByType['pick_list'].map(q => ({
      'Question ID': q.id || '',
      'Title': q.title || '',
      'Type': 'PL',
      'Points': q.points || 0,
      'Category': q.category || '',
      'Difficulty': q.difficulty || '',
      'Question Text': q.question_text || '',
      'Image URL': q.image_url || '',
      'List Options': Array.isArray(q.list_options) ? q.list_options.join('; ') : q.list_options || '',
      'Correct Answer': q.correct_answer || '',
      'Explanation': q.explanation || '',
      'Dataset URL': q.dataset_url || '',
      'Time Limit (seconds)': q.time_limit_seconds || ''
    }));
    const wsPL = XLSX.utils.json_to_sheet(plData);
    XLSX.utils.book_append_sheet(wb, wsPL, 'PL');
  }

  // Create FT sheet
  if (groupedByType['file_upload']) {
    const ftData = groupedByType['file_upload'].map(q => ({
      'Question ID': q.id || '',
      'Title': q.title || '',
      'Type': 'FT',
      'Points': q.points || 0,
      'Category': q.category || '',
      'Difficulty': q.difficulty || '',
      'Question Text': q.question_text || '',
      'Image URL': q.image_url || '',
      'Allowed File Types': Array.isArray(q.allowed_file_types) ? q.allowed_file_types.join(', ') : q.allowed_file_types || '',
      'Max File Size (MB)': q.max_file_size_mb || '',
      'Expected Answer': q.expected_answer || '',
      'Dataset URL': q.dataset_url || '',
      'Time Limit (seconds)': q.time_limit_seconds || '',
      'Instructions': q.file_upload_instructions || ''
    }));
    const wsFT = XLSX.utils.json_to_sheet(ftData);
    XLSX.utils.book_append_sheet(wb, wsFT, 'FT');
  }

  // Create OL sheet
  if (groupedByType['ordered_list']) {
    const olData = groupedByType['ordered_list'].map(q => ({
      'Question ID': q.id || '',
      'Title': q.title || '',
      'Type': 'OL',
      'Points': q.points || 0,
      'Category': q.category || '',
      'Difficulty': q.difficulty || '',
      'Question Text': q.question_text || '',
      'Image URL': q.image_url || '',
      'List Items': Array.isArray(q.list_items) ? q.list_items.join('; ') : q.list_items || '',
      'Correct Order': q.correct_order || '',
      'Explanation': q.explanation || '',
      'Dataset URL': q.dataset_url || '',
      'Time Limit (seconds)': q.time_limit_seconds || ''
    }));
    const wsOL = XLSX.utils.json_to_sheet(olData);
    XLSX.utils.book_append_sheet(wb, wsOL, 'OL');
  }

  // Create SA sheet
  if (groupedByType['shortanswer']) {
    const saData = groupedByType['shortanswer'].map(q => ({
      'Question ID': q.id || '',
      'Title': q.title || '',
      'Type': 'SA',
      'Points': q.points || 0,
      'Category': q.category || '',
      'Difficulty': q.difficulty || '',
      'Question Text': q.question_text || '',
      'Image URL': q.image_url || '',
      'Expected Answer': q.expected_answer || '',
      'Keywords': Array.isArray(q.keywords) ? q.keywords.join('; ') : q.keywords || '',
      'Explanation': q.explanation || '',
      'Case Sensitive': q.case_sensitive ? 'Yes' : 'No',
      'Dataset URL': q.dataset_url || '',
      'Time Limit (seconds)': q.time_limit_seconds || ''
    }));
    const wsSA = XLSX.utils.json_to_sheet(saData);
    XLSX.utils.book_append_sheet(wb, wsSA, 'SA');
  }

  // Create EA sheet
  if (groupedByType['essay']) {
    const eaData = groupedByType['essay'].map(q => ({
      'Question ID': q.id || '',
      'Title': q.title || '',
      'Type': 'EA',
      'Points': q.points || 0,
      'Category': q.category || '',
      'Difficulty': q.difficulty || '',
      'Question Text': q.question_text || '',
      'Image URL': q.image_url || '',
      'Min Words': q.min_words || '',
      'Max Words': q.max_words || '',
      'Rubric': q.rubric_items ? JSON.stringify(q.rubric_items) : '',
      'Explanation': q.explanation || '',
      'Dataset URL': q.dataset_url || '',
      'Time Limit (seconds)': q.time_limit_seconds || ''
    }));
    const wsEA = XLSX.utils.json_to_sheet(eaData);
    XLSX.utils.book_append_sheet(wb, wsEA, 'EA');
  }

  // Create ALL QUESTIONS summary sheet
  const allQuestionsData = questionsData.map(q => ({
    'Question ID': q.id || '',
    'Title': q.title || '',
    'Type': getQuestionTypeCode(q.question_type),
    'Points': q.points || 0,
    'Category': q.category || '',
    'Difficulty': q.difficulty || '',
    'Question Text': q.question_text || '',
    'Created': q.created_at ? new Date(q.created_at).toISOString().split('T')[0] : '',
    'Updated': q.updated_at ? new Date(q.updated_at).toISOString().split('T')[0] : '',
    'Created By': q.created_by || ''
  }));
  const wsAll = XLSX.utils.json_to_sheet(allQuestionsData);
  XLSX.utils.book_append_sheet(wb, wsAll, 'ALL QUESTIONS');

  // Write file
  const timestamp = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `BECA-Questions-Export-${timestamp}.xlsx`);
  console.log('Exported questions successfully');
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
