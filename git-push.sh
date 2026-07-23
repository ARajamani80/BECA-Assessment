#!/bin/bash

# BECA Assessment Platform - Git Push Script
# Removes git locks and pushes to GitHub

PROJECT_DIR="C:\Users\TL13 ADMIN\OneDrive - DJBH Global\Documents\Claude\Projects\BECA-Assessment"

echo "=========================================="
echo "BECA Assessment - GitHub Upload Script"
echo "=========================================="
echo ""

# Change to project directory
cd "$PROJECT_DIR" || exit 1
echo "✓ Working directory: $(pwd)"
echo ""

# Remove git lock files
echo "Removing git lock files..."
if [ -f ".git/index.lock" ]; then
    rm -f ".git/index.lock"
    echo "  ✓ Removed .git/index.lock"
fi

if [ -f ".git/HEAD.lock" ]; then
    rm -f ".git/HEAD.lock"
    echo "  ✓ Removed .git/HEAD.lock"
fi
echo ""

# Check git status
echo "Checking git status..."
git status
echo ""

# Stage all changes
echo "Staging changes..."
git add -A
echo "  ✓ All changes staged"
echo ""

# Get commit message
read -p "Enter commit message (or press Enter for auto-timestamp): " commit_msg

# Generate auto-timestamp if no message provided
if [ -z "$commit_msg" ]; then
    timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    commit_msg="Update: $timestamp"
fi

# Commit
echo "Committing changes..."
git commit -m "$commit_msg"
if [ $? -eq 0 ]; then
    echo "  ✓ Changes committed"
else
    echo "  ! No changes to commit or commit failed"
fi
echo ""

# Push to GitHub
echo "Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "  ✓ Successfully pushed to GitHub!"
    echo ""
    echo "=========================================="
    echo "Netlify will auto-deploy in 2-5 minutes"
    echo "Site: https://becaskill-assessment.netlify.app"
    echo "=========================================="
else
    echo "  ✗ Push failed - check your connection"
    exit 1
fi
