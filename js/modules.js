// ============================================================================
// BECA Assessment Platform - Module Bank (INDEPENDENT)
//
// This module manages independent groups of questions from the Question Bank.
// Modules are created separately and can be assigned to assessments.
//
// WORKFLOW: Select Questions from Bank → Group into Module → Assign to Assessment
// ============================================================================

let allModules = [];
let filteredModules = [];
let allQuestions = [];
let currentModuleEdit = null;
let moduleCurrentPage = 1;
const moduleItemsPerPage = 10;

/**
 * Render Module Bank page
 */
async function renderModules() {
  document.getElementById('pageTitle').textContent = 'Module Bank';

  try {
    await loadAllModules();
    await loadAllQuestionsForModules();

    document.getElementById('page').innerHTML = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div class="card-title" style="margin: 0;"><i class="fas fa-book"></i> Module Bank</div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="openCreateModuleModal()">
              <i class="fas fa-plus"></i> Create Module
            </button>
            <button class="btn btn-info btn-sm" id="exportModulesBtn" onclick="exportModulesToExcel(allModules)" title="Export all modules to Excel">
              <i class="fas fa-download"></i> Export
            </button>
            <button class="btn btn-secondary btn-sm" id="refreshModulesBtn" onclick="refreshModuleBank()" title="Refresh modules list">
              <i class="fas fa-redo"></i> Refresh
            </button>
          </div>
        </div>

        <!-- Search -->
        <div style="margin-bottom: 20px;">
          <input type="text" id="moduleSearch" placeholder="Search modules..."
                 onkeyup="filterModules()" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <!-- Modules Table -->
        <div style="overflow-x: auto;">
          <table class="table">
            <thead>
              <tr>
                <th>Module Name</th>
                <th>Description</th>
                <th>Questions</th>
                <th>Total Points</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="modulesTable">
              <tr><td colspan="6" style="text-align: center; color: #999;">Loading modules...</td></tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div id="modulesPagination" style="margin-top: 20px; text-align: center;">
        </div>
      </div>
    `;

    displayModulesTable();
  } catch (error) {
    showMessage('Error loading modules: ' + error.message, 'error');
    document.getElementById('page').innerHTML = '<div class="card"><p style="color: red;">Error: ' + error.message + '</p></div>';
  }
}

/**
 * Load all modules from database
 */
async function loadAllModules() {
  try {
    allModules = await getModules();
    filteredModules = allModules;
  } catch (error) {
    console.error('Error loading modules:', error);
    allModules = [];
    filteredModules = [];
  }
}

/**
 * Load all questions for modules
 */
async function loadAllQuestionsForModules() {
  try {
    allQuestions = await getAllQuestions();
  } catch (error) {
    console.error('Error loading questions:', error);
    allQuestions = [];
  }
}

/**
 * Filter modules by search term
 */
function filterModules() {
  const searchTerm = document.getElementById('moduleSearch').value.toLowerCase();

  filteredModules = allModules.filter(m => {
    return !searchTerm ||
      m.name.toLowerCase().includes(searchTerm) ||
      (m.description && m.description.toLowerCase().includes(searchTerm));
  });

  moduleCurrentPage = 1;
  displayModulesTable();
}

/**
 * Display modules table with pagination
 */
function displayModulesTable() {
  const start = (moduleCurrentPage - 1) * moduleItemsPerPage;
  const end = start + moduleItemsPerPage;
  const pageModules = filteredModules.slice(start, end);

  let html = '';
  if (pageModules.length === 0) {
    html = '<tr><td colspan="6" style="text-align: center; color: #999;">No modules found</td></tr>';
  } else {
    pageModules.forEach(m => {
      const createdDate = m.created_at ? formatDate(m.created_at) : 'N/A';
      const moduleQuestions = m.questions || [];
      const totalPoints = moduleQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

      html += `
        <tr>
          <td><strong>${m.name}</strong></td>
          <td>${truncateText(m.description || '', 50)}</td>
          <td><span class="badge">${moduleQuestions.length} Q</span></td>
          <td><strong>${totalPoints} pts</strong></td>
          <td>${createdDate}</td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" onclick="editModule('${m.id}')" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-info btn-sm" onclick="viewModuleQuestions('${m.id}')" title="View Questions">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="deleteModuleConfirm('${m.id}')" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  }

  document.getElementById('modulesTable').innerHTML = html;

  // Pagination
  const totalPages = Math.ceil(filteredModules.length / moduleItemsPerPage);
  let paginationHtml = '';

  if (totalPages > 1) {
    paginationHtml += `<div style="display: flex; justify-content: center; gap: 10px;">`;

    if (moduleCurrentPage > 1) {
      paginationHtml += `<button class="btn btn-secondary btn-sm" onclick="moduleCurrentPage--; displayModulesTable()">← Previous</button>`;
    }

    paginationHtml += `<span style="align-self: center; color: var(--text-secondary);">Page ${moduleCurrentPage} of ${totalPages}</span>`;

    if (moduleCurrentPage < totalPages) {
      paginationHtml += `<button class="btn btn-secondary btn-sm" onclick="moduleCurrentPage++; displayModulesTable()">Next →</button>`;
    }

    paginationHtml += `</div>`;
  }

  document.getElementById('modulesPagination').innerHTML = paginationHtml;
}

