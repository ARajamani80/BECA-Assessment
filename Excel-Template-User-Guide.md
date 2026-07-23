# BECA Assessment Platform - Excel Template User Guide

## Overview

The BECA Assessment Platform provides comprehensive Excel templates for creating, importing, and exporting questions. This guide explains all available fields, question types, and best practices for using the templates.

## Getting Started

### Downloading the Template

1. Log into the BECA Assessment Platform
2. Navigate to **Question Bank**
3. Click the **"Download Template"** button
4. The file `BECA-Questions-Complete-Template.xlsx` will download
5. Open it in Microsoft Excel, Google Sheets, or compatible spreadsheet software

### Template Structure

The template contains 10 sheets:

| Sheet Name | Purpose | Contents |
|-----------|---------|----------|
| **INSTRUCTIONS** | Overview and help | Field definitions, usage tips, examples |
| **MCQ** | Multiple Choice Questions | 4-5 options with one correct answer |
| **T/F** | True/False Questions | Boolean correct/incorrect answers |
| **PL** | Pick List/Dropdown | Select from predefined list options |
| **FT** | File Upload | Upload CAD, PDF, or other files |
| **OL** | Ordered List/Ranking | Arrange items in correct sequence |
| **SA** | Short Answer | Text response with keyword matching |
| **EA** | Essay | Long-form response with rubric scoring |
| **BULK IMPORT** | Mixed Types | All question types in one sheet |
| **Sample Data** | Examples | Pre-filled examples for reference |

---

## Question Types and Fields

### 1. MCQ (Multiple Choice Question)

**Use for:** Questions with 2-5 options where only one is correct.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Question ID | Text | No* | Auto-generated if blank |
| Title | Text | Yes | Question name/title |
| Type | Text | Yes | Must be "MCQ" |
| Points | Number | Yes | Score for correct answer (1-100) |
| Category | Text | No | Topic area (e.g., AutoCAD, Revit) |
| Difficulty | Text | No | Easy, Medium, or Hard |
| Question Text | Text | Yes | Full question prompt |
| Image URL | Text | No | URL to question image/diagram |
| Option 1-5 | Text | Yes (min 2) | Answer choices |
| Correct Answer | Text | Yes | Must match one of the options exactly |
| Explanation | Text | No | Answer rationale for students |
| Dataset URL | Text | No | Reference file URL |
| Time Limit (seconds) | Number | No | Optional timer (30-600 seconds) |
| Shuffle Options | Text | No | "Yes" or "No" |
| Show All Options | Text | No | "Yes" or "No" |

**Example:**

```
Question ID: Q-MCQ-001
Title: AutoCAD File Dialog Command
Type: MCQ
Points: 5
Category: AutoCAD
Difficulty: Medium
Question Text: Which command opens the file dialog in AutoCAD?
Option 1: OPEN
Option 2: NEW
Option 3: SAVE
Option 4: EXIT
Correct Answer: OPEN
Explanation: The OPEN command is the standard command for opening files.
Time Limit: 30
```

**Tips:**
- Provide 4 plausible options for better assessment value
- Make incorrect options realistic and commonly confused
- Keep options concise
- Use consistent formatting for option text

---

### 2. T/F (True/False)

**Use for:** Binary true/false conceptual questions.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Question ID | Text | No* | Auto-generated if blank |
| Title | Text | Yes | Question name |
| Type | Text | Yes | Must be "T/F" |
| Points | Number | Yes | Score for correct answer |
| Category | Text | No | Topic area |
| Difficulty | Text | No | Easy, Medium, or Hard |
| Question Text | Text | Yes | Complete question statement |
| Image URL | Text | No | URL to supporting image |
| Correct Answer | Text | Yes | Must be exactly "True" or "False" |
| Explanation | Text | No | Why the answer is correct |
| Dataset URL | Text | No | Reference file |
| Time Limit (seconds) | Number | No | Optional timer |
| Show Explanation | Text | No | "Yes" or "No" |

**Example:**

```
Question ID: Q-TF-001
Title: Revit Parametric Design
Type: T/F
Points: 3
Category: Revit
Difficulty: Easy
Question Text: Revit is a parametric modeling tool that uses associative design.
Correct Answer: True
Explanation: Revit is built on parametric principles, allowing intelligent relationships between building elements.
Time Limit: 20
```

