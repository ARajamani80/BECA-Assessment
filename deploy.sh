#!/bin/bash

################################################################################
#
# BECA Assessment Platform - Deployment Script
#
# Purpose: Complete Git upload script for three-tier workflow implementation
#
# Features:
#   - Backs up old files before making changes
#   - Validates file integrity
#   - Commits changes with meaningful message
#   - Pushes to GitHub with error handling
#   - Provides detailed confirmation and rollback option
#
# Usage:
#   bash deploy.sh
#   bash deploy.sh --backup-only
#   bash deploy.sh --dry-run
#
################################################################################

set -e  # Exit on error

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"
BACKUP_DIR="${PROJECT_ROOT}/.backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

# Files to deploy
FILES_TO_DEPLOY=(
  "js/questions.js"
  "js/modules.js"
  "js/assessments.js"
  "js/users.js"
  "index-new.html"
)

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
  echo -e "${BLUE}================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}================================${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

# ============================================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================================

check_git_repo() {
  if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not a git repository. Initialize git first: git init"
    exit 1
  fi
  print_success "Git repository found"
}

check_git_configured() {
  if [ -z "$(git config user.name)" ] || [ -z "$(git config user.email)" ]; then
    print_error "Git user not configured"
    echo "Run these commands:"
    echo "  git config user.name 'Your Name'"
    echo "  git config user.email 'your@email.com'"
    exit 1
  fi
  print_success "Git user configured: $(git config user.name) <$(git config user.email)>"
}

check_working_directory() {
  if [ -n "$(git status --porcelain)" ]; then
    print_warning "Uncommitted changes detected"
    git status --short
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_info "Deployment cancelled"
      exit 0
    fi
  else
    print_success "Working directory clean"
  fi
}

check_files_exist() {
  print_info "Checking if files to deploy exist..."
  for file in "${FILES_TO_DEPLOY[@]}"; do
    if [ ! -f "${PROJECT_ROOT}/${file}" ]; then
      print_error "File not found: ${file}"
      exit 1
    fi
    print_success "Found: ${file}"
  done
}

check_branch() {
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  print_info "Current branch: ${CURRENT_BRANCH}"

  if [ "${CURRENT_BRANCH}" != "main" ] && [ "${CURRENT_BRANCH}" != "master" ]; then
    print_warning "Not on main/master branch. Deploy to branch: ${CURRENT_BRANCH}"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_info "Deployment cancelled"
      exit 0
    fi
  fi
}

# ============================================================================
# BACKUP OPERATIONS
# ============================================================================

create_backup() {
  print_header "Creating Backup"

  mkdir -p "$BACKUP_PATH/js"
  mkdir -p "$BACKUP_PATH"

  for file in "${FILES_TO_DEPLOY[@]}"; do
    if [ -f "${PROJECT_ROOT}/${file}" ]; then
      cp "${PROJECT_ROOT}/${file}" "${BACKUP_PATH}/${file}"
      print_success "Backed up: ${file}"
    fi
  done

  # Also backup current git status
  git log --oneline -10 > "${BACKUP_PATH}/git_log.txt"
  git status > "${BACKUP_PATH}/git_status.txt"

  print_success "Backup created at: ${BACKUP_PATH}"
  echo "${BACKUP_PATH}" > "${BACKUP_DIR}/latest.txt"
}

# ============================================================================
# DEPLOYMENT OPERATIONS
# ============================================================================

verify_files() {
  print_header "Verifying Files"

  for file in "${FILES_TO_DEPLOY[@]}"; do
    if [ ! -f "${PROJECT_ROOT}/${file}" ]; then
      print_error "File missing: ${file}"
      return 1
    fi

    # Check file size
    size=$(wc -c < "${PROJECT_ROOT}/${file}")
    if [ "$size" -lt 100 ]; then
      print_error "File too small (possibly corrupted): ${file} (${size} bytes)"
      return 1
    fi

    print_success "Verified: ${file} ($(numfmt --to=iec-i --suffix=B "$size" 2>/dev/null || echo "$size bytes"))"
  done

  return 0
}

git_stage_files() {
  print_header "Staging Files for Commit"

  for file in "${FILES_TO_DEPLOY[@]}"; do
    git add "${file}"
    print_success "Staged: ${file}"
  done
}

git_commit() {
  print_header "Creating Commit"

  COMMIT_MESSAGE="feat: Implement three-tier workflow (Questions, Modules, Assessments)

- Added standalone Question Bank (js/questions.js)
- Added independent Module Bank (js/modules.js)
- Fixed Assessment workflow to use modules (js/assessments.js)
- Added Permission Editor to Users page (js/users.js)
- Created production-ready index-new.html with all modals
- Workflow: Question Bank → Module Bank → Assessments
- Questions auto-load from selected modules in assessments
- All features include search, filter, edit, delete operations
- Complete CRUD for all entities

Deployment timestamp: ${TIMESTAMP}"

  git commit -m "$COMMIT_MESSAGE"
  print_success "Commit created"
  git log --oneline -1
}

