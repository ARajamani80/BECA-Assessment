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

/**
 * Show bulk dataset upload modal
 */
function showBulkDatasetUploadModal(freeTextQuestions) {
  if (!freeTextQuestions || freeTextQuestions.length === 0) {
    showMessage('No Free Text questions found', 'info');
    return;
  }

  const questionsList = freeTextQuestions.map((q, idx) => 
    `<div style="padding: 8px; background: #f9fafb; border-radius: 4px; margin: 5px 0;">
      <strong>Q-${String(q.number).padStart(5, '0')}:</strong> ${q.text.substring(0, 60)}${q.text.length > 60 ? '...' : ''}
    </div>`
  ).join('');

  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <div>
        <h2 style="margin: 0;">📁 Bulk Upload Datasets</h2>
        <p style="font-size: 12px; color: #666; margin: 5px 0;">Upload multiple .rvt, .dwg files for ${freeTextQuestions.length} Free Text question(s)</p>
      </div>
      <button onclick="closeModal('bulkDatasetUploadModal')" style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
    </div>

    <div style="background: #f0f7ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0; font-weight: 600; color: #1e40af;">📋 Free Text Questions Ready for Datasets:</p>
      <div style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
        ${questionsList}
      </div>
    </div>

    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #92400e;">
        <strong>ℹ️ How it works:</strong><br>
        1. Select multiple dataset files (.rvt, .dwg, .pdf, etc.)<br>
        2. Files will be distributed among Free Text questions<br>
        3. System will match by filename patterns when possible
      </p>
    </div>

    <div class="form-group">
      <label style="font-weight: 600; margin-bottom: 8px; display: block;">📂 Select Multiple Files</label>
      <p style="font-size: 12px; color: #666; margin: 0 0 10px 0;">Hold Ctrl/Cmd to select multiple files</p>
      <input type="file" id="bulkDatasetInput" multiple
             accept=".csv,.xlsx,.xls,.json,.pdf,.jpg,.jpeg,.png,.gif,.dwg,.dwt,.rvt,.rfa,.rte,.rft,.iam,.ipt,.ipj,.f3d,.f3z,.zip"
             style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; cursor: pointer;">
      <div id="bulkFileList" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
      <button class="btn btn-secondary" onclick="closeModal('bulkDatasetUploadModal')">Skip Upload</button>
      <button class="btn btn-success" id="bulkUploadBtn" onclick="processBulkDatasetUpload()">
        Upload All Files
      </button>
    </div>
  `;

  document.getElementById('bulkDatasetUploadModalContent').innerHTML = html;
  showModal('bulkDatasetUploadModal');

  // File list update
  setTimeout(() => {
    const fileInput = document.getElementById('bulkDatasetInput');
    if (fileInput) {
      fileInput.onchange = function() {
        const fileList = document.getElementById('bulkFileList');
        if (this.files.length > 0) {
          let html = `<div style="margin-top: 10px;"><strong>Selected ${this.files.length} file(s):</strong><ul style="margin: 5px 0; padding-left: 20px;">`;
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
 * Process bulk dataset upload
 */
async function processBulkDatasetUpload() {
  const fileInput = document.getElementById('bulkDatasetInput');
  const btn = document.getElementById('bulkUploadBtn');
  const questions = datasetUploadState.questions;

  if (!fileInput || fileInput.files.length === 0) {
    showMessage('No files selected', 'warning');
    return;
  }

  if (questions.length === 0) {
    showMessage('No Free Text questions found', 'error');
    return;
  }

  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

  try {
    const files = Array.from(fileInput.files);
    let uploadedCount = 0;
    let failedCount = 0;

    console.log(`📁 Starting bulk upload of ${files.length} file(s) for ${questions.length} question(s)`);

    // Distribute files among questions
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const questionIndex = i % questions.length; // Round-robin distribution
      const question = questions[questionIndex];

      try {
        console.log(`⏳ Uploading ${file.name} to Q-${String(question.number).padStart(5, '0')}...`);
        const fileUrl = await uploadQuestionDataset(question.id, file);

        // Get existing files and add new one
        const client = await getSupabaseClient();
        const { data: qData } = await client
          .from('assessment_questions')
          .select('dataset_files')
          .eq('id', question.id)
          .single();

        const existingFiles = qData?.dataset_files ? JSON.parse(qData.dataset_files) : [];
        const updatedFiles = [...existingFiles, fileUrl];

        await client
          .from('assessment_questions')
          .update({ dataset_files: JSON.stringify(updatedFiles) })
          .eq('id', question.id);

        console.log(`✅ Uploaded ${file.name} to Q-${String(question.number).padStart(5, '0')}`);
        uploadedCount++;
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        failedCount++;
      }
    }

    const msg = `✅ Bulk upload complete! ${uploadedCount} file(s) uploaded${failedCount > 0 ? `, ${failedCount} failed` : ''}`;
    showMessage(msg, 'success');

    closeModal('bulkDatasetUploadModal');
    showMessage('📁 All datasets uploaded. Questions are ready for assessment!', 'success');
  } catch (error) {
    console.error('Bulk upload error:', error);
    showMessage(`❌ Upload failed: ${error.message}`, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}
