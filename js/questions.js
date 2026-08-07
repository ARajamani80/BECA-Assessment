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
            <button class="btn btn-info btn-sm" id="downloadTemplateBtn" onclick="downloadQuestionTemplate()" title="Download blank template for importing questions">
              <i class="fas fa-file-excel"></i> Download Template
            </button>
            <button class="btn btn-info btn-sm" id="exportQuestionsBtn" onclick="exportQuestionsToExcel(questionsData)" title="Export all questions to Excel">
              <i class="fas fa-download"></i> Export
            </button>
            <button class="btn btn-secondary btn-sm" id="refreshQuestionsBtn" onclick="refreshQuestionBank()" title="Refresh questions list">
              <i class="fas fa-redo"></i> Refresh
            </button>
            <button class="btn btn-danger btn-sm" onclick="deleteAllQuestions()" title="Delete all questions">
              <i class="fas fa-trash-alt"></i> Delete All
            </button>
          </div>
        </div>

        <!-- Search & Filter -->
        <div style="margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <input type="text" id="questionSearch" placeholder="Search questions..."
                 onkeyup="filterQuestions()" style="flex: 1; min-width: 200px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <select id="questionTypeFilter" onchange="filterQuestions()" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="">All Types</option>
            <option value="mcq">MCQ - Multiple Choice</option>
            <option value="true_false">T/F - True/False</option>
            <option value="pick_list">PL - Pick List</option>
            <option value="free_text">FT - Free Text</option>
            <option value="ordered_list">OL - Ordered List</option>
            <option value="shortanswer">SA - Short Answer</option>
            <option value="essay">EA - Essay</option>
          </select>
          <select id="questionTagFilter" onchange="filterQuestions()" style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="">All Tags</option>
          </select>
        </div>

        <!-- Questions Table -->
        <div style="overflow-x: auto;">
          <table class="table">
            <thead>
              <tr>
                <th style="width: 120px;">Question ID</th>
                <th>Question Text</th>
                <th style="width: 100px;">Type Code</th>
                <th style="width: 80px;">Points</th>
                <th style="width: 150px;">Tags</th>
                <th style="width: 120px;">Created</th>
                <th style="width: 100px;">Actions</th>
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
    populateTagFilter();
  } catch (error) {
    showMessage('Error loading questions: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error: ' + error.message + '</p></div>';
  }
}

/**
 * Populate tag filter dropdown with available tags
 */