**Tips:**
- Write questions as clear, definitive statements
- Avoid double negatives
- Make both answers plausible
- Provide clear rationale in explanation

---

### 3. PL (Pick List/Dropdown)

**Use for:** Selecting one correct option from a list.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Question ID | Text | No* | Auto-generated if blank |
| Title | Text | Yes | Question name |
| Type | Text | Yes | Must be "PL" |
| Points | Number | Yes | Score for correct answer |
| Category | Text | No | Topic area |
| Difficulty | Text | No | Easy, Medium, or Hard |
| Question Text | Text | Yes | Question prompt |
| Image URL | Text | No | URL to image |
| List Option 1-5 | Text | Yes (min 3) | Available choices in dropdown |
| Correct Answer | Text | Yes | Must match one option exactly |
| Explanation | Text | No | Why answer is correct |
| Dataset URL | Text | No | Reference file |
| Time Limit (seconds) | Number | No | Optional timer |

**Example:**

```
Question ID: Q-PL-001
Title: Revit Element Classification
Type: PL
Points: 4
Category: Revit
Difficulty: Medium
Question Text: Which element type is primarily used for vertical structural support?
List Option 1: Wall
List Option 2: Column
List Option 3: Door
List Option 4: Window
Correct Answer: Column
Explanation: Columns are primary vertical structural elements designed to support and transfer loads.
```

**Tips:**
- Include 4-7 options (minimum 3)
- Make incorrect options reasonable
- Present options in consistent order
- Ensure answer text matches exactly

---

### 4. FT (File Upload)

**Use for:** Questions requiring file uploads (CAD, PDF, documents).

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Question ID | Text | No* | Auto-generated if blank |
| Title | Text | Yes | Question name |
| Type | Text | Yes | Must be "FT" |
| Points | Number | Yes | Score for submission |
| Category | Text | No | Topic area |
| Difficulty | Text | No | Easy, Medium, or Hard |
| Question Text | Text | Yes | What to upload/create |
| Image URL | Text | No | Reference image |
| Allowed File Types | Text | Yes | Comma-separated (e.g., .DWG,.PDF) |
| Max File Size (MB) | Number | Yes | Maximum upload size (1-100 MB) |
| Expected Answer | Text | No | What the correct submission contains |
| Dataset URL | Text | No | Reference/sample file |
| Time Limit (seconds) | Number | No | Optional timer |
| Instructions | Text | No | Detailed submission instructions |

**Supported File Formats:**

**Autodesk Files:**
- AutoCAD: `.DWG`, `.DWT`
- Revit: `.RVT`, `.RFA`, `.RTE`, `.RFT`
- Inventor: `.IAM`, `.IPT`, `.IPJ`
- Fusion 360: `.F3D`, `.F3Z`

**General Files:**
- Documents: `.PDF`, `.DOCX`, `.DOC`
- Spreadsheets: `.XLSX`, `.XLS`, `.CSV`
- Data: `.JSON`, `.TXT`
- Images: `.JPG`, `.PNG`, `.GIF`
- Archives: `.ZIP`

**Example:**

```
Question ID: Q-FT-001
Title: Upload CAD Site Plan
Type: FT
Points: 10
Category: AutoCAD
Difficulty: Hard
Question Text: Create and upload a site plan drawing showing property boundaries and structures.
Allowed File Types: .DWG, .PDF
Max File Size (MB): 50
Expected Answer: Complete site plan with all property features dimensioned
Dataset URL: examples/sample-site-plan.dwg
Time Limit: 300
Instructions: Include all major features with dimensions. Use standard drawing conventions.
```

**Tips:**
- Specify exact file format requirements
- Set reasonable file size limits (50MB typical)
- Provide sample files for reference
- Give clear submission requirements
- Estimate time needed for completion

---

### 5. OL (Ordered List/Ranking)

**Use for:** Arranging items in correct sequence or priority order.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Question ID | Text | No* | Auto-generated if blank |
| Title | Text | Yes | Question name |
| Type | Text | Yes | Must be "OL" |
| Points | Number | Yes | Score for correct order |
| Category | Text | No | Topic area |
| Difficulty | Text | No | Easy, Medium, or Hard |
| Question Text | Text | Yes | Ordering task description |
| Image URL | Text | No | Reference image |
| Item 1-5 | Text | Yes (min 3) | Items to arrange |
| Correct Order | Text | Yes | Comma-separated order (e.g., 1,2,3,4) |
| Explanation | Text | No | Why this order is correct |
| Dataset URL | Text | No | Reference file |
| Time Limit (seconds) | Number | No | Optional timer |

