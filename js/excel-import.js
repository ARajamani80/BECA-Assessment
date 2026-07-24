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

    const modalContent = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">📊 Import Questions from Excel</h2>
        <button onclick="closeModal('excelImportModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <div id="importStep1" style="display: block;">
        <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3>📁 Select Excel File</h3>
          <p style="color: #666; font-size: 13px; margin: 10px 0;">
            Questions will be imported to the Question Bank as standalone items
          </p>

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

    if (!importState.file) {
      const msg = '❌ No file selected. Please choose an Excel file.';
      console.error(msg);
      showMessage(msg, 'error');
      return;
    }

    console.log('🚀 Starting import of', importState.file.name, 'to Question Bank');

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
        // Insert question without assessment_id (standalone in Question Bank)
        const client = await getSupabaseClient();
        const { error } = await client
          .from('assessment_questions')
          .insert([questions[i]])
          .select();

        if (error) throw error;
        imported++;
        console.log(`✅ Q${i + 1} imported successfully`);
      } catch (error) {
        failed++;

        // Log detailed error info
        console.error(`❌ Question ${i + 1} failed:`);
        console.error('Error message:', error.message);
        console.error('Question data:', questions[i]);

        // Check for field length issues
        if (error.message && error.message.includes('character varying')) {
          console.error('⚠️ Field length exceeded - check category, skill_level, author, tags fields');
        }

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
 * Auto-detect column mapping from Excel headers
 */
function autoDetectColumnMapping(rows) {
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const headers = Object.keys(firstRow);
  const mapping = {};

  headers.forEach(header => {
    const lower = header.toLowerCase().trim();

    // Map all available columns
    if (lower.includes('question') && lower.includes('text')) mapping.question_text = header;
    else if (lower === 'type' || lower === 'question type' || lower.includes('question_type')) mapping.question_type = header;
    else if (lower === 'answer' || lower === 'correct answer') mapping.correct_answer = header;
    else if (lower.includes('allanswer')) mapping.all_answers = header;
    else if (lower === 'skillevel' || lower.includes('skill')) mapping.skill_level = header;
    else if (lower.includes('category') || lower === 'questioncategory') mapping.category = header;
    else if (lower.includes('tag') && !lower.includes('training')) mapping.tags = header;
    else if (lower.includes('trainingtag') || lower.includes('training tag')) mapping.training_tags = header;
    else if (lower.includes('file') && lower.includes('related')) mapping.dataset_files = header;
    else if (lower.includes('coaching') && lower.includes('text')) mapping.coaching_notes = header;
    else if (lower.includes('coaching') && lower.includes('file')) mapping.coaching_files = header;
    else if (lower.includes('learning') && (lower.includes('text') || lower.includes('link'))) mapping.learning_resources = header;
    else if (lower.includes('learning') && lower.includes('file')) mapping.learning_files = header;
    else if (lower === 'author') mapping.author = header;
    else if (lower === 'questionname' || lower.includes('question name')) mapping.question_name = header;
    else if (lower === 'questionsummary' || lower.includes('question summary')) mapping.question_summary = header;
  });

  console.log('📋 Column mapping:', mapping);
  return mapping;
}

/**
 * Process and validate questions with proper field mapping
 */
function processQuestions(rows, mapping) {
  const valid = [];
  const errors = [];

  rows.forEach((row, idx) => {
    try {
      // Get values from mapped columns
      const questionText = row[mapping.question_text] || '';
      const typeRaw = (row[mapping.question_type] || '').trim();
      const correctAnswer = row[mapping.correct_answer] || '';
      const allAnswers = row[mapping.all_answers] || '';

      // Normalize type (trim spaces, convert to lowercase)
      let questionType = typeRaw.toLowerCase().trim();

      // Map type values
      if (questionType.includes('free')) questionType = 'free_text';
      else if (questionType.includes('pick')) questionType = 'pick_list';
      else if (questionType.includes('choice') || questionType === 'mcq') questionType = 'mcq';
      else if (questionType.includes('true') && questionType.includes('false')) questionType = 'true_false';
      else if (questionType.includes('order') || questionType.includes('rank')) questionType = 'ordered_list';
      else if (questionType.includes('short')) questionType = 'short_answer';
      else if (questionType.includes('essay')) questionType = 'essay';

      const question = {
        question_text: questionText,
        question_type: questionType,
        category: row[mapping.category] || null,
        skill_level: row[mapping.skill_level] || null,
        tags: row[mapping.tags] || null,
        training_tags: row[mapping.training_tags] || null,
        question_name: row[mapping.question_name] || null,
        question_summary: row[mapping.question_summary] || null,
        coaching_notes: row[mapping.coaching_notes] || null,
        coaching_files: row[mapping.coaching_files] || null,
        learning_resources: row[mapping.learning_resources] || null,
        learning_files: row[mapping.learning_files] || null,
        author: row[mapping.author] || null
      };

      // Parse type-specific fields
      if (questionType === 'free_text' || questionType === 'short_answer') {
        // Free text: use Answer as expected_answer
        question.expected_answer = correctAnswer;
        // Also add as keywords
        if (correctAnswer) {
          question.keywords = JSON.stringify([correctAnswer]);
        }
      } else if (questionType === 'pick_list') {
        // Pick List: parse AllAnswers by newline into options
        if (allAnswers) {
          // Split by newline first (preferred), then by semicolon/comma
          let rawOptions = allAnswers.includes('\n')
            ? allAnswers.split('\n').map(o => o.trim()).filter(o => o)
            : allAnswers.split(/[;,]/).map(o => o.trim()).filter(o => o);

          // Extract option text (remove A), B), etc. if present)
          let options = rawOptions.map(opt => {
            // Check if starts with letter+) like "A) option text"
            const match = opt.match(/^[A-Z]\)\s*(.+)$/);
            return match ? match[1] : opt;
          });

          if (options.length > 0) {
            question.options = JSON.stringify(options);
            question.list_options = JSON.stringify(options);
            console.log(`📋 Pick List (Q${idx + 1}): ${options.length} options`);
          }
        }
        // Correct answer identifies which option(s) are correct
        if (correctAnswer) {
          question.correct_answer = correctAnswer;
        }
      } else if (questionType === 'mcq') {
        // MCQ: parse AllAnswers with proper format handling
        if (allAnswers) {
          console.log(`📋 MCQ (Q${idx + 1}) - Raw AllAnswers:`, allAnswers.substring(0, 100));

          let rawOptions = [];

          // Try different split methods
          if (allAnswers.includes('\n')) {
            // Split by newline
            rawOptions = allAnswers.split('\n').map(o => o.trim()).filter(o => o);
          } else if (allAnswers.includes('\r\n')) {
            // Split by CRLF
            rawOptions = allAnswers.split('\r\n').map(o => o.trim()).filter(o => o);
          } else if (allAnswers.includes(';')) {
            // Split by semicolon
            rawOptions = allAnswers.split(';').map(o => o.trim()).filter(o => o);
          } else if (allAnswers.includes(',')) {
            // Split by comma (but be careful with "A), B)" format)
            rawOptions = allAnswers.split(/,(?![^)]*\))/).map(o => o.trim()).filter(o => o);
          } else {
            // No clear delimiter - might be space separated with A) B) C) format
            rawOptions = [allAnswers];
          }

          // Extract option text and find correct index
          let options = [];
          let correctIndex = -1;

          rawOptions.forEach((opt, idx) => {
            // Check if starts with letter+) like "A) option text"
            const match = opt.match(/^([A-Z])\)\s*(.+)$/);
            if (match) {
              const letter = match[1];
              const text = match[2].trim();
              options.push(text);

              // Check if this option is the correct answer
              if (correctAnswer && correctAnswer.toUpperCase().includes(letter)) {
                correctIndex = idx;
              }
            } else if (opt.trim()) {
              options.push(opt.trim());
            }
          });

          if (options.length > 0) {
            question.options = JSON.stringify(options);
            question.list_options = JSON.stringify(options);

            // Set correct_answer to the option text
            if (correctIndex >= 0) {
              question.correct_answer = options[correctIndex];
            } else if (correctAnswer) {
              question.correct_answer = correctAnswer;
            }

            console.log(`✅ MCQ (Q${idx + 1}): ${options.length} options - ${options.join(' | ')}`);
          } else {
            console.warn(`⚠️ MCQ (Q${idx + 1}): No options extracted`);
          }
        } else if (correctAnswer) {
          question.correct_answer = correctAnswer;
        }
      } else if (questionType === 'true_false') {
        // True/False: Answer specifies correct option
        if (correctAnswer) {
          question.correct_answer = correctAnswer;
          question.options = JSON.stringify(['True', 'False']);
          question.list_options = JSON.stringify(['True', 'False']);
          console.log(`📋 T/F (Q${idx + 1}): correct = ${correctAnswer}`);
        }
      } else if (questionType === 'ordered_list') {
        // Ordered List: try to extract items from AllAnswers or Items column
        if (allAnswers) {
          let items = allAnswers.includes('\n')
            ? allAnswers.split('\n').map(i => i.trim()).filter(i => i)
            : allAnswers.split(/[;,]/).map(i => i.trim()).filter(i => i);

          // Remove numbering if present (1. Item, 2. Item)
          items = items.map(item => {
            const match = item.match(/^\d+[\.\)]\s*(.+)$/);
            return match ? match[1] : item;
          });

          if (items.length > 0) {
            question.list_items = JSON.stringify(items);
            console.log(`📋 Ordered List (Q${idx + 1}): ${items.length} items`);
          }
        }
        if (correctAnswer) {
          question.correct_answer = correctAnswer;
        }
      }

      // Parse dataset files (comma-separated)
      if (mapping.dataset_files && row[mapping.dataset_files]) {
        const files = row[mapping.dataset_files]
          .toString()
          .split(',')
          .map(f => f.trim())
          .filter(f => f);
        if (files.length > 0) {
          question.dataset_files = JSON.stringify(files);
        }
      }

      // Validation
      const validationErrors = [];
      if (!question.question_text) validationErrors.push('Missing question text');
      if (!question.question_type) validationErrors.push('Missing type');

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
        question: '(Error parsing row)',
        issues: [err.message]
      });
    }
  });

  return { valid, errors };
}
