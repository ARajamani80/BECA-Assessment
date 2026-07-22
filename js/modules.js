// BECA Assessment Platform - Modules Module

/**
 * Render module bank page
 */
async function renderModules() {
  document.getElementById('pageTitle').textContent = 'Module Bank';
  document.getElementById('page').innerHTML = `
    <div class="card">
      <div class="card-title"><i class="fas fa-book"></i> Module Bank</div>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">
        Modules are managed within assessments. Create an assessment first to add modules to it.
      </p>
      <button class="btn btn-primary" onclick="showPage('create-assessment')">
        <i class="fas fa-plus"></i> Create New Assessment
      </button>
    </div>
  `;
}

/**
 * Handle module save
 * @param {Event} e - Form event
 */
async function handleModuleSave(e) {
  e.preventDefault();

  try {
    const moduleId = document.getElementById('moduleModal').dataset.moduleId;
    const name = document.getElementById('moduleName').value;
    const description = document.getElementById('moduleDescription').value;

    if (moduleId) {
      await updateModule(moduleId, { name, description });
    } else {
      await createModule({
        name,
        description,
        assessment_id: currentAssessmentEdit
      });
    }

    closeModal('moduleModal');
    showMessage('Module saved!', 'success');
    loadModules(currentAssessmentEdit);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}