**Example:**

```
Question ID: Q-OL-001
Title: CAD Drawing Workflow
Type: OL
Points: 6
Category: AutoCAD
Difficulty: Medium
Question Text: Order these steps in the correct sequence for creating a technical drawing:
Item 1: Draw geometry
Item 2: Apply constraints
Item 3: Add dimensions
Item 4: Export to PDF
Correct Order: 1,2,3,4
Explanation: Geometry must be drawn first, then constrained for accuracy, dimensions added for clarity, and finally exported.
Time Limit: 60
```

**Tips:**
- Use 3-6 items maximum
- Make sequences logical but not obvious
- Number the correct order starting from 1
- Provide clear ordering rationale
- Test that only one correct order exists

---

### 6. SA (Short Answer)

**Use for:** Text responses evaluated against keywords and expected answers.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Question ID | Text | No* | Auto-generated if blank |
| Title | Text | Yes | Question name |
| Type | Text | Yes | Must be "SA" |
| Points | Number | Yes | Score for match |
| Category | Text | No | Topic area |
| Difficulty | Text | No | Easy, Medium, or Hard |
| Question Text | Text | Yes | Question prompt |
| Image URL | Text | No | Reference image |
| Expected Answer | Text | Yes | Primary correct answer |
| Keyword 1-5 | Text | At least 1 | Keywords that indicate correct answer |
| Explanation | Text | No | Answer rationale |
| Case Sensitive | Text | No | "Yes" or "No" |
| Dataset URL | Text | No | Reference file |
| Time Limit (seconds) | Number | No | Optional timer |

**Example:**

```
Question ID: Q-SA-001
Title: AutoCAD Zoom Shortcut
Type: SA
Points: 2
Category: AutoCAD
Difficulty: Easy
Question Text: What is the keyboard shortcut for the ZOOM command in AutoCAD?
Expected Answer: Z
Keyword 1: Z
Keyword 2: zoom
Keyword 3: shortcut
Explanation: The Z key activates the ZOOM command. You can also type ZOOM in the command line.
Case Sensitive: No
Time Limit: 15
```

**Tips:**
- Provide alternative accepted answers via keywords
- Make keywords specific to the topic
- Allow case-insensitive matching when appropriate
- Accept abbreviations or alternative spellings
- Use at least 3 keywords
- Keep expected answers concise

---

### 7. EA (Essay)

**Use for:** Long-form responses evaluated using rubric scoring criteria.

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Question ID | Text | No* | Auto-generated if blank |
| Title | Text | Yes | Question name |
| Type | Text | Yes | Must be "EA" |
| Points | Number | Yes | Total possible points |
| Category | Text | No | Topic area |
| Difficulty | Text | No | Easy, Medium, or Hard |
| Question Text | Text | Yes | Essay prompt |
| Image URL | Text | No | Reference image |
| Min Words | Number | No | Minimum word count |
| Max Words | Number | No | Maximum word count |
| Rubric Criteria 1-3 | Text | Yes | What to evaluate (e.g., "Understanding") |
| Rubric Points 1-3 | Number | Yes | Points for each criterion |
| Explanation | Text | No | What constitutes a good answer |
| Dataset URL | Text | No | Reference material |
| Time Limit (seconds) | Number | No | Optional timer |

**Example:**

```
Question ID: Q-EA-001
Title: CAD Drawing Analysis
Type: EA
Points: 15
Category: AutoCAD
Difficulty: Hard
Question Text: Analyze the provided CAD drawing and describe the design intent, building components, and technical requirements.
Min Words: 100
Max Words: 500
Rubric Criteria 1: Understanding and Technical Knowledge
Rubric Points 1: 5
Rubric Criteria 2: Clarity and Organization
Rubric Points 2: 5
Rubric Criteria 3: Detail and Completeness
Rubric Points 3: 5
Explanation: Comprehensive analysis should address design purpose, structural elements, spatial relationships, and specifications.
Dataset URL: examples/sample-drawing.dwg
Time Limit: 600
```

**Rubric Scoring Example:**

```
Rubric format: "Criterion Name (Points); Criterion Name (Points)"

Understanding (5): Does response demonstrate grasp of concepts?
Clarity (5): Is the writing clear and well-organized?
Completeness (5): Does response address all aspects?

Total: 15 points
```

