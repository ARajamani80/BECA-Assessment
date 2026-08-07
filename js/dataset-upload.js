// ============================================================================
// Dataset Upload Workflow - Post-Import for Free Text Questions
// ============================================================================

let datasetUploadState = {
  questions: [],
  currentIndex: 0
};

/**
 * Show dataset upload workflow for Free Text questions
 */
function showDatasetUploadWorkflow(freeTextQuestions) {
  if (!freeTextQuestions || freeTextQuestions.length === 0) return;

  datasetUploadState.questions = freeTextQuestions;
  datasetUploadState.currentIndex = 0;

  displayDatasetQuestion(0);
}

/**
 * Display a specific Free Text question for dataset upload
 */
function displayDatasetQuestion(index) {
  if (index >= datasetUploadState.questions.length) {
    closeModal('datasetUploadModal');
    showMessage('✅ All Free Text questions processed! You can now upload more questions or close.', 'success');
    return;
  }

  const q = datasetUploadState.questions[index];
  const progress = `${index + 1}/${datasetUploadState.questions.length}`;

  console.log(`📊 Showing dataset question ${index + 1}:`, q.id, q.text);

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h2 style="margin: 0;">📁 Upload Dataset Files</h2>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">Question ${progress}</p>
      </div>
      <button onclick="closeModal('datasetUploadModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0; font-weight: 600; color: #1e40af;">Q-${String(q.number).padStart(5, '0')} - Free Text Question</p>
      <p style="margin: 8px 0 0 0; color: #475569; font-size: 14px;">${q.text.substring(0, 100)}${q.text.length > 100 ? '...' : ''}</p>
    </div>

    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #92400e;">
        <strong>ℹ️ Note:</strong> Upload reference files (CAD drawings, PDFs, etc.) that trainees will need to answer this question.
      </p>
    </div>

    <div class="form-group">
      <label style="font-weight: 600; margin-bottom: 8px; display: block;">📂 Select Files to Upload</label>
      <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Supports: .rvt, .dwg, .pdf, .rfa, .rte, .rft, Images, Excel, ZIP (up to 100MB)</p>
      <input type="file" id="datasetUploadInput" multiple
             accept=".csv,.xlsx,.xls,.json,.pdf,.jpg,.jpeg,.png,.gif,.dwg,.dwt,.rvt,.rfa,.rte,.rft,.iam,.ipt,.ipj,.f3d,.f3z,.zip"
             style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">
      <div id="fileList" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
      ${index > 0 ? `<button class="btn btn-secondary" onclick="displayDatasetQuestion(${index - 1})">← Previous</button>` : ''}
      <button class="btn btn-secondary" onclick="skipDatasetQuestion(${index})">Skip Question</button>
      <button class="btn btn-success" id="uploadNextBtn" onclick="uploadDatasetAndNext(${index})">
        ${index === datasetUploadState.questions.length - 1 ? 'Upload & Complete' : 'Upload & Next →'}
      </button>
    </div>
  `;

  document.getElementById('datasetUploadModalContent').innerHTML = html;
  showModal('datasetUploadModal');

  // Attach file list update handler
  setTimeout(() => {
    const fileInput = document.getElementById('datasetUploadInput');
    if (fileInput) {
      fileInput.onchange = function() {
        const fileList = document.getElementById('fileList');
        if (this.files.length > 0) {
          let html = '<div style="margin-top: 10px;"><strong>Selected files:</strong><ul style="margin: 5px 0; padding-left: 20px;">';
          Array.from(this.files).forEach(f => {
            html += `<li>${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)</li>`;
          });
          html += '</ul></div>';
          fileList.innerHTML = html;
        } else {
          fileList.innerHTML = '';
        }
      };
    }
  }, 100);
}

/**
 * Upload dataset files and move to next question
 */
async function uploadDatasetAndNext(index) {
  const fileInput = document.getElementById('datasetUploadInput');
  const q = datasetUploadState.questions[index];
  const btn = document.getElementById('uploadNextBtn');

  if (!btn) {
    console.error('Button not found');
    return;
  }

  // Disable button and show loading
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  try {
    if (fileInput && fileInput.files.length > 0) {
      console.log(`⏳ Uploading ${fileInput.files.length} file(s) for Q-${String(q.number).padStart(5, '0')}...`);

      const uploadedUrls = [];

      // Upload each file
      for (let file of Array.from(fileInput.files)) {
        try {
          const url = await uploadQuestionDataset(q.id, file);
          uploadedUrls.push(url);
          console.log(`✅ Uploaded: ${file.name}`);
        } catch (fileError) {
          console.error(`❌ Failed to upload ${file.name}:`, fileError);
          throw new Error(`Failed to upload ${file.name}: ${fileError.message}`);
        }
      }

      // Update question with dataset files
      const client = await getSupabaseClient();
      const { error } = await client
        .from('assessment_questions')
        .update({ dataset_files: JSON.stringify(uploadedUrls) })
        .eq('id', q.id);

      if (error) throw error;

      console.log(`✅ Q-${String(q.number).padStart(5, '0')} updated with ${uploadedUrls.length} file(s)`);
      showMessage(`✅ ${uploadedUrls.length} file(s) uploaded for question ${index + 1}`, 'success');
    } else {
      console.log(`⏭️ Skipping dataset upload for Q-${String(q.number).padStart(5, '0')}`);
    }

    // Move to next question
    if (index + 1 < datasetUploadState.questions.length) {
      displayDatasetQuestion(index + 1);
    } else {
      closeModal('datasetUploadModal');
      showMessage('✅ All Free Text questions processed! Datasets uploaded successfully.', 'success');
    }
  } catch (error) {
    console.error('Upload error:', error);
    showMessage(`❌ Upload failed: ${error.message}`, 'error');
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

/**
 * Skip current question and move to next
 */
function skipDatasetQuestion(index) {
  console.log(`⏭️ Skipping Q-${String(datasetUploadState.questions[index].number).padStart(5, '0')}`);

  if (index + 1 < datasetUploadState.questions.length) {
    displayDatasetQuestion(index + 1);
  } else {
    closeModal('datasetUploadModal');
    showMessage('✅ Free Text questions processed!', 'success');
  }
}
