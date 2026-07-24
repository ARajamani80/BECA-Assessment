// ============================================================================
// EXCEL IMPORT MODULE - Bulk Question Import
// Modal-based approach with proper file handling
// ============================================================================

let importState = {
  file: null,
  rawData: [],
  processedQuestions: [],
  validationErrors: [],
  currentStep: 'upload'
};

/**
 * Open Excel import modal
 */
function openExcelImportModal() {
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

    // Create modal content
    const modalContent = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">📊 Import Questions from Excel</h2>
        <button onclick="closeModal('excelImportModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <div id="importStep1" style="display: block;">
        <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3>Select Excel File</h3>
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
    if (!importState.file) {
      showMessage('❌ No file selected', 'error');
      return;
    }

    console.log('🚀 Starting import of', importState.file.name);

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
    const total = questions.length;

    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      document.getElementById('progressFill').style.width = percent + '%';
      document.getElementById('progressFill').textContent = percent + '%';
      document.getElementById('progressText').textContent = `Importing ${i + 1}/${total}...`;

      try {
        const client = await getSupabaseClient();
        const { error } = await client
          .from('assessment_questions')
          .insert([questions[i]])
          .select();

        if (error) throw error;
        imported++;
      } catch (error) {
        console.warn(`⚠️ Question ${i + 1} failed:`, error);
      }
    }

    // Show results
    document.getElementById('importStep2').style.display = 'none';
    document.getElementById('importStep3').style.display = 'block';

    const summary = `
      <div><strong style="color: #059669;">✅ ${imported} questions imported successfully</strong></div>
      ${importState.validationErrors.length > 0 ? `<div style="color: #d97706; margin-top: 10px;">⚠️ ${importState.validationErrors.length} questions skipped (validation errors)</div>` : ''}
      <div style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 4px;">
        Questions are now available in Question Bank and ready to use!
      </div>
    `;
    document.getElementById('resultSummary').innerHTML = summary;

    console.log(`✅ IMPORT COMPLETE: ${imported}/${total} questions`);
    showMessage(`✅ Imported ${imported} questions!`, 'success');

  } catch (error) {
    console.error('Error importing:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Auto-detect column mapping
 */
function autoDetectColumnMapping(rows) {
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const headers = Object.keys(firstRow);
  const mapping = {};

  headers.forEach(header => {
    const lower = header.toLowerCase().trim();

    if (lower.includes('question') && lower.includes('text')) {
      mapping.question_text = header;
    } else if (lower.includes('type')) {
      mapping.question_type = header;
    } else if (lower.includes('answer') && !lower.includes('all')) {
      mapping.correct_answer = header;
    } else if (lower.includes('difficulty') || lower.includes('skill')) {
      mapping.difficulty = header;
    } else if (lower.includes('category')) {
      mapping.category = header;
    } else if (lower.includes('tag')) {
      mapping.tags = header;
    }
  });

  console.log('📋 Column mapping:', mapping);
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
        tags: row[mapping.tags] || null,
        points: row['Points'] || row['points'] || 5
      };

      // Extract type-specific fields from Excel
      const qType = question.question_type.toLowerCase();

      // MCQ / Multiple Choice - Extract all options
      if (qType.includes('choice') || qType === 'mcq' || qType === 'pick_list') {
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
          question.all_options = options;
          question.list_options = JSON.stringify(options);
          console.log(`📋 Options for ${qType} (Q${idx + 1}):`, options);
        }
      }

      // True/False - Extract both options if available
      if (qType === 'true_false' || qType.includes('true') || qType.includes('false')) {
        const trueOptCol = Object.keys(row).find(h => h.toLowerCase().includes('true option'));
        const falseOptCol = Object.keys(row).find(h => h.toLowerCase().includes('false option'));

        if (trueOptCol && falseOptCol) {
          const options = [row[trueOptCol]?.toString() || 'True', row[falseOptCol]?.toString() || 'False'];
          question.all_options = options;
          question.list_options = JSON.stringify(options);
          console.log(`📋 T/F options (Q${idx + 1}):`, options);
        }
      }

      // Ordered List - Extract items
      if (qType.includes('ordered') || qType.includes('ranking')) {
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

      // Essay - Extract word limits
      if (qType.includes('essay')) {
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

      const validationErrors = [];
      if (!question.question_text) validationErrors.push('Missing question text');
      if (!question.question_type) validationErrors.push('Missing type');
      if (!question.correct_answer) validationErrors.push('Missing answer');

      // Normalize type
      const typeMap = {
        'true or false': 'true_false',
        'truefal': 'true_false',
        'true/false': 'true_false',
        'multiple choice': 'mcq',
        'mcq': 'mcq',
        'pick list': 'pick_list',
        'picklist': 'pick_list',
        'dropdown': 'pick_list',
        'ordered list': 'ordered_list',
        'ranking': 'ordered_list',
        'short answer': 'short_answer',
        'free text': 'free_text',
        'file upload': 'free_text',
        'essay': 'essay'
      };
      question.question_type = typeMap[question.question_type.toLowerCase()] || question.question_type;

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
