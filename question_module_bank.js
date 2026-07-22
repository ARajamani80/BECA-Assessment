/**
 * Question & Module Bank System
 * Comprehensive functions for managing global, reusable questions and modules
 * For BECA Assessment Platform
 */

// ============================================================
// QUESTION BANK FUNCTIONS
// ============================================================

/**
 * Add a new question to the question bank
 */
async function addQuestion(questionData) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const user = await sb.auth.getUser();
    if (!user.data?.user) throw new Error('User not authenticated');

    const { data, error } = await sb.from('question_bank').insert([{
      title: questionData.title,
      description: questionData.description || '',
      question_text: questionData.question_text,
      question_type: questionData.question_type,
      options: questionData.options || null,
      correct_answer: questionData.correct_answer,
      points: questionData.points || 10,
      image_url: questionData.image_url || null,
      has_dataset: questionData.has_dataset || false,
      difficulty_level: questionData.difficulty_level || 'medium',
      category: questionData.category || '',
      tags: questionData.tags || [],
      created_by: user.data.user.id
    }]).select();

    if (error) throw error;
    return { success: true, data: data[0], message: 'Question added successfully' };
  } catch (error) {
    console.error('Error adding question:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Edit an existing question
 */
async function editQuestion(questionId, questionData) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const user = await sb.auth.getUser();
    if (!user.data?.user) throw new Error('User not authenticated');

    const { data, error } = await sb.from('question_bank')
      .update({
        title: questionData.title,
        description: questionData.description || '',
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        options: questionData.options || null,
        correct_answer: questionData.correct_answer,
        points: questionData.points || 10,
        image_url: questionData.image_url || null,
        has_dataset: questionData.has_dataset || false,
        difficulty_level: questionData.difficulty_level || 'medium',
        category: questionData.category || '',
        tags: questionData.tags || [],
        updated_by: user.data.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0], message: 'Question updated successfully' };
  } catch (error) {
    console.error('Error editing question:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a question from the bank
 */
async function deleteQuestion(questionId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    // Delete associated datasets
    await sb.from('assessment_question_datasets')
      .delete()
      .eq('question_id', questionId);

    const { error } = await sb.from('question_bank')
      .delete()
      .eq('id', questionId);

    if (error) throw error;
    return { success: true, message: 'Question deleted successfully' };
  } catch (error) {
    console.error('Error deleting question:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all questions with optional filters
 */
async function searchQuestions(filters = {}) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    let query = sb.from('question_bank').select('*');

    if (filters.type) {
      query = query.eq('question_type', filters.type);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,question_text.ilike.%${filters.search}%`
      );
    }

    // Pagination
    const limit = filters.limit || 50;
    const offset = (filters.page || 0) * limit;
    query = query.range(offset, offset + limit - 1);

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { success: true, data, total: count };
  } catch (error) {
    console.error('Error searching questions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get a single question by ID
 */
async function getQuestion(questionId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb.from('question_bank')
      .select('*')
      .eq('id', questionId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting question:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Upload image for a question
 */
async function uploadQuestionImage(questionId, file) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const fileName = `question-${questionId}-${Date.now()}-${file.name}`;
    const { data, error } = await sb.storage
      .from('question-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = sb.storage
      .from('question-images')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    // Update question with image URL
    await sb.from('question_bank')
      .update({ image_url: imageUrl })
      .eq('id', questionId);

    return { success: true, imageUrl, message: 'Image uploaded successfully' };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove image from a question
 */
async function removeQuestionImage(questionId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data: question, error: fetchError } = await sb.from('question_bank')
      .select('image_url')
      .eq('id', questionId)
      .single();

    if (fetchError) throw fetchError;

    if (question.image_url) {
      const fileName = question.image_url.split('/').pop();
      await sb.storage.from('question-images').remove([fileName]);
    }

    await sb.from('question_bank')
      .update({ image_url: null })
      .eq('id', questionId);

    return { success: true, message: 'Image removed successfully' };
  } catch (error) {
    console.error('Error removing image:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export questions to Excel
 */
async function exportQuestionsToExcel(questionIds = null) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    let query = sb.from('question_bank').select('*');

    if (questionIds && questionIds.length > 0) {
      query = query.in('id', questionIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Convert to CSV format
    const headers = ['ID', 'Title', 'Type', 'Description', 'Points', 'Image URL', 'Has Dataset', 'Correct Answer', 'Options', 'Category', 'Difficulty', 'Tags'];
    const rows = data.map(q => [
      q.id,
      q.title,
      q.question_type,
      q.description || '',
      q.points,
      q.image_url || '',
      q.has_dataset ? 'Yes' : 'No',
      q.correct_answer || '',
      q.options ? JSON.stringify(q.options) : '',
      q.category || '',
      q.difficulty_level,
      q.tags.join(';')
    ]);

    // Create CSV content
    const csvContent = [
      headers.join('\t'),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join('\t'))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `questions-export-${new Date().toISOString().split('T')[0]}.tsv`;
    link.click();

    return { success: true, message: 'Questions exported successfully', count: data.length };
  } catch (error) {
    console.error('Error exporting questions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Import questions from Excel/CSV
 */
async function importQuestionsFromExcel(file) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const user = await sb.auth.getUser();
    if (!user.data?.user) throw new Error('User not authenticated');

    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split('\t').map(h => h.replace(/^"|"$/g, ''));

    const errors = [];
    const questionsToInsert = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      try {
        const cells = lines[i].split('\t').map(cell => cell.replace(/^"|"$/g, ''));
        const rowData = {};
        headers.forEach((header, idx) => {
          rowData[header] = cells[idx];
        });

        // Validate required fields
        if (!rowData['Title'] || !rowData['Type'] || !rowData['Question Text']) {
          errors.push({ row: i + 1, message: 'Missing required fields: Title, Type, Question Text' });
          continue;
        }

        // Validate question type
        const validTypes = ['PL', 'MCQ', 'TRUEFALSE', 'FREETEXT', 'ORDERED_LIST'];
        if (!validTypes.includes(rowData['Type'])) {
          errors.push({ row: i + 1, message: `Invalid question type: ${rowData['Type']}` });
          continue;
        }

        let options = null;
        if (rowData['Options']) {
          try {
            options = JSON.parse(rowData['Options']);
          } catch (e) {
            // Try comma-separated
            options = { options: rowData['Options'].split(',').map(o => o.trim()) };
          }
        }

        questionsToInsert.push({
          title: rowData['Title'],
          description: rowData['Description'] || '',
          question_text: rowData['Question Text'],
          question_type: rowData['Type'],
          options: options,
          correct_answer: rowData['Correct Answer'] || '',
          points: parseInt(rowData['Points']) || 10,
          image_url: rowData['Image URL'] || null,
          has_dataset: rowData['Has Dataset'] === 'true' || rowData['Has Dataset'] === 'Yes',
          difficulty_level: rowData['Difficulty'] || 'medium',
          category: rowData['Category'] || '',
          tags: rowData['Tags'] ? rowData['Tags'].split(';').map(t => t.trim()) : [],
          created_by: user.data.user.id
        });
      } catch (err) {
        errors.push({ row: i + 1, message: err.message });
      }
    }

    // Insert questions
    let successCount = 0;
    if (questionsToInsert.length > 0) {
      const { data, error: insertError } = await sb.from('question_bank')
        .insert(questionsToInsert)
        .select();

      if (insertError) throw insertError;
      successCount = data.length;
    }

    // Log import
    await sb.from('question_imports').insert([{
      imported_by: user.data.user.id,
      file_name: file.name,
      row_count: lines.length - 1,
      successful_count: successCount,
      error_count: errors.length,
      status: errors.length === 0 ? 'completed' : 'completed_with_errors',
      errors: errors.length > 0 ? errors : null
    }]);

    return {
      success: true,
      successCount,
      errorCount: errors.length,
      errors,
      message: `Imported ${successCount} questions${errors.length > 0 ? ` (${errors.length} errors)` : ''}`
    };
  } catch (error) {
    console.error('Error importing questions:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// MODULE BANK FUNCTIONS
// ============================================================

/**
 * Add a new module to the module bank
 */
async function addModule(moduleData) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const user = await sb.auth.getUser();
    if (!user.data?.user) throw new Error('User not authenticated');

    const { data, error } = await sb.from('module_bank').insert([{
      name: moduleData.name,
      description: moduleData.description || '',
      question_ids: moduleData.question_ids || [],
      question_order: moduleData.question_order || moduleData.question_ids || [],
      created_by: user.data.user.id
    }]).select();

    if (error) throw error;
    return { success: true, data: data[0], message: 'Module added successfully' };
  } catch (error) {
    console.error('Error adding module:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Edit an existing module
 */
async function editModule(moduleId, moduleData) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const user = await sb.auth.getUser();
    if (!user.data?.user) throw new Error('User not authenticated');

    const { data, error } = await sb.from('module_bank')
      .update({
        name: moduleData.name,
        description: moduleData.description || '',
        question_ids: moduleData.question_ids || [],
        question_order: moduleData.question_order || moduleData.question_ids || [],
        updated_by: user.data.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0], message: 'Module updated successfully' };
  } catch (error) {
    console.error('Error editing module:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a module
 */
async function deleteModule(moduleId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { error } = await sb.from('module_bank')
      .delete()
      .eq('id', moduleId);

    if (error) throw error;
    return { success: true, message: 'Module deleted successfully' };
  } catch (error) {
    console.error('Error deleting module:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add questions to a module
 */
async function addQuestionsToModule(moduleId, questionIds) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data: module, error: fetchError } = await sb.from('module_bank')
      .select('question_ids, question_order')
      .eq('id', moduleId)
      .single();

    if (fetchError) throw fetchError;

    const currentIds = module.question_ids || [];
    const newIds = [...new Set([...currentIds, ...questionIds])];
    const newOrder = [...new Set([...(module.question_order || []), ...questionIds])];

    const { data, error } = await sb.from('module_bank')
      .update({
        question_ids: newIds,
        question_order: newOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0], message: 'Questions added to module' };
  } catch (error) {
    console.error('Error adding questions to module:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove question from module
 */
async function removeQuestionFromModule(moduleId, questionId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data: module, error: fetchError } = await sb.from('module_bank')
      .select('question_ids, question_order')
      .eq('id', moduleId)
      .single();

    if (fetchError) throw fetchError;

    const newIds = (module.question_ids || []).filter(id => id !== questionId);
    const newOrder = (module.question_order || []).filter(id => id !== questionId);

    const { data, error } = await sb.from('module_bank')
      .update({
        question_ids: newIds,
        question_order: newOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0], message: 'Question removed from module' };
  } catch (error) {
    console.error('Error removing question from module:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reorder questions within a module
 */
async function reorderQuestionsInModule(moduleId, orderedQuestionIds) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb.from('module_bank')
      .update({
        question_order: orderedQuestionIds,
        updated_at: new Date().toISOString()
      })
      .eq('id', moduleId)
      .select();

    if (error) throw error;
    return { success: true, data: data[0], message: 'Questions reordered successfully' };
  } catch (error) {
    console.error('Error reordering questions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all modules
 */
async function getAllModules(filters = {}) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    let query = sb.from('module_bank').select('*');

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const limit = filters.limit || 50;
    const offset = (filters.page || 0) * limit;
    query = query.range(offset, offset + limit - 1);

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { success: true, data, total: count };
  } catch (error) {
    console.error('Error getting modules:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get a single module with its questions
 */
async function getModuleWithQuestions(moduleId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data: module, error: moduleError } = await sb.from('module_bank')
      .select('*')
      .eq('id', moduleId)
      .single();

    if (moduleError) throw moduleError;

    if (module.question_ids && module.question_ids.length > 0) {
      const { data: questions, error: questionsError } = await sb.from('question_bank')
        .select('*')
        .in('id', module.question_ids);

      if (questionsError) throw questionsError;

      // Sort questions according to question_order
      const orderedQuestions = module.question_order
        ? module.question_order.map(id => questions.find(q => q.id === id)).filter(Boolean)
        : questions;

      return { success: true, data: { ...module, questions: orderedQuestions } };
    }

    return { success: true, data: { ...module, questions: [] } };
  } catch (error) {
    console.error('Error getting module with questions:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// DATASET MANAGEMENT FUNCTIONS
// ============================================================

/**
 * Upload dataset file for a question
 */
async function uploadDatasetFile(questionId, file) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const user = await sb.auth.getUser();
    if (!user.data?.user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `question-${questionId}-${Date.now()}-${file.name}`;
    const filePath = `${questionId}/${fileName}`;

    const { data, error } = await sb.storage
      .from('assessment-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Record in database
    const { data: dbData, error: dbError } = await sb.from('assessment_question_datasets')
      .insert([{
        question_id: questionId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: fileExt,
        uploaded_by: user.data.user.id
      }])
      .select();

    if (dbError) throw dbError;

    // Update question's has_dataset flag
    await sb.from('question_bank')
      .update({ has_dataset: true })
      .eq('id', questionId);

    return { success: true, data: dbData[0], message: 'Dataset uploaded successfully' };
  } catch (error) {
    console.error('Error uploading dataset:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete dataset file
 */
async function deleteDatasetFile(datasetId, filePath) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    // Delete from storage
    const { error: storageError } = await sb.storage
      .from('assessment-files')
      .remove([filePath]);

    if (storageError) throw storageError;

    // Delete from database
    const { data, error: dbError } = await sb.from('assessment_question_datasets')
      .delete()
      .eq('id', datasetId)
      .select();

    if (dbError) throw dbError;

    // Check if question still has datasets
    if (data.length > 0) {
      const questionId = data[0].question_id;
      const { data: remaining } = await sb.from('assessment_question_datasets')
        .select('id')
        .eq('question_id', questionId);

      if (!remaining || remaining.length === 0) {
        await sb.from('question_bank')
          .update({ has_dataset: false })
          .eq('id', questionId);
      }
    }

    return { success: true, message: 'Dataset deleted successfully' };
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get datasets for a question
 */
async function getQuestionDatasets(questionId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb.from('assessment_question_datasets')
      .select('*')
      .eq('question_id', questionId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error getting datasets:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get download link for dataset
 */
async function getDatasetDownloadLink(filePath) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data } = sb.storage
      .from('assessment-files')
      .getPublicUrl(filePath);

    return { success: true, url: data.publicUrl };
  } catch (error) {
    console.error('Error getting download link:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================
// ASSESSMENT + MODULE/QUESTION INTEGRATION FUNCTIONS
// ============================================================

/**
 * Select modules for an assessment
 */
async function selectModulesForAssessment(assessmentId, moduleIds) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    // Remove existing module assignments
    await sb.from('assessment_module_assignments')
      .delete()
      .eq('assessment_id', assessmentId);

    // Insert new assignments
    const assignments = moduleIds.map((moduleId, idx) => ({
      assessment_id: assessmentId,
      module_id: moduleId,
      module_order: idx
    }));

    const { data, error } = await sb.from('assessment_module_assignments')
      .insert(assignments)
      .select();

    if (error) throw error;
    return { success: true, data, message: 'Modules added to assessment' };
  } catch (error) {
    console.error('Error selecting modules:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove module from assessment
 */
async function removeModuleFromAssessment(assessmentId, moduleId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { error } = await sb.from('assessment_module_assignments')
      .delete()
      .eq('assessment_id', assessmentId)
      .eq('module_id', moduleId);

    if (error) throw error;
    return { success: true, message: 'Module removed from assessment' };
  } catch (error) {
    console.error('Error removing module:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load questions for an assessment based on selected modules
 */
async function loadQuestionsForAssessment(assessmentId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    // Get module assignments
    const { data: assignments, error: assignError } = await sb.from('assessment_module_assignments')
      .select('module_id')
      .eq('assessment_id', assessmentId)
      .order('module_order');

    if (assignError) throw assignError;

    const moduleIds = assignments.map(a => a.module_id);

    if (moduleIds.length === 0) {
      return { success: true, data: [] };
    }

    // Get all modules with their questions
    const { data: modules, error: moduleError } = await sb.from('module_bank')
      .select('id, question_ids, question_order')
      .in('id', moduleIds);

    if (moduleError) throw moduleError;

    // Collect all question IDs in order
    let allQuestionIds = [];
    for (const module of modules) {
      const orderedIds = module.question_order && module.question_order.length > 0
        ? module.question_order
        : module.question_ids || [];
      allQuestionIds = [...allQuestionIds, ...orderedIds];
    }

    // Remove duplicates while preserving order
    allQuestionIds = [...new Set(allQuestionIds)];

    // Get all questions
    if (allQuestionIds.length === 0) {
      return { success: true, data: [] };
    }

    const { data: questions, error: questionsError } = await sb.from('question_bank')
      .select('*')
      .in('id', allQuestionIds);

    if (questionsError) throw questionsError;

    // Sort according to allQuestionIds order
    const sortedQuestions = allQuestionIds
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean);

    return { success: true, data: sortedQuestions };
  } catch (error) {
    console.error('Error loading questions:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Preview all questions for an assessment
 */
async function previewAssessmentQuestions(assessmentId) {
  return loadQuestionsForAssessment(assessmentId);
}

/**
 * Get assessment modules
 */
async function getAssessmentModules(assessmentId) {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data: assignments, error: assignError } = await sb.from('assessment_module_assignments')
      .select('module_id')
      .eq('assessment_id', assessmentId)
      .order('module_order');

    if (assignError) throw assignError;

    const moduleIds = assignments.map(a => a.module_id);

    if (moduleIds.length === 0) {
      return { success: true, data: [] };
    }

    const { data: modules, error: moduleError } = await sb.from('module_bank')
      .select('*')
      .in('id', moduleIds);

    if (moduleError) throw moduleError;

    return { success: true, data: modules };
  } catch (error) {
    console.error('Error getting assessment modules:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Get distinct categories from questions
 */
async function getQuestionCategories() {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb.from('question_bank')
      .select('category')
      .not('category', 'is', null)
      .neq('category', '');

    if (error) throw error;

    const categories = [...new Set(data.map(q => q.category).filter(Boolean))];
    return { success: true, data: categories };
  } catch (error) {
    console.error('Error getting categories:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get all distinct tags from questions
 */
async function getAllTags() {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb.from('question_bank')
      .select('tags');

    if (error) throw error;

    const allTags = new Set();
    data.forEach(q => {
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(tag => allTags.add(tag));
      }
    });

    return { success: true, data: Array.from(allTags).sort() };
  } catch (error) {
    console.error('Error getting tags:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Get question type statistics
 */
async function getQuestionStatistics() {
  try {
    const sb = window.supabaseClient?.getSupabase?.();
    if (!sb) throw new Error('Supabase not initialized');

    const { data, error } = await sb.from('question_bank')
      .select('question_type, points');

    if (error) throw error;

    const stats = {
      totalQuestions: data.length,
      byType: {},
      totalPoints: 0
    };

    data.forEach(q => {
      if (!stats.byType[q.question_type]) {
        stats.byType[q.question_type] = 0;
      }
      stats.byType[q.question_type]++;
      stats.totalPoints += q.points || 0;
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error getting statistics:', error);
    return { success: false, error: error.message };
  }
}
