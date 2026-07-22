// CORRECT Question Bank Implementation
// Questions are created INDEPENDENTLY and stored in database
// They can be reused across multiple modules/assessments

let currentQuestionId = null;
let questionsData = [];

async function renderQuestions() {
  document.getElementById('pageTitle').textContent = 'Question Bank';

  try {
    // Load all questions from database
    const questions = await apiCall('GET', 'questions?select=*&order=created_at.desc');
    questionsData = Array.isArray(questions) ? questions : [];

    let html = `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div class="card-title" style="margin: 0;">📚 Question Bank</div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary btn-sm" onclick="openAddQuestionModal()">
              <i class="fas fa-plus"></i> Add Question
            </button>
            <button class="btn btn-secondary btn-sm" onclick="openImportExcelModal()">
              <i class="fas fa-upload"></i> Import Excel
            </button>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Points</th>
              <th>Category</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (questionsData.length === 0) {
      html += '<tr><td colspan="6" style="text-align: center; color: #64748b;">No questions yet. Create one to get started!</td></tr>';
    } else {
      questionsData.forEach(q => {
        const createdDate = new Date(q.created_at).toLocaleDateString();
        html += `
          <tr>
            <td><strong>${q.title || 'Untitled'}</strong></td>
            <td><span class="badge" style="background: #e0e7ff; color: #4f46e5;">${q.question_type || 'MCQ'}</span></td>
            <td>${q.points || 10}</td>
            <td>${q.category || '-'}</td>
            <td>${createdDate}</td>
            <td>
              <button class="btn btn-primary btn-sm" onclick="editQuestion('${q.id}')"><i class="fas fa-edit"></i></button>
              <button class="btn btn-danger btn-sm" onclick="deleteQuestion('${q.id}')"><i class="fas fa-trash"></i></button>
            </td>
          </tr>
        `;
      });
    }

    html += '</tbody></table></div>';
    document.getElementById('page').innerHTML = html;
  } catch (error) {
    console.error('Error loading questions:', error);
    showMessage('Error loading questions: ' + error.message, 'error');
  }
}

function openAddQuestionModal() {
  currentQuestionId = null;
  document.getElementById('questionTitle').value = '';
  document.getElementById('questionType').value = 'MCQ';
  document.getElementById('questionText').value = '';
  document.getElementById('questionPoints').value = '10';
  document.getElementById('questionCategory').value = '';
  document.getElementById('questionDifficulty').value = 'Medium';
  document.getElementById('questionModal').classList.add('active');
}

function editQuestion(id) {
  const question = questionsData.find(q => q.id === id);
  if (!question) return;

  currentQuestionId = id;
  document.getElementById('questionTitle').value = question.title || '';
  document.getElementById('questionType').value = question.question_type || 'MCQ';
  document.getElementById('questionText').value = question.question_text || '';
  document.getElementById('questionPoints').value = question.points || '10';
  document.getElementById('questionCategory').value = question.category || '';
  document.getElementById('questionDifficulty').value = question.difficulty_level || 'Medium';
  document.getElementById('questionModal').classList.add('active');
}

async function saveQuestion() {
  const title = document.getElementById('questionTitle').value;
  const type = document.getElementById('questionType').value;
  const text = document.getElementById('questionText').value;
  const points = parseInt(document.getElementById('questionPoints').value);
  const category = document.getElementById('questionCategory').value;
  const difficulty = document.getElementById('questionDifficulty').value;

  if (!title || !text) {
    showMessage('Please fill in all required fields', 'error');
    return;
  }

  try {
    const questionData = {
      title,
      question_type: type,
      question_text: text,
      points,
      category,
      difficulty_level: difficulty,
      created_by: currentUser.id
    };

    if (currentQuestionId) {
      // Update existing
      await apiCall('PATCH', 'questions', questionData, `?id=eq.${currentQuestionId}`);
      showMessage('Question updated!', 'success');
    } else {
      // Create new
      await apiCall('POST', 'questions', questionData);
      showMessage('Question created!', 'success');
    }

    closeModal('questionModal');
    renderQuestions();
  } catch (error) {
    showMessage('Error saving question: ' + error.message, 'error');
  }
}

async function deleteQuestion(id) {
  if (!confirm('Delete this question? It will be removed from all modules.')) return;

  try {
    await apiCall('DELETE', 'questions', null, `?id=eq.${id}`);
    showMessage('Question deleted!', 'success');
    renderQuestions();
  } catch (error) {
    showMessage('Error deleting question: ' + error.message, 'error');
  }
}

function openImportExcelModal() {
  document.getElementById('excelImportModal').classList.add('active');
}

async function handleExcelImport(e) {
  const file = document.getElementById('excelFile').files[0];
  if (!file) {
    showMessage('Please select an Excel file', 'error');
    return;
  }

  try {
    showMessage('Importing Excel file...', 'success');
    
    // TODO: Parse Excel file and import questions
    // This requires a library like SheetJS
    // For now, show message
    
    showMessage('Excel import feature coming soon. Please add questions manually.', 'success');
  } catch (error) {
    showMessage('Error importing Excel: ' + error.message, 'error');
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}
