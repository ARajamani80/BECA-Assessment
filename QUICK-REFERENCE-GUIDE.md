# BECA Excel Template - Quick Reference Guide

## Download Template
**Button Location:** Question Bank → "Download Template"  
**File:** BECA-Questions-Complete-Template.xlsx

---

## Question Type Codes

| Type | Code | Best For |
|------|------|----------|
| Multiple Choice | MCQ | Selection from 4-5 options |
| True/False | T/F | Binary concept verification |
| Dropdown/List | PL | Selection from list |
| File Upload | FT | CAD/PDF/Document submission |
| Ranking/Order | OL | Sequence arrangement (3-6 items) |
| Short Text | SA | 1-2 word answers with keywords |
| Essay | EA | Long-form with rubric scoring |

---

## Required Fields by Type

### MCQ
- Question Text ✓
- Type = "MCQ" ✓
- Option 1-2+ ✓
- Correct Answer ✓
- Points ✓

### T/F
- Question Text ✓
- Type = "T/F" ✓
- Correct Answer (True/False) ✓
- Points ✓

### PL
- Question Text ✓
- Type = "PL" ✓
- List Option 1-3+ ✓
- Correct Answer ✓
- Points ✓

### FT
- Question Text ✓
- Type = "FT" ✓
- Allowed File Types ✓
- Max File Size ✓
- Points ✓

### OL
- Question Text ✓
- Type = "OL" ✓
- Item 1-3+ ✓
- Correct Order ✓
- Points ✓

### SA
- Question Text ✓
- Type = "SA" ✓
- Expected Answer ✓
- Keyword 1+ ✓
- Points ✓

### EA
- Question Text ✓
- Type = "EA" ✓
- Rubric Criteria 1-3 ✓
- Rubric Points 1-3 ✓
- Points ✓

---

## Common Field Values

**Difficulty:** Easy | Medium | Hard  
**Type Code:** MCQ | T/F | PL | FT | OL | SA | EA  
**Case Sensitive:** Yes | No  
**Shuffle Options:** Yes | No  
**Show Explanation:** Yes | No  

---

## File Format Examples

### Allowed File Types (FT)
```
.DWG, .PDF
.DWG, .PDF, .XLSX
.RVT
.DWG, .DWT, .PDF, .ZIP
```

### Correct Order (OL)
```
1,2,3,4
2,1,3,4,5
1,3,2
```

### Keywords (SA)
```
Z; zoom; shortcut
Interference; Clash; Check; Detection
```

### Rubric Format (EA)
```
Understanding (5); Clarity (5); Detail (5)
Planning (7); Expertise (7); Detail (6)
```

---

## Step-by-Step Import

1. **Download Template** → Question Bank → "Download Template"
2. **Open in Excel** → BECA-Questions-Complete-Template.xlsx
3. **Select Sheet** → Choose type (MCQ, T/F, PL, FT, OL, SA, EA)
4. **Copy Sample** → Copy row 2 (example row)
5. **Modify Data** → Fill in your question details
6. **Save File** → Save as .xlsx format
7. **Import** → Question Bank → "Import Excel"
8. **Select File** → Choose your prepared Excel file
9. **Review** → Check for errors
10. **Confirm** → Click Import

---

## Step-by-Step Export

1. **Click Export** → Question Bank → "Export" button
2. **Wait** → File downloads automatically
3. **Filename** → BECA-Questions-Export-[DATE].xlsx
4. **Sheets** → One sheet per type + ALL QUESTIONS
5. **Edit** → Modify in Excel if needed
6. **Re-import** → Use same Question IDs to update

---

## Field Validation Rules

| Field | Rules |
|-------|-------|
| Points | Integer 1-100 |
| Time Limit | Integer 30-3600 (seconds) |
| Min/Max Words | Integer, Min < Max |
| File Size | Integer 1-100 (MB) |
| Case Sensitive | "Yes" or "No" only |
| Correct Answer | Must match option/answer exactly |
| Question ID | Leave blank for auto-generation |
| URLs | Must start with http:// or https:// |
| Item Count | Min 3 items required |
| Option Count | Min 2 required, Max 5 typical |

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Answer not found | Check exact spelling/spacing |
| Invalid file type | Use correct codes (.DWG not dwg) |
| Points out of range | Use 1-100 only |
| Missing required field | Fill in all ✓ marked fields |
| Wrong type code | Use exact: MCQ, T/F, PL, FT, OL, SA, EA |
| Option count mismatch | Ensure min options for type |
| Blank Question ID | Leave blank → auto-generated |

