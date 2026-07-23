// ============================================================================
// BECA Assessment Platform - Local Storage Management
// ============================================================================
// Handles local caching of answers for offline support and auto-recovery

const STORAGE_PREFIX = 'beca_assessment_';
const STORAGE_VERSION = '1.0';

/**
 * Get the storage key for a taker's answers
 */
function getStorageKey() {
  if (!assessmentState.token) return null;
  return `${STORAGE_PREFIX}${assessmentState.token}`;
}

/**
 * Save answers to localStorage
 */
function saveAnswersToLocalStorage() {
  try {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    const data = {
      version: STORAGE_VERSION,
      token: assessmentState.token,
      assessmentId: assessmentState.assessment?.id,
      takerId: assessmentState.taker?.id,
      answers: assessmentState.answers,
      currentQuestionIndex: assessmentState.currentQuestionIndex,
      startTime: assessmentState.startTime,
      timeElapsed: assessmentState.timeElapsed,
      savedAt: new Date().toISOString()
    };

    localStorage.setItem(storageKey, JSON.stringify(data));
    console.log('Answers saved to localStorage');
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    // Handle quota exceeded
    if (error.name === 'QuotaExceededError') {
      cleanOldCaches();
      try {
        localStorage.setItem(getStorageKey(), JSON.stringify(data));
      } catch (retryError) {
        console.error('Still failed after cleanup:', retryError);
      }
    }
  }
}

/**
 * Load answers from localStorage
 */
function loadAnswersFromLocalStorage() {
  try {
    const storageKey = getStorageKey();
    if (!storageKey) return;

    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      console.log('No cached answers found');
      return;
    }

    const data = JSON.parse(stored);

    // Verify the data matches current assessment
    if (data.token !== assessmentState.token ||
        data.assessmentId !== assessmentState.assessment?.id) {
      console.log('Cached data is for different assessment, ignoring');
      return;
    }

    // Restore answers
    assessmentState.answers = data.answers || {};
    assessmentState.currentQuestionIndex = data.currentQuestionIndex || 0;
    assessmentState.timeElapsed = data.timeElapsed || 0;

    console.log('Answers restored from localStorage');
    console.log(`Recovered ${Object.keys(assessmentState.answers).length} answers`);
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
}

/**
 * Clear answers from localStorage
 */
function clearAnswersFromLocalStorage() {
  try {
    const storageKey = getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
      console.log('Cached answers cleared from localStorage');
    }
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get all cached assessments (for debugging)
 */
function getCachedAssessments() {
  try {
    const cached = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          cached.push({
            token: data.token,
            assessmentId: data.assessmentId,
            answersCount: Object.keys(data.answers || {}).length,
            savedAt: data.savedAt
          });
        } catch (e) {
          console.error('Error parsing cached data:', e);
        }
      }
    }
    return cached;
  } catch (error) {
    console.error('Error getting cached assessments:', error);
    return [];
  }
}

/**
 * Clean old cached assessments (keep last 10)
 */
function cleanOldCaches() {
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          keys.push({
            key: key,
            savedAt: new Date(data.savedAt)
          });
        } catch (e) {
          // Invalid JSON, can be removed
          localStorage.removeItem(key);
        }
      }
    }

    // Sort by date descending and remove oldest
    if (keys.length > 10) {
      keys.sort((a, b) => b.savedAt - a.savedAt);
      const toRemove = keys.slice(10); // Keep only 10

      toRemove.forEach(item => {
        localStorage.removeItem(item.key);
        console.log('Removed old cache:', item.key);
      });
    }
  } catch (error) {
    console.error('Error cleaning old caches:', error);
  }
}

/**
 * Auto-save answers to localStorage periodically
 */
function setupLocalStorageAutoSave() {
  // Save to localStorage every 10 seconds
  setInterval(() => {
    if (!assessmentState.isSubmitted &&
        Object.keys(assessmentState.answers).length > 0) {
      saveAnswersToLocalStorage();
    }
  }, 10000);
}

/**
 * Get storage info (for debugging)
 */
function getStorageInfo() {
  try {
    let totalSize = 0;
    let itemCount = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const item = localStorage.getItem(key);
      if (key?.startsWith(STORAGE_PREFIX)) {
        totalSize += item?.length || 0;
        itemCount++;
      }
    }

    // Estimate available space
    const test = 'test';
    let availableSpace = 0;
    try {
      const testStorage = new Array(10 * 1024 * 1024).join('x');
      localStorage.setItem('__test__', testStorage);
      localStorage.removeItem('__test__');
    } catch (e) {
      // Storage full or limited
    }

    return {
      cachedItems: itemCount,
      totalSize: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      lastSaved: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return null;
  }
}

/**
 * Recovery mode - check if there are unsaved answers
 */
function checkForUnsavedAnswers() {
  const storageKey = getStorageKey();
  if (!storageKey) return null;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const data = JSON.parse(stored);

    // Check if assessment is still in progress
    if (data.answers && Object.keys(data.answers).length > 0) {
      return {
        answersCount: Object.keys(data.answers).length,
        lastSaved: data.savedAt,
        currentQuestion: data.currentQuestionIndex
      };
    }
  } catch (error) {
    console.error('Error checking for unsaved answers:', error);
  }

  return null;
}

/**
 * Export storage utility functions
 */
window.saveAnswersToLocalStorage = saveAnswersToLocalStorage;
window.loadAnswersFromLocalStorage = loadAnswersFromLocalStorage;
window.clearAnswersFromLocalStorage = clearAnswersFromLocalStorage;
window.getCachedAssessments = getCachedAssessments;
window.cleanOldCaches = cleanOldCaches;
window.getStorageInfo = getStorageInfo;
window.checkForUnsavedAnswers = checkForUnsavedAnswers;

console.log('Local Storage module loaded');
