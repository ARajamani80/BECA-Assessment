/**
 * Question & Module Bank UI Handlers
 * Manages the user interface for Question Bank and Module Bank pages
 */

// ============================================================
// PAGE NAVIGATION
// ============================================================

function showQuestionBankPage() {
  currentPage = 'questionBank';
  document.getElementById('app').innerHTML = document.getElementById('questionBankPage')?.outerHTML || '<p>Page not found</p>';
  document.querySelector('.nav-item[data-page="questionBank"]')?.classList.add('active');
  loadQuestionsPage();
  updateUserInfo();
}

function showModuleBankPage() {
  currentPage = 'moduleBank';
  document.getElementById('app').innerHTML = document.getElementById('moduleBankPage')?.outerHTML || '<p>Page not found</p>';
  document.querySelector('.nav-item[data-page="moduleBank"]')?.classList.add('active');
  loadModulesPage();
  updateUserInfo();
}

// ============================================================
// QUESTION BANK - TABLE & PAGINATION
// ============================================================

let currentQuestionPage = 0;
const questionsPerPage = 20;
let allQuestionsFilters = {};
let currentQuestionFilters = {};

async function loadQuestionsPage() {
  try {
    const filters = {
      ...currentQuestionFilters,
      page: currentQuestionPage,
      limit: questionsPerPage
    };

    const result = await searchQuestions(filters);

    if (!result.success) {
      showMessage('questionsTableBody', result.error, 'error');
      return;
    }

    renderQuestionsTable(result.data);
    updateQuestionStats();
    updateQuestionPagination(result.total);
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

function renderQuestionsTable(questions) {
  const tbody = document.getElementById('questionsTableBody');
  if (!tbody) return;

  if (questions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No questions found</td></tr>';
    return;
  }

  tbody.innerHTML = questions.map(q => `
    <tr>
      <td>
        <strong>${q.title}</strong>
        ${q.description ? `<br><small style="color: var(--text-secondary);">${q.description}</small>` : ''}
      </td>
      <td><span class="badge badge-primary">${q.question_type}</span></td>
      <td>${q.points}</td>
      <td>${q.category || '-'}</td>
      <td><span class="badge" style="background: ${getDifficultyColor(q.difficulty_level)};">${q.difficulty_level}</span></td>
      <td>${q.image_url ? '<i class="fas fa-image" style="color: var(--success);"></i>' : '-'}</td>
      <td>${q.has_dataset ? '<i class="fas fa-file" style="color: var(--primary);"></i>' : '-'}</td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-sm btn-secondary" onclick="editQuestion('${q.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteQuestionConfirm('${q.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="manageQuestionDatasets('${q.id}')" title="Manage Datasets">
            <i class="fas fa-folder"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function getDifficultyColor(level) {
  const colors = {
    easy: '#bbf7d0',
    medium: '#fef3c7',
    hard: '#fecaca'
  };
  return colors[level] || '#e5e7eb';
}

function updateQuestionPagination(total) {
  const prevBtn = document.getElementById('prevQuestionsBtn');
  const nextBtn = document.getElementById('nextQuestionsBtn');
  const pageInfo = document.getElementById('questionsPageInfo');

  if (!prevBtn || !nextBtn || !pageInfo) return;

  const totalPages = Math.ceil(total / questionsPerPage);
  pageInfo.textContent = `Page ${currentQuestionPage + 1} of ${totalPages}`;

  prevBtn.disabled = currentQuestionPage === 0;
  nextBtn.disabled = currentQuestionPage >= totalPages - 1;
}

function previousQuestionsPage() {
  if (currentQuestionPage > 0) {
    currentQuestionPage--;
    loadQuestionsPage();
  }
}

function nextQuestionsPage() {
  currentQuestionPage++;
  loadQuestionsPage();
}

async function updateQuestionStats() {
  try {
    const stats = await getQuestionStatistics();
    if (stats.success) {
      document.getElementById('totalQuestionsCount').textContent = stats.data.totalQuestions;
      document.getElementById('totalPointsCount').textContent = stats.data.totalPoints;

      // Count questions with datasets
      const result = await searchQuestions({ limit: 1000 });
      if (result.success) {
        const withDatasets = result.data.filter(q => q.has_dataset).length;
        document.getElementById('questionsWithDatasets').textContent = withDatasets;
      }
    }
  } catch (error) {
    console.error('Error updating stats:', error);
  }
}

// ============================================================
// QUESTION BANK - SEARCH & FILTER
// ============================================================

async function applyQuestionFilters() {
  currentQuestionPage = 0;
  currentQuestionFilters = {
    search: document.getElementById('questionSearch')?.value || '',
    type: document.getElementById('questionTypeFilter')?.value || '',
    category: document.getElementById('questionCategoryFilter')?.value || '',
    difficulty: document.getElementById('questionDifficultyFilter')?.value || ''
  };
  loadQuestionsPage();
  loadFilterOptions();
}

function resetQuestionFilters() {
  document.getElementById('questionSearch').value = '';
  document.getElementById('questionTypeFilter').value = '';
  document.getElementById('questionCategoryFilter').value = '';
  document.getElementById('questionDifficultyFilter').value = '';
  currentQuestionPage = 0;
  currentQuestionFilters = {};
  loadQuestionsPage();
  loadFilterOptions();
}

async function loadFilterOptions() {
  try {
    const categories = await getQuestionCategories();
    if (categories.success) {
      const categorySelect = document.getElementById('questionCategoryFilter');
      if (categorySelect) {
        const currentValue = categorySelect.value;
        categorySelect.innerHTML = '<option value="">All Categories</option>' +
          categories.data.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        categorySelect.value = currentValue;
      }
    }
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

// ============================================================
// QUESTION BANK - ADD/EDIT MODALS
// ============================================================

let currentEditingQuestionId = null;
let currentEditingQuestionImage = null;

function showAddQuestionModal() {
  currentEditingQuestionId = null;
  resetQuestionForm();
  document.getElementById('questionModalTitle').textContent = 'Add Question';
  document.getElementById('saveQuestionBtn').textContent = 'Save Question';
  openModal('questionModal');
}

async function editQuestion(questionId) {
  try {
    const result = await getQuestion(questionId);
    if (!result.success) {
      showMessage('questionMessage', result.error, 'error');
      return;
    }

    currentEditingQuestionId = questionId;
    const q = result.data;

    document.getElementById('questionTitle').value = q.title;
    document.getElementById('questionDescription').value = q.description || '';
    document.getElementById('questionType').value = q.question_type;
    document.getElementById('questionText').value = q.question_text;
    document.getElementById('questionCorrectAnswer').value = q.correct_answer || '';
    document.getElementById('questionPoints').value = q.points;
    document.getElementById('questionCategory').value = q.category || '';
    document.getElementById('questionDifficulty').value = q.difficulty_level;
    document.getElementById('questionTags').value = (q.tags || []).join(', ');

    if (q.options) {
      const optionsStr = Array.isArray(q.options.options)
        ? q.options.options.join(', ')
        : JSON.stringify(q.options);
      document.getElementById('questionOptions').value = optionsStr;
    }

    if (q.image_url) {
      document.getElementById('questionImagePreview').src = q.image_url;
      document.getElementById('questionImagePreview').style.display = 'block';
      document.getElementById('removeImageBtn').style.display = 'inline-block';
      currentEditingQuestionImage = q.image_url;
    }

    updateQuestionTypeUI();
    document.getElementById('questionModalTitle').textContent = 'Edit Question';
    document.getElementById('saveQuestionBtn').textContent = 'Update Question';
    openModal('questionModal');
  } catch (error) {
    console.error('Error loading question:', error);
    showMessage('questionMessage', 'Error loading question', 'error');
  }
}

function updateQuestionTypeUI() {
  const type = document.getElementById('questionType').value;
  const optionsSection = document.getElementById('optionsSection');
  const correctAnswerLabel = document.getElementById('correctAnswerLabel');

  if (['MCQ', 'PL', 'ORDERED_LIST'].includes(type)) {
    optionsSection.style.display = 'block';
  } else {
    optionsSection.style.display = 'none';
  }

  if (type === 'TRUEFALSE') {
    correctAnswerLabel.textContent = 'Correct Answer (true/false) *';
  } else if (['MCQ', 'PL', 'ORDERED_LIST'].includes(type)) {
    correctAnswerLabel.textContent = 'Correct Answer (option number or text) *';
  } else {
    correctAnswerLabel.textContent = 'Correct Answer *';
  }
}

function resetQuestionForm() {
  document.getElementById('questionTitle').value = '';
  document.getElementById('questionDescription').value = '';
  document.getElementById('questionType').value = '';
  document.getElementById('questionText').value = '';
  document.getElementById('questionCorrectAnswer').value = '';
  document.getElementById('questionPoints').value = '10';
  document.getElementById('questionCategory').value = '';
  document.getElementById('questionDifficulty').value = 'medium';
  document.getElementById('questionTags').value = '';
  document.getElementById('questionOptions').value = '';
  document.getElementById('questionImageInput').value = '';
  document.getElementById('questionImagePreview').style.display = 'none';
  document.getElementById('removeImageBtn').style.display = 'none';
  document.getElementById('questionMessage').style.display = 'none';
  currentEditingQuestionImage = null;
  updateQuestionTypeUI();
}

async function saveQuestion() {
  try {
    const title = document.getElementById('questionTitle').value.trim();
    const questionType = document.getElementById('questionType').value;
    const questionText = document.getElementById('questionText').value.trim();
    const correctAnswer = document.getElementById('questionCorrectAnswer').value.trim();

    if (!title || !questionType || !questionText || !correctAnswer) {
      showMessage('questionMessage', 'Please fill in all required fields', 'error');
      return;
    }

    const questionData = {
      title,
      description: document.getElementById('questionDescription').value,
      question_type: questionType,
      question_text: questionText,
      correct_answer: correctAnswer,
      points: parseInt(document.getElementById('questionPoints').value) || 10,
      category: document.getElementById('questionCategory').value,
      difficulty_level: document.getElementById('questionDifficulty').value,
      tags: document.getElementById('questionTags').value.split(',').map(t => t.trim()).filter(Boolean),
      image_url: currentEditingQuestionImage
    };

    if (['MCQ', 'PL', 'ORDERED_LIST'].includes(questionType)) {
      const optionsText = document.getElementById('questionOptions').value.trim();
      if (!optionsText) {
        showMessage('questionMessage', 'Please provide options for this question type', 'error');
        return;
      }
      questionData.options = {
        options: optionsText.split(',').map(o => o.trim())
      };
    }

    let result;
    if (currentEditingQuestionId) {
      result = await editQuestion(currentEditingQuestionId, questionData);
    } else {
      result = await addQuestion(questionData);
    }

    if (result.success) {
      showMessage('questionMessage', result.message, 'success');
      setTimeout(() => {
        closeQuestionModal();
        currentQuestionPage = 0;
        loadQuestionsPage();
      }, 1000);
    } else {
      showMessage('questionMessage', result.error, 'error');
    }
  } catch (error) {
    console.error('Error saving question:', error);
    showMessage('questionMessage', 'Error saving question', 'error');
  }
}

async function deleteQuestionConfirm(questionId) {
  if (confirm('Are you sure you want to delete this question?')) {
    try {
      const result = await deleteQuestion(questionId);
      if (result.success) {
        showNotification('Question deleted successfully', 'success');
        loadQuestionsPage();
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  }
}

async function exportQuestions() {
  try {
    const result = await exportQuestionsToExcel();
    if (result.success) {
      showNotification(`${result.count} questions exported successfully`, 'success');
    } else {
      showNotification(result.error, 'error');
    }
  } catch (error) {
    console.error('Error exporting questions:', error);
  }
}

// ============================================================
// QUESTION BANK - IMAGE HANDLING
// ============================================================

function previewQuestionImage() {
  const file = document.getElementById('questionImageInput').files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const preview = document.getElementById('questionImagePreview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    document.getElementById('removeImageBtn').style.display = 'inline-block';

    // Store for later upload
    currentEditingQuestionImage = file;
  };
  reader.readAsDataURL(file);
}

function removeQuestionImagePreview() {
  document.getElementById('questionImageInput').value = '';
  document.getElementById('questionImagePreview').style.display = 'none';
  document.getElementById('removeImageBtn').style.display = 'none';
  currentEditingQuestionImage = null;
}

// ============================================================
// QUESTION BANK - IMPORT EXCEL
// ============================================================

let selectedExcelFile = null;

function showImportExcelModal() {
  selectedExcelFile = null;
  document.getElementById('excelFileInput').value = '';
  document.getElementById('selectedFileName').textContent = '';
  document.getElementById('importMessage').style.display = 'none';
  document.getElementById('importProgress').style.display = 'none';
  openModal('importExcelModal');
}

function handleExcelFileSelect() {
  const file = document.getElementById('excelFileInput').files[0];
  if (file) {
    selectedExcelFile = file;
    document.getElementById('selectedFileName').textContent = `Selected: ${file.name}`;
  }
}

async function importExcelFile() {
  if (!selectedExcelFile) {
    showMessage('importMessage', 'Please select a file first', 'error');
    return;
  }

  try {
    document.getElementById('importExcelBtn').disabled = true;
    document.getElementById('importExcelBtn').textContent = 'Importing...';

    const result = await importQuestionsFromExcel(selectedExcelFile);

    if (result.success) {
      document.getElementById('importSuccessCount').textContent = result.successCount;
      document.getElementById('importErrorCount').textContent = result.errorCount;

      if (result.errors.length > 0) {
        const errorsList = result.errors.map(e => `
          <div style="background: #fef2f2; padding: 8px; border-radius: 4px; margin-bottom: 4px; font-size: 12px;">
            <strong>Row ${e.row}:</strong> ${e.message}
          </div>
        `).join('');
        document.getElementById('importErrors').innerHTML = errorsList;
      }

      document.getElementById('importProgress').style.display = 'block';
      showMessage('importMessage', result.message, result.errorCount > 0 ? 'warning' : 'success');

      setTimeout(() => {
        closeImportExcelModal();
        loadQuestionsPage();
      }, 2000);
    } else {
      showMessage('importMessage', result.error, 'error');
    }
  } catch (error) {
    console.error('Error importing file:', error);
    showMessage('importMessage', 'Error importing file: ' + error.message, 'error');
  } finally {
    document.getElementById('importExcelBtn').disabled = false;
    document.getElementById('importExcelBtn').textContent = 'Import Questions';
  }
}

// ============================================================
// QUESTION BANK - DATASET MANAGEMENT
// ============================================================

async function manageQuestionDatasets(questionId) {
  // Show a simple modal or redirect to dataset management
  alert('Dataset management for question ' + questionId + ' - Coming soon in dataset management modal');
}

// ============================================================
// MODULE BANK - TABLE & PAGINATION
// ============================================================

let currentModulePage = 0;
const modulesPerPage = 20;
let currentModuleFilters = {};

async function loadModulesPage() {
  try {
    const filters = {
      ...currentModuleFilters,
      page: currentModulePage,
      limit: modulesPerPage
    };

    const result = await getAllModules(filters);

    if (!result.success) {
      showNotification(result.error, 'error');
      return;
    }

    renderModulesList(result.data);
    updateModuleStats();
    updateModulePagination(result.total);
  } catch (error) {
    console.error('Error loading modules:', error);
  }
}

async function renderModulesList(modules) {
  const container = document.getElementById('modulesContainer');
  if (!container) return;

  if (modules.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">No modules found</div>';
    return;
  }

  const moduleItems = await Promise.all(modules.map(async (m) => {
    const moduleDetail = await getModuleWithQuestions(m.id);
    const questionCount = moduleDetail.data?.questions?.length || 0;
    const totalPoints = moduleDetail.data?.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

    return `
      <div class="module-item">
        <div class="module-info">
          <h3>${m.name}</h3>
          <p>${m.description || 'No description'}</p>
          <div style="display: flex; gap: 20px; margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
            <span><i class="fas fa-list"></i> ${questionCount} questions</span>
            <span><i class="fas fa-star"></i> ${totalPoints} points</span>
            <span><i class="fas fa-calendar"></i> ${new Date(m.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <div class="module-actions">
          <button class="btn btn-sm btn-secondary" onclick="editModule('${m.id}')" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="deleteModuleConfirm('${m.id}')" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm btn-secondary" onclick="previewModule('${m.id}')" title="Preview">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `;
  }));

  container.innerHTML = moduleItems.join('');
}

function updateModulePagination(total) {
  const prevBtn = document.getElementById('prevModulesBtn');
  const nextBtn = document.getElementById('nextModulesBtn');
  const pageInfo = document.getElementById('modulesPageInfo');

  if (!prevBtn || !nextBtn || !pageInfo) return;

  const totalPages = Math.ceil(total / modulesPerPage);
  pageInfo.textContent = `Page ${currentModulePage + 1} of ${totalPages}`;

  prevBtn.disabled = currentModulePage === 0;
  nextBtn.disabled = currentModulePage >= totalPages - 1;
}

function previousModulesPage() {
  if (currentModulePage > 0) {
    currentModulePage--;
    loadModulesPage();
  }
}

function nextModulesPage() {
  currentModulePage++;
  loadModulesPage();
}

async function updateModuleStats() {
  try {
    const result = await getAllModules({ limit: 1000 });
    if (result.success) {
      document.getElementById('totalModulesCount').textContent = result.data.length;

      let totalQuestions = 0;
      for (const m of result.data) {
        const detail = await getModuleWithQuestions(m.id);
        if (detail.data?.questions) {
          totalQuestions += detail.data.questions.length;
        }
      }
      document.getElementById('totalModuleQuestions').textContent = totalQuestions;
    }
  } catch (error) {
    console.error('Error updating module stats:', error);
  }
}

// ============================================================
// MODULE BANK - SEARCH & FILTER
// ============================================================

async function applyModuleFilters() {
  currentModulePage = 0;
  currentModuleFilters = {
    search: document.getElementById('moduleSearch')?.value || ''
  };
  loadModulesPage();
}

function resetModuleFilters() {
  document.getElementById('moduleSearch').value = '';
  currentModulePage = 0;
  currentModuleFilters = {};
  loadModulesPage();
}

// ============================================================
// MODULE BANK - ADD/EDIT MODALS
// ============================================================

let currentEditingModuleId = null;
let selectedQuestionsForModule = [];

function showAddModuleModal() {
  currentEditingModuleId = null;
  selectedQuestionsForModule = [];
  resetModuleForm();
  document.getElementById('moduleModalTitle').textContent = 'Add Module';
  document.getElementById('saveModuleBtn').textContent = 'Save Module';
  loadQuestionsForModule();
  openModal('moduleModal');
}

async function editModule(moduleId) {
  try {
    const result = await getModuleWithQuestions(moduleId);
    if (!result.success) {
      showNotification(result.error, 'error');
      return;
    }

    currentEditingModuleId = moduleId;
    const m = result.data;

    document.getElementById('moduleName').value = m.name;
    document.getElementById('moduleDescription').value = m.description || '';

    selectedQuestionsForModule = m.question_ids || [];
    loadQuestionsForModule();
    renderSelectedQuestionsPreview(m.questions || []);

    document.getElementById('moduleModalTitle').textContent = 'Edit Module';
    document.getElementById('saveModuleBtn').textContent = 'Update Module';
    openModal('moduleModal');
  } catch (error) {
    console.error('Error loading module:', error);
  }
}

async function loadQuestionsForModule() {
  try {
    const result = await searchQuestions({ limit: 1000 });
    if (!result.success) {
      console.error('Error loading questions:', result.error);
      return;
    }

    const container = document.getElementById('moduleQuestionsCheckboxes');
    if (!container) return;

    container.innerHTML = result.data.map(q => `
      <label style="display: flex; align-items: center; padding: 8px; margin: 0; cursor: pointer; border-radius: 4px; gap: 10px;">
        <input type="checkbox"
               data-question-id="${q.id}"
               data-question-title="${q.title}"
               data-question-points="${q.points}"
               onchange="updateSelectedQuestions()"
               ${selectedQuestionsForModule.includes(q.id) ? 'checked' : ''}>
        <div style="flex: 1;">
          <div style="font-weight: 500; color: var(--text-primary);">${q.title}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">${q.question_type} • ${q.points} pts</div>
        </div>
      </label>
    `).join('');
  } catch (error) {
    console.error('Error loading questions for module:', error);
  }
}

function updateSelectedQuestions() {
  const checkboxes = document.querySelectorAll('#moduleQuestionsCheckboxes input[type="checkbox"]');
  selectedQuestionsForModule = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.questionId);

  renderSelectedQuestionsPreview();
  updateModuleStats();
}

async function renderSelectedQuestionsPreview(questions = null) {
  const container = document.getElementById('moduleQuestionsPreview');
  if (!container) return;

  if (selectedQuestionsForModule.length === 0 && !questions) {
    container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">No questions selected yet</div>';
    document.getElementById('moduleQuestionCount').textContent = '0';
    document.getElementById('moduleTotalPoints').textContent = '0';
    return;
  }

  let questionsData = questions;
  if (!questions) {
    const result = await searchQuestions({ limit: 1000 });
    if (result.success) {
      questionsData = result.data.filter(q => selectedQuestionsForModule.includes(q.id));
    }
  }

  const totalPoints = questionsData.reduce((sum, q) => sum + (q.points || 0), 0);
  document.getElementById('moduleQuestionCount').textContent = questionsData.length;
  document.getElementById('moduleTotalPoints').textContent = totalPoints;

  container.innerHTML = questionsData.map((q, idx) => `
    <div class="question-order-item" draggable="true">
      <span class="drag-handle"><i class="fas fa-grip-vertical"></i></span>
      <div style="flex: 1;">
        <strong>${idx + 1}. ${q.title}</strong>
        <div style="font-size: 12px; color: var(--text-secondary);">${q.question_type} • ${q.points} pts</div>
      </div>
      <button type="button" class="btn btn-sm btn-danger" onclick="removeQuestionFromSelection('${q.id}')">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}

function removeQuestionFromSelection(questionId) {
  selectedQuestionsForModule = selectedQuestionsForModule.filter(id => id !== questionId);
  const checkbox = document.querySelector(`input[data-question-id="${questionId}"]`);
  if (checkbox) checkbox.checked = false;
  renderSelectedQuestionsPreview();
}

function refreshQuestionsForModule() {
  loadQuestionsForModule();
}

function resetModuleForm() {
  document.getElementById('moduleName').value = '';
  document.getElementById('moduleDescription').value = '';
  selectedQuestionsForModule = [];
  document.getElementById('moduleMessage').style.display = 'none';
}

async function saveModule() {
  try {
    const name = document.getElementById('moduleName').value.trim();
    const description = document.getElementById('moduleDescription').value.trim();

    if (!name) {
      showMessage('moduleMessage', 'Please enter a module name', 'error');
      return;
    }

    if (selectedQuestionsForModule.length === 0) {
      showMessage('moduleMessage', 'Please select at least one question', 'error');
      return;
    }

    const moduleData = {
      name,
      description,
      question_ids: selectedQuestionsForModule,
      question_order: selectedQuestionsForModule
    };

    let result;
    if (currentEditingModuleId) {
      result = await editModule(currentEditingModuleId, moduleData);
    } else {
      result = await addModule(moduleData);
    }

    if (result.success) {
      showMessage('moduleMessage', result.message, 'success');
      setTimeout(() => {
        closeModuleModal();
        currentModulePage = 0;
        loadModulesPage();
      }, 1000);
    } else {
      showMessage('moduleMessage', result.error, 'error');
    }
  } catch (error) {
    console.error('Error saving module:', error);
    showMessage('moduleMessage', 'Error saving module', 'error');
  }
}

async function deleteModuleConfirm(moduleId) {
  if (confirm('Are you sure you want to delete this module?')) {
    try {
      const result = await deleteModule(moduleId);
      if (result.success) {
        showNotification('Module deleted successfully', 'success');
        loadModulesPage();
      } else {
        showNotification(result.error, 'error');
      }
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  }
}

async function previewModule(moduleId) {
  try {
    const result = await getModuleWithQuestions(moduleId);
    if (result.success) {
      const m = result.data;
      const questions = m.questions || [];
      const questionsList = questions.map((q, idx) => `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid var(--border);">
          <strong>${idx + 1}. ${q.title}</strong> (${q.question_type} • ${q.points} pts)
          <p style="margin: 8px 0; color: var(--text-secondary);">${q.question_text}</p>
        </div>
      `).join('');

      alert(`Module: ${m.name}\n\nQuestions: ${questions.length}\nTotal Points: ${questions.reduce((sum, q) => sum + q.points, 0)}\n\n${questionsList}`);
    }
  } catch (error) {
    console.error('Error previewing module:', error);
  }
}

// ============================================================
// MODAL UTILITIES
// ============================================================

function closeQuestionModal() {
  closeModal('questionModal');
  resetQuestionForm();
}

function closeModuleModal() {
  closeModal('moduleModal');
  resetModuleForm();
}

function closeImportExcelModal() {
  closeModal('importExcelModal');
  selectedExcelFile = null;
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function showMessage(elementId, message, type) {
  const element = document.getElementById(elementId);
  if (!element) return;

  element.textContent = message;
  element.className = `message ${type}`;
  element.style.display = 'block';

  if (type === 'success') {
    setTimeout(() => {
      element.style.display = 'none';
    }, 3000);
  }
}

function showNotification(message, type) {
  // Simple notification - can be enhanced with toast notifications
  console.log(`[${type.toUpperCase()}] ${message}`);
  alert(`${type.toUpperCase()}: ${message}`);
}

function updateUserInfo() {
  const currentUser = window.currentUser;
  const emailElements = document.querySelectorAll('[id*="userEmail"]');
  emailElements.forEach(el => {
    el.textContent = `Welcome, ${currentUser?.email || 'User'}`;
  });
}
