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
  importTags: []
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

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h3 style="margin-top: 0;">🏷️ (Optional) Assign Tags</h3>
          <p style="color: #666; font-size: 13px; margin: 10px 0;">
            Tags help organize and filter questions. Example: "Revit Archi", "AutoCAD", "BIM", etc.
          </p>
          <div>
            <input type="text" id="importTagsInput" placeholder="Enter tags separated by commas (e.g., Revit Archi, BIM, Architecture)" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; margin-bottom: 8px;">
            <div id="tagsPreview" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px;"></div>
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

      // Tag input handler
      const tagsInput = document.getElementById('importTagsInput');
      if (tagsInput) {
        tagsInput.addEventListener('input', function(e) {
          const tagsText = e.target.value;
          importState.importTags = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t) : [];

          // Update preview
          const preview = document.getElementById('tagsPreview');
          if (importState.importTags.length > 0) {
            preview.innerHTML = importState.importTags.map(tag =>
              `<span class="badge" style="background: #ffc107; color: #000; padding: 4px 12px; border-radius: 12px; font-size: 12px;">${tag}</span>`
            ).join('');
          } else {
            preview.innerHTML = '<span style="color: #999; font-size: 12px;">No tags entered</span>';
          }
        });
      }

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
    let duplicates = 0;
    const total = questions.length;
    const freeTextQuestions = []; // Track free text questions for dataset upload

    for (let i = 0; i < total; i++) {
      const percent = Math.round(((i + 1) / total) * 100);
      document.getElementById('progressFill').style.width = percent + '%';
      document.getElementById('progressFill').textContent = percent + '%';
      document.getElementById('progressText').textContent = `Importing ${i + 1}/${total}...`;

      try {
        const client = await getSupabaseClient();
        const questionText = (questions[i].question_text || '').trim();

        // Check for duplicate question (normalize text for comparison)
        const normalizedText = questionText.toLowerCase().trim();
        console.log(`🔍 Checking for duplicates of: "${questionText.substring(0, 50)}..."`);

        const { data: existing, error: checkError } = await client
          .from('assessment_questions')
          .select('id, question_text')
          .limit(1000); // Get all to check locally

        if (checkError) {
          console.warn('⚠️ Duplicate check error:', checkError);
        } else if (existing && existing.length > 0) {
          // Check for exact or normalized match
          const isDuplicate = existing.some(q => {
            const dbText = (q.question_text || '').toLowerCase().trim();
            return dbText === normalizedText;
          });

          if (isDuplicate) {
            console.warn(`⏭️ Skipping duplicate question ${i + 1}: "${questionText.substring(0, 50)}..."`);
            duplicates++;
            continue; // Skip this question
          }
        }

        // Add import tags to the question
        const questionWithTags = { ...questions[i] };
        if (importState.importTags.length > 0) {
          // Append import tags to existing tags if any
          const existingTags = questionWithTags.tags ?
            (typeof questionWithTags.tags === 'string' ?
              questionWithTags.tags.split(',').map(t => t.trim()) :
              questionWithTags.tags) : [];
          const allTags = [...new Set([...existingTags, ...importState.importTags])];
          questionWithTags.tags = allTags.join(', ');
          console.log(`🏷️ Tags added to Q${i + 1}:`, questionWithTags.tags);
        }

        // Insert question without assessment_id (standalone in Question Bank)
        const { data, error } = await client
          .from('assessment_questions')
          .insert([questionWithTags])
          .select();

        if (error) throw error;
        imported++;

        // Track free text questions
        if (questionWithTags.question_type === 'free_text' && data && data.length > 0) {
          freeTextQuestions.push({
            id: data[0].id,
            number: data[0].question_number,
            text: data[0].question_text
          });
        }

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
      ${duplicates > 0 ? `<div style="color: #f59e0b; margin-top: 10px;">🔄 ${duplicates} duplicate question(s) skipped</div>` : ''}
      ${failed > 0 ? `<div style="color: #dc2626; margin-top: 10px;">❌ ${failed} questions failed</div>` : ''}
      ${importState.validationErrors.length > 0 ? `<div style="color: #d97706; margin-top: 5px;">⚠️ ${importState.validationErrors.length} questions skipped (validation errors)</div>` : ''}
      ${freeTextQuestions.length > 0 ? `<div style="color: #2563eb; margin-top: 10px;">📁 ${freeTextQuestions.length} Free Text question(s) ready for dataset upload</div>` : ''}
      <div style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 4px; font-size: 13px;">
        <div>Total in file: ${total}</div>
        <div>New imported: ${imported}</div>
        <div>Duplicates skipped: ${duplicates}</div>
        <div>Import rate: ${imported > 0 ? Math.round((imported / (total - duplicates)) * 100) : 0}%</div>
      </div>
    `;
    document.getElementById('resultSummary').innerHTML = summary;

    console.log(`✅ IMPORT COMPLETE: ${imported}/${total} questions imported, ${duplicates} duplicates skipped, ${failed} failed`);
    if (imported > 0) {
      const msg = duplicates > 0
        ? `✅ Imported ${imported} questions! Skipped ${duplicates} duplicate(s).`
        : `✅ Imported ${imported}/${total} questions!`;
      showMessage(msg, 'success');
    } else if (duplicates > 0) {
      showMessage(`⏭️ No new questions imported - all ${duplicates} were duplicates.`, 'info');
    } else {
      showMessage(`❌ Failed to import any questions. Check the browser console for details.`, 'error');
    }

    // If there are free text questions, show bulk dataset upload workflow
    if (freeTextQuestions.length > 0) {
      importState.freeTextQuestions = freeTextQuestions;
      datasetUploadState.questions = freeTextQuestions; // Set for bulk upload
      setTimeout(() => {
        console.log(`📁 ${freeTextQuestions.length} Free Text questions found - showing bulk dataset upload`);
        showBulkDatasetUploadModal(freeTextQuestions);
      }, 500);
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
        // Pick List: parse AllAnswers (space-separated values)
        if (allAnswers) {
          let options = allAnswers.split(/\s+/).filter(o => o.trim());

          console.log(`📋 Pick List (Q${idx + 1}) - AllAnswers: "${allAnswers.substring(0, 50)}..."`);
          console.log(`   Options: ${options.length} items -`, options);

          if (options.length > 0) {
            const optionsJson = JSON.stringify(options);
            question.options = optionsJson;
            question.list_options = optionsJson;

            // Find correct answer - match the value in the Answer column
            if (correctAnswer && correctAnswer.trim()) {
              const correctValue = correctAnswer.toString().trim();
              const correctIndex = options.findIndex(opt => opt.toString() === correctValue);

              if (correctIndex >= 0) {
                question.correct_answer = options[correctIndex];
                console.log(`   ✅ Correct: "${options[correctIndex]}" (index ${correctIndex})`);
              } else {
                question.correct_answer = correctValue;
              }
            }

            console.log(`✅ Pick List (Q${idx + 1}): ${options.length} options`);
          }
        }
      } else if (questionType === 'mcq') {
        // MCQ: parse AllAnswers (space-separated values like "1 2 3 4 5")
        if (allAnswers) {
          console.log(`📋 MCQ (Q${idx + 1}) - AllAnswers: "${allAnswers}", Answer: "${correctAnswer}"`);

          // Split by spaces to get individual options
          let options = allAnswers.split(/\s+/).filter(o => o.trim());

          console.log(`   Options (space-split): ${options.length} items -`, options);

          if (options.length > 0) {
            const optionsJson = JSON.stringify(options);
            question.options = optionsJson;
            question.list_options = optionsJson;

            // Find correct answer - match the value in the Answer column
            if (correctAnswer && correctAnswer.trim()) {
              const correctValue = correctAnswer.toString().trim();
              const correctIndex = options.findIndex(opt => opt.toString() === correctValue);

              if (correctIndex >= 0) {
                question.correct_answer = options[correctIndex];
                console.log(`   ✅ Correct answer: "${options[correctIndex]}" (index ${correctIndex})`);
              } else {
                question.correct_answer = correctValue;
                console.log(`   ⚠️ Answer "${correctValue}" not found in options, storing as-is`);
              }
            }

            console.log(`✅ MCQ (Q${idx + 1}): ${options.length} options - ${options.join(' | ')}`);
          } else {
            console.warn(`⚠️ MCQ (Q${idx + 1}): No options extracted from AllAnswers`);
          }
        } else if (correctAnswer) {
          question.correct_answer = correctAnswer;
        }
      } else if (questionType === 'true_false') {
        // True/False: Create True/False options and mark correct one
        question.options = JSON.stringify(['True', 'False']);
        question.list_options = JSON.stringify(['True', 'False']);

        if (correctAnswer) {
          const answer = correctAnswer.toString().trim().toLowerCase();
          if (answer === 'true' || answer === 't' || answer === '1') {
            question.correct_answer = 'True';
          } else if (answer === 'false' || answer === 'f' || answer === '0') {
            question.correct_answer = 'False';
          } else {
            question.correct_answer = correctAnswer;
          }
          console.log(`📋 T/F (Q${idx + 1}): correct = ${question.correct_answer}`);
        }
      } else if (questionType === 'ordered_list') {
        // Ordered List: parse AllAnswers as space-separated items
        if (allAnswers) {
          let items = allAnswers.split(/\s+/).filter(i => i.trim());

          console.log(`📋 Ordered List (Q${idx + 1}) - AllAnswers: "${allAnswers}", Answer: "${correctAnswer}"`);
          console.log(`   Items: ${items.length} -`, items);

          if (items.length > 0) {
            const itemsJson = JSON.stringify(items);
            question.list_items = itemsJson;

            // If Answer is provided, use it as correct_order or reference
            if (correctAnswer && correctAnswer.trim()) {
              question.correct_answer = correctAnswer;
            }

            console.log(`✅ Ordered List (Q${idx + 1}): ${items.length} items`);
          }
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

/**
 * Show dataset upload workflow for Free Text questions
 */
function showDatasetUploadWorkflow(freeTextQuestions) {
  if (!freeTextQuestions || freeTextQuestions.length === 0) return;

  let currentIndex = 0;

  const showQuestion = (index) => {
    if (index >= freeTextQuestions.length) {
      closeModal('datasetUploadModal');
      showMessage('✅ Dataset upload complete! All Free Text questions are ready.', 'success');
      return;
    }

    const q = freeTextQuestions[index];
    const progress = `${index + 1}/${freeTextQuestions.length}`;

    document.getElementById('datasetUploadModalContent').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">📁 Upload Dataset Files</h2>
          <p style="font-size: 12px; color: #666; margin: 5px 0;">Question ${progress}</p>
        </div>
        <button onclick="closeModal('datasetUploadModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
        <p style="margin: 0; font-weight: 600; color: #1e40af;">Q-${String(q.number).padStart(5, '0')} - Free Text Question</p>
        <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px;">${q.text.substring(0, 100)}${q.text.length > 100 ? '...' : ''}</p>
      </div>

      <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
        <p style="margin: 0; font-size: 13px; color: #92400e;">
          <strong>ℹ️ Note:</strong> Upload reference files (CAD drawings, PDFs, etc.) that trainees will need to answer this question.
        </p>
      </div>

      <div class="form-group">
        <label style="font-weight: 600; margin-bottom: 8px; display: block;">📂 Select Files to Upload</label>
        <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Supports: .rvt, .dwg, .pdf, .rfa, .rte, .rft, Images, Excel, ZIP (up to 100MB)</p>
        <input type="file" id="datasetUploadInput" multiple
               accept=".csv,.xlsx,.xls,.json,.pdf,.jpg,.jpeg,.png,.gif,.dwg,.dwt,.rvt,.rfa,.rte,.rft,.iam,.ipt,.ipj,.f3d,.f3z,.zip"
               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">
        <div id="fileList" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
        ${index > 0 ? `<button class="btn btn-secondary" onclick="window.datasetWorkflowShowQuestion(${index - 1})">← Previous</button>` : ''}
        <button class="btn btn-secondary" onclick="closeModal('datasetUploadModal')">Skip Question</button>
        <button class="btn btn-success" onclick="window.datasetWorkflowUploadAndNext(${index})">
          ${index === freeTextQuestions.length - 1 ? 'Upload & Complete' : 'Upload & Next →'}
        </button>
      </div>
    `;

    // Update file list as user selects
    const fileInput = document.getElementById('datasetUploadInput');
    fileInput.onchange = function() {
      const fileList = document.getElementById('fileList');
      if (this.files.length > 0) {
        let html = '<div style="margin-top: 10px;"><strong>Selected files:</strong><ul style="margin: 5px 0; padding-left: 20px;">';
        Array.from(this.files).forEach(f => {
          html += `<li>${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)</li>`;
        });
        html += '</ul></div>';
        fileList.innerHTML = html;
      } else {
        fileList.innerHTML = '';
      }
    };

    showModal('datasetUploadModal');
  };

  // Store functions globally for use in onclick handlers
  window.datasetWorkflowShowQuestion = showQuestion;
  window.datasetWorkflowUploadAndNext = async (index) => {
    const fileInput = document.getElementById('datasetUploadInput');
    const q = freeTextQuestions[index];

    if (fileInput.files.length > 0) {
      try {
        const uploadedUrls = [];
        for (let file of Array.from(fileInput.files)) {
          const url = await uploadQuestionDataset(q.id, file);
          uploadedUrls.push(url);
        }

        // Update question with dataset files
        const client = await getSupabaseClient();
        await client
          .from('assessment_questions')
          .update({ dataset_files: JSON.stringify(uploadedUrls) })
          .eq('id', q.id);

        console.log(`✅ Uploaded ${uploadedUrls.length} file(s) for Q-${String(q.number).padStart(5, '0')}`);
        showMessage(`✅ ${uploadedUrls.length} file(s) uploaded for question ${index + 1}`, 'success');
      } catch (error) {
        console.error('Upload error:', error);
        showMessage(`❌ Failed to upload files: ${error.message}`, 'error');
        return;
      }
    }

    // Move to next question or close
    if (index + 1 < freeTextQuestions.length) {
      showQuestion(index + 1);
    } else {
      closeModal('datasetUploadModal');
      showMessage('✅ All Free Text questions processed! You can now upload more questions or close.', 'success');
    }
  };

  showQuestion(0);
}
