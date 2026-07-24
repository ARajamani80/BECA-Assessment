# Excel to Database Field Mapping

## Your Excel Structure → Database Columns

| Excel Column | Database Column | Type | Notes |
|---|---|---|---|
| QuestionID | (skip) | - | Internal reference only |
| QuestionName | question_name | VARCHAR | Optional metadata |
| QuestionSummary | question_summary | TEXT | Optional metadata |
| **QuestionText** | **question_text** | TEXT | ✅ REQUIRED |
| **Type** | **question_type** | VARCHAR | ✅ REQUIRED - needs normalization |
| Answer | correct_answer or expected_answer | VARCHAR/TEXT | Depends on type |
| AllAnswers | list_options or keywords | JSONB | Parse based on type |
| SkillLevel | skill_level | VARCHAR | Basic, Intermediate, Advanced |
| QuestionCategory | category | VARCHAR | Task (Interrogate), etc |
| CategoryTags | tags | TEXT | Comma/semicolon separated |
| TrainingTags | training_tags | TEXT | Comma/semicolon separated |
| RelatedFiles | dataset_files | TEXT | File names with .dwg, .pdf, etc |
| CoachingText | coaching_notes | TEXT | Explanatory text |
| CoachingFiles | coaching_files | TEXT | File references |
| LearningText/Links | learning_resources | TEXT | URLs or links |
| LearningFiles | learning_files | TEXT | File references |
| Author | author | VARCHAR | Django Blaylock (DJ) |
| UsedInModules | (skip) | - | For reference only |
| UsedInTests | (skip) | - | For reference only |

---

## Type Normalization

Your Excel has:
- `Free text           ` (with spaces)
- `Pick list           ` (with spaces)

Need to map to database:
- `free_text`
- `pick_list`

---

## Question Type Specific Handling

### Free Text Questions
**Example:**
- QuestionText: "What is the true value of..."
- Type: "Free text"
- Answer: "3450"
- AllAnswers: "3450"

**Mapping:**
- question_text = QuestionText
- question_type = "free_text"
- expected_answer = Answer (or AllAnswers)
- keywords = [extract from Answer/AllAnswers]

---

### Pick List Questions
**Example:**
- QuestionText: "Which properties have been edited?"
- Type: "Pick list"
- Answer: "Dimension lines > Color Text Placement > Vertical"
- AllAnswers: "Arrowheads > First\nArrowheads > Second\nCenter Marks\n..."

**Mapping:**
- question_text = QuestionText
- question_type = "pick_list"
- list_options = Parse AllAnswers by newlines or semicolons
- correct_answer = Parse Answer for which options are correct

**Note:** AllAnswers appears to be separated by line breaks (newlines), not semicolons!

---

## Files Parsing

### RelatedFiles Column
Example: `ACAD-Dimensions-Override-26m.dwg, P-X-Grid-Dims.dwg`

**Mapping:**
- dataset_files = Split by comma, store as JSON array
- File types: .dwg, .pdf (Autodesk and PDF files)

### CoachingFiles, LearningFiles
- coaching_files = "ACAD-Dimensions-Override-26m_Coaching.pdf"
- learning_files = "learning.pdf"

---

## Sample Mappings

### Question 1008649 (Free Text)
```
QuestionText → "Open the file, ACAD-Dimensions-Override-26m.dwg..."
Type → "free_text"
Answer → "3450"
expected_answer → "3450"
keywords → ["3450"]
dataset_files → ["ACAD-Dimensions-Override-26m.dwg", "P-X-Grid-Dims.dwg"]
coaching_notes → "See PDF for coaching notes."
coaching_files → "ACAD-Dimensions-Override-26m_Coaching.pdf"
learning_resources → "https://example.com"
learning_files → "learning.pdf"
category → "Task (Interrogate)"
skill_level → "Basic"
tags → "Text, Dimensions, Text Override"
author → "DJ"
```

### Question 1008650 (Pick List)
```
QuestionText → "Open the file, ACAD-Dimensions-Style01-26m.dwg..."
Type → "pick_list"
Answer → "Dimension lines > Color Text Placement > Vertical"
AllAnswers → Parse by newlines:
  - "Arrowheads > First"
  - "Arrowheads > Second"
  - "Center Marks"
  - "Dimension lines > Color"
  - "Extension lines > Color"
  - "Fit options"
  - "Linear dimensions > Decimal separator"
  - "Text Alignment"
  - "Text Placement > Horizontal"
  - "Text Placement > Vertical"
  
list_options → Array of above options
correct_answer → Identify which from Answer field
dataset_files → ["ACAD-Dimensions-Style01-26m.dwg", "P-X-Grid-Dims.dwg"]
```

---

## Implementation

The import code needs to:

1. ✅ Trim whitespace from Type values ("Free text           " → "free_text")
2. ✅ Parse AllAnswers by **newline first**, then comma/semicolon
3. ✅ For Pick List: split AllAnswers into array of options
4. ✅ For Free Text: use Answer as expected_answer
5. ✅ Parse RelatedFiles by comma into JSON array
6. ✅ Map all metadata fields (category, tags, author, etc.)
7. ✅ Store coaching/learning files and resources

---

## Key Differences from Previous

- **Separator is NEWLINE** for AllAnswers (not semicolon!)
- **More metadata columns** to use (author, skill_level, tags, etc.)
- **File references** need special handling (.dwg, .pdf files)
- **Type values have trailing spaces** - need trimming