function populateTagFilter() {
  const tagSet = new Set();

  questionsData.forEach(q => {
    if (q.tags) {
      const tagsText = typeof q.tags === 'string' ? q.tags : JSON.stringify(q.tags);
      const tagsArray = tagsText.split(',').map(t => t.trim()).filter(t => t);
      tagsArray.forEach(tag => tagSet.add(tag));
    }
  });

  const tagSelect = document.getElementById('questionTagFilter');
  const currentValue = tagSelect.value;

  let html = '<option value="">All Tags</option>';
  Array.from(tagSet).sort().forEach(tag => {
    html += `<option value="${tag}">${tag}</option>`;
  });

  tagSelect.innerHTML = html;
  tagSelect.value = currentValue;
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
  const tagFilter = document.getElementById('questionTagFilter').value;

  filteredQuestionsData = questionsData.filter(q => {
    const matchesSearch = !searchTerm ||
      q.question_text.toLowerCase().includes(searchTerm) ||
      (q.question_description && q.question_description.toLowerCase().includes(searchTerm));

    const matchesType = !typeFilter || q.question_type === typeFilter;

    let matchesTag = true;
    if (tagFilter) {
      const tagsText = q.tags ? (typeof q.tags === 'string' ? q.tags : JSON.stringify(q.tags)) : '';
      const tagsArray = tagsText ? tagsText.split(',').map(t => t.trim()) : [];
      matchesTag = tagsArray.includes(tagFilter);
    }

    return matchesSearch && matchesType && matchesTag;
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
    html = '<tr><td colspan="7" style="text-align: center; color: #999;">No questions found</td></tr>';
  } else {
    pageQuestions.forEach(q => {
      const typeCode = getQuestionTypeCode(q.question_type);
      const typeLabel = getQuestionTypeLabel(q.question_type);
      const createdDate = q.created_at ? formatDate(q.created_at) : 'N/A';
      const tagsText = q.tags ? (typeof q.tags === 'string' ? q.tags : JSON.stringify(q.tags)) : '';
      const tagsArray = tagsText ? tagsText.split(',').map(t => t.trim()).filter(t => t) : [];
      const tagsHtml = tagsArray.map(tag => `<span class="badge" style="background: #e0e7ff; color: #3730a3; margin: 2px;">${tag}</span>`).join(' ');
      const questionCode = q.question_number ? `Q-${String(q.question_number).padStart(5, '0')}` : `Q-${q.id.substring(0, 8)}`;

      html += `
        <tr>
          <td><code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">${questionCode}</code></td>
          <td>${truncateText(q.question_text, 50)}</td>
          <td><span class="badge" title="${typeLabel}">${typeCode}</span></td>
          <td>${q.points || 0}</td>
          <td>${tagsHtml || '<span style="color: #999;">-</span>'}</td>
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
  try {
    console.log('📝 Opening Question Modal, ID:', questionId);

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

    const questionCode = question?.question_number ? `Q-${String(question.question_number).padStart(5, '0')}` : 'New Question';

    document.getElementById('questionModalContent').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div>
          <h2 style="margin: 0;">${titleText}</h2>
          ${question ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">ID: <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px;">${questionCode}</code></div>` : ''}
        </div>
        <button onclick="closeModal('questionModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <form id="questionForm" onsubmit="handleQuestionSave(event)">
        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Question Text</label>
          <textarea id="questionText" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; resize: vertical; min-height: 80px;">${question?.question_text || ''}</textarea>
        </div>

        <!-- Question Image -->
        <div class="form-group">
          <label>📷 Question Image (Optional)</label>
          <p style="font-size: 12px; color: #666; margin: 5px 0;">Upload an image to display below the question text</p>
          <input type="file" id="questionImageFile" accept="image/*" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">

          ${question?.question_image_url ? `
            <div style="margin: 10px 0;">
              <p style="font-size: 12px; color: #666; margin: 5px 0;">📸 Current Image:</p>
              <img src="${question.question_image_url}" alt="Question image" style="max-width: 100%; max-height: 300px; border: 1px solid #ddd; border-radius: 4px;">
              <button type="button" class="btn btn-danger btn-sm" onclick="removeQuestionImage()" style="margin-top: 10px;">
                <i class="fas fa-trash"></i> Remove Image
              </button>
            </div>
          ` : ''}
        </div>

        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Question Type</label>
          <select id="questionType" onchange="updateQuestionTypeFields()" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <option value="mcq" ${questionType === 'mcq' ? 'selected' : ''}>MCQ - Multiple Choice Question</option>
            <option value="true_false" ${questionType === 'true_false' ? 'selected' : ''}>T/F - True/False</option>
            <option value="pick_list" ${questionType === 'pick_list' ? 'selected' : ''}>PL - Pick List (Dropdown)</option>
            <option value="free_text" ${questionType === 'free_text' ? 'selected' : ''}>FT - Free Text</option>
            <option value="ordered_list" ${questionType === 'ordered_list' ? 'selected' : ''}>OL - Ordered List (Ranking)</option>
            <option value="short_answer" ${questionType === 'short_answer' ? 'selected' : ''}>SA - Short Answer</option>
            <option value="essay" ${questionType === 'essay' ? 'selected' : ''}>EA - Essay</option>
          </select>
        </div>

        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Points</label>
          <input type="number" id="questionPoints" value="${question?.points || 1}" min="1" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div class="form-group">
          <label>Description (Optional)</label>
          <textarea id="questionDescription" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; resize: vertical; min-height: 60px;">${question?.question_description || ''}</textarea>
        </div>

        <!-- MCQ Options -->
        <div id="mcqFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-list-ol"></i> Answer Options <span style="color: #dc2626;">*</span></h4>
          <p style="font-size: 12px; color: #64748b; margin: 8px 0;">Add multiple choice options and select the correct answer</p>
          <div id="optionsContainer"></div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addOption()" style="margin-top: 10px;">
            <i class="fas fa-plus"></i> Add Option
          </button>
        </div>

        <!-- True/False Options -->
        <div id="trueFalseFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-toggle-on"></i> Correct Answer <span style="color: #dc2626;">*</span></h4>
          <div style="display: flex; gap: 20px;">
            <label style="display: flex; align-items: center; gap: 8px; margin: 0; cursor: pointer;">
              <input type="radio" name="tfCorrectAnswer" value="true" required>
              <span>True</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin: 0; cursor: pointer;">
              <input type="radio" name="tfCorrectAnswer" value="false">
              <span>False</span>
            </label>
          </div>
        </div>

        <!-- Pick List Options -->
        <div id="pickListFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-list"></i> List Items <span style="color: #dc2626;">*</span></h4>
          <p style="font-size: 12px; color: #64748b; margin: 8px 0;">Add items that will appear in a dropdown menu</p>
          <div id="pickListContainer"></div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addPickListItem()" style="margin-top: 10px;">
            <i class="fas fa-plus"></i> Add Item
          </button>
        </div>

        <!-- File Upload -->
        <div id="fileUploadFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-file-upload"></i> Allowed File Types <span style="color: #dc2626;">*</span></h4>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 8px;"><input type="checkbox" name="fileType" value="pdf"> PDF Documents</label>
            <label style="display: block; margin-bottom: 8px;"><input type="checkbox" name="fileType" value="doc"> Word (.doc, .docx)</label>
            <label style="display: block; margin-bottom: 8px;"><input type="checkbox" name="fileType" value="image"> Images (JPG, PNG, GIF)</label>
            <label style="display: block; margin-bottom: 8px;"><input type="checkbox" name="fileType" value="autodesk"> Autodesk Files (.dwg, .rvt, .rfa)</label>
            <label style="display: block;"><input type="checkbox" name="fileType" value="other"> Other Formats</label>
          </div>
          <div class="form-group">
            <label>Max File Size (MB)</label>
            <input type="number" id="maxFileSize" value="50" min="1" max="500" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div class="form-group">
            <label>Instructions (Optional)</label>
            <textarea id="fileInstructions" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 60px;" placeholder="Provide instructions for file upload..."></textarea>
          </div>
          <div class="form-group">
            <label>📁 Upload Dataset Files (Optional)</label>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">Upload reference files that trainees will need. Save the question first to enable file uploads.</p>
            <input type="file" id="datasetFiles" multiple style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            <p style="font-size: 11px; color: #999; margin-top: 5px;">Supported: PDF, DOC, XLS, IMG, .dwg, .rvt, .rfa and other formats</p>
          </div>
        </div>

        <!-- Ordered List -->
        <div id="orderedListFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-sort-numeric-down"></i> Items to Rank <span style="color: #dc2626;">*</span></h4>
          <p style="font-size: 12px; color: #64748b; margin: 8px 0;">Add items that need to be arranged in correct order</p>
          <div id="orderedListContainer"></div>
          <button type="button" class="btn btn-secondary btn-sm" onclick="addOrderedListItem()" style="margin-top: 10px;">
            <i class="fas fa-plus"></i> Add Item
          </button>
        </div>

        <!-- Free Text -->
        <div id="freeTextFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-file-alt"></i> Expected Answer</h4>
          <div class="form-group">
            <label>Expected Answer</label>
            <textarea id="ftExpectedAnswer" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 60px;"></textarea>
          </div>

          <h4 style="margin-top: 20px; color: #1e293b;"><i class="fas fa-file-upload"></i> 📁 Dataset Files (Optional)</h4>
          <p style="font-size: 12px; color: #666; margin: 5px 0;">Upload files (.dwg, .rvt, .pdf, images, etc.) for reference</p>
          <input type="file" id="ftDatasetFiles" multiple style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">

          <div id="ftDatasetDisplay" style="margin-top: 10px;"></div>
        </div>

        <!-- Short Answer -->
        <div id="shortAnswerFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-pen-square"></i> Expected Answer <span style="color: #dc2626;">*</span></h4>
          <div class="form-group">
            <label>Expected Answer</label>
            <input type="text" id="saExpectedAnswer" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
          </div>
          <div class="form-group">
            <label>Keywords (comma-separated)</label>
            <input type="text" id="saKeywords" placeholder="e.g., keyword1, keyword2, keyword3" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <label style="display: flex; align-items: center; gap: 8px; margin: 10px 0; cursor: pointer;">
            <input type="checkbox" id="saCaseSensitive">
            <span>Case Sensitive</span>
          </label>
        </div>

        <!-- Essay Answer -->
        <div id="essayFieldsContainer" style="display: none; background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; opacity: 0; transition: opacity 0.3s;">
          <h4 style="margin-top: 0; color: #1e293b;"><i class="fas fa-book"></i> Rubric Criteria</h4>
          <div class="form-group">
            <label>Min Words (Optional)</label>
            <input type="number" id="eaMinWords" min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div class="form-group">
            <label>Max Words (Optional)</label>
            <input type="number" id="eaMaxWords" min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div class="form-group">
            <label>Rubric Criteria (Optional)</label>
            <textarea id="eaRubricCriteria" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 80px;" placeholder="Define how this essay will be graded..."></textarea>
          </div>
        </div>

        <!-- Dataset Upload Section -->
        <div class="form-group" style="background: #f0f7ff; padding: 15px; border-radius: 4px; border-left: 4px solid #3b82f6;">
          <label style="font-weight: 600; color: #1e40af;"><i class="fas fa-database"></i> Upload Dataset (Optional)</label>
          <p style="margin: 8px 0; font-size: 13px; color: #64748b;">Attach reference files for trainees. Supports: CSV, Excel, JSON, PDF, Images, or Autodesk files (DWG, RVT, etc.) - up to 100MB.</p>
          <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 8px;">
            <input type="file" id="datasetFile"
                   accept=".csv,.xlsx,.xls,.json,.pdf,.jpg,.jpeg,.png,.gif,.dwg,.dwt,.rvt,.rfa,.rte,.rft,.iam,.ipt,.ipj,.f3d,.f3z,.zip"
                   style="flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="viewDatasetInfo()">
              <i class="fas fa-info-circle"></i> Info
            </button>
          </div>
          <div id="datasetPreview" style="margin-top: 8px; font-size: 12px; color: #64748b;"></div>
          <div id="fileWarning" style="margin-top: 8px; padding: 8px; background: #fff3cd; border-radius: 3px; color: #856404; font-size: 12px; display: none;"></div>
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

    // Initialize type-specific fields
    if (questionType === 'mcq') {
      loadMCQOptions(question);
    } else if (questionType === 'file_upload' || questionType === 'fileupload') {
      loadFileTypes(question);
    } else if (questionType === 'true_false') {
      // Load T/F correct answer
      if (question?.correct_answer) {
        const val = question.correct_answer === 'true' || question.correct_answer === true ? 'true' : 'false';
        document.querySelector(`input[name="tfCorrectAnswer"][value="${val}"]`).checked = true;
      }
    } else if (questionType === 'pick_list') {
      loadPickListItems(question);
    } else if (questionType === 'ordered_list') {
      loadOrderedListItems(question);
    } else if (questionType === 'free_text') {
      if (question?.expected_answer) document.getElementById('ftExpectedAnswer').value = question.expected_answer;

      // Load dataset files if they exist
      if (question?.dataset_files) {
        try {
          const files = typeof question.dataset_files === 'string'
            ? JSON.parse(question.dataset_files)
            : question.dataset_files;

          if (Array.isArray(files) && files.length > 0) {
            let html = '<div style="margin-top: 10px;"><p style="font-size: 12px; color: #666; margin: 5px 0;">📎 Current Dataset Files:</p>';
            files.forEach((url, idx) => {
              const fileName = url.split('/').pop() || 'File ' + (idx + 1);
              html += `<div style="margin: 5px 0; font-size: 12px;">
                <a href="${url}" target="_blank" style="color: #3b82f6; text-decoration: none;">📄 ${fileName}</a>
              </div>`;
            });
            html += '</div>';
            document.getElementById('ftDatasetDisplay').innerHTML = html;
          }
        } catch (e) {
          console.warn('Error parsing dataset_files:', e);
        }
      }
    } else if (questionType === 'shortanswer' || questionType === 'short_answer') {
      if (question?.correct_answer) document.getElementById('saExpectedAnswer').value = question.correct_answer;
      if (question?.keywords) document.getElementById('saKeywords').value = question.keywords.join(', ');
      if (question?.case_sensitive) document.getElementById('saCaseSensitive').checked = true;
    } else if (questionType === 'essay') {
      if (question?.min_words) document.getElementById('eaMinWords').value = question.min_words;
      if (question?.max_words) document.getElementById('eaMaxWords').value = question.max_words;
      if (question?.rubric_criteria) document.getElementById('eaRubricCriteria').value = question.rubric_criteria;
    }

    updateQuestionTypeFields();
    const result = showModal('questionModal');

    if (result) {
      console.log('✅ Question Modal opened successfully');
    }

  } catch (error) {
    console.error('🔴 Error opening Question Modal:', error);
    alert('Error: ' + error.message);
  }
}

/**
 * Load MCQ options into modal
 */
function loadMCQOptions(question) {
  let html = '';
  let options = question?.options;

  // Debug logging
  console.log('📋 loadMCQOptions - raw options:', options);
  console.log('📋 loadMCQOptions - list_options:', question?.list_options);
  console.log('📋 loadMCQOptions - correct_answer:', question?.correct_answer);

  // Ensure options is an array
  if (!Array.isArray(options)) {
    options = [];
  }

  // If no options, create empty defaults
  if (options.length === 0) {
    options = [
      { text: '', correct: true },
      { text: '', correct: false },
      { text: '', correct: false },
      { text: '', correct: false }
    ];
  }

  // Ensure each option has correct structure
  options = options.map((opt, idx) => {
    if (typeof opt === 'string') {
      return { text: opt, correct: false };
    }
    return opt || { text: '', correct: false };
  });

  console.log('✅ Processed options for UI:', options);

  options.forEach((opt, idx) => {
    const optText = opt?.text || opt || '';
    const isCorrect = opt?.correct || false;

    html += `
      <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
        <input type="text" class="option-input" value="${optText}" placeholder="Option ${idx + 1}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <label style="margin: 0; display: flex; align-items: center; gap: 5px;">
          <input type="radio" name="correctOption" value="${idx}" ${isCorrect ? 'checked' : ''}>
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
  if (question?.max_file_size) document.getElementById('maxFileSize').value = question.max_file_size;
  if (question?.file_instructions) document.getElementById('fileInstructions').value = question.file_instructions;
}

/**
 * Load pick list items into modal
 */
function loadPickListItems(question) {
  let html = '';
  const items = question?.list_items || ['', '', '', ''];

  items.forEach((item, idx) => {
    html += `
      <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
        <input type="text" class="pick-list-input" value="${item || ''}" placeholder="Item ${idx + 1}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });

  document.getElementById('pickListContainer').innerHTML = html;
}

/**
 * Add pick list item
 */
function addPickListItem() {
  const container = document.getElementById('pickListContainer');
  const itemCount = container.children.length;

  const newItem = document.createElement('div');
  newItem.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
  newItem.innerHTML = `
    <input type="text" class="pick-list-input" placeholder="Item ${itemCount + 1}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
      <i class="fas fa-trash"></i>
    </button>
  `;

  container.appendChild(newItem);
}

/**
 * Load ordered list items into modal
 */
function loadOrderedListItems(question) {
  let html = '';
  let items = question?.list_items;

  console.log('📋 loadOrderedListItems - raw list_items:', items);

  // Ensure items is array
  if (!Array.isArray(items) || items.length === 0) {
    console.warn('⚠️ No list_items found, using empty defaults');
    items = ['', '', '', ''];
  }

  // Ensure each item is a string
  items = items.map(item => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item?.text) return item.text;
    return '';
  });

  console.log('✅ Processed items for UI:', items);

  items.forEach((item, idx) => {
    html += `
      <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
        <span style="font-weight: 600; color: #64748b; min-width: 30px;">${idx + 1}.</span>
        <input type="text" class="ordered-list-input" value="${item || ''}" placeholder="Item ${idx + 1}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
  });

  document.getElementById('orderedListContainer').innerHTML = html;
}

/**
 * Add ordered list item
 */
function addOrderedListItem() {
  const container = document.getElementById('orderedListContainer');
  const itemCount = container.children.length;

  const newItem = document.createElement('div');
  newItem.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';
  newItem.innerHTML = `
    <span style="font-weight: 600; color: #64748b; min-width: 30px;">${itemCount + 1}.</span>
    <input type="text" class="ordered-list-input" placeholder="Item ${itemCount + 1}" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
      <i class="fas fa-trash"></i>
    </button>
  `;

  container.appendChild(newItem);
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
 * Update question type fields visibility with dynamic field switching
 */
function updateQuestionTypeFields() {
  try {
    const type = document.getElementById('questionType').value;
    console.log('🔄 Updating question fields for type:', type);

    // Hide all type-specific containers first
    const containers = [
      'mcqFieldsContainer',
      'fileUploadFieldsContainer',
      'trueFalseFieldsContainer',
      'pickListFieldsContainer',
      'orderedListFieldsContainer',
      'freeTextFieldsContainer',
      'shortAnswerFieldsContainer',
      'essayFieldsContainer'
    ];

    containers.forEach(id => {
      const elem = document.getElementById(id);
      if (elem) {
        elem.style.display = 'none';
        elem.style.opacity = '0';
        elem.style.transition = 'opacity 0.3s ease-in-out';
      }
    });

    // Show relevant fields based on type with smooth transition
    setTimeout(() => {
      let targetId = null;

      switch(type) {
        case 'mcq':
          targetId = 'mcqFieldsContainer';
          if (document.getElementById('optionsContainer').children.length === 0) {
            loadMCQOptions(null);
          }
          break;
        case 'true_false':
          targetId = 'trueFalseFieldsContainer';
          break;
        case 'pick_list':
          targetId = 'pickListFieldsContainer';
          break;
        case 'file_upload':
        case 'fileupload':
          targetId = 'fileUploadFieldsContainer';
          break;
        case 'ordered_list':
          targetId = 'orderedListFieldsContainer';
          break;
        case 'free_text':
          targetId = 'freeTextFieldsContainer';
          break;
        case 'short_answer':
        case 'shortanswer':
          targetId = 'shortAnswerFieldsContainer';
          break;
        case 'essay':
          targetId = 'essayFieldsContainer';
          break;
      }

      if (targetId) {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.style.display = 'block';
          setTimeout(() => {
            elem.style.opacity = '1';
          }, 10);
          console.log('✅ Showing fields for:', type);
        }
      }
    }, 10);

  } catch (error) {
    console.error('🔴 Error updating question fields:', error);
  }
}

/**
 * Handle question save with validation for all question types
 */
async function handleQuestionSave(e) {
  e.preventDefault();

  try {
    console.log('💾 Saving question...');

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

    // Type-specific validation and data collection
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
      console.log('✅ MCQ options collected:', options.length);

    } else if (type === 'true_false') {
      const tfValue = document.querySelector('input[name="tfCorrectAnswer"]:checked');
      if (!tfValue) {
        showMessage('Please select the correct answer for True/False', 'error');
        return;
      }
      questionData.correct_answer = tfValue.value;
      console.log('✅ T/F answer set:', tfValue.value);

    } else if (type === 'pick_list') {
      const items = [];
      document.querySelectorAll('.pick-list-input').forEach(input => {
        if (input.value) {
          items.push(input.value);
        }
      });

      if (items.length < 2) {
        showMessage('Pick List must have at least 2 items', 'error');
        return;
      }

      questionData.list_items = items;
      console.log('✅ Pick list items collected:', items.length);

    } else if (type === 'file_upload' || type === 'fileupload') {
      const fileTypes = [];
      document.querySelectorAll('input[name="fileType"]:checked').forEach(cb => {
        fileTypes.push(cb.value);
      });

      if (fileTypes.length === 0) {
        showMessage('Please select at least one file type', 'error');
        return;
      }

      questionData.allowed_file_types = fileTypes;
      questionData.max_file_size = parseInt(document.getElementById('maxFileSize').value) || 50;
      questionData.file_instructions = document.getElementById('fileInstructions').value;
      console.log('✅ File upload settings collected');

    } else if (type === 'ordered_list') {
      const items = [];
      document.querySelectorAll('.ordered-list-input').forEach(input => {
        if (input.value) {
          items.push(input.value);
        }
      });

      if (items.length < 2) {
        showMessage('Ordered List must have at least 2 items', 'error');
        return;
      }

      questionData.list_items = JSON.stringify(items);
      console.log('✅ Ordered list items collected:', items.length);

    } else if (type === 'free_text') {
      const expectedAnswer = document.getElementById('ftExpectedAnswer').value;
      if (expectedAnswer) {
        questionData.expected_answer = expectedAnswer;
        console.log('✅ Free text expected answer collected');
      }

    } else if (type === 'short_answer' || type === 'shortanswer') {
      const expectedAnswer = document.getElementById('saExpectedAnswer').value;
      if (!expectedAnswer) {
        showMessage('Please provide the expected answer for Short Answer', 'error');
        return;
      }

      questionData.correct_answer = expectedAnswer;
      questionData.keywords = document.getElementById('saKeywords').value.split(',').map(k => k.trim()).filter(k => k);
      questionData.case_sensitive = document.getElementById('saCaseSensitive').checked;
      console.log('✅ Short answer settings collected');

    } else if (type === 'essay') {
      questionData.min_words = parseInt(document.getElementById('eaMinWords').value) || null;
      questionData.max_words = parseInt(document.getElementById('eaMaxWords').value) || null;
      questionData.rubric_criteria = document.getElementById('eaRubricCriteria').value;
      console.log('✅ Essay criteria collected');
    }

    // Handle question image upload
    const questionImageInput = document.getElementById('questionImageFile');
    const questionImageFile = questionImageInput ? questionImageInput.files[0] : null;

    // Handle dataset file uploads (for free text questions)
    // Check for free text dataset files first, otherwise check general dataset files
    let datasetFilesInput = document.getElementById('ftDatasetFiles');
    if (!datasetFilesInput || datasetFilesInput.style.display === 'none') {
      datasetFilesInput = document.getElementById('datasetFiles');
    }
    const datasetFiles = datasetFilesInput ? Array.from(datasetFilesInput.files) : [];
    const uploadedFileUrls = [];

    if (questionId) {
      // Update existing question
      await updateQuestion(questionId, questionData);

      // Upload question image if provided
      if (questionImageFile) {
        try {
          const imageUrl = await uploadQuestionImage(questionId, questionImageFile);
          await updateQuestion(questionId, { question_image_url: imageUrl });
          console.log('✅ Question image uploaded:', imageUrl);
        } catch (uploadError) {
          console.warn('⚠️ Image upload failed:', uploadError);
          showMessage('Question updated, but image upload failed.', 'warning');
        }
      }

      // Upload datasets if provided
      if (datasetFiles.length > 0) {
        try {
          for (let file of datasetFiles) {
            const fileUrl = await uploadQuestionDataset(questionId, file);
            uploadedFileUrls.push(fileUrl);
          }
          await updateQuestion(questionId, { dataset_files: JSON.stringify(uploadedFileUrls) });
          showMessage(`Question and ${datasetFiles.length} dataset file(s) updated successfully!`, 'success');
        } catch (uploadError) {
          console.error('Dataset upload warning:', uploadError);
          showMessage('Question updated, but some dataset uploads failed. Please try again.', 'warning');
        }
      } else {
        showMessage('Question updated successfully!', 'success');
      }
    } else {
      // Create new question
      const newQuestion = await createQuestion(questionData);

      // Upload question image if provided
      if (questionImageFile && newQuestion?.id) {
        try {
          const imageUrl = await uploadQuestionImage(newQuestion.id, questionImageFile);
          await updateQuestion(newQuestion.id, { question_image_url: imageUrl });
          console.log('✅ Question image uploaded:', imageUrl);
        } catch (uploadError) {
          console.warn('⚠️ Image upload failed:', uploadError);
        }
      }

      // Upload datasets if provided
      if (datasetFiles.length > 0 && newQuestion?.id) {
        try {
          for (let file of datasetFiles) {
            const fileUrl = await uploadQuestionDataset(newQuestion.id, file);
            uploadedFileUrls.push(fileUrl);
          }
          await updateQuestion(newQuestion.id, { dataset_files: JSON.stringify(uploadedFileUrls) });
          showMessage(`Question and ${datasetFiles.length} dataset file(s) created successfully!`, 'success');
        } catch (uploadError) {
          console.error('Dataset upload warning:', uploadError);
          showMessage('Question created, but some dataset uploads failed. Please try again.', 'warning');
        }
      } else {
        showMessage('Question created successfully!', 'success');
      }
    }

    closeModal('questionModal');
    await renderQuestions();
  } catch (error) {
    console.error('🔴 Error saving question:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Remove question image
 */
async function removeQuestionImage() {
  const questionId = document.getElementById('questionModal').dataset.questionId;
  if (!questionId) {
    showMessage('Cannot remove image - question not found', 'error');
    return;
  }

  if (confirm('Are you sure you want to remove the question image?')) {
    try {
      await updateQuestion(questionId, { question_image_url: null });
      showMessage('Image removed successfully!', 'success');
      // Refresh the modal to show the change
      await editQuestion(questionId);
    } catch (error) {
      console.error('Error removing image:', error);
      showMessage('Error removing image', 'error');
    }
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
  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  const isAutodesk = isValidAutodeskFile(file);
  const fileValidation = validateFileSize(file, 100);

  let preview = `<strong>Selected:</strong> ${file.name} (${sizeMB} MB)`;
  if (isAutodesk) {
    preview += ` <span style="color: #d97706; font-weight: 600;"><i class="fas fa-cad"></i> Autodesk Format</span>`;
  }
  document.getElementById('datasetPreview').innerHTML = preview;

  // Show warning if file is large
  const warningDiv = document.getElementById('fileWarning');
  if (fileValidation.warning) {
    warningDiv.textContent = '⚠ ' + fileValidation.warning;
    warningDiv.style.display = 'block';
  } else {
    warningDiv.style.display = 'none';
  }
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
    const client = await getSupabaseClient();
    const { error } = await client
      .from('assessment_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    showMessage('✅ Question deleted successfully!', 'success');
    await renderQuestions();
  } catch (error) {
    showMessage('❌ Error deleting question: ' + error.message, 'error');
  }
}

/**
 * Delete all questions with confirmation
 */
async function deleteAllQuestions() {
  if (!confirm('⚠️ DELETE ALL QUESTIONS?\n\nThis action cannot be undone. All questions will be permanently deleted.')) {
    return;
  }

  if (!confirm('🚨 Final confirmation: Delete ALL questions? This will affect all modules and assessments.')) {
    return;
  }

  let btn = null;
  let originalHtml = '';

  try {
    btn = document.querySelector('[onclick="deleteAllQuestions()"]');
    if (btn) {
      originalHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    }

    console.log('🗑️ Deleting all questions...');
    console.log('📊 Total questions to delete:', questionsData.length);

    const client = await getSupabaseClient();

    // Delete all questions one by one for better error handling
    let deleted = 0;
    for (const question of questionsData) {
      try {
        const { error } = await client
          .from('assessment_questions')
          .delete()
          .eq('id', question.id);

        if (error) {
          console.warn(`⚠️ Failed to delete question ${question.id}:`, error);
        } else {
          deleted++;
        }
      } catch (err) {
        console.warn(`⚠️ Error deleting question ${question.id}:`, err);
      }
    }

    console.log(`✅ Deleted ${deleted}/${questionsData.length} questions`);
    showMessage(`✅ Deleted ${deleted} question(s) successfully!`, 'success');
    await renderQuestions();
  } catch (error) {
    console.error('❌ Error deleting questions:', error);
    showMessage('❌ Error: ' + error.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
  }
}

/**
 * Download question import template as Excel
 */
function downloadQuestionTemplate() {
  try {
    if (typeof XLSX === 'undefined') {
      showMessage('❌ Excel library not loaded. Try refreshing the page.', 'error');
      return;
    }

    // Column headers matching the 19-column format
    const headers = [
      'QuestionID',
      'QuestionName',
      'QuestionSummary',
      'QuestionText',
      'Type',
      'Answer',
      'AllAnswers',
      'SkillLevel',
      'QuestionCategory',
      'CategoryTags',
      'TrainingTags',
      'RelatedFiles',
      'CoachingText',
      'CoachingFiles',
      'LearningText/Links',
      'LearningFiles',
      'Author',
      'UsedInModules',
      'UsedInTests'
    ];

    // Example data rows
    const examples = [
      [
        '1001',
        'ACAD-Basic-01',
        'Basic AutoCAD Question',
        'What is AutoCAD?',
        'True or false',
        'Yes',
        'Yes;No',
        'Basic',
        'Basics',
        'autocad;basics',
        'training',
        'sample.dwg',
        'See PDF for coaching',
        'coaching.pdf',
        'https://example.com',
        'learning.pdf',
        'Author Name',
        'Module 1',
        'Test 1'
      ],
      [
        '1002',
        'ACAD-MCQ-01',
        'Multiple Choice Question',
        'Which command creates a line?',
        'Multiple choice',
        'LINE',
        'LINE;CIRCLE;ARC;RECTANGLE',
        'Intermediate',
        'Drawing',
        'commands;lines',
        'training',
        'sample.dwg',
        'Multiple choice tips',
        'coaching.pdf',
        'https://example.com',
        'learning.pdf',
        'Author Name',
        'Module 1',
        'Test 1'
      ],
      [
        '1003',
        'ACAD-Essay-01',
        'Essay Question',
        'Explain the importance of layers',
        'Essay',
        'Important for organization',
        '',
        'Advanced',
        'Layers',
        'organization;layers',
        'training',
        '',
        'Essay tips',
        'coaching.pdf',
        'https://example.com',
        'learning.pdf',
        'Author Name',
        'Module 2',
        'Test 2'
      ]
    ];

    // Add empty rows for user to fill
    for (let i = 0; i < 47; i++) {
      examples.push(Array(19).fill(''));
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Template sheet with data
    const templateData = [headers, ...examples];
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 12 },  // QuestionID
      { wch: 20 },  // QuestionName
      { wch: 20 },  // QuestionSummary
      { wch: 40 },  // QuestionText
      { wch: 18 },  // Type
      { wch: 20 },  // Answer
      { wch: 30 },  // AllAnswers
      { wch: 15 },  // SkillLevel
      { wch: 20 },  // QuestionCategory
      { wch: 25 },  // CategoryTags
      { wch: 20 },  // TrainingTags
      { wch: 25 },  // RelatedFiles
      { wch: 25 },  // CoachingText
      { wch: 20 },  // CoachingFiles
      { wch: 25 },  // LearningText/Links
      { wch: 20 },  // LearningFiles
      { wch: 15 },  // Author
      { wch: 30 },  // UsedInModules
      { wch: 30 }   // UsedInTests
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Create instructions sheet
    const instructions = [
      ['BECA-ASSESSMENT QUESTION IMPORT TEMPLATE'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. Copy your questions from your existing Excel file'],
      ['2. Paste into rows starting from row 4 (after examples)'],
      ['3. Fill in all required columns: QuestionText, Type, Answer'],
      ['4. Optional columns: SkillLevel, Category, Tags, etc.'],
      ['5. In BECA-Assessment: Question Bank → Import Excel'],
      ['6. Upload this file → Review → Confirm → Done!'],
      [''],
      ['REQUIRED COLUMNS:'],
      ['• QuestionText - The actual question'],
      ['• Type - True or false, Multiple choice, Pick List, Ordered List, Short Answer, Free text, Essay'],
      ['• Answer - Correct answer'],
      [''],
      ['OPTIONAL COLUMNS:'],
      ['• QuestionID - Unique identifier'],
      ['• QuestionName - Short name'],
      ['• QuestionSummary - Brief description'],
      ['• AllAnswers - For MCQ/Pick List (semicolon-separated)'],
      ['• SkillLevel - Basic, Intermediate, Advanced'],
      ['• QuestionCategory - Topic/category'],
      ['• CategoryTags - Tags (semicolon-separated)'],
      ['• TrainingTags - Internal training tags'],
      ['• RelatedFiles - Dataset files (.dwg, .rvt, etc.)'],
      ['• CoachingText - Tips for instructors'],
      ['• CoachingFiles - Coaching material files'],
      ['• LearningText/Links - Learning resource links'],
      ['• LearningFiles - Learning material files'],
      ['• Author - Question creator']
    ];

    const ws_inst = XLSX.utils.aoa_to_sheet(instructions);
    ws_inst['!cols'] = [{ wch: 60 }];
    XLSX.utils.book_append_sheet(wb, ws_inst, 'Instructions');

    // Download Excel file
    XLSX.writeFile(wb, `BECA-Question-Template-${new Date().toISOString().split('T')[0]}.xlsx`);

    showMessage('✅ Excel template downloaded successfully!', 'success');
  } catch (error) {
    console.error('Error downloading template:', error);
    showMessage('❌ Error downloading template: ' + error.message, 'error');
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

/**
 * Refresh question bank - reload all questions
 */
async function refreshQuestionBank() {
  const btn = document.getElementById('refreshQuestionsBtn');
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

  try {
    await loadAllQuestions();
    questionsCurrentPage = 1;
    displayQuestionsTable();
    populateTagFilter();
    showMessage('Data refreshed successfully', 'success');
  } catch (error) {
    showMessage('Error refreshing data: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}
