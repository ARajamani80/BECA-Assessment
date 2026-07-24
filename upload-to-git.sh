#!/bin/bash
# ============================================================================
# BECA Assessment - Upload to GitHub
# This script stages all changes and pushes to GitHub
# ============================================================================

echo "🚀 Starting upload to GitHub..."

# Check if we're in a git repo
if [ ! -d ".git" ]; then
  echo "❌ Error: Not in a git repository"
  echo "Please run this script from the root of your BECA-Assessment project"
  exit 1
fi

# Show current status
echo ""
echo "📊 Current git status:"
git status --short

echo ""
echo "📝 Staging changes..."
git add -A

echo ""
echo "📋 Changes to be committed:"
git status --short

# Count changes
CHANGES=$(git status --short | wc -l)
if [ $CHANGES -eq 0 ]; then
  echo "⚠️ No changes to commit"
  exit 0
fi

echo ""
echo "💬 Commit message:"
echo "  Fix: Excel import issues - add assessment selection, fix column mapping, parse JSON fields"
echo "  - Added assessment selection to import modal (CRITICAL FIX for missing assessment_id)"
echo "  - Improved type detection and column mapping"
echo "  - Fixed JSON parsing for list_options, list_items, keywords"
echo "  - Added dataset file upload support"
echo "  - Removed non-existent fields (all_options, points)"
echo ""

read -p "Proceed with commit and push? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Commit
  echo "✍️ Committing changes..."
  git commit -m "Fix: Excel import issues - add assessment selection, improve validation

- Add assessment selection dropdown to import modal (critical fix for missing assessment_id)
- Improve type detection to handle various question type spellings
- Improve column mapping for Excel headers
- Add JSON parsing for list_options, list_items, keywords, correct_order
- Add dataset file upload support for questions
- Support dataset_files column in Excel import
- Remove non-existent fields (all_options, points) causing schema errors
- Reduce validation strictness for different question types

These changes fix the issue where only 23/94 questions were importing successfully."

  # Push
  echo ""
  echo "📤 Pushing to GitHub..."
  git push origin main

  if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Changes uploaded to GitHub"
    echo "   Check your Netlify deployment for auto-updates"
  else
    echo "❌ Push failed. Please check your git configuration and GitHub access."
    exit 1
  fi
else
  echo "❌ Upload cancelled"
  exit 1
fi
