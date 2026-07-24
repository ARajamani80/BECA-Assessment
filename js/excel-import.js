// ============================================================================
// EXCEL IMPORT MODULE - Bulk Question Import
// Modal-based approach with proper file handling
// ============================================================================

let importState = {
  file: null,
  rawData: [],
  processedQuestions: [],
  validationErrors: [],
  currentStep: 'upload',
  assessmentId: null
};

/**
 * Open Excel import modal
 */
async function openExcelImportModal() {
  try {
    console.log('📂 Opening Excel import modal...');

    // Get or create file input
    let fileInput = document.getElementById('globalExcelFileInput');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'globalExcelFileInput';
      fileInput.accept = '.xlsx,.xls';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }

    // Ensure assessments are loaded
    if (!window.allAssessments || window.allAssessments.length === 0) {
      console.log('📋 Loading assessments...');
      window.allAssessments = await getAllAssessments();
    }

    console.log('📊 Available assessments:', window.allAssessments?.length || 0);

    // Create modal content
    const assessmentOptions = (window.allAssessments && window.allAssessments.length > 0)
      ? window.allAssessments.map(a =>
          `<option value="${a.id}">${a.title}</option>`
        ).join('')
      : '';

    // Show warning if no assessments
    let assessmentHtml = `
      <h3>1. Select Assessment</h3>
      <select id="importAssessmentSelect" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 10px;">
        <option value="">-- Select an assessment --</option>
        ${assessmentOptions}
      </select>
      <p style="color: #666; font-size: 12px; margin: 5px 0;">Questions will be added to this assessment</p>
    `;

    if (!assessmentOptions) {
      assessmentHtml = `
        <h3>⚠️ No Assessments Found</h3>
        <div style="background: #fef3c7; padding: 12px; border-radius: 4px; border-left: 4px solid #f59e0b; margin-bottom: 15px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            Please create an assessment first before importing questions.
          </p>
        </div>
      `;
    }

    const modalContent = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">📊 Import Questions from Excel</h2>
        <button onclick="closeModal('excelImportModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <div id="importStep1" style="display: block;">
        <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          ${assessmentHtml}

          <h3 style="margin-top: 20px;">2. Select Excel File</h3>
          <p style="color: #666; font-size: 13px; margin: 10px 0;">
            Use the BECA-Question-Import-Template.xlsx with 19 columns
          </p>

          <div style="border: 2px dashed #3b82f6; border-radius: 8px; padding: 30px; text-align: center; background: white; margin: 20px 0;">
            <div style="font-size: 48px; margin-bottom: 10px;">📁</div>
            <div id="fileDisplay" style="font-weight: bold; margin-bottom: 10px;">No file selected</div>
            <button type="button" class="btn btn-primary" onclick="document.getElementById('globalExcelFileInput').click();">
              <i class="fas fa-upload"></i> Choose File
            </button>
          </div>

          <div id="fileInfo" style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 4px; display: none;">
            <div><strong>📄 File:</strong> <span id="fileName">-</span></div>
            <div style="font-size: 12px; color: #666; margin-top: 5px;">Ready to process</div>
          </div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn btn-secondary" onclick="closeModal('excelImportModal')">Cancel</button>
          <button type="button" class="btn btn-success" id="importStartBtn" onclick="startImport()" disabled>
            <i class="fas fa-arrow-right"></i> Process & Import
          </button>
        </div>
      </div>

      <div id="importStep2" style="display: none; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
        <h3>Importing Questions...</h3>
        <div id="progressBar" style="width: 100%; height: 30px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 20px 0;">
          <div id="progressFill" style="width: 0%; height: 100%; background: #3b82f6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">0%</div>
        </div>
        <div id="progressText" style="font-size: 14px; color: #666;">Initializing...</div>
      </div>

      <div id="importStep3" style="display: none;">
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
          <h3 style="color: #059669; margin-top: 0;">✅ Import Complete!</h3>
          <div id="resultSummary" style="font-size: 14px;"></div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button type="button" class="btn btn-success" onclick="closeModal('excelImportModal'); renderQuestions();">
            <i class="fas fa-check"></i> Done
          </button>
        </div>
      </div>
    `;

    document.getElementById('excelImportModalContent').innerHTML = modalContent;
    showModal('excelImportModal');

    // Attach event listeners after modal is rendered
    setTimeout(() => {
      // File selection handler
      fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
          console.log('✅ File selected:', file.name, 'Size:', file.size);
          importState.file = file;
          document.getElementById('fileDisplay').textContent = file.name;
          document.getElementById('fileName').textContent = file.name;
          document.getElementById('fileInfo').style.display = 'block';
          document.getElementById('importStartBtn').disabled = false;
        }
      };

      // Attach button click handlers with addEventListener
      const importBtn = document.getElementById('importStartBtn');
      if (importBtn) {
        // Remove old listeners by replacing
        const newBtn = importBtn.cloneNode(true);
        importBtn.parentNode.replaceChild(newBtn, importBtn);

        // Add new listener
        document.getElementById('importStartBtn').addEventListener('click', async (e) => {
          e.preventDefault();
          console.log('🔘 Import button clicked');
          await startImport();
        });
      }

      const cancelBtn = document.querySelector('button[onclick="closeModal(\'excelImportModal\')"]');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
          e.preventDefault();
          closeModal('excelImportModal');
        });
      }

      console.log('✅ Modal event handlers attached');
    }, 100);


  } catch (error) {
    console.error('Error opening modal:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Start import process
 */
async function startImport() {
  try {
    console.log('🔘 startImport() called');

    // Validate assessment selection
    const assessmentSelect = document.getElementById('importAssessmentSelect');
    console.log('Assessment select element:', assessmentSelect);
    console.log('Assessment value:', assessmentSelect?.value);

    if (!assessmentSelect || !assessmentSelect.value) {
      const msg = '❌ Please select an assessment first';
      console.error(msg);
      showMessage(msg, 'error');
      return;
    }
    importState.assessmentId = assessmentSelect.value;
    console.log('✅ Assessment selected:', importState.assessmentId);

    if (!importState.file) {
      const msg = '❌ No file selected. Please choose an Excel file.';
      console.error(msg);
      showMessage(msg, 'error');
      return;
    }

    console.log('🚀 Starting import of', importState.file.name, 'to assessment:', importState.assessmentId);

    // Show progress
    document.getElementById('importStep1').style.display = 'none';
    document.getElementById('importStep2').style.display = 'block';
    document.getElementById('progressText').textContent = 'Reading file...';

    // Read file
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        if (typeof XLSX === 'undefined') {
          throw new Error('XLSX library not loaded');
        }

        document.getElementById('progressText').textContent = 'Parsing Excel...';
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet);

        console.log('📊 Found', rawRows.length, 'rows');

        if (rawRows.length === 0) {
          throw new Error('No data found in Excel file');
        }

        // Process and validate
        const mapping = autoDetectColumnMapping(rawRows);
        const processed = processQuestions(rawRows, mapping);

        if (processed.valid.length === 0) {
          throw new Error(`No valid questions found. ${processed.errors.length} validation errors.`);
        }

        importState.processedQuestions = processed.valid;
        importState.validationErrors = processed.errors;

        console.log(`✅ Processed: ${processed.valid.length} valid questions`);

        // Import questions
        await importQuestions(processed.valid);

      } catch (error) {
        console.error('Error:', error);
        showMessage('❌ ' + error.message, 'error');
        document.getElementById('importStep2').style.display = 'none';
        document.getElementById('importStep1').style.display = 'block';
      }
    };

    reader.onerror = () => {
      showMessage('❌ Error reading file', 'error');
      document.getElementById('importStep2').style.display = 'none';
      document.getElementById('importStep1').style.display = 'block';
    };

    reader.readAsArrayBuffer(importState.file);

  } catch (error) {
    console.error('Error starting import:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Import questions to database
 */
async function importQuestions(questions) {
  try {
    let imported = 0;
    let failed = 0;
    const total = questions.length;

    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      document.getElementById('progressFill').style.width = percent + '%';
      document.getElementById('progressFill').textContent = percent + '%';
      document.getElementById('progressText').textContent = `Importing ${i + 1}/${total}...`;

      try {
        // Add assessment_id to question before inserting
        const questionToInsert = {
          ...questions[i],
          assessment_id: importState.assessmentId
        };

        const client = await getSupabaseClient();
        const { error } = await client
          .from('assessment_questions')
          .insert([questionToInsert])
          .select();

        if (error) throw error;
        imported++;
        console.log(`✅ Q${i + 1} imported successfully`);
      } catch (error) {
        failed++;
        console.warn(`⚠️ Question ${i + 1} failed:`, error.message);
      }
    }

    // Show results
    document.getElementById('importStep2').style.display = 'none';
    document.getElementById('importStep3').style.display = 'block';

    const summary = `
      <div><strong style="color: #059669;">✅ ${imported} questions imported successfully</strong></div>
      ${failed > 0 ? `<div style="color: #dc2626; margin-top: 10px;">❌ ${failed} questions failed</div>` : ''}
      ${importState.validationErrors.length > 0 ? `<div style="color: #d97706; margin-top: 5px;">⚠️ ${importState.validationErrors.length} questions skipped (validation errors)</div>` : ''}
      <div style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 4px; font-size: 13px;">
        <div>Total processed: ${total}</div>
        <div>Success rate: ${Math.round((imported / total) * 100)}%</div>
      </div>
    `;
    document.getElementById('resultSummary').innerHTML = summary;

    console.log(`✅ IMPORT COMPLETE: ${imported}/${total} questions imported, ${failed} failed`);
    if (imported > 0) {
      showMessage(`✅ Imported ${imported}/${total} questions!`, 'success');
    } else {
      showMessage(`❌ Failed to import any questions. Check the browser console for details.`, 'error');
    }

  } catch (error) {
    console.error('Error importing:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Auto-detect column mapping - more flexible for various Excel formats
 */
function autoDetectColumnMapping(rows) {
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const headers = Object.keys(firstRow);
  const mapping = {};

  headers.forEach(header => {
    const lower = header.toLowerCase().trim();

    // Question text - try multiple variations
    if (!mapping.question_text) {
      if ((lower.includes('question') && (lower.includes('text') || lower.includes('prompt'))) ||
          lower === 'question' || lower === 'q' || lower.includes('question_text')) {
        mapping.question_text = header;
      }
    }

    // Question type
    if (!mapping.question_type) {
      if (lower.includes('type') || lower.includes('question_type') || lower === 'qtype') {
        mapping.question_type = header;
      }
    }

    // Correct answer
    if (!mapping.correct_answer) {
      if ((lower.includes('answer') && !lower.includes('all') && !lower.includes('option') && !lower.includes('true') && !lower.includes('false')) ||
          lower === 'answer' || lower === 'correct') {
        mapping.correct_answer = header;
      }
    }

    // Difficulty
    if (!mapping.difficulty) {
      if (lower.includes('difficulty') || lower.includes('level') || lower.includes('skill')) {
        mapping.difficulty = header;
      }
    }

    // Category
    if (!mapping.category) {
      if (lower.includes('category') || lower === 'topic') {
        mapping.category = header;
      }
    }

    // Tags
    if (!mapping.tags) {
      if (lower.includes('tag') || lower.includes('keyword')) {
        mapping.tags = header;
      }
    }
  });

  console.log('📋 Auto-detected column mapping:', mapping);
  console.log('📋 Available headers:', headers);
  return mapping;
}

/**
 * Process and validate questions
 */
function processQuestions(rows, mapping) {
  const valid = [];
  const errors = [];

  rows.forEach((row, idx) => {
    try {
      const question = {
        question_text: row[mapping.question_text] || '',
        question_type: (row[mapping.question_type] || '').toLowerCase().trim(),
        correct_answer: row[mapping.correct_answer] || '',
        difficulty: row[mapping.difficulty] || null,
        category: row[mapping.category] || null,
        tags: row[mapping.tags] || null
      };

      // Extract type-specific fields from Excel
      // Note: question.question_type is still unnormalized at this point
      const qType = question.question_type.toLowerCase().trim();

      // MCQ / Multiple Choice - Extract all options
      if (qType.includes('choice') || qType.includes('mcq') || qType.includes('pick')) {
        let options = [];

        // Method 1: AllAnswers column (semicolon-separated)
        const allAnswersCol = Object.keys(row).find(h => h.toLowerCase().includes('allanswers'));
        if (allAnswersCol && row[allAnswersCol]) {
          options = row[allAnswersCol].toString().split(';').map(o => o.trim()).filter(o => o);
        } else {
          // Method 2: Individual Option 1, Option 2, etc. columns
          for (let i = 1; i <= 10; i++) {
            const optionCol = Object.keys(row).find(h => h.toLowerCase() === `option ${i}`);
            if (optionCol && row[optionCol]) {
              options.push(row[optionCol].toString().trim());
            }
          }
        }

        if (options.length > 0) {
          question.list_options = JSON.stringify(options);
          console.log(`📋 Options for ${qType} (Q${idx + 1}):`, options);
        }
      }

      // True/False - Extract both options if available
      if (qType.includes('true') || qType.includes('false')) {
        const trueOptCol = Object.keys(row).find(h => h.toLowerCase().includes('true option'));
        const falseOptCol = Object.keys(row).find(h => h.toLowerCase().includes('false option'));

        if (trueOptCol && falseOptCol) {
          const options = [row[trueOptCol]?.toString() || 'True', row[falseOptCol]?.toString() || 'False'];
          question.list_options = JSON.stringify(options);
          console.log(`📋 T/F options (Q${idx + 1}):`, options);
        }
      }

      // Ordered List - Extract items
      if (qType.includes('order') || qType.includes('rank')) {
        let items = [];

        // Method 1: ListItems column (semicolon-separated)
        const listItemsCol = Object.keys(row).find(h => h.toLowerCase().includes('items'));
        if (listItemsCol && row[listItemsCol]) {
          items = row[listItemsCol].toString().split(';').map(i => i.trim()).filter(i => i);
        } else {
          // Method 2: Item 1, Item 2, etc. columns
          for (let i = 1; i <= 10; i++) {
            const itemCol = Object.keys(row).find(h => h.toLowerCase() === `item ${i}`);
            if (itemCol && row[itemCol]) {
              items.push(row[itemCol].toString().trim());
            }
          }
        }

        if (items.length > 0) {
          question.list_items = JSON.stringify(items);
          console.log(`📋 Ordered list items (Q${idx + 1}):`, items);
        }
      }

      // Free Text / Short Answer - Extract keywords
      if (qType.includes('short') || qType.includes('free') || qType.includes('text')) {
        const keywordsCol = Object.keys(row).find(h => h.toLowerCase().includes('keyword'));
        if (keywordsCol && row[keywordsCol]) {
          const keywords = row[keywordsCol].toString().split(';').map(k => k.trim()).filter(k => k);
          if (keywords.length > 0) {
            question.keywords = JSON.stringify(keywords);
            console.log(`📋 Keywords for short answer (Q${idx + 1}):`, keywords);
          }
        }

        // Also extract min/max word limits if available
        const minWordsCol = Object.keys(row).find(h => h.toLowerCase().includes('min word'));
        const maxWordsCol = Object.keys(row).find(h => h.toLowerCase().includes('max word'));
        if (minWordsCol && row[minWordsCol]) question.min_words = parseInt(row[minWordsCol]) || null;
        if (maxWordsCol && row[maxWordsCol]) question.max_words = parseInt(row[maxWordsCol]) || null;
      }

      // Essay - Extract word limits and keywords
      if (qType.includes('essay') || qType.includes('paragraph')) {
        const minWordsCol = Object.keys(row).find(h => h.toLowerCase().includes('min word'));
        const maxWordsCol = Object.keys(row).find(h => h.toLowerCase().includes('max word'));
        if (minWordsCol && row[minWordsCol]) question.min_words = parseInt(row[minWordsCol]) || null;
        if (maxWordsCol && row[maxWordsCol]) question.max_words = parseInt(row[maxWordsCol]) || null;

        const keywordsCol = Object.keys(row).find(h => h.toLowerCase().includes('keyword'));
        if (keywordsCol && row[keywordsCol]) {
          const keywords = row[keywordsCol].toString().split(';').map(k => k.trim()).filter(k => k);
          if (keywords.length > 0) {
            question.keywords = JSON.stringify(keywords);
            console.log(`📋 Essay keywords (Q${idx + 1}):`, keywords);
          }
        }
      }

      // Dataset files - Extract file references if provided
      const datasetFilesCol = Object.keys(row).find(h => h.toLowerCase().includes('dataset'));
      if (datasetFilesCol && row[datasetFilesCol]) {
        const files = row[datasetFilesCol].toString().split(';').map(f => f.trim()).filter(f => f);
        if (files.length > 0) {
          question.dataset_files = JSON.stringify(files);
          console.log(`📋 Dataset files for Q${idx + 1}:`, files);
        }
      }

      const validationErrors = [];
      if (!question.question_text) validationErrors.push('Missing question text');
      if (!question.question_type) validationErrors.push('Missing type');

      // Don't require correct_answer for all types - some store answers differently
      // MCQ/Pick List need list_options, Ordered List needs list_items, etc.

      // Normalize type - more flexible matching
      let normalizedType = question.question_type.toLowerCase().trim();
      let matchedType = null;

      if (normalizedType.includes('true') && normalizedType.includes('false')) {
        matchedType = 'true_false';
      } else if (normalizedType.includes('choice') || normalizedType === 'mcq') {
        matchedType = 'mcq';
      } else if (normalizedType.includes('pick') || normalizedType === 'dropdown') {
        matchedType = 'pick_list';
      } else if (normalizedType.includes('order') || normalizedType.includes('rank')) {
        matchedType = 'ordered_list';
      } else if (normalizedType.includes('short')) {
        matchedType = 'short_answer';
      } else if (normalizedType.includes('free') || normalizedType.includes('text')) {
        matchedType = 'free_text';
      } else if (normalizedType.includes('essay')) {
        matchedType = 'essay';
      }

      if (matchedType) {
        question.question_type = matchedType;
      }

      const validTypes = ['true_false', 'mcq', 'pick_list', 'ordered_list', 'short_answer', 'free_text', 'essay'];
      if (!validTypes.includes(question.question_type)) {
        validationErrors.push(`Invalid type: ${question.question_type}`);
      }

      if (validationErrors.length > 0) {
        errors.push({
          row: idx + 2,
          question: question.question_text.substring(0, 50),
          issues: validationErrors
        });
      } else {
        valid.push(question);
      }
    } catch (err) {
      errors.push({
        row: idx + 2,
        question: '(Error)',
        issues: [err.message]
      });
    }
  });

  return { valid, errors };
}
