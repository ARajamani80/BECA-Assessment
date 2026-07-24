# Database Schema Update - Question Metadata

## Overview
This update adds 13 new metadata columns to the `assessment_questions` table to support rich question data import from Excel templates.

## Files Involved
- `migrations/003_add_question_metadata.sql` - SQL migration script

## New Columns Added

| Column Name | Type | Purpose | Example |
|---|---|---|---|
| `difficulty` | VARCHAR(50) | Skill level of question | Basic, Intermediate, Advanced |
| `category` | VARCHAR(255) | Question category/topic | Dimensions, Layers, Commands |
| `tags` | TEXT | Comma-separated tags | graphics, vectors, 2d |
| `question_name` | VARCHAR(255) | Short name for question | ACAD-Dimensions-Association |
| `question_summary` | TEXT | Brief description | "This question tests knowledge of settings" |
| `coaching_notes` | TEXT | Tips for instructors | "See PDF for coaching notes" |
| `coaching_files` | TEXT | Coaching resource files | PDF, Word doc names |
| `learning_resources` | TEXT | Learning links/resources | URLs or resource references |
| `learning_files` | TEXT | Learning support files | File names for download |
| `dataset_files` | TEXT | DWG, DWT, RVT files needed | "model-25m.dwg, drawing.rvt" |
| `training_tags` | TEXT | Internal training tags | Tags used by trainers |
| `author` | VARCHAR(255) | Question creator | "John Doe" or org name |
| `skill_level` | VARCHAR(50) | Alternative to difficulty | Same as `difficulty` |

## Indexes Added
- `idx_questions_category` - Fast filtering by category
- `idx_questions_difficulty` - Fast filtering by difficulty
- `idx_questions_tags` - Full-text search on tags

## How to Apply

### Option 1: Supabase Web Editor (Recommended)
1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the entire contents of `migrations/003_add_question_metadata.sql`
5. Paste into the SQL Editor
6. Click **Run** (top right)
7. Wait for confirmation (should say "Success")

### Option 2: Supabase CLI (if installed)
```bash
cd /path/to/BECA-Assessment
supabase db push
```

## Verification

After running the migration, verify it worked:

### In Supabase SQL Editor:
```sql
-- Check new columns exist
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'assessment_questions'
ORDER BY ordinal_position;

-- Should show ~30 columns now (was ~17 before)

-- Check data integrity
SELECT COUNT(*) as total_questions FROM assessment_questions;
```

### Expected Result
- Column count: ~30 columns
- All existing questions preserved
- All existing data intact

## Rollback (if needed)

If something goes wrong:

```sql
-- Drop the new columns (WARNING: This deletes the data)
ALTER TABLE assessment_questions
DROP COLUMN IF EXISTS difficulty,
DROP COLUMN IF EXISTS category,
DROP COLUMN IF EXISTS tags,
DROP COLUMN IF EXISTS question_name,
DROP COLUMN IF EXISTS question_summary,
DROP COLUMN IF EXISTS coaching_notes,
DROP COLUMN IF EXISTS coaching_files,
DROP COLUMN IF EXISTS learning_resources,
DROP COLUMN IF EXISTS learning_files,
DROP COLUMN IF EXISTS dataset_files,
DROP COLUMN IF EXISTS training_tags,
DROP COLUMN IF EXISTS author,
DROP COLUMN IF EXISTS skill_level;

-- Drop the indexes
DROP INDEX IF EXISTS idx_questions_category;
DROP INDEX IF EXISTS idx_questions_difficulty;
DROP INDEX IF EXISTS idx_questions_tags;
```

## Next Steps

1. ✅ Run the migration (above)
2. ✅ Verify columns exist
3. → Build the Excel Importer (Stage 3)
4. → Import your 100 questions

---

**Status:** Ready to apply  
**Risk Level:** Low (additive only, no existing data modified)  
**Estimated Time:** 30 seconds
