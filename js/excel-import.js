// ============================================================================
// EXCEL IMPORT MODULE - Bulk Question Import
// Supports importing up to 500 questions from Excel template
// ============================================================================

let importState = {
  file: null,
  rawData: [],
  processedQuestions: [],
  validationErrors: [],
  currentStep: 'upload' // upload → preview → confirm → processing → complete
};

/**
 * Open Excel import modal for questions
 */
async function openExcelImportModal() {
  try {
    console.log('📂 Opening Excel import modal...');

    const modalContent = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">📊 Bulk Import Questions from Excel</h2>
        <button onclick="closeModal('excelImportModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <div id="importStepContainer">
        <!-- Step 1: Upload -->
        <div id="importStep1" style="display: block;">
          <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3>Step 1: Upload Excel File</h3>
            <p style="color: #666; font-size: 13px; margin: 10px 0;">
              Use the <strong>BECA-Question-Import-Template.xlsx</strong> or follow the same column structure.
            </p>

            <div style="border: 2px dashed #3b82f6; border-radius: 8px; padding: 30px; text-align: center; background: white; cursor: pointer;"
                 id="dropZone"
                 ondrop="handleFileDrop(event)"
                 ondragover="event.preventDefault(); event.currentTarget.style.background='#eff6ff';"
                 ondragleave="event.currentTarget.style.background='white';">
              <div style="font-size: 48px; margin-bottom: 10px;">📁</div>
              <div style="font-weight: bold; margin-bottom: 5px;">Drop Excel file here or click to select</div>
              <div style="font-size: 12px; color: #999;">Supported formats: .xlsx, .xls</div>
              <input type="file" id="excelFileInput" accept=".xlsx,.xls" onchange="handleFileSelect(event)" style="display: none;">
            </div>

            <div style="margin-top: 15px;">
              <button class="btn btn-primary" onclick="document.getElementById('excelFileInput').click();">
                <i class="fas fa-upload"></i> Choose File
              </button>
            </div>

            <div id="fileInfo" style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 4px; display: none;">
              <strong>📄 File Selected:</strong> <span id="fileName"></span>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">Ready to upload</div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-secondary" onclick="closeModal('excelImportModal')">Cancel</button>
            <button class="btn btn-primary" id="uploadBtn" onclick="processExcelFile()" disabled>
              <i class="fas fa-arrow-right"></i> Next: Preview
            </button>
          </div>
        </div>

        <!-- Step 2: Preview -->
        <div id="importStep2" style="display: none;">
          <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3>Step 2: Preview & Validation</h3>
            <div id="validationSummary" style="margin-bottom: 20px;"></div>
            <div id="previewTable" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px;"></div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-secondary" onclick="resetImport()">← Back</button>
            <button class="btn btn-secondary" onclick="closeModal('excelImportModal')">Cancel</button>
            <button class="btn btn-success" id="confirmBtn" onclick="confirmAndImport()">
              <i class="fas fa-check"></i> Confirm & Import
            </button>
          </div>
        </div>

        <!-- Step 3: Processing -->
        <div id="importStep3" style="display: none;">
          <div style="background: #f0f4f8; padding: 20px; border-radius: 8px; text-align: center;">
            <div style="font-size: 48px; margin-bottom: 10px;">⏳</div>
            <h3>Importing Questions...</h3>
            <div id="progressBar" style="width: 100%; height: 30px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin: 20px 0;">
              <div id="progressFill" style="width: 0%; height: 100%; background: #3b82f6; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">0%</div>
            </div>
            <div id="progressText" style="font-size: 14px; color: #666;">0 / 0 questions imported...</div>
          </div>
        </div>

        <!-- Step 4: Complete -->
        <div id="importStep4" style="display: none;">
          <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <h3 style="color: #059669; margin-top: 0;">✅ Import Complete!</h3>
            <div id="resultSummary" style="font-size: 14px;"></div>
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-secondary" onclick="resetImport()">Import Another File</button>
            <button class="btn btn-success" onclick="closeImportAndRefresh()">
              <i class="fas fa-check"></i> Done
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('excelImportModalContent').innerHTML = modalContent;
    showModal('excelImportModal');

  } catch (error) {
    console.error('Error opening import modal:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Handle file drop
 */
function handleFileDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    importState.file = files[0];
    showFileSelected();
  }
}

/**
 * Handle file selection
 */
function handleFileSelect(event) {
  console.log('📁 File select event triggered');
  if (event.target.files.length > 0) {
    importState.file = event.target.files[0];
    console.log('✅ File selected:', {
      name: importState.file.name,
      size: importState.file.size,
      type: importState.file.type
    });
    showFileSelected();
  } else {
    console.warn('⚠️ No files selected');
  }
}

/**
 * Show file selected
 */
function showFileSelected() {
  if (!importState.file) return;

  document.getElementById('fileInfo').style.display = 'block';
  document.getElementById('fileName').textContent = importState.file.name;
  document.getElementById('uploadBtn').disabled = false;
}

/**
 * Process Excel file
 */
async function processExcelFile() {
  try {
    if (!importState.file) {
      showMessage('❌ Please select a file first', 'error');
      console.warn('⚠️ No file in importState');
      return;
    }

    console.log('📂 Processing Excel file:', importState.file.name);
    showMessage('⏳ Parsing Excel file...', 'info');

    // Check if XLSX is available
    if (typeof XLSX === 'undefined') {
      console.error('❌ XLSX library not loaded!');
      showMessage('❌ Excel library not loaded. Try refreshing the page.', 'error');
      return;
    }

    console.log('✅ XLSX library available');

    // Read file using XLSX library
    const reader = new FileReader();

    reader.onerror = function(error) {
      console.error('❌ FileReader error:', error);
      showMessage('❌ Error reading file: ' + error.message, 'error');
    };

    reader.onload = async function(e) {
      try {
        console.log('✅ File loaded, size:', e.target.result.byteLength, 'bytes');

        const data = new Uint8Array(e.target.result);
        console.log('📖 Parsing with XLSX...');

        const workbook = XLSX.read(data, { type: 'array' });
        console.log('✅ Workbook parsed, sheets:', workbook.SheetNames);

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(sheet);

        console.log(`📊 Read ${rawRows.length} rows from sheet: ${sheetName}`);

        if (rawRows.length === 0) {
          showMessage('❌ No data found in Excel file', 'error');
          return;
        }

        // Auto-detect column mapping
        importState.rawData = rawRows;
        const mapping = autoDetectColumnMapping(rawRows);

        // Process and validate
        const processed = processQuestions(rawRows, mapping);

        if (processed.valid.length === 0) {
          showMessage(`❌ No valid questions found. ${processed.errors.length} errors.`, 'error');
          console.error('Validation errors:', processed.errors);
          return;
        }

        importState.processedQuestions = processed.valid;
        importState.validationErrors = processed.errors;

        console.log(`✅ Processed: ${processed.valid.length} valid, ${processed.errors.length} errors`);

        // Show preview
        showStep('importStep2');
        renderPreview();
        showMessage(`✅ Ready to import ${processed.valid.length} questions`, 'success');

      } catch (error) {
        console.error('❌ Error parsing file:', error);
        console.error('Stack:', error.stack);
        showMessage('❌ Error parsing Excel file: ' + error.message, 'error');
      }
    };

    reader.readAsArrayBuffer(importState.file);

  } catch (error) {
    console.error('❌ Error processing file:', error);
    showMessage('❌ Error: ' + error.message, 'error');
  }
}

/**
 * Auto-detect column mapping from Excel headers
 */
function autoDetectColumnMapping(rows) {
  if (rows.length === 0) return {};

  const firstRow = rows[0];
  const headers = Object.keys(firstRow);

  console.log('🔍 Excel headers found:', headers);
  console.log('📊 First row sample:', firstRow);

  // Map common header variations
  const mapping = {};
  headers.forEach(header => {
    const lower = header.toLowerCase().trim();

    if (lower.includes('question') && lower.includes('text')) {
      mapping.question_text = header;
    } else if (lower === 'type' || lower === 'questiontype') {
      mapping.question_type = header;
    } else if ((lower.includes('answer') && !lower.includes('all')) || lower === 'correct answer') {
      mapping.correct_answer = header;
    } else if ((lower.includes('all') && lower.includes('answer')) || lower === 'allanswers') {
      mapping.all_options = header;
    } else if (lower.includes('difficulty') || lower.includes('skill') || lower === 'skilllevel') {
      mapping.difficulty = header;
    } else if (lower.includes('category') || lower === 'questioncategory') {
      mapping.category = header;
    } else if (lower.includes('tag') && !lower.includes('training') || lower === 'categorytags') {
      mapping.tags = header;
    } else if ((lower.includes('name') && !lower.includes('question')) || lower === 'questionname') {
      mapping.question_name = header;
    } else if (lower.includes('summary') || lower === 'questionsummary') {
      mapping.question_summary = header;
    } else if (lower.includes('coaching') || lower === 'coachingtext') {
      mapping.coaching_notes = header;
    } else if (lower.includes('learning')) {
      mapping.learning_resources = header;
    } else if ((lower.includes('files') && lower.includes('related')) || lower === 'relatedfiles') {
      mapping.dataset_files = header;
    } else if (lower.includes('training') || lower === 'trainingtags') {
      mapping.training_tags = header;
    } else if (lower === 'author') {
      mapping.author = header;
    }
  });

  console.log('📋 Column mapping detected:', mapping);

  // Verify critical fields are mapped
  if (!mapping.question_text) {
    console.warn('⚠️ Warning: question_text not mapped. Available headers:', headers);
  }
  if (!mapping.question_type) {
    console.warn('⚠️ Warning: question_type not mapped. Available headers:', headers);
  }
  if (!mapping.correct_answer) {
    console.warn('⚠️ Warning: correct_answer not mapped. Available headers:', headers);
  }

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
      // Extract fields based on mapping
      const question = {
        question_text: row[mapping.question_text] || '',
        question_type: (row[mapping.question_type] || '').toLowerCase().trim(),
        correct_answer: row[mapping.correct_answer] || '',
        question_name: row[mapping.question_name] || '',
        question_summary: row[mapping.question_summary] || '',
        difficulty: row[mapping.difficulty] || null,
        category: row[mapping.category] || null,
        tags: row[mapping.tags] || null,
        coaching_notes: row[mapping.coaching_notes] || null,
        learning_resources: row[mapping.learning_resources] || null,
        dataset_files: row[mapping.dataset_files] || null,
        training_tags: row[mapping.training_tags] || null,
        author: row[mapping.author] || null,
        all_options: row[mapping.all_options] || null,
        points: row['Points'] || 5, // Default points
        module_id: null // Will be set during linking if needed
      };

      // Validate required fields
      const validationErrors = [];
      if (!question.question_text || question.question_text.toString().trim() === '') {
        validationErrors.push('Missing question text');
      }
      if (!question.question_type) {
        validationErrors.push('Missing question type');
      }
      if (!question.correct_answer) {
        validationErrors.push('Missing correct answer');
      }

      // Normalize question type
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

      const normalized = typeMap[question.question_type.toLowerCase()] || question.question_type;
      question.question_type = normalized;

      // Validate type
      const validTypes = ['true_false', 'mcq', 'pick_list', 'ordered_list', 'short_answer', 'free_text', 'essay'];
      if (!validTypes.includes(question.question_type)) {
        validationErrors.push(`Invalid question type: ${question.question_type}`);
      }

      if (validationErrors.length > 0) {
        errors.push({
          row: idx + 2, // +1 for header, +1 for 1-based indexing
          question: question.question_text.substring(0, 50),
          issues: validationErrors
        });
      } else {
        valid.push(question);
      }

    } catch (err) {
      errors.push({
        row: idx + 2,
        question: '(Error reading row)',
        issues: [err.message]
      });
    }
  });

  return { valid, errors };
}

