# Question & Module Bank System - User Guide

## Overview

The Question & Module Bank System is a comprehensive assessment management platform that allows administrators and trainers to:

1. **Create and manage a global question bank** - Questions that can be reused across multiple assessments
2. **Organize questions into modules** - Group related questions for easy assessment composition
3. **Create assessments from modules** - Quickly assemble assessments by selecting pre-built modules
4. **Manage datasets** - Upload and link supporting files (PDFs, images, documents) to questions

## Table of Contents

- [Quick Start](#quick-start)
- [Question Bank Management](#question-bank-management)
- [Module Bank Management](#module-bank-management)
- [Assessment Creation](#assessment-creation)
- [Dataset Management](#dataset-management)
- [Excel Import/Export](#excel-import-export)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

### Accessing the System

1. Log in to the BECA Assessment Platform
2. You'll see two new navigation items in the sidebar:
   - **Question Bank** - Manage individual questions
   - **Module Bank** - Manage question groupings

### First Steps

1. **Start with Question Bank**
   - Create some questions independently
   - Or import questions via Excel
   
2. **Then create Modules**
   - Group related questions together
   - Create templates for common assessment structures

3. **Finally, create Assessments**
   - Select modules to compose your assessment
   - Questions auto-populate from selected modules

---

## Question Bank Management

### Overview

The Question Bank is where you create and maintain all reusable questions. Each question is independent and can be used in multiple modules and assessments.

### Question Types

#### 1. **Multiple Choice (MCQ)**
- User selects one correct answer from multiple options
- Best for: Knowledge testing, decision-making scenarios
- Example: "What is the capital of France? a) London b) Paris c) Berlin"

#### 2. **Pick List (PL)**
- User selects one or more correct answers from a list
- Best for: Selecting applicable items, multiple correct answers
- Example: "Which of these are project management tools? (select all)"

#### 3. **True/False**
- User selects true or false
- Best for: Quick concept validation, yes/no questions
- Example: "Project scope cannot be changed once approved: True/False"

#### 4. **Free Text**
- User types their answer
- Best for: Essays, open-ended responses, detailed explanations
- Example: "Describe your approach to conflict resolution in teams"

#### 5. **Ordered List**
- User arranges items in correct order
- Best for: Process steps, prioritization, sequencing
- Example: "Arrange project phases in correct order: Planning, Execution, Closing, Initiation"

### Creating a Question

#### Step-by-Step Guide

1. **Navigate to Question Bank**
   - Click "Question Bank" in the sidebar

2. **Click "Add Question"**
   - A form modal will appear

3. **Fill in Basic Information**
   - **Title**: Brief name for the question (e.g., "Leadership Decision Scenario")
   - **Question Type**: Select the type from dropdown
   - **Question Text**: The actual question to display to users
   - **Description**: Additional context (optional)

4. **Set Difficulty & Category**
   - **Difficulty Level**: Easy, Medium, or Hard
   - **Category**: Group questions by topic (e.g., "Leadership", "Technical")
   - **Tags**: Add multiple tags for easy filtering (e.g., "scenario", "critical-thinking")

5. **Configure Answer**
   - **Correct Answer**: The answer that earns full points
   - **Points**: How many points this question is worth (default: 10)

6. **Add Options** (for MCQ/PL/Ordered List only)
   - Enter options separated by commas
   - Example: "Option 1, Option 2, Option 3"

7. **Upload Image** (Optional)
   - Click "Upload Image" to add a visual to the question
   - Supported formats: PNG, JPG, GIF, etc.
   - Images are stored securely in Supabase

8. **Save the Question**
   - Click "Save Question"
   - Question appears in the Question Bank table

### Searching & Filtering Questions

**Quick Filter Options:**
- **Search**: Full-text search across title, description, and question text
- **Question Type**: Filter by MCQ, PL, True/False, Free Text, Ordered List
- **Category**: Group by topic
- **Difficulty**: Easy, Medium, Hard

**Example Workflow:**
```
1. Click "Question Bank"
2. Enter "leadership" in Search field
3. Select "Medium" difficulty
4. Click "Search"
→ View all medium-difficulty leadership questions
```

### Editing Questions

1. Find the question in the table
2. Click the **Edit** button (pencil icon)
3. Modify any fields
4. Click "Update Question"
5. Changes are saved immediately

### Deleting Questions

1. Find the question in the table
2. Click the **Delete** button (trash icon)
3. Confirm deletion in the popup
4. ⚠️ Warning: Deleted questions are removed from all modules automatically

### Exporting Questions

1. **Export All**: Click "Export" button
   - Downloads all questions as TSV file
   - Can be used as backup or shared with others

2. **Export Selected**: Select specific questions and export
   - Useful for sharing question sets with team members

### Managing Datasets

Datasets are supporting files for questions (e.g., PDFs, images, documents).

1. Click **Manage Datasets** (folder icon) for a question
2. **Upload File**:
   - Click "Upload Dataset"
   - Select file (PDF, Word, Image, etc.)
   - File is uploaded to secure storage

3. **View Files**:
   - See all uploaded files for that question
   - File info: name, size, upload date

4. **Delete File**:
   - Click delete icon next to filename
   - File is removed from storage

---

## Module Bank Management

### Overview

Modules are logical groupings of questions. They represent a complete unit or section of an assessment. Modules make it easy to:
- Reuse question sets across multiple assessments
- Maintain consistent assessment structure
- Update questions for entire assessment groups

### Creating a Module

#### Step-by-Step Guide

1. **Navigate to Module Bank**
   - Click "Module Bank" in sidebar

2. **Click "Add Module"**
   - A form modal will appear

3. **Enter Module Details**
   - **Module Name**: Title (e.g., "Leadership Fundamentals")
   - **Description**: What this module covers (optional)

4. **Select Questions**
   - Large list of all available questions appears
   - Check boxes next to questions you want to include
   - **Search**: Use search box to find questions quickly

5. **Order Questions**
   - Selected questions appear in "Selected Questions Order" section
   - Drag questions using the handle icon (::) to reorder
   - Or click delete (×) to remove from module

6. **View Module Stats**
   - Number of questions
   - Total points for the module

7. **Save Module**
   - Click "Save Module"
   - Module appears in Module Bank list

### Example: Creating a "Project Management" Module

```
Module Name: Project Management Fundamentals
Description: Essential PM concepts and definitions

Questions to include:
1. [Easy - 5 pts] What is project management? (MCQ)
2. [Medium - 10 pts] List the five process groups (Ordered List)
3. [Medium - 10 pts] Which tools are PM tools? (Pick List)
4. [Hard - 15 pts] Analyze this scenario and recommend an approach (Free Text)

Total: 4 questions, 40 points
```

### Editing Modules

1. Find the module in the list
2. Click **Edit** button (pencil icon)
3. Add/remove questions as needed
4. Reorder questions
5. Click "Update Module"

### Previewing Modules

1. Click **Preview** button (eye icon) for any module
2. See all questions and their details
3. Verify content before using in assessments

### Deleting Modules

1. Click **Delete** button (trash icon)
2. Confirm deletion
3. ⚠️ Deleting a module does NOT delete questions - they remain in Question Bank

---

## Assessment Creation

### New Workflow: Module-Based Assessment

The assessment creation process now leverages your Question and Module Banks:

#### Step 1: Create Assessment Skeleton
1. Click "Create Assessment"
2. Enter assessment details:
   - Title
   - Description
   - Duration (in minutes)
   - Passing score (percentage)

#### Step 2: Select Modules
1. Browse available modules
2. Select multiple modules (multi-select)
3. Selected modules appear with:
   - Number of questions
   - Total points
   - Preview option

#### Step 3: Organize
1. Reorder modules if needed (drag-drop)
2. Questions auto-load in module order
3. Preview entire assessment

#### Step 4: Review & Publish
1. Review all questions in final order
2. Verify total points and duration
3. Publish assessment
4. Assessment becomes available to trainees

### Example Assessment Creation

```
Title: Mid-Year Performance Assessment
Description: Comprehensive evaluation of core competencies

Modules Selected:
1. Leadership Fundamentals (4 questions, 40 pts)
2. Communication Skills (3 questions, 30 pts)
3. Decision Making (5 questions, 50 pts)

Total: 12 questions, 120 points
Duration: 60 minutes
Passing Score: 70%
```

### Benefits of Module-Based Assessments

✓ **Consistency**: Use same questions across multiple assessments
✓ **Speed**: Create assessments in minutes, not hours
✓ **Flexibility**: Easily swap modules without affecting questions
✓ **Maintenance**: Update module questions, automatically updated everywhere
✓ **Reporting**: Better insights since questions are tracked globally

---

## Dataset Management

### What are Datasets?

Datasets are supporting files for specific questions. They might include:
- PDF documents (case studies, instructions)
- Images (diagrams, screenshots, reference materials)
- Word documents (detailed information)
- Spreadsheets (data for analysis)
- CAD files (technical drawings - DWG, RVT)

### Example: Free Text Question with Dataset

```
Question: "Analyze the provided architectural drawing and identify three structural issues"

Dataset: 
- building_drawing.dwg (CAD file)
- reference_guide.pdf (technical specifications)

User sees question + can download both files
```

### Uploading Datasets

1. Edit the question
2. Click "Manage Datasets" (folder icon)
3. Click "Upload Dataset"
4. Select file from your computer
5. File uploads to secure storage
6. File info is recorded (name, size, date, type)

### Supported File Types

| Type | Extensions | Use Case |
|------|-----------|----------|
| Documents | PDF, DOC, DOCX | Case studies, instructions |
| Images | PNG, JPG, GIF, SVG | Diagrams, screenshots |
| Spreadsheets | XLS, XLSX, CSV | Data for analysis |
| CAD Files | DWG, RVT, DXF | Technical drawings |
| Presentations | PPT, PPTX | Reference materials |

### Downloading Datasets

**For Trainees:**
- When taking assessment, datasets appear as download links
- Can download during or after assessment (based on permissions)

**For Instructors:**
- Can preview all attached datasets before assignment

### Managing Dataset Storage

**Storage Limits:**
- Typical setup: Up to 5GB per Supabase project
- Monitor in Supabase dashboard

**Best Practices:**
- Compress large files before uploading
- Remove outdated datasets regularly
- Use consistent file naming: `question_[title]_[description].ext`

---

## Excel Import/Export

### Exporting Questions to Excel

**Use Cases:**
- Back up all questions
- Share with team members
- Bulk edit in Excel
- Archive questions

**Steps:**
1. Go to Question Bank
2. Click "Export" button
3. File downloads as `questions-export-YYYY-MM-DD.tsv`
4. Open in Excel or Google Sheets

**Excel Format:**

| Column | Description | Required |
|--------|-------------|----------|
| Title | Question title | Yes |
| Type | MCQ, PL, TRUEFALSE, FREETEXT, ORDERED_LIST | Yes |
| Description | Additional context | No |
| Points | Points for question | No |
| Category | Topic/category | No |
| Difficulty | easy, medium, hard | No |
| Question Text | The actual question | Yes |
| Correct Answer | The correct answer | Yes |
| Options | Comma-separated options (for MCQ/PL) | No |
| Tags | Comma-separated tags | No |

### Importing Questions from Excel

**Preparation:**
1. Create Excel file with required columns
2. Ensure headers match exactly (see format above)
3. Validate all data before importing

**Steps:**
1. Go to Question Bank
2. Click "Import Excel"
3. Select your file (TSV, CSV, or XLS)
4. Preview import results
5. Click "Import Questions"

**Result:**
- New questions added to Question Bank
- Error report shows any rows that failed
- Can retry after fixing errors

### Example Excel Import

```
Title,Type,Description,Points,Category,Difficulty,Question Text,Correct Answer,Options,Tags
"What is 2+2?","MCQ","Basic math",10,"Math","easy","Calculate: 2+2","4","2,3,4,5","basics,math"
"Is earth round?","TRUEFALSE","Geography basics",5,"Geography","easy","The earth is round","true","","geography"
"Describe leadership","FREETEXT","Essay question",20,"Leadership","hard","What makes an effective leader?","varies","","essay,leadership"
```

**Import Workflow:**

1. ✓ Rows 1-3 successfully imported
2. ✗ Row 4 error: Missing required "Question Text"
3. ✗ Row 5 error: Invalid type "MULTIPLE_CHOICE" (should be "MCQ")

**Fix & Retry:**
- Correct rows 4-5 in Excel
- Re-import file
- Successfully import fixed rows

---

## Best Practices

### Question Bank Best Practices

**Organization:**
- Use consistent naming: Start with verb (e.g., "Describe...", "Calculate...", "Analyze...")
- Categorize questions logically (by topic, module, or skill)
- Tag questions with multiple relevant tags

**Question Quality:**
- Write clear, unambiguous questions
- Ensure correct answers are actually correct
- Test questions before adding to modules
- Avoid trick questions

**Difficulty Progression:**
- Create questions at all difficulty levels
- Use difficulty levels for adaptive assessments
- Mix difficulties within modules (easy → medium → hard)

**Reusability:**
- Create general questions that work in multiple contexts
- Avoid overly specific questions
- Plan questions during module design phase

### Module Bank Best Practices

**Logical Grouping:**
- Group related questions into cohesive modules
- Each module should represent a learning objective
- Typical module size: 3-10 questions

**Balance:**
- Balance easy/medium/hard questions within modules
- Mix question types for variety
- Ensure total points make sense (e.g., 40 points for 4 questions)

**Naming & Documentation:**
- Use descriptive module names
- Add descriptions explaining module scope
- Document prerequisites if needed

**Versioning:**
- Create new modules rather than heavily modifying existing ones
- Use naming convention: "Module Name v1", "Module Name v2"
- Keep historical versions for reference

### Assessment Creation Best Practices

**Structure:**
- Start with easier questions to build confidence
- Progress to harder questions
- Use varied question types

**Timing:**
- Allocate 1-2 minutes per question
- Add buffer time (20-30%) for complex questions
- Consider difficulty when setting time

**Passing Score:**
- Set realistically based on question difficulty
- Typically 60-70% for knowledge tests
- Adjust based on assessment purpose

---

## Troubleshooting

### Common Issues

#### "Import failed: Invalid file format"
**Solution:**
- Ensure file is TSV, CSV, or XLS format
- Check headers match exactly
- Verify encoding is UTF-8

#### "Question won't save"
**Solution:**
- Check all required fields are filled (Title, Type, Question Text, Correct Answer)
- Verify question type matches content
- Check for special characters in text

#### "Module is empty after importing"
**Solution:**
- Questions may not have imported successfully
- Check import error report
- Re-import questions first, then create module

#### "Cannot delete question - still in use"
**Solution:**
- Question is linked to an active module
- Edit module to remove the question
- Then delete the question
- Or use "force delete" if available (admin only)

### Performance Tips

**Slow Search/Filter:**
- Try more specific filters
- Use pagination (load 20 at a time)
- Check browser console for errors

**Large Imports:**
- Split large Excel files (max 500 rows per import)
- Import in multiple batches
- Monitor import progress

**Storage Issues:**
- Check Supabase storage dashboard
- Remove old datasets you no longer need
- Compress large files before uploading

### Getting Help

**For Questions:**
- Hover over field labels for hints
- Check error messages for specific guidance

**For Bugs:**
- Note exact steps to reproduce
- Screenshot error messages
- Contact administrator or support team

---

## Advanced Features

### Saved Filters

Save your common filter combinations for quick access:

1. Apply filters you use regularly
2. Click "Save This Filter"
3. Give filter a name
4. Load saved filters in future sessions

### Bulk Operations

**Bulk Edit:**
- Select multiple questions
- Update common fields (difficulty, category, tags)
- Save changes in batch

**Bulk Delete:**
- Select questions to delete
- Confirm bulk deletion
- Generates deletion report

### Automation

**Assessment Templates:**
- Create standard module sets for common assessment types
- Quick-load templates when creating new assessments

**Question Suggestions:**
- System suggests related questions
- Based on tags, category, and difficulty

---

## Security & Access Control

### User Roles

| Role | Create Questions | Create Modules | Create Assessments | Manage Datasets | View Reports |
|------|-----|-----|-----|-----|-----|
| Trainer | ✓ | ✓ | ✓ | ✓ | ✓ |
| Administrator | ✓ | ✓ | ✓ | ✓ | ✓ |
| Superadmin | ✓ | ✓ | ✓ | ✓ | ✓ |
| Trainee | ✗ | ✗ | ✗ | ✗ | ✗ (own only) |

### Data Protection

- Questions are private to creator (except admins can see all)
- Modules can only be edited by creator
- Datasets stored in secure Supabase storage
- All changes logged for audit purposes

---

## FAQ

**Q: Can I reuse a question in multiple modules?**
A: Yes! This is the entire point of the Question Bank. Questions are created once, used everywhere.

**Q: What happens if I edit a question that's already in a module?**
A: The change appears everywhere - in the module, and in any assessment using that module. This is powerful but use carefully.

**Q: Can trainees see the Question Bank?**
A: No. Question Bank is admin/trainer only. Trainees only see questions in assigned assessments.

**Q: Can I delete a module without deleting its questions?**
A: Yes! Modules and questions are separate. Deleting a module keeps the questions in the Question Bank.

**Q: How do I handle question updates for active assessments?**
A: Create a new version of the question/module and use it in new assessments. Keep old versions for historical reference.

**Q: What file size limits exist for datasets?**
A: Individual files can be up to your Supabase storage limit (typically 100MB per file). Check your project settings.

**Q: Can I export and modify questions offline?**
A: Yes! Export to Excel, modify, and re-import. The import process is designed for this workflow.

---

## Support & Resources

- **Documentation**: See this guide and the Implementation Guide
- **Video Tutorials**: Available in the platform (if configured)
- **Administrator Contact**: Reach out to your BECA Administrator
- **Issue Reports**: Document issues with steps to reproduce

---

**Version**: 1.0  
**Last Updated**: 2024  
**System**: BECA Assessment Platform
