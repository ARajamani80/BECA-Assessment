// BECA Assessment Platform - Utility Functions

/**
 * Generate random token
 * @param {number} length - Token length
 * @returns {string} Random token
 */
function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Format seconds as MM:SS
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Get URL parameter
 * @param {string} param - Parameter name
 * @returns {string|null} Parameter value
 */
function getUrlParameter(param) {
  const url = new URL(window.location.href);
  return url.searchParams.get(param);
}

/**
 * Show message notification
 * @param {string} msg - Message text
 * @param {string} type - Message type (success, error, warning)
 */
function showMessage(msg, type) {
  const el = document.getElementById('message');
  if (el) {
    el.textContent = msg;
    el.className = `message ${type} active`;
    setTimeout(() => el.classList.remove('active'), 5000);
  }
}

/**
 * Generate temporary password
 * @returns {string} Generated password
 */
function generateTempPassword() {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Open modal
 * @param {string} modalId - Modal ID
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

/**
 * Close modal
 * @param {string} modalId - Modal ID
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/**
 * Format date
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

/**
 * Format datetime
 * @param {string} dateString - Date string
 * @returns {string} Formatted datetime
 */
function formatDateTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleString();
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (warning, success, error)
 */
function showTakerMessage(message, type) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#10b981'};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    z-index: 9999;
    font-weight: 600;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 5000);
}

/**
 * Get user initial from email
 * @param {string} email - User email
 * @returns {string} Single character initial
 */
function getUserInitial(email) {
  if (!email) return 'U';
  const emailParts = email.split('@');
  return emailParts[0] ? emailParts[0][0].toUpperCase() : 'U';
}

/**
 * Get user display name
 * @param {string} fullName - Full name
 * @param {string} email - Email address
 * @returns {string} Display name
 */
function getUserDisplayName(fullName, email) {
  if (fullName) return fullName;
  if (email) return email.split('@')[0];
  return 'User';
}

/**
 * Debounce function
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {function} Debounced function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