---

## Best Practices Checklist

### Before Creating
- [ ] Define learning objective
- [ ] Choose appropriate type
- [ ] Plan answer options/keywords
- [ ] Gather reference materials

### While Creating
- [ ] Write clear questions
- [ ] Provide helpful explanations
- [ ] Test answer accuracy
- [ ] Use consistent formatting
- [ ] Add category/difficulty

### Before Importing
- [ ] Review all data
- [ ] Check for typos
- [ ] Verify answers match options
- [ ] Test file types
- [ ] Save as .xlsx

### After Importing
- [ ] Verify questions imported
- [ ] Review in Question Bank
- [ ] Test question display
- [ ] Check image/dataset links

---

## Excel Tips

**Freeze Header Row:**
- Select row 2
- View → Freeze Panes

**Auto-fit Columns:**
- Select all (Ctrl+A)
- Double-click column border

**Add Rows:**
- Right-click → Insert
- Copy sample row and modify

**Find & Replace:**
- Ctrl+H
- Replace all similar values

**Sort Data:**
- Select all data
- Data → Sort
- Choose column to sort by

**Filter Data:**
- Select headers
- Data → AutoFilter
- Click dropdown arrows

---

## Sample Question Template

```
FIELD                  VALUE
Question ID            [Leave blank for auto-generation]
Title                  Understanding AutoCAD Commands
Type                   MCQ
Points                 5
Category               AutoCAD
Difficulty             Medium
Question Text          Which command opens the file dialog in AutoCAD?
Image URL              [Leave blank if not needed]
Option 1               OPEN
Option 2               NEW
Option 3               SAVE
Option 4               EXIT
Option 5               [Leave blank]
Correct Answer         OPEN
Explanation            The OPEN command is standard for file operations
Dataset URL            [Leave blank]
Time Limit (seconds)   30
Shuffle Options        Yes
Show All Options       Yes
```

---

## File Type Reference

**Autodesk CAD Files:**
- .DWG = AutoCAD Drawing
- .RVT = Revit Project
- .IAM = Inventor Assembly
- .F3D = Fusion 360 Project

**Office Documents:**
- .PDF = Portable Document
- .DOCX = Word Document
- .XLSX = Excel Spreadsheet
- .CSV = Data File

**Images:**
- .JPG, .JPEG = Photo
- .PNG = Image with transparency
- .GIF = Animated image

**Archives:**
- .ZIP = Compressed file

---

## Points per Question Type

| Type | Typical Range | Example |
|------|---------------|---------|
| MCQ | 2-10 pts | 5 pts |
| T/F | 1-3 pts | 2 pts |
| PL | 2-5 pts | 3 pts |
| SA | 1-5 pts | 3 pts |
| OL | 3-8 pts | 6 pts |
| FT | 5-20 pts | 10 pts |
| EA | 10-30 pts | 15 pts |

---

## Rubric Example (Essay)

```
CRITERIA              POINTS
Understanding         5
Clarity               5
Completeness         5
___________________________
TOTAL POINTS         15
```

Student scoring:
- Full points = Fully meets criterion
- Partial = Partially meets criterion
- No points = Does not meet criterion

---

## Difficulty Levels

**Easy:** Direct recall, simple application, basic concepts
- Example: "What is the keyboard shortcut for ZOOM?"
- Time: 5-15 seconds
- No research needed

**Medium:** Application, analysis, connecting concepts
- Example: "Which element type is structural in Revit?"
- Time: 30-60 seconds
- Moderate reasoning

**Hard:** Analysis, evaluation, complex problem-solving
- Example: "Analyze design strategy and implementation"
- Time: 60-600 seconds
- Requires deep understanding

---

## Time Limits (Seconds)

| Type | Recommended |
|------|-------------|
| MCQ | 30-60 |
| T/F | 15-30 |
| PL | 20-45 |
| SA | 15-60 |
| OL | 45-90 |
| FT | 300-900 (5-15 min) |
| EA | 600-1800 (10-30 min) |

---

## Contact & Support

**Documentation:** Excel-Template-User-Guide.md  
**Implementation:** IMPLEMENTATION-SUMMARY.md  
**Issues:** GitHub Issues tracker  
**Email:** support@beca.example.com  

---

## Version

**Template Version:** 1.0  
**Updated:** July 23, 2026  
**Status:** Production Ready

---

**Print this guide for quick reference while working with Excel templates!**