**Tips:**
- Define 3-5 clear evaluation criteria
- Distribute points appropriately
- Set realistic word count ranges
- Provide reference materials
- Make rubric criteria observable and measurable
- Allocate 10-20 minutes for essay questions

---

## Field Reference Guide

### Common Fields (All Question Types)

| Field | Format | Rules | Example |
|-------|--------|-------|---------|
| **Question ID** | UUID or custom text | Optional; auto-generated if blank | `Q-MCQ-001` or `550e8400-e29b-41d4-a716-446655440000` |
| **Title** | Text (max 255 chars) | Required | `Understanding AutoCAD Commands` |
| **Type** | Code: MCQ, T/F, PL, FT, OL, SA, EA | Required | `MCQ` |
| **Points** | Integer 1-100 | Required | `5` |
| **Category** | Text | Recommended | `AutoCAD`, `Revit`, `General` |
| **Difficulty** | Easy, Medium, Hard | Recommended | `Medium` |
| **Question Text** | Long text | Required | `Which command...?` |
| **Image URL** | Valid HTTP(S) URL | Optional | `https://example.com/image.png` |
| **Dataset URL** | File path or URL | Optional | `examples/model.rvt` |
| **Time Limit** | Integer seconds (30-3600) | Optional | `60` |

### Data Type Rules

**Text Fields:**
- Can contain letters, numbers, special characters
- Maximum 255 characters unless noted
- Supports Unicode (international characters)

**Number Fields:**
- Integers only (no decimals)
- Must be within specified range
- Cannot be negative unless specified

**Boolean Fields:**
- Use "Yes" or "No"
- Case-insensitive
- Cannot be blank

**URL Fields:**
- Must start with http:// or https://
- Can point to internal or external resources
- Validate before import

---

## Importing Questions

### Step-by-Step Import Process

1. **Prepare your Excel file:**
   - Use the provided template
   - Fill in all required fields
   - Remove sample rows if not needed
   - Save as `.xlsx` format

2. **Navigate to Question Bank:**
   - Log into BECA platform
   - Click "Question Bank"
   - Click "Import Excel" button

3. **Select your file:**
   - Browse to your prepared Excel file
   - Select the appropriate sheet (MCQ, T/F, etc.)
   - Click "Next"

4. **Review and validate:**
   - System will check all required fields
   - Errors will be highlighted
   - Fix any issues before proceeding

5. **Confirm import:**
   - Review summary of questions
   - Click "Import" to add to Question Bank
   - System generates IDs for new questions

### Import Validation Rules

The system will check:

- Required fields are not empty
- Question types are valid codes
- Points are valid integers
- URLs are properly formatted
- Option counts match type requirements
- Answers match available options
- No duplicate IDs (unless creating new)

**Common Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| Missing required field | Empty cell | Fill in all required columns |
| Invalid type code | Wrong spelling | Use exact codes: MCQ, T/F, PL, FT, OL, SA, EA |
| Answer not in options | Answer doesn't match option text | Ensure exact match, including spacing |
| Invalid URL format | Malformed URL | Use full URL with http:// or https:// |
| Points not a number | Text in number field | Enter integers only (1-100) |

---

## Exporting Questions

### Exporting Current Questions

1. Go to **Question Bank**
2. Click **"Export"** button
3. System creates multi-sheet Excel file with:
   - One sheet per question type
   - "ALL QUESTIONS" summary sheet
   - Includes all fields and metadata

### Export File Contents

**MCQ Sheet:**
- All MCQ questions with full options
- Correct answers marked
- Explanations included

**T/F Sheet:**
- True/False questions
- Correct answers
- Explanations

**All Question Types:**
- Dedicated sheets for PL, FT, OL, SA, EA
- Complete field data
- Links to datasets

**ALL QUESTIONS Sheet:**
- Summary of all questions
- Question ID, Title, Type, Points
- Category, Difficulty
- Creation/update metadata

### Using Exported Files

- **Backup:** Keep exported files as backup
- **Review:** Audit questions and answers
- **Modify:** Edit in Excel and re-import
- **Analyze:** Analyze by difficulty or category
- **Share:** Distribute to content creators

---

## Best Practices

### Question Design

**Do:**
- Write clear, unambiguous questions
- Provide context and background
- Use correct terminology
- Include reasonable time limits
- Add helpful explanations
- Test questions before deployment