/**
 * Render preview table
 */
function renderPreview() {
  const summary = `
    <div style="display: flex; gap: 20px; margin-bottom: 20px;">
      <div style="flex: 1; background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
        <div style="font-size: 24px; font-weight: bold; color: #059669;">${importState.processedQuestions.length}</div>
        <div style="font-size: 12px; color: #666;">Valid Questions</div>
      </div>
      ${importState.validationErrors.length > 0 ? `
        <div style="flex: 1; background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #f59e0b;">
          <div style="font-size: 24px; font-weight: bold; color: #d97706;">${importState.validationErrors.length}</div>
          <div style="font-size: 12px; color: #666;">Validation Errors</div>
        </div>
      ` : ''}
    </div>
  `;

  if (importState.validationErrors.length > 0) {
    let errorHtml = '<div style="margin-top: 15px;"><strong style="color: #d97706;">⚠️ Issues Found:</strong><ul style="font-size: 12px; margin: 10px 0; padding-left: 20px;">';
    importState.validationErrors.slice(0, 5).forEach(err => {
      errorHtml += `<li><strong>Row ${err.row}:</strong> ${err.issues.join(', ')}</li>`;
    });
    if (importState.validationErrors.length > 5) {
      errorHtml += `<li>... and ${importState.validationErrors.length - 5} more errors</li>`;
    }
    errorHtml += '</ul></div>';
  }

  document.getElementById('validationSummary').innerHTML = summary + (errorHtml || '');

  // Render table
  let tableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
      <thead>
        <tr style="background: #f3f4f6; border-bottom: 2px solid #ddd;">
          <th style="padding: 8px; text-align: left;">#</th>
          <th style="padding: 8px; text-align: left;">Question</th>
          <th style="padding: 8px; text-align: center;">Type</th>
          <th style="padding: 8px; text-align: left;">Answer</th>
        </tr>
      </thead>
      <tbody>
  `;

  importState.processedQuestions.slice(0, 10).forEach((q, idx) => {
    tableHtml += `
      <tr style="border-bottom: 1px solid #eee; background: ${idx % 2 === 0 ? 'white' : '#f9fafb'};">
        <td style="padding: 8px;">${idx + 1}</td>
        <td style="padding: 8px;">${truncateText(q.question_text, 60)}</td>
        <td style="padding: 8px; text-align: center;"><span style="background: #e0e7ff; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${q.question_type}</span></td>
        <td style="padding: 8px;">${truncateText(q.correct_answer, 30)}</td>
      </tr>
    `;
  });

  if (importState.processedQuestions.length > 10) {
    tableHtml += `
      <tr style="background: #f3f4f6;">
        <td colspan="4" style="padding: 8px; text-align: center; color: #666; font-size: 11px;">
          ... and ${importState.processedQuestions.length - 10} more questions
        </td>
      </tr>
    `;
  }

  tableHtml += `
      </tbody>
    </table>
  `;

  document.getElementById('previewTable').innerHTML = tableHtml;
}

/**
 * Confirm and start import
 */
async function confirmAndImport() {
  try {
    showStep('importStep3');
    console.log(`🚀 Starting import of ${importState.processedQuestions.length} questions...`);

    // Log first question for debugging
    if (importState.processedQuestions.length > 0) {
      console.log('📄 First question sample:', importState.processedQuestions[0]);
    }

    let imported = 0;
    const total = importState.processedQuestions.length;

    for (let i = 0; i < importState.processedQuestions.length; i++) {
      const question = importState.processedQuestions[i];

      try {
        console.log(`📝 Importing question ${i + 1}/${total}:`, {
          text: question.question_text?.substring(0, 50) || '(empty)',
          type: question.question_type,
          answer: question.correct_answer
        });

        // Direct API call without retry wrapper
        const client = await getSupabaseClient();
        const { data, error } = await client
          .from('assessment_questions')
          .insert([question])
          .select()
          .single();

        if (error) {
          throw new Error(`Database error: ${error.message}`);
        }

        console.log(`✅ Question ${i + 1} imported successfully:`, data?.id);
        imported++;
      } catch (error) {
        console.error(`❌ Failed to import question ${i + 1}:`, error);
        console.log('Question data that failed:', question);
        // Continue with next question even if one fails
      }

      // Update progress
      const percent = Math.round((imported / total) * 100);
      document.getElementById('progressFill').style.width = percent + '%';
      document.getElementById('progressFill').textContent = percent + '%';
      document.getElementById('progressText').textContent = `${imported} / ${total} questions imported...`;
    }

    // Show results
    showStep('importStep4');
    const resultSummary = `
      <div style="font-size: 14px;">
        <div style="margin-bottom: 10px;">
          <strong style="color: #059669;">✅ ${imported} questions successfully imported</strong>
        </div>
        ${importState.validationErrors.length > 0 ? `
          <div style="color: #d97706;">
            <strong>⚠️ ${importState.validationErrors.length} questions were skipped due to validation errors</strong>
          </div>
        ` : ''}
        <div style="margin-top: 15px; padding: 10px; background: #f3f4f6; border-radius: 4px; font-size: 12px;">
          You can now:
          <ul style="margin: 5px 0; padding-left: 20px;">
            <li>View imported questions in the Question Bank</li>
            <li>Add them to modules</li>
            <li>Use them in assessments</li>
          </ul>
        </div>
      </div>
    `;
    document.getElementById('resultSummary').innerHTML = resultSummary;

    console.log(`✅ Import complete: ${imported}/${total} questions`);
    showMessage(`Successfully imported ${imported} questions!`, 'success');

  } catch (error) {
    console.error('Error during import:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Show specific step
 */
function showStep(stepId) {
  document.getElementById('importStep1').style.display = 'none';
  document.getElementById('importStep2').style.display = 'none';
  document.getElementById('importStep3').style.display = 'none';
  document.getElementById('importStep4').style.display = 'none';
  document.getElementById(stepId).style.display = 'block';
}

/**
 * Reset import
 */
function resetImport() {
  importState = {
    file: null,
    rawData: [],
    processedQuestions: [],
    validationErrors: [],
    currentStep: 'upload'
  };
  document.getElementById('excelFileInput').value = '';
  document.getElementById('fileInfo').style.display = 'none';
  document.getElementById('uploadBtn').disabled = true;
  showStep('importStep1');
}

/**
 * Close and refresh
 */
async function closeImportAndRefresh() {
  try {
    closeModal('excelImportModal');
    resetImport();

    // Wait a moment for modal to close, then refresh
    setTimeout(async () => {
      console.log('🔄 Refreshing questions list...');
      await renderQuestions();
      showMessage('✅ Questions list refreshed!', 'success');
    }, 500);
  } catch (error) {
    console.error('Error closing import:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Handle Excel file import for questions (legacy)
 */
async function handleExcelImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    showMessage('Processing Excel file...', 'info');

    // Check if SheetJS is available
    if (typeof XLSX === 'undefined') {
      throw new Error('SheetJS library not loaded. Please refresh the page.');
    }

    // Read file
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('No sheets found in workbook');
        }

        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          throw new Error('No data found in spreadsheet');
        }

        // Process rows
        const questions = [];
        const errors = [];

        rows.forEach((row, idx) => {
          try {
            // Expected columns: question_text, question_type, options (comma-separated), correct_answer, points, module_id
            const question = {
              question_text: row['Question'] || row['question_text'] || '',
              question_type: row['Type'] || row['question_type'] || 'multiple_choice',
              points: parseInt(row['Points'] || row['points'] || '1'),
              module_id: row['Module ID'] || row['module_id'] || '',
              options: row['Options'] || row['options'] || '',
              correct_answer: row['Correct Answer'] || row['correct_answer'] || ''
            };

            // Validate required fields
            if (!question.question_text) {
              errors.push(`Row ${idx + 2}: Question text is required`);
              return;
            }

            if (!question.module_id) {
              errors.push(`Row ${idx + 2}: Module ID is required`);
              return;
            }

            if (question.points <= 0) {
              errors.push(`Row ${idx + 2}: Points must be greater than 0`);
              return;
            }

            // Parse options if provided
            if (question.options && typeof question.options === 'string') {
              question.options = question.options.split('|').map(o => o.trim()).filter(o => o);
            }

            questions.push(question);
          } catch (error) {
            errors.push(`Row ${idx + 2}: ${error.message}`);
          }
        });

        if (errors.length > 0) {
          showMessage(`Found ${errors.length} errors: ${errors.join('; ')}`, 'error');
        }

        if (questions.length === 0) {
          throw new Error('No valid questions found in file');
        }

        // Show preview and confirm
        showExcelImportPreview(questions, errors);
      } catch (error) {
        console.error('Error reading Excel file:', error);
        showMessage('Error reading file: ' + error.message, 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  } catch (error) {
    console.error('Error handling Excel import:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Show preview of imported questions
 */
function showExcelImportPreview(questions, errors) {
  const previewHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Import Questions Preview</h2>
      <button onclick="closeModal('excelImportModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    ${errors.length > 0 ? `
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 12px; margin-bottom: 20px; color: #991b1b;">
        <strong><i class="fas fa-exclamation-circle"></i> ${errors.length} Validation Error(s):</strong>
        <ul style="margin: 8px 0 0 20px; font-size: 13px;">
          ${errors.map(e => `<li>${e}</li>`).join('')}
        </ul>
      </div>
    ` : ''}

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 12px; margin-bottom: 20px; color: #166534;">
      <strong><i class="fas fa-check-circle"></i> ${questions.length} Question(s) Ready to Import</strong>
    </div>

    <div style="max-height: 400px; overflow-y: auto; margin-bottom: 20px;">
      <table class="table" style="font-size: 13px;">
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Type</th>
            <th>Module</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          ${questions.map((q, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${truncateText(q.question_text, 50)}</td>
              <td><span class="badge">${q.question_type}</span></td>
              <td>${q.module_id}</td>
              <td>${q.points}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <button class="btn btn-success" onclick="confirmExcelImport(${JSON.stringify(questions).replace(/"/g, '&quot;')})" style="flex: 1;">
        <i class="fas fa-upload"></i> Import All
      </button>
      <button class="btn btn-secondary" onclick="closeModal('excelImportModal')" style="flex: 1;">
        <i class="fas fa-times"></i> Cancel
      </button>
    </div>
  `;

  document.getElementById('excelImportModalContent').innerHTML = previewHtml;
  showModal('excelImportModal');
}