git_push() {
  print_header "Pushing to GitHub"

  # Check remote
  if ! git remote -v | grep -q .; then
    print_warning "No remote configured"
    read -p "Add GitHub remote? Enter URL (or press Enter to skip): " remote_url
    if [ ! -z "$remote_url" ]; then
      git remote add origin "$remote_url"
      print_success "Remote added"
    else
      print_warning "Skipped adding remote"
      return 0
    fi
  fi

  # Push
  print_info "Pushing to remote..."
  if git push -u origin "${CURRENT_BRANCH}" 2>&1 | tee /tmp/push_output.log; then
    print_success "Push completed successfully"
    return 0
  else
    print_error "Push failed. Check error output above."
    return 1
  fi
}

# ============================================================================
# ROLLBACK OPERATIONS
# ============================================================================

rollback_deployment() {
  print_header "Rolling Back Deployment"

  if [ ! -d "$BACKUP_PATH" ]; then
    print_error "No backup found to rollback"
    return 1
  fi

  print_warning "Rolling back to backup: ${BACKUP_NAME}"

  for file in "${FILES_TO_DEPLOY[@]}"; do
    if [ -f "${BACKUP_PATH}/${file}" ]; then
      cp "${BACKUP_PATH}/${file}" "${PROJECT_ROOT}/${file}"
      print_success "Restored: ${file}"
    fi
  done

  # Reset git to before commit
  git reset --soft HEAD~1
  git reset HEAD .

  print_success "Rollback completed"
  print_warning "Changes are unstaged. Use 'git checkout .' to discard or 'git add .' to re-commit"
}

# ============================================================================
# REPORTING
# ============================================================================

print_summary() {
  print_header "Deployment Summary"

  echo -e "${GREEN}Status: SUCCESS${NC}"
  echo
  echo "Deployment Details:"
  echo "  Timestamp: ${TIMESTAMP}"
  echo "  Branch: ${CURRENT_BRANCH}"
  echo "  Backup: ${BACKUP_PATH}"
  echo
  echo "Files Deployed:"
  for file in "${FILES_TO_DEPLOY[@]}"; do
    echo "  ✓ ${file}"
  done
  echo
  echo "Workflow:"
  echo "  ✓ Question Bank (Tier 1) - Independent question management"
  echo "  ✓ Module Bank (Tier 2) - Groups questions from Question Bank"
  echo "  ✓ Assessments (Tier 3) - Selects modules, questions auto-load"
  echo "  ✓ Permission Editor - Manage role-based permissions"
  echo
  echo "Next Steps:"
  echo "  1. Test the application: http://localhost:8000"
  echo "  2. Verify all features work correctly"
  echo "  3. Check GitHub repository for commit"
  echo "  4. If issues found, run: bash deploy.sh --rollback"
  echo
}

print_error_summary() {
  print_header "Deployment Failed"

  echo -e "${RED}Status: FAILED${NC}"
  echo
  echo "Backup preserved at: ${BACKUP_PATH}"
  echo "No changes committed to git."
  echo
  echo "To rollback any partial changes:"
  echo "  git reset --hard HEAD"
  echo "  git clean -fd"
  echo
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
  print_header "BECA Assessment Platform - Deployment Script"
  echo "Three-Tier Workflow Implementation"
  echo
  echo "Timestamp: ${TIMESTAMP}"
  echo

  # Parse arguments
  DRY_RUN=false
  BACKUP_ONLY=false
  ROLLBACK=false

  while [[ $# -gt 0 ]]; do
    case $1 in
      --dry-run)
        DRY_RUN=true
        print_warning "DRY RUN MODE - No changes will be committed"
        shift
        ;;
      --backup-only)
        BACKUP_ONLY=true
        print_warning "BACKUP ONLY MODE"
        shift
        ;;
      --rollback)
        ROLLBACK=true
        shift
        ;;
      *)
        print_error "Unknown option: $1"
        exit 1
        ;;
    esac
  done

  # Pre-deployment checks
  print_header "Pre-Deployment Checks"
  check_git_repo
  check_git_configured
  check_working_directory
  check_files_exist
  check_branch

  # Backup
  create_backup

  if [ "$BACKUP_ONLY" = true ]; then
    print_success "Backup completed (Backup-only mode)"
    exit 0
  fi

  if [ "$ROLLBACK" = true ]; then
    rollback_deployment
    exit 0
  fi

  # Verify
  if ! verify_files; then
    print_error_summary
    exit 1
  fi

  # Deploy
  git_stage_files

  if [ "$DRY_RUN" = true ]; then
    print_info "DRY RUN: Changes staged but not committed"
    git status
    exit 0
  fi

  # Confirm before commit
  print_info "About to commit and push changes"
  git diff --cached --stat
  echo
  read -p "Proceed with deployment? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deployment cancelled by user"
    git reset
    exit 0
  fi

  # Commit and push
  if git_commit && git_push; then
    print_summary
    exit 0
  else
    print_error_summary
    print_info "Rollback available: bash deploy.sh --rollback"
    exit 1
  fi
}

# ============================================================================
# ENTRY POINT
# ============================================================================

main "$@"