**Don't:**
- Use trick questions
- Include negative wording
- Make answers obvious from other questions
- Forget to proofread
- Use outdated information
- Create overly complex wording

### File Management

**Do:**
- Use descriptive file names with dates
- Keep backup copies
- Version control important templates
- Organize by course/module
- Document question sources
- Validate before importing

**Don't:**
- Overwrite original templates
- Import unreviewed questions
- Leave sample data in production
- Use absolute file paths
- Import incomplete questions
- Forget to set time limits

### Data Quality

**Do:**
- Maintain consistent formatting
- Use complete URLs
- Include all explanations
- Verify all answers
- Test option ordering
- Check file upload limits

**Don't:**
- Mix multiple languages
- Use inconsistent categories
- Leave fields blank unnecessarily
- Duplicate question IDs
- Mix question types in wrong sheets
- Import questions without metadata

---

## Troubleshooting

### File Won't Open

**Problem:** Excel file shows error or won't open
**Solutions:**
- Ensure file is saved as `.xlsx` format
- Check file isn't corrupted
- Try opening in different application
- Download fresh template

### Import Fails

**Problem:** "Import validation failed" error
**Solutions:**
- Check all required fields are filled
- Verify type codes are exact (MCQ, T/F, etc.)
- Ensure answer matches option text exactly
- Validate URLs are properly formatted
- Check for extra spaces in cells

### Missing Questions After Import

**Problem:** Questions imported but don't appear
**Solutions:**
- Refresh Question Bank page
- Check filters aren't hiding questions
- Verify correct sheet was imported
- Check browser developer console for errors

### Export File Empty

**Problem:** Export creates file but no data
**Solutions:**
- Ensure questions exist in system
- Try refreshing Question Bank first
- Check that XLSX library loaded correctly
- Try export again or contact support

---

## Advanced Features

### Bulk Operations

**Create Multiple Questions Quickly:**
1. Use BULK IMPORT sheet
2. Mix different question types
3. Type field determines parsing
4. System handles type-specific fields

**Update Multiple Questions:**
1. Export current questions
2. Edit in Excel
3. Re-import with same Question IDs
4. System updates existing records

### Conditional Fields

Certain fields only apply to specific question types:

| Field | MCQ | T/F | PL | FT | OL | SA | EA |
|-------|-----|-----|----|----|----|----|-----|
| Options 1-5 | Y | - | - | - | - | - | - |
| Correct Answer | Y | Y | Y | - | - | Y | - |
| File Types | - | - | - | Y | - | - | - |
| Keywords | - | - | - | - | - | Y | - |
| Rubric | - | - | - | - | - | - | Y |

---

## Support and Resources

### Getting Help

- **Documentation:** Review INSTRUCTIONS sheet in template
- **Examples:** Copy sample rows and modify
- **Support Contact:** Email support@beca.example.com
- **Video Tutorials:** Visit help.beca.example.com

### Related Documents

- BECA User Manual
- Question Design Guidelines
- Assessment Best Practices
- Rubric Scoring Guide

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-23 | Initial comprehensive template and user guide |

---

## Appendix: Formula Reference

### Common Excel Formulas for Template Preparation

**Generate IDs (in unused column):**
```
=CONCATENATE("Q-", MID(A2,1,3), "-", ROW()-1)
```

**Count questions by type:**
```
=COUNTIF(C:C, "MCQ")
```

**Check for missing fields:**
```
=IF(ISBLANK(A2), "MISSING", "OK")
```

**Validate numeric range:**
```
=IF(AND(B2>=1, B2<=100), "VALID", "OUT OF RANGE")
```

**Extract category from text:**
```
=TRIM(LEFT(A2, FIND("|", A2)-1))
```

---

## Glossary

**Autodesk Files:** CAD/BIM file formats from AutoCAD, Revit, Inventor, and Fusion 360

**Bulk Import:** Sheet combining multiple question types for efficient mass importing

**BIM:** Building Information Modeling

**CAD:** Computer-Aided Design

**Case Sensitive:** Exact letter case must match (e.g., "AutoCAD" vs "autocad")

**Dataset:** Reference file or material provided to students

**Keyword Matching:** Answer accepted if contains specified keywords

**Rubric:** Scoring criteria with point allocations

**UUID:** Universally Unique Identifier (long alphanumeric code)

---

Last Updated: July 23, 2026
Next Review: July 23, 2027