/**
 * Confirm and process Excel import
 */
async function confirmExcelImport(questions) {
  if (!questions || questions.length === 0) {
    showMessage('No questions to import', 'error');
    return;
  }

  try {
    showMessage('Importing questions...', 'info');

    let imported = 0;
    let failed = 0;

    for (const question of questions) {
      try {
        // Add created_at and other fields
        const questionData = {
          ...question,
          order: imported + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await createQuestion(questionData);
        imported++;
      } catch (error) {
        console.error('Error importing question:', error);
        failed++;
      }
    }

    closeModal('excelImportModal');
    showMessage(`Import complete: ${imported} imported, ${failed} failed`, imported > 0 ? 'success' : 'error');

    // Reload questions page if it exists
    if (typeof renderQuestions === 'function') {
      await renderQuestions();
    }
  } catch (error) {
    console.error('Error processing import:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Trigger Excel file select
 */
function triggerExcelFileSelect() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv';
  input.onchange = handleExcelImport;
  input.click();
}

/**
 * Download Excel template
 */
function downloadExcelTemplate() {
  // Create sample data
  const data = [
    {
      'Question': 'What is the capital of France?',
      'Type': 'multiple_choice',
      'Options': 'Paris|London|Berlin|Madrid',
      'Correct Answer': 'Paris',
      'Points': '5',
      'Module ID': 'module-1'
    },
    {
      'Question': 'What is 2 + 2?',
      'Type': 'short_answer',
      'Options': '',
      'Correct Answer': '4',
      'Points': '3',
      'Module ID': 'module-1'
    }
  ];

  try {
    if (typeof XLSX === 'undefined') {
      showMessage('SheetJS library not available', 'error');
      return;
    }

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');

    // Set column widths
    ws['!cols'] = [
      { wch: 40 },
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 8 },
      { wch: 12 }
    ];

    // Download
    XLSX.writeFile(wb, 'questions-template.xlsx');
    showMessage('Template downloaded successfully!', 'success');
  } catch (error) {
    console.error('Error downloading template:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}
