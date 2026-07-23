// ============================================================================
// BECA Assessment Platform - Timer Management
// ============================================================================
// Handles assessment countdown timer with visual warnings and auto-submit

/**
 * Start the assessment timer
 */
function startAssessmentTimer(durationMinutes) {
  try {
    const durationSeconds = durationMinutes * 60;
    const startTime = Date.now();
    const endTime = startTime + (durationSeconds * 1000);

    assessmentState.startTime = startTime;
    assessmentState.endTime = endTime;

    console.log(`Starting timer for ${durationMinutes} minutes (${durationSeconds} seconds)`);

    // Clear any existing timer
    if (assessmentState.timerInterval) {
      clearInterval(assessmentState.timerInterval);
    }

    // Update timer every second
    assessmentState.timerInterval = setInterval(() => {
      updateTimer(endTime);
    }, 1000);

    // Initial update
    updateTimer(endTime);
  } catch (error) {
    console.error('Error starting timer:', error);
  }
}

/**
 * Update the timer display and check for warnings
 */
function updateTimer(endTime) {
  const now = Date.now();
  const timeRemaining = Math.max(0, endTime - now);
  const secondsRemaining = Math.floor(timeRemaining / 1000);

  // Update global state
  assessmentState.timeElapsed = Math.floor((now - assessmentState.startTime) / 1000);

  // Get display element
  const timerDisplay = document.getElementById('timerDisplay');
  if (!timerDisplay) return;

  // Format time
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  let displayText = '';
  if (hours > 0) {
    displayText = `${hours}h ${minutes}m ${seconds}s`;
  } else {
    displayText = `${minutes}:${String(seconds).padStart(2, '0')}`;
  }

  timerDisplay.textContent = displayText;

  // Apply visual warnings
  const timerContainer = timerDisplay.parentElement?.parentElement;
  if (timerContainer) {
    timerContainer.classList.remove('timer-warning-1min', 'timer-warning-5min');

    if (secondsRemaining <= 60) {
      // Less than 1 minute - red warning
      timerContainer.classList.add('timer-warning-1min');
      if (secondsRemaining > 0 && secondsRemaining % 10 === 0) {
        showTimerNotification(`Only ${secondsRemaining} seconds remaining!`);
      }
    } else if (secondsRemaining <= 300) {
      // Less than 5 minutes - yellow warning
      timerContainer.classList.add('timer-warning-5min');
      if (secondsRemaining > 0 && secondsRemaining === 300) {
        showTimerNotification('5 minutes remaining. Please start wrapping up.');
      }
    }
  }

  // Auto-submit when time expires
  if (timeRemaining <= 0) {
    clearInterval(assessmentState.timerInterval);
    handleTimeExpired();
  }
}

/**
 * Handle time expired
 */
function handleTimeExpired() {
  console.log('Assessment time expired!');

  // Stop accepting answers
  assessmentState.isSubmitted = true;

  // Disable all inputs
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.disabled = true;
  });

  // Show notification
  alert('Time is up! Your assessment will be automatically submitted.');

  // Auto-submit
  submitAssessment();
}

/**
 * Show timer notification
 */
function showTimerNotification(message) {
  // Only show once per unique message to avoid spam
  const notificationId = 'timer-' + message.replace(/\s/g, '-');

  if (document.getElementById(notificationId)) {
    return; // Already showing
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.id = notificationId;
  notification.className = 'timer-notification';
  notification.innerHTML = `
    <i class="fas fa-clock"></i>
    <span>${message}</span>
  `;

  // Add to page
  const container = document.querySelector('.taker-instructions-banner');
  if (container) {
    container.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

/**
 * Format seconds to readable time
 */
function formatTimeRemaining(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Get remaining time in seconds
 */
function getRemainingSeconds() {
  if (!assessmentState.endTime) return 0;
  const remaining = Math.max(0, assessmentState.endTime - Date.now());
  return Math.floor(remaining / 1000);
}

/**
 * Pause the timer
 */
function pauseTimer() {
  if (assessmentState.timerInterval) {
    clearInterval(assessmentState.timerInterval);
    assessmentState.timerInterval = null;
  }
}

/**
 * Resume the timer
 */
function resumeTimer() {
  if (assessmentState.endTime && !assessmentState.timerInterval) {
    assessmentState.timerInterval = setInterval(() => {
      updateTimer(assessmentState.endTime);
    }, 1000);
  }
}

/**
 * Check if time is running out
 */
function isTimeRunningOut() {
  const remaining = getRemainingSeconds();
  return remaining <= 300; // 5 minutes
}

/**
 * Check if time is critical
 */
function isTimeCritical() {
  const remaining = getRemainingSeconds();
  return remaining <= 60; // 1 minute
}

// Export functions
window.startAssessmentTimer = startAssessmentTimer;
window.getRemainingSeconds = getRemainingSeconds;
window.isTimeRunningOut = isTimeRunningOut;
window.isTimeCritical = isTimeCritical;
window.pauseTimer = pauseTimer;
window.resumeTimer = resumeTimer;

console.log('Timer module loaded');