/**
 * Open create module modal
 */
async function openCreateModuleModal() {
  try {
    console.log('📚 openCreateModuleModal() called');
    currentModuleEdit = null;

    // Load assessments and questions first
    console.log('📥 Loading assessments and questions...');
    const assessments = await getAssessments();
    const assessmentOptions = assessments.map(a => `<option value="${a.id}">${a.title}</option>`).join('');

    // Ensure questions are loaded
    console.log('🔍 Current allQuestions:', allQuestions?.length || 0);
    if (!allQuestions || allQuestions.length === 0) {
      console.log('📥 Loading questions from API...');
      try {
        allQuestions = await getAllQuestions();
        console.log('✅ Loaded', allQuestions?.length || 0, 'questions');
      } catch (err) {
        console.error('❌ Failed to load questions:', err);
        allQuestions = [];
      }
    }
    console.log('📋 Questions available:', allQuestions?.length || 0);

    document.getElementById('moduleModalContent').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">Create New Module</h2>
        <button onclick="closeModal('moduleModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <form id="moduleForm" onsubmit="handleModuleSave(event)">
        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Select Assessment</label>
          <select id="assessmentSelect" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            <option value="">-- Choose Assessment --</option>
            ${assessmentOptions}
          </select>
        </div>

        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Module Name</label>
          <input type="text" id="moduleName" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <div class="form-group">
          <label>Description (Optional)</label>
          <textarea id="moduleDescription" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 60px;"></textarea>
        </div>

        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Select Questions</label>
          <p style="color: var(--text-secondary); font-size: 12px; margin: 5px 0;">Choose questions to include in this module</p>
          <div id="questionsChecklistContainer" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
            ${loadQuestionsChecklist()}
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn btn-success" style="flex: 1;">
            <i class="fas fa-save"></i> Create Module
          </button>
          <button type="button" class="btn btn-secondary" onclick="closeModal('moduleModal')" style="flex: 1;">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    `;

    const result = showModal('moduleModal');
    if (result) {
      console.log('✅ Module Modal opened successfully');
    }
    return result;
  } catch (error) {
    console.error('🔴 Error opening Module Modal:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Load questions checklist
 */
function loadQuestionsChecklist() {
  if (allQuestions.length === 0) {
    return '<p style="color: #999; text-align: center;">No questions available. Create questions in the Question Bank first.</p>';
  }

  let html = '';
  allQuestions.forEach(q => {
    const typeLabel = {
      'mcq': 'MCQ',
      'shortanswer': 'Short Answer',
      'essay': 'Essay',
      'fileupload': 'File Upload'
    }[q.question_type] || q.question_type;

    html += `
      <div style="display: flex; align-items: flex-start; padding: 10px; border-bottom: 1px solid #eee;">
        <input type="checkbox" name="moduleQuestion" value="${q.id}" class="module-question-checkbox" style="margin-right: 10px; margin-top: 4px;">
        <div style="flex: 1;">
          <div style="font-weight: bold;">${truncateText(q.question_text, 60)}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            <i class="fas fa-tag"></i> ${typeLabel} | <i class="fas fa-star"></i> ${q.points} points
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

/**
 * Handle module save
 */
async function handleModuleSave(e) {
  e.preventDefault();

  try {
    console.log('📝 Saving module...');
    const name = document.getElementById('moduleName').value;
    const description = document.getElementById('moduleDescription').value;
    const assessmentId = document.getElementById('assessmentSelect')?.value;

    if (!name || !assessmentId) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    // Module data (only database fields)
    const moduleData = {
      name: name,
      description: description || '',
      assessment_id: assessmentId,
      order_index: 0
    };

    console.log('📤 Module data to save:', moduleData);

    let createdModuleId = currentModuleEdit;

    if (currentModuleEdit) {
      // Update existing module using API
      console.log('🔄 Updating module:', currentModuleEdit);
      await updateModule(currentModuleEdit, moduleData);
      showMessage('✅ Module updated successfully!', 'success');
    } else {
      // Create new module using API
      console.log('✨ Creating new module');
      const newModule = await createModule(moduleData);
      createdModuleId = newModule.id;
      console.log('✅ Module created with ID:', createdModuleId);
    }

    // Link selected questions to this module
    const selectedQuestionIds = Array.from(document.querySelectorAll('.module-question-checkbox:checked'))
      .map(cb => cb.value);

    if (selectedQuestionIds.length > 0) {
      console.log('🔗 Linking', selectedQuestionIds.length, 'questions to module');
      for (const questionId of selectedQuestionIds) {
        await updateQuestion(questionId, { module_id: createdModuleId });
      }
      console.log('✅ All questions linked to module');
    }

    closeModal('moduleModal');
    await renderModules();
  } catch (error) {
    console.error('❌ Error saving module:', error);
    showMessage('Error: ' + error.message, 'error');
  }
}

/**
 * Edit module
 */
async function editModule(moduleId) {
  try {
    console.log('📚 editModule() called with ID:', moduleId);

    const module = allModules.find(m => m.id === moduleId);
    if (!module) {
      showMessage('Module not found', 'error');
      return;
    }

    currentModuleEdit = moduleId;

    document.getElementById('moduleModalContent').innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0;">Edit Module</h2>
        <button onclick="closeModal('moduleModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
      </div>

      <form id="moduleForm" onsubmit="handleModuleSave(event)">
        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Module Name</label>
          <input type="text" id="moduleName" value="${module.name}" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
        </div>

        <div class="form-group">
          <label>Description (Optional)</label>
          <textarea id="moduleDescription" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; min-height: 60px;">${module.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label><span style="color: #dc2626;">*</span> Select Questions</label>
          <p style="color: var(--text-secondary); font-size: 12px; margin: 5px 0;">Choose questions to include in this module</p>
          <div id="questionsChecklistContainer" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
            ${loadQuestionsChecklistForEdit(module)}
          </div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button type="submit" class="btn btn-success" style="flex: 1;">
            <i class="fas fa-save"></i> Update Module
          </button>
          <button type="button" class="btn btn-secondary" onclick="closeModal('moduleModal')" style="flex: 1;">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>
      </form>
    `;

    const result = showModal('moduleModal');
    if (result) {
      console.log('✅ Module edit modal opened successfully');
    }
    return result;
  } catch (error) {
    console.error('🔴 Error editing module:', error);
    alert('Error: ' + error.message);
    return false;
  }
}

/**
 * Load questions checklist with pre-selected items for editing
 */
function loadQuestionsChecklistForEdit(module) {
  if (allQuestions.length === 0) {
    return '<p style="color: #999; text-align: center;">No questions available.</p>';
  }

  const selectedIds = (module.questions || []).map(q => q.id || q);

  let html = '';
  allQuestions.forEach(q => {
    const typeLabel = {
      'mcq': 'MCQ',
      'shortanswer': 'Short Answer',
      'essay': 'Essay',
      'fileupload': 'File Upload'
    }[q.question_type] || q.question_type;

    const isSelected = selectedIds.includes(q.id);

    html += `
      <div style="display: flex; align-items: flex-start; padding: 10px; border-bottom: 1px solid #eee;">
        <input type="checkbox" name="moduleQuestion" value="${q.id}" class="module-question-checkbox" ${isSelected ? 'checked' : ''} style="margin-right: 10px; margin-top: 4px;">
        <div style="flex: 1;">
          <div style="font-weight: bold;">${truncateText(q.question_text, 60)}</div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            <i class="fas fa-tag"></i> ${typeLabel} | <i class="fas fa-star"></i> ${q.points} points
          </div>
        </div>
      </div>
    `;
  });

  return html;
}

/**
 * View module questions
 */
function viewModuleQuestions(moduleId) {
  const module = allModules.find(m => m.id === moduleId);
  if (!module) return;

  const questions = module.questions || [];

  document.getElementById('viewModuleModalContent').innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <h2 style="margin: 0;">${module.name} - Questions</h2>
      <button onclick="closeModal('viewModuleModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="overflow-x: auto;">
      <table class="table" style="font-size: 14px;">
        <thead>
          <tr>
            <th>#</th>
            <th>Question</th>
            <th>Type</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          ${questions.map((q, idx) => `
            <tr>
              <td>${idx + 1}</td>
              <td>${truncateText(q.question_text, 60)}</td>
              <td><span class="badge">${q.question_type}</span></td>
              <td>${q.points}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: right;">
      <button class="btn btn-secondary" onclick="closeModal('viewModuleModal')">Close</button>
    </div>
  `;

  showModal('viewModuleModal');
}

/**
 * Delete module with confirmation
 */
function deleteModuleConfirm(moduleId) {
  const module = allModules.find(m => m.id === moduleId);
  if (!module) return;

  if (confirm(`Delete module "${module.name}" and all its questions?`)) {
    deleteModule(moduleId);
  }
}

/**
 * Delete module from database
 */
async function deleteModule(moduleId) {
  try {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', moduleId);

    if (error) throw error;
    showMessage('Module deleted successfully!', 'success');
    await renderModules();
  } catch (error) {
    showMessage('Error deleting module: ' + error.message, 'error');
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
 * Refresh module bank - reload all modules
 */
async function refreshModuleBank() {
  const btn = document.getElementById('refreshModulesBtn');
  if (!btn) return;

  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';

  try {
    await loadAllModules();
    await loadAllQuestionsForModules();
    moduleCurrentPage = 1;
    displayModulesTable();
    showMessage('Data refreshed successfully', 'success');
  } catch (error) {
    showMessage('Error refreshing data: ' + error.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
}
