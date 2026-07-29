# Debug: Check What's Actually Stored

Run this in the browser console (F12 → Console tab) to see what's in the database:

## Step 1: Check a specific MCQ question

```javascript
// Get the first MCQ question
const { data, error } = await getSupabaseClient()
  .from('assessment_questions')
  .select('*')
  .eq('question_type', 'mcq')
  .limit(1)
  .single();

if (error) {
  console.error('Error:', error);
} else {
  console.log('Raw question from DB:');
  console.log('ID:', data.id);
  console.log('Type:', data.question_type);
  console.log('Options field:', data.options);
  console.log('List Options field:', data.list_options);
  console.log('Correct Answer:', data.correct_answer);
  console.log('Raw options type:', typeof data.options);
  console.log('Raw options is array?:', Array.isArray(data.options));
  
  // Try to parse
  if (typeof data.options === 'string') {
    console.log('Parsed options:', JSON.parse(data.options));
  }
}
```

## Step 2: Check an Ordered List question

```javascript
const { data, error } = await getSupabaseClient()
  .from('assessment_questions')
  .select('*')
  .eq('question_type', 'ordered_list')
  .limit(1)
  .single();

if (error) {
  console.error('Error:', error);
} else {
  console.log('Ordered List question from DB:');
  console.log('ID:', data.id);
  console.log('List Items field:', data.list_items);
  console.log('List Items type:', typeof data.list_items);
  console.log('List Items is array?:', Array.isArray(data.list_items));
}
```

## Step 3: Delete ALL old questions and re-import

```javascript
// Delete ALL questions
const { error } = await getSupabaseClient()
  .from('assessment_questions')
  .delete()
  .neq('id', null);

console.log('Deleted all questions');
```

Then re-import your Excel file.

## Expected Results

After running these commands, you should see:
- For MCQ: `options` field contains `'["F1", "F2", "F3", "F4", "F5"]'` (JSON string)
- For Ordered List: `list_items` field contains `'["Item1", "Item2", ...]'` (JSON string)

If you see something different, reply with the exact output you see in the console.
