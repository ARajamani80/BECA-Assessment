// BECA Assessment Platform - Send to Trainees Module

/**
 * Render send trainees page
 */
async function renderSendTrainees() {
  document.getElementById('pageTitle').textContent = 'Send Assessment to Trainees';

  try {
    const assessments = await getAssessments();
    const users = await getUsers();

    let assessmentOptions = '<option value="">Select Assessment</option>';
    if (Array.isArray(assessments)) {
      assessments.forEach(a => {
        assessmentOptions += `<option value="${a.id}">${a.title || a.name}</option>`;
      });
    }
    document.getElementById('assessmentSelect').innerHTML = assessmentOptions;

    let traineesHtml = '';
    if (Array.isArray(users)) {
      users.forEach(u => {
        traineesHtml += `
          <label style="display: flex; align-items: center; gap: 8px; padding: 8px; border-bottom: 1px solid var(--border);">
            <input type="checkbox" name="trainee" value="${u.id}" class="trainee-checkbox">
            <span>${u.full_name || u.email}</span>
            <span class="badge badge-${u.user_role || 'user'}" style="margin-left: auto;">${u.user_role || 'user'}</span>
          </label>
        `;
      });
    }
    document.getElementById('traineesList').innerHTML = traineesHtml || '<p style="color: var(--text-secondary);">No trainees found</p>';

    document.getElementById('traineesModal').classList.add('active');
  } catch (error) {
    showMessage('Error loading data: ' + error.message, 'error');
  }
}

/**
 * Handle send to trainees
 * @param {Event} e - Form event
 */
async function handleSendToTrainees(e) {
  e.preventDefault();

  try {
    const assessmentId = document.getElementById('assessmentSelect').value;
    const selectedTrainees = Array.from(document.querySelectorAll('.trainee-checkbox:checked')).map(cb => cb.value);
    const includeDatasets = document.getElementById('includedatasets').checked;

    if (!assessmentId || selectedTrainees.length === 0) {
      showMessage('Please select assessment and trainees', 'error');
      return;
    }

    for (const traineeId of selectedTrainees) {
      const token = generateToken(32);
      await createAssessmentTaker({
        assessment_id: assessmentId,
        trainee_id: traineeId,
        assigned_by: currentUser.id,
        token: token,
        status: 'assigned',
        answers: {}
      });
    }

    closeModal('traineesModal');
    showMessage(`Assessment sent to ${selectedTrainees.length} trainee(s)!`, 'success');
  } catch (error) {
    showMessage('Error: ' + error.message, 'error');
  }
}
