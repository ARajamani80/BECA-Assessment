// BECA Assessment Platform - Excel Import Module (using SheetJS)

/**
 * Handle Excel file import for questions
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
