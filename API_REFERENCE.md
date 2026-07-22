# BECA Assessment Platform - API Reference

## Overview

This document describes all API endpoints available in the BECA Assessment Platform. The API uses Supabase REST API for database operations.

### Base URL
```
https://your-project.supabase.co/rest/v1
```

### Authentication
All requests require an Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
apikey: YOUR_ANON_KEY
Content-Type: application/json
```

### Response Format
All responses return JSON:
```json
{
  "data": {...},
  "error": null,
  "status": 200
}
```

---

## Authentication Endpoints

### Sign In
**POST** `/auth/v1/token?grant_type=password`

Sign in with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "...",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

### Get Current User
**GET** `/auth/v1/user`

Get the currently logged-in user's information.

**Headers:**
```
Authorization: Bearer ACCESS_TOKEN
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "user_metadata": {
    "full_name": "John Doe",
    "role": "trainer"
  }
}
```

---

## Assessment Endpoints

### List Assessments
**GET** `/assessments`

Retrieve all assessments.

**Query Parameters:**
- `status=eq.published` - Filter by status
- `created_by=eq.{user_id}` - Filter by creator
- `limit=20` - Limit results
- `offset=0` - Pagination offset

**Example:**
```
GET /assessments?status=eq.published&limit=10
```

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "JavaScript Basics",
    "description": "Learn JavaScript fundamentals",
    "duration": 60,
    "passing_score": 70,
    "status": "published",
    "created_by": "uuid",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Get Assessment
**GET** `/assessments?id=eq.{assessment_id}`

Get a specific assessment with all details.

**Example:**
```
GET /assessments?id=eq.abc123
```

**Response:**
```json
[
  {
    "id": "abc123",
    "title": "JavaScript Basics",
    "description": "Learn JavaScript fundamentals",
    "duration": 60,
    "passing_score": 70,
    "status": "published",
    "created_by": "uuid",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Create Assessment
**POST** `/assessments`

Create a new assessment.

**Request:**
```json
{
  "title": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals",
  "duration": 60,
  "passing_score": 70,
  "status": "draft",
  "created_by": "uuid"
}
```

**Response:**
```json
{
  "id": "new-uuid",
  "title": "JavaScript Basics",
  "description": "Learn JavaScript fundamentals",
  "duration": 60,
  "passing_score": 70,
  "status": "draft",
  "created_by": "uuid",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Update Assessment
**PATCH** `/assessments?id=eq.{assessment_id}`

Update an assessment.

**Request:**
```json
{
  "title": "JavaScript Advanced",
  "status": "published"
}
```

**Response:**
```json
[
  {
    "id": "abc123",
    "title": "JavaScript Advanced",
    "status": "published"
  }
]
```

### Delete Assessment
**DELETE** `/assessments?id=eq.{assessment_id}`

Delete an assessment (also deletes all related data).

**Example:**
```
DELETE /assessments?id=eq.abc123
```

**Response:**
```json
[]
```

---

## Assessment Module Endpoints

### List Modules
**GET** `/assessment_modules?assessment_id=eq.{assessment_id}`

Get all modules for an assessment.

**Example:**
```
GET /assessment_modules?assessment_id=eq.abc123&order=sequence.asc
```

**Response:**
```json
[
  {
    "id": "module-uuid",
    "assessment_id": "abc123",
    "name": "Variables",
    "description": "Learn about variables",
    "sequence": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Create Module
**POST** `/assessment_modules`

Create a new module.

**Request:**
```json
{
  "assessment_id": "abc123",
  "name": "Variables",
  "description": "Learn about variables",
  "sequence": 1
}
```

**Response:**
```json
{
  "id": "module-uuid",
  "assessment_id": "abc123",
  "name": "Variables",
  "description": "Learn about variables",
  "sequence": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Update Module
**PATCH** `/assessment_modules?id=eq.{module_id}`

Update module details.

**Request:**
```json
{
  "name": "Variables and Types",
  "description": "Learn about variables and data types"
}
```

**Response:**
```json
[
  {
    "id": "module-uuid",
    "name": "Variables and Types",
    "description": "Learn about variables and data types"
  }
]
```

### Delete Module
**DELETE** `/assessment_modules?id=eq.{module_id}`

Delete a module (also deletes all questions in it).

**Example:**
```
DELETE /assessment_modules?id=eq.module-uuid
```

---

## Question Endpoints

### List Questions
**GET** `/assessment_questions?module_id=eq.{module_id}`

Get all questions in a module.

**Example:**
```
GET /assessment_questions?module_id=eq.mod123&order=sequence.asc
```

**Response:**
```json
[
  {
    "id": "question-uuid",
    "module_id": "mod123",
    "question_text": "What is a variable?",
    "question_type": "essay",
    "points": 10,
    "options": null,
    "allowed_file_types": null,
    "sequence": 1,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### Create Question
**POST** `/assessment_questions`

Create a new question.

**Request (MCQ):**
```json
{
  "module_id": "mod123",
  "question_text": "Which is NOT a primitive type?",
  "question_type": "mcq",
  "points": 10,
  "options": [
    {"text": "String", "correct": false},
    {"text": "Number", "correct": false},
    {"text": "Object", "correct": true},
    {"text": "Boolean", "correct": false}
  ],
  "sequence": 1
}
```

**Request (Essay):**
```json
{
  "module_id": "mod123",
  "question_text": "Explain closures in JavaScript",
  "question_type": "essay",
  "points": 20,
  "sequence": 2
}
```

**Request (File Upload):**
```json
{
  "module_id": "mod123",
  "question_text": "Upload your project file",
  "question_type": "fileupload",
  "points": 30,
  "allowed_file_types": ["pdf", "doc", "zip"],
  "sequence": 3
}
```

**Response:**
```json
{
  "id": "question-uuid",
  "module_id": "mod123",
  "question_text": "Which is NOT a primitive type?",
  "question_type": "mcq",
  "points": 10,
  "options": [...],
  "sequence": 1,
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Update Question
**PATCH** `/assessment_questions?id=eq.{question_id}`

Update a question.

**Request:**
```json
{
  "question_text": "Updated question text",
  "points": 15
}
```

### Delete Question
**DELETE** `/assessment_questions?id=eq.{question_id}`

Delete a question.

---

## Assessment Result Endpoints

### List Results
**GET** `/assessment_results`

Get assessment results.

**Query Parameters:**
- `assessment_id=eq.{id}` - Filter by assessment
- `user_id=eq.{id}` - Filter by user
- `order=submitted_at.desc` - Sort by date

**Example:**
```
GET /assessment_results?assessment_id=eq.abc123&order=submitted_at.desc
```

**Response:**
```json
[
  {
    "id": "result-uuid",
    "assessment_id": "abc123",
    "user_id": "user-uuid",
    "total_score": 85.5,
    "passed": true,
    "submitted_at": "2024-01-15T14:30:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T14:30:00Z"
  }
]
```

### Create Result
**POST** `/assessment_results`

Create a new result (usually done when assessment is submitted).

**Request:**
```json
{
  "assessment_id": "abc123",
  "user_id": "user-uuid",
  "total_score": 85.5,
  "passed": true,
  "submitted_at": "2024-01-15T14:30:00Z"
}
```

### Update Result
**PATCH** `/assessment_results?id=eq.{result_id}`

Update result score or passed status.

**Request:**
```json
{
  "total_score": 90,
  "passed": true,
  "submitted_at": "2024-01-15T14:30:00Z"
}
```

---

## Assignment Endpoints

### List Assignments
**GET** `/assessment_assignments`

Get all assignments.

**Query Parameters:**
- `trainee_id=eq.{id}` - Filter by trainee
- `assessment_id=eq.{id}` - Filter by assessment
- `status=eq.assigned` - Filter by status

**Example:**
```
GET /assessment_assignments?trainee_id=eq.user123&order=assigned_at.desc
```

**Response:**
```json
[
  {
    "id": "assignment-uuid",
    "assessment_id": "abc123",
    "trainee_id": "user-uuid",
    "assigned_by": "trainer-uuid",
    "status": "assigned",
    "include_datasets": true,
    "due_date": "2024-01-31T23:59:59Z",
    "assigned_at": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Create Assignment
**POST** `/assessment_assignments`

Assign an assessment to a trainee.

**Request:**
```json
{
  "assessment_id": "abc123",
  "trainee_id": "user-uuid",
  "assigned_by": "trainer-uuid",
  "status": "assigned",
  "include_datasets": true,
  "due_date": "2024-01-31T23:59:59Z"
}
```

**Response:**
```json
{
  "id": "assignment-uuid",
  "assessment_id": "abc123",
  "trainee_id": "user-uuid",
  "assigned_by": "trainer-uuid",
  "status": "assigned",
  "include_datasets": true,
  "due_date": "2024-01-31T23:59:59Z",
  "assigned_at": "2024-01-15T10:30:00Z"
}
```

### Update Assignment
**PATCH** `/assessment_assignments?id=eq.{assignment_id}`

Update assignment status or dates.

**Request:**
```json
{
  "status": "in_progress",
  "started_at": "2024-01-16T09:00:00Z"
}
```

### Bulk Assignment
**POST** `/assessment_assignments` (multiple times)

Send an assessment to multiple trainees:

```javascript
const trainees = ['user1', 'user2', 'user3'];
for (const traineeId of trainees) {
  await apiCall('POST', 'assessment_assignments', {
    assessment_id: assessmentId,
    trainee_id: traineeId,
    assigned_by: currentUserId
  });
}
```

---

## Submission Endpoints

### Create Submission
**POST** `/assessment_submissions`

Submit an answer to a question.

**Request (MCQ):**
```json
{
  "assessment_id": "abc123",
  "user_id": "user-uuid",
  "question_id": "q1",
  "answer_text": "A",
  "submitted_at": "2024-01-16T10:30:00Z"
}
```

**Request (Essay):**
```json
{
  "assessment_id": "abc123",
  "user_id": "user-uuid",
  "question_id": "q2",
  "answer_text": "A closure is a function that has access to...",
  "submitted_at": "2024-01-16T10:30:00Z"
}
```

**Request (File Upload):**
```json
{
  "assessment_id": "abc123",
  "user_id": "user-uuid",
  "question_id": "q3",
  "file_url": "https://storage.supabase.co/.../file.pdf",
  "file_name": "project.pdf",
  "submitted_at": "2024-01-16T10:30:00Z"
}
```

### Get Submissions
**GET** `/assessment_submissions?user_id=eq.{user_id}&assessment_id=eq.{assessment_id}`

Get all submissions by a user for an assessment.

**Response:**
```json
[
  {
    "id": "submission-uuid",
    "assessment_id": "abc123",
    "user_id": "user-uuid",
    "question_id": "q1",
    "answer_text": "A",
    "is_correct": true,
    "points_earned": 10,
    "submitted_at": "2024-01-16T10:30:00Z"
  }
]
```

---

## Profile Endpoints

### List Profiles
**GET** `/profiles`

Get all user profiles.

**Query Parameters:**
- `user_role=eq.trainer` - Filter by role
- `limit=50` - Limit results

**Response:**
```json
[
  {
    "id": "user-uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "user_role": "trainer",
    "avatar_url": "https://...",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### Get Profile
**GET** `/profiles?id=eq.{user_id}`

Get a specific user profile.

### Update Profile
**PATCH** `/profiles?id=eq.{user_id}`

Update user profile.

**Request:**
```json
{
  "full_name": "John Doe",
  "user_role": "trainer",
  "avatar_url": "https://..."
}
```

---

## File Upload Endpoints

### Upload File
**POST** `/storage/v1/object/assessment-files/{path}`

Upload a file to storage.

**Headers:**
```
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/octet-stream
```

**Example:**
```
POST /storage/v1/object/assessment-files/questions/question1/document.pdf
```

### Download File
**GET** `/storage/v1/object/public/assessment-files/{path}`

Download a file from storage.

### Delete File
**DELETE** `/storage/v1/object/assessment-files/{path}`

Delete a file from storage.

---

## Filtering & Sorting

### Filter Operators
```
eq.value       - Equals
neq.value      - Not equals
gt.value       - Greater than
gte.value      - Greater than or equal
lt.value       - Less than
lte.value      - Less than or equal
like.pattern   - Pattern match
in.(1,2,3)     - In list
is.null        - Is NULL
```

### Examples
```
GET /assessments?status=eq.published
GET /assessments?duration=gt.30
GET /assessments?title=like.%JavaScript%
GET /assessments?created_by=eq.uuid&status=eq.published
```

### Sorting
```
?order=created_at.asc
?order=created_at.desc
?order=title.asc,created_at.desc
```

---

## Error Handling

### Error Response Format
```json
{
  "code": "PGRST001",
  "details": null,
  "hint": null,
  "message": "Row not found"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No content
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict
- `500` - Server error

### JavaScript Example
```javascript
async function apiCall(method, table, data = null, filter = null) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API Error');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

---

## Rate Limiting

Supabase has built-in rate limiting:
- 5,000 API calls per minute per project
- Exceeding limit returns HTTP 429

### Best Practices
- Cache frequently accessed data
- Use pagination for large datasets
- Batch operations when possible
- Implement client-side caching

---

## Pagination

### Example
```
GET /assessments?limit=20&offset=0    // First page
GET /assessments?limit=20&offset=20   // Second page
GET /assessments?limit=20&offset=40   // Third page
```

### Implementation
```javascript
let offset = 0;
const limit = 20;

async function getNextPage() {
  const data = await apiCall('GET', 'assessments', null, `?limit=${limit}&offset=${offset}`);
  offset += limit;
  return data;
}
```

---

## Batch Operations

### Create Multiple
```javascript
const assessments = [
  { title: "Test 1", ... },
  { title: "Test 2", ... }
];

for (const assessment of assessments) {
  await apiCall('POST', 'assessments', assessment);
}
```

### Update Multiple
```javascript
const updates = [
  { id: 'id1', status: 'published' },
  { id: 'id2', status: 'published' }
];

for (const update of updates) {
  await apiCall('PATCH', 'assessments', update, `?id=eq.${update.id}`);
}
```

---

## Best Practices

1. **Always use transactions for related updates**
2. **Validate input before sending**
3. **Use proper error handling**
4. **Cache responses when appropriate**
5. **Implement retry logic for failed requests**
6. **Use pagination for large datasets**
7. **Filter at the database level**
8. **Close connections properly**

---

## Testing

### Test with curl
```bash
# Get assessments
curl -H "apikey: YOUR_KEY" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-project.supabase.co/rest/v1/assessments

# Create assessment
curl -X POST \
     -H "apikey: YOUR_KEY" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test"}' \
     https://your-project.supabase.co/rest/v1/assessments
```

### Test in Supabase Dashboard
1. Go to SQL Editor
2. Test queries directly
3. View results in real-time

---

## Rate Limit Headers

Responses include headers:
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1234567890
```

---

## Support

For API issues:
- Check Supabase status: https://status.supabase.com
- Review logs in Supabase dashboard
- Check browser network tab
- Enable verbose logging

---

This API reference covers all endpoints available in the BECA Assessment Platform.
