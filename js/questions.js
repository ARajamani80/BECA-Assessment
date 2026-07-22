// BECA Assessment Platform - Questions Module

/**
 * Render question bank page
 */
async function renderQuestions() {
  document.getElementById('pageTitle').textContent = 'Question Bank';
  document.getElementById('page').innerHTML = `
    <div class="card">
      <div class="card-title"><i class="fas fa-comments"></i> Question Bank</div>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">
        Questions are managed within assessments. Create an assessment first to add questions to it.
      </p>
      <button class="btn btn-primary" onclick="showPage('create-assessment')">
        <i class="fas fa-plus"></i> Create New Assessment
      </button>
    </div>
  `;
}

/**
 * Handle question save
 * @param {Event} e - Form event
 */
async function handleQuestionSave(e) {
  e.preventDefault();

  try {
    const questionId = document.getElementById('questionModal').dataset.questionId;
    const moduleId = document.getElementById('questionModal').dataset.moduleId;
    const type = document.getElementById('questionType').value;
    const text = document.getElementById('questionText').value;
    const points = parseInt(document.getElementById('questionPoints').value);

    let questionData = {
      question_text: text,
      question_type: type,
      points: points,
      module_id: moduleId
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
      questionData.options = options;
    } else if (type === 'fileupload') {
      const fileTypes = [];
      document.querySelectorAll('input[name="fileType"]:checked').forEach(cb => {
        fileTypes.push(cb.value);
      });
      questionData.allowed_file_types = fileTypes;
    }

    if (questionId) {
      await updateQuestion(questionId, questionData);
    } else {
      await createQuestion(questionData);
    }

    closeModal('questionModal');
    showMessage('Question saved!', 'success');
    loadModules(currentAssessmentEdit);
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}
