// ============================================================================
// BECA Assessment Platform - Question Bank Module (INDEPENDENT)
//
// This module manages standalone questions that are NOT tied to assessments.
// Questions are created independently and can be grouped into modules later.
//
// WORKFLOW: Create Questions → Import from Excel → Module Bank groups them
// ============================================================================

let questionsData = [];
let filteredQuestionsDataData = [];
let questionsCurrentPage = 1;
const itemsPerPage = 10;

/**
 * Render Question Bank page
 */
async function renderQuestions() {
  document.getElementById('pageTitle').textContent = 'Question Bank';

  try {
    await loadAllQuestions();

    document.getElementById('page').innerHTML = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div class="card-title" style="margin: 0;"><i class="fas fa-comments"></i> Question Bank</div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="openQuestionModal()">
              <i class="fas fa-plus"></i> Add Question
            </button>
            <button class="btn btn-secondary btn-sm" onclick="openExcelImportModal()">
              <i class="fas fa-file-excel"></i> Import Excel
            </button>
          </div>
        </div>

        <!-- Search & Filter -->
        <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <input type="text" id="questionSearch" placeholder="Search questions..."
                 onkeyup="filterQuestions()" style="flex: 1; min-width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <select id="questionTypeFilter" onchange="filterQuestions()" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="">All Types</option>
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="shortanswer">Short Answer</option>
            <option value="essay">Essay</option>
            <option value="fileupload">File Upload</option>
          </select>
        </div>

        <!-- Questions Table -->
        <div style="overflow-x: auto;">
          <table class="table">
            <thead>
              <tr>
                <th>Question Text</th>
                <th>Type</th>
                <th>Points</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="questionsTable">
              <tr><td colspan="5" style="text-align: center; color: #999;">Loading questions...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div id="questionsPagination" style="margin-top: 20px; text-align: center;">
        </div>
      </div>
    `;

    displayQuestionsTable();
  } catch (error) {
    showMessage('Error loading questions: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error: ' + error.message + '</p></div>';
  }
}

/**
 * Load all questions from database
 */
async function loadAllQuestions() {
  try {
    questionsData = await getAllQuestions();
    filteredQuestionsData = questionsData;
  } catch (error) {
    console.error('Error loading questions:', error);
    questionsData = [];
    filteredQuestionsData = [];
  }
}

/**
 * Filter questions by search and type
 */
function filterQuestions() {
  const searchTerm = document.getElementById('questionSearch').value.toLowerCase();
  const typeFilter = document.getElementById('questionTypeFilter').value;

  filteredQuestionsData = questionsData.filter(q => {
    const matchesSearch = !searchTerm ||
      q.question_text.toLowerCase().includes(searchTerm) ||
      (q.question_description && q.question_description.toLowerCase().includes(searchTerm));

    const matchesType = !typeFilter || q.question_type === typeFilter;

    return matchesSearch && matchesType;
  });

  questionsCurrentPage = 1;
  displayQuestionsTable();
}

/**
 * Display questions table with pagination
 */
function displayQuestionsTable() {
  const start = (questionsCurrentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageQuestions = filteredQuestionsData.slice(start, end);

  let html = '';
  if (pageQuestions.length === 0) {
    html = '<tr><td colspan="5" style="text-align: center; color: #999;">No questions found</td></tr>';
  } else {
    pageQuestions.forEach(q => {
      const typeLabel = {
        'mcq': 'Multiple Choice',
        'shortanswer': 'Short Answer',
        'essay': 'Essay',
        'fileupload': 'File Upload'
      }[q.question_type] || q.question_type;

      const createdDate = q.created_at ? formatDate(q.created_at) : 'N/A';

      html += `
        <tr>
          <td>${truncateText(q.question_text, 60)}</td>
          <td><span class="badge">${typeLabel}</span></td>
          <td>${q.points || 0}</td>
          <td>${createdDate}</td>
          <td>
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-primary btn-sm" onclick="editQuestion('${q.id}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteQuestionConfirm('${q.id}')" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  document.getElementById('questionsTable').innerHTML = html;

  // Pagination
  const totalPages = Math.ceil(filteredQuestionsData.length / itemsPerPage);
  let paginationHtml = '';

  if (totalPages > 1) {
    paginationHtml += `<div style="display: flex; justify-content: center; gap: 10px;">`;

    if (questionsCurrentPage > 1) {
      paginationHtml += `<button class="btn btn-secondary btn-sm" onclick="questionsCurrentPage--; displayQuestionsTable()">← Previous</button>`;
    }

    paginationHtml += `<span style="align-self: center; color: var(--text-secondary);">Page ${questionsCurrentPage} of ${totalPages}</span>`;

    if (questionsCurrentPage < totalPages) {
      paginationHtml += `<button class="btn btn-secondary btn-sm" onclick="questionsCurrentPage++; displayQuestionsTable()">Next →</button>`;
    }

    paginationHtml += `</div>`;
  }

  document.getElementById('questionsPagination').innerHTML = paginationHtml;
}

/**
 * Open question modal for create/edit
 * @param {string} questionId - Optional question ID for editing
 */
async function openQuestionModal(questionId = null) {
  let question = null;
  let titleText = 'Add New Question';

  if (questionId) {
    const q = questionsData.find(q => q.id === questionId);
    if (q) {
      question = q;
      titleText = 'Edit Question';
    }
  }

  const questionType = question?.question_type || 'mcq';

  document.getElementById('questionModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">${titleText}</h2>
      <button onclick="closeModal('questionModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <form id="questionForm" onsubmit="handleQuestionSave(event)">
      <div class="form-group">
        <label>Question Text *</label>
        <textarea id="questionText" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; resize: vertical; min-height: 80px;">${question?.question_text || ''}</textarea>
      </div>

      <div class="form-group">
        <label>Question Type *</label>
        <select id="questionType" onchange="updateQuestionTypeFields()" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <option value="mcq" ${questionType === 'mcq' ? 'selected' : ''}>Multiple Choice (MCQ)</option>
          <option value="shortanswer" ${questionType === 'shortanswer' ? 'selected' : ''}>Short Answer</option>
          <option value="essay" ${questionType === 'essay' ? 'selected' : ''}>Essay</option>
          <option value="fileupload" ${questionType === 'fileupload' ? 'selected' : ''}>File Upload</option>
        </select>
      </div>

      <div class="form-group">
        <label>Points *</label>
        <input type="number" id="questionPoints" value="${question?.points || 1}" min="1" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      </div>

      <div class="form-group">
        <label>Description (Optional)</label>
        <textarea id="questionDescription" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; resize: vertical; min-height: 60px;">${question?.question_description || ''}</textarea>
      </div>

      <!-- MCQ Options -->
      <div id="mcqFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h4 style="margin-top: 0;">Answer Options</h4>
        <div id="optionsContainer"></div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addOption()" style="margin-top: 10px;">
          <i class="fas fa-plus"></i> Add Option
        </button>
      </div>

      <!-- File Upload Types -->
      <div id="fileUploadFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0;">
        <h4 style="margin-top: 0;">Allowed File Types</h4>
        <div>
          <label><input type="checkbox" name="fileType" value="pdf"> PDF</label>
          <label style="margin-left: 15px;"><input type="checkbox" name="fileType" value="doc"> Word (.doc, .docx)</label>
          <label style="margin-left: 15px;"><input type="checkbox" name="fileType" value="image"> Images</label>
          <label style="margin-left: 15px;"><input type="checkbox" name="fileType" value="other"> Other</label>
        </div>
      </div>

      <!-- Dataset Upload Section -->
      <div class="form-group" style="background: #f0f7ff; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
        <label style="font-weight: 600; color: #1e40af;"><i class="fas fa-database"></i> Upload Dataset (Optional)</label>
        <p style="margin: 8px 0; font-size: 13px; color: #64748b;">Attach a CSV or Excel file that trainees will reference for this question.</p>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="file" id="datasetFile" accept=".csv,.xlsx,.xls,.json" style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="viewDatasetInfo()">
            <i class="fas fa-info-circle"></i> Info
          </button>
        </div>
        <div id="datasetPreview" style="margin-top: 10px; font-size: 12px; color: #64748b;"></div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-success" style="flex: 1;">
          <i class="fas fa-save"></i> Save Question
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('questionModal')" style="flex: 1;">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
  `;

  document.getElementById('questionModal').dataset.questionId = questionId || '';

  if (questionType === 'mcq') {
    loadMCQOptions(question);
  } else if (questionType === 'fileupload') {
    loadFileTypes(question);
  }

  updateQuestionTypeFields();
  showModal('questionModal');
}

/**
 * Load MCQ options into modal
 */
function loadMCQOptions(question) {
  let html = '';
  const options = question?.options || [
    { text: '', correct: true },
    { text: '', correct: false },
    { text: '', correct: false },
    { text: '', correct: false }
  ];

  options.forEach((opt, idx) => {
    html += `
      <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
        <input type="text" class="option-input" value="${opt.text}" placeholder="Option ${idx + 1}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <label style="margin: 0; display: flex; align-items: center; gap: 5px;">
          <input type="radio" name="correctOption" value="${idx}" ${opt.correct ? 'checked' : ''}>
          Correct
        </label>
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });

  document.getElementById('optionsContainer').innerHTML = html;
}

/**
 * Load file types into modal
 */
function loadFileTypes(question) {
  const allowedTypes = question?.allowed_file_types || [];
  document.querySelectorAll('input[name="fileType"]').forEach(cb => {
    cb.checked = allowedTypes.includes(cb.value);
  });
}

/**
 * Add new MCQ option
 */
function addOption() {
  const container = document.getElementById('optionsContainer');
  const optionCount = container.children.length;

  const newOption = document.createElement('div');
  newOption.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
  newOption.innerHTML = `
    <input type="text" class="option-input" placeholder="Option ${optionCount + 1}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    <label style="margin: 0; display: flex; align-items: center; gap: 5px;">
      <input type="radio" name="correctOption" value="${optionCount}">
      Correct
    </label>
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
      <i class="fas fa-trash"></i>
    </button>
  `;

  container.appendChild(newOption);
}

/**
 * Update question type fields visibility
 */
function updateQuestionTypeFields() {
  const type = document.getElementById('questionType').value;

  document.getElementById('mcqFieldsContainer').style.display = type === 'mcq' ? 'block' : 'none';
  document.getElementById('fileUploadFieldsContainer').style.display = type === 'fileupload' ? 'block' : 'none';

  if (type === 'mcq' && document.getElementById('optionsContainer').children.length === 0) {
    loadMCQOptions(null);
  }
}

/**
 * Handle question save
 */
async function handleQuestionSave(e) {
  e.preventDefault();

  try {
    const questionId = document.getElementById('questionModal').dataset.questionId;
    const type = document.getElementById('questionType').value;
    const text = document.getElementById('questionText').value;
    const points = parseInt(document.getElementById('questionPoints').value);
    const description = document.getElementById('questionDescription').value;

    let questionData = {
      question_text: text,
      question_type: type,
      points: points,
      question_description: description
    };

    if (type === 'mcq') {
      const options = [];
      document.querySelectorAll('.option-input').forEach((input, idx) => {
        if (input.value) {
          options.push({
            text: input.value,
            correct: document.querySelector(`input[value="${idx}"][name="correctOption"]:checked`) !== null
          });
        }
      });

      if (options.length < 2) {
        showMessage('MCQ must have at least 2 options', 'error');
        return;
      }

      questionData.options = options;
    } else if (type === 'fileupload') {
      const fileTypes = [];
      document.querySelectorAll('input[name="fileType"]:checked').forEach(cb => {
        fileTypes.push(cb.value);
      });

      if (fileTypes.length === 0) {
        showMessage('Please select at least one file type', 'error');
        return;
      }

      questionData.allowed_file_types = fileTypes;
    }

    // Handle dataset upload
    const datasetFile = document.getElementById('datasetFile').files[0];
    let datasetUrl = null;

    if (questionId) {
      // Update existing question
      await updateQuestion(questionId, questionData);

      // Upload dataset if provided
      if (datasetFile) {
        try {
          datasetUrl = await uploadQuestionDataset(questionId, datasetFile);
          await updateQuestion(questionId, { dataset_url: datasetUrl });
          showMessage('Question and dataset updated successfully!', 'success');
        } catch (uploadError) {
          console.error('Dataset upload warning:', uploadError);
          showMessage('Question updated, but dataset upload failed. Please try again.', 'warning');
        }
      } else {
        showMessage('Question updated successfully!', 'success');
      }
    } else {
      // Create new question
      const newQuestion = await createQuestion(questionData);

      // Upload dataset if provided
      if (datasetFile && newQuestion?.id) {
        try {
          datasetUrl = await uploadQuestionDataset(newQuestion.id, datasetFile);
          await updateQuestion(newQuestion.id, { dataset_url: datasetUrl });
          showMessage('Question and dataset created successfully!', 'success');
        } catch (uploadError) {
          console.error('Dataset upload warning:', uploadError);
          showMessage('Question created, but dataset upload failed. Please try again.', 'warning');
        }
      } else {
        showMessage('Question created successfully!', 'success');
      }
    }

    closeModal('questionModal');
    await renderQuestions();
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * View dataset info
 */
function viewDatasetInfo() {
  const file = document.getElementById('datasetFile').files[0];
  if (!file) {
    showMessage('Please select a file first', 'info');
    return;
  }

  const sizeKB = (file.size / 1024).toFixed(2);
  const preview = `<strong>Selected:</strong> ${file.name} (${sizeKB} KB)`;
  document.getElementById('datasetPreview').innerHTML = preview;
}

/**
 * Edit question
 */
function editQuestion(questionId) {
  openQuestionModal(questionId);
}

/**
 * Delete question with confirmation
 */
function deleteQuestionConfirm(questionId) {
  const question = questionsData.find(q => q.id === questionId);
  if (!question) return;

  if (confirm(`Delete question: "${truncateText(question.question_text, 50)}"?`)) {
    deleteQuestion(questionId);
  }
}

/**
 * Delete question from database
 */
async function deleteQuestion(questionId) {
  try {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    showMessage('Question deleted successfully!', 'success');
    await renderQuestions();
  } catch (error) {
    showMessage('Error deleting question: ' + error.message, 'error');
  }
}

/**
 * Open Excel import modal
 */
function openExcelImportModal() {
  document.getElementById('excelImportModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">Import Questions from Excel</h2>
      <button onclick="closeModal('excelImportModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="background: #f0f4ff; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
      <p style="margin: 0 0 10px 0;"><strong>Excel Format Requirements:</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Column A: Question Text (required)</li>
        <li>Column B: Question Type (mcq, shortanswer, essay, fileupload)</li>
        <li>Column C: Points (required)</li>
        <li>Column D: Description (optional)</li>
        <li>Column E: Options (for MCQ, use | to separate. Mark correct answer with *)</li>
      </ul>
    </div>

    <form id="excelImportForm" onsubmit="handleExcelImport(event)">
      <div class="form-group">
        <label>Select Excel File *</label>
        <input type="file" id="excelFile" accept=".xlsx,.xls,.csv" required style="padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 100%; box-sizing: border-box;">
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button type="submit" class="btn btn-success" style="flex: 1;">
          <i class="fas fa-upload"></i> Import
        </button>
        <button type="button" class="btn btn-secondary" onclick="closeModal('excelImportModal')" style="flex: 1;">
          <i class="fas fa-times"></i> Cancel
        </button>
      </div>
    </form>
  `;

  showModal('excelImportModal');
}

/**
 * Handle Excel import (framework)
 * Note: Full Excel parsing requires a library like SheetJS
 */
async function handleExcelImport(e) {
  e.preventDefault();

  try {
    const file = document.getElementById('excelFile').files[0];

    // TODO: Implement full Excel parsing using SheetJS library
    // This is a framework for the import handler

    showMessage('Excel import framework is ready. Add SheetJS library for full implementation.', 'info');
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Truncate text to specified length
 */
function truncateText(text, length) {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}
