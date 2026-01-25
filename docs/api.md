# ACT E-Learning Platform API Documentation

## Overview
The ACT E-Learning Platform provides a RESTful API for managing courses, users, and learning content. All endpoints return JSON responses and use standard HTTP status codes.

### Base URL
- **Production**: `https://api.aymenab.com`
- **Local Development**: `http://localhost:8000`

### Authentication
The API uses Laravel Sanctum for token-based authentication. Include the token in the Authorization header:
```
Authorization: Bearer {your_sanctum_token}
```

#### Authentication Flow
1. **Register**: `POST /register` → Receive OTP via email
2. **Verify OTP**: `POST /verify-otp` → Receive authentication token
3. **Access Protected Routes**: Include Bearer token in headers

### Response Format
All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data varies by endpoint
  },
  "message": "Operation completed successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": ["Validation error messages"]
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/register`

Creates a new user account and sends OTP verification email.

**Required Role:** Public

**Rate Limiting:** 5 requests per minute per IP

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "student"
}
```

**Validation Rules:**
- `name`: required, string, max:255
- `email`: required, email, unique:users
- `password`: required, min:8, confirmed
- `role`: optional, in:student,instructor

**Response (201):**
```json
{
  "success": true,
  "status": "otp_sent",
  "message": "Please check your email for the verification code",
  "email": "john@example.com",
  "otp": "123456" // Development only
}
```

**Error Responses:**
- `422`: Validation errors
- `409`: Email already exists
- `429`: Rate limit exceeded

### Verify OTP
**POST** `/verify-otp`

Verifies email OTP and issues authentication token.

**Required Role:** Public

**Rate Limiting:** 10 attempts per OTP per email

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Validation Rules:**
- `email`: required, email
- `otp`: required, string, size:6

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "1|abc123def456...",
  "token_type": "Bearer",
  "expires_in": 525600, // seconds (7 days)
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "email_verified_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Error Responses:**
- `422`: Invalid OTP or email
- `404`: User not found
- `401`: OTP expired
- `429`: Too many attempts

### Login
**POST** `/login`

Authenticates user with email and password.

**Required Role:** Public

**Rate Limiting:** 5 attempts per minute per IP

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "1|abc123def456...",
  "token_type": "Bearer",
  "expires_in": 525600,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "last_login_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

**Error Responses:**
- `401`: Invalid credentials
- `403`: Account not verified
- `429`: Too many login attempts

### Logout
**POST** `/logout`

Revokes current authentication token and all user tokens.

**Required Role:** Any authenticated user

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Token
**POST** `/api/token/refresh`

Issues new authentication token.

**Required Role:** Any authenticated user

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "token": "2|xyz789uvw012...",
  "token_type": "Bearer",
  "expires_in": 525600
}
```

### Get Current User
**GET** `/api/user`

Returns current authenticated user details.

**Required Role:** Any authenticated user

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "email_verified_at": "2024-01-01T00:00:00.000000Z",
    "last_login_at": "2024-01-01T00:00:00.000000Z",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Update Profile
**PUT** `/api/user/profile`

Updates user profile information.

**Required Role:** Any authenticated user

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Validation Rules:**
- `name`: required, string, max:255
- `email`: required, email, unique:users (except current user)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john.updated@example.com",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Change Password
**PUT** `/api/user/password`

Changes user password.

**Required Role:** Any authenticated user

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "current_password": "oldpassword123",
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Validation Rules:**
- `current_password`: required, string
- `password`: required, min:8, confirmed
- `password_confirmation`: required

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `422`: Validation errors
- `401`: Current password incorrect

---

## 📚 Courses Endpoints

### List All Courses (Public)
**GET** `/api/courses`

Returns a paginated list of all published courses.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `per_page` (integer, optional): Items per page (default: 15)
- `search` (string, optional): Search in title and description
- `category` (string, optional): Filter by category
- `level` (string, optional): Filter by level ("Beginner", "Intermediate", "Advanced")

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "title": "Introduction to React",
        "description": "Learn React from scratch",
        "category": "Programming",
        "level": "Beginner",
        "price": 49.99,
        "thumbnail": "/storage/thumbnails/react-course.jpg",
        "instructor": {
          "id": 2,
          "name": "Jane Smith"
        },
        "lessons_count": 12,
        "students_count": 150,
        "rating": 4.5,
        "created_at": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 25
  }
}
```

### Get Course Details
**GET** `/api/courses/{id}`

Returns detailed information about a specific course.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Introduction to React",
    "description": "Learn React from scratch",
    "category": "Programming",
    "level": "Beginner",
    "price": 49.99,
    "thumbnail": "/storage/thumbnails/react-course.jpg",
    "instructor": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "lessons": [
      {
        "id": 1,
        "title": "Getting Started",
        "description": "Introduction to React",
        "order": 1,
        "youtube_url": "https://youtube.com/watch?v=example",
        "resource_url": "https://drive.google.com/file/d/example"
      }
    ],
    "is_enrolled": false,
    "students_count": 150,
    "rating": 4.5,
    "created_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Create Course (Instructor)
**POST** `/api/instructor/courses`

Creates a new course (instructor only).

**Headers:** `Authorization: Bearer {token}`

**Request Body (multipart/form-data):**
```
title: "Course Title"
description: "Course description"
category: "Programming"
level: "Beginner"
price: 49.99
thumbnail: [file] // Image file
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Course Title",
    "description": "Course description",
    "category": "Programming",
    "level": "Beginner",
    "price": 49.99,
    "thumbnail": "/storage/thumbnails/course.jpg",
    "instructor_id": 2,
    "created_at": "2024-01-01T00:00:00.000000Z"
  },
  "message": "Course created successfully"
}
```

### Update Course (Instructor)
**PUT** `/api/instructor/courses/{id}`

Updates an existing course (instructor only).

**Headers:** `Authorization: Bearer {token}`

**Request Body (multipart/form-data):**
```
title: "Updated Course Title"
description: "Updated description"
category: "Programming"
level: "Intermediate"
price: 69.99
thumbnail: [file] // Optional new image
```

### Delete Course (Instructor)
**DELETE** `/api/instructor/courses/{id}`

Deletes a course (instructor only).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

---

## 📖 Lessons Endpoints

### Add Lesson to Course (Instructor)
**POST** `/api/instructor/courses/{courseId}/lessons`

Adds a new lesson to a course (instructor only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Lesson Title",
  "description": "Lesson description",
  "youtube_url": "https://youtube.com/watch?v=example",
  "resource_url": "https://drive.google.com/file/d/example"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "course_id": 1,
    "title": "Lesson Title",
    "description": "Lesson description",
    "youtube_url": "https://youtube.com/watch?v=example",
    "resource_url": "https://drive.google.com/file/d/example",
    "order": 1,
    "created_at": "2024-01-01T00:00:00.000000Z"
  },
  "message": "Lesson added successfully"
}
```

### Update Lesson (Instructor)
**PUT** `/api/instructor/courses/{courseId}/lessons/{lessonId}`

Updates an existing lesson (instructor only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "title": "Updated Lesson Title",
  "description": "Updated description",
  "youtube_url": "https://youtube.com/watch?v=updated",
  "resource_url": "https://drive.google.com/file/d/updated"
}
```

### Delete Lesson (Instructor)
**DELETE** `/api/instructor/courses/{courseId}/lessons/{lessonId}`

Deletes a lesson (instructor only).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

---

## 🎓 Enrollment Endpoints

### Enroll in Course
**POST** `/api/courses/{courseId}/enroll`

Enrolls the current user in a course.

**Required Role:** Student

**Headers:** `Authorization: Bearer {token}`

**Rate Limiting:** 10 enrollments per hour per user

**Response (201):**
```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment_id": 123,
    "course_id": 1,
    "user_id": 1,
    "enrolled_at": "2024-01-01T00:00:00.000000Z",
    "progress": 0,
    "completed_lessons": 0,
    "total_lessons": 12
  }
}
```

**Error Responses:**
- `409`: Already enrolled
- `403`: Course not available
- `402`: Payment required (for paid courses)
- `429`: Rate limit exceeded

### Unenroll from Course
**DELETE** `/api/courses/{courseId}/enroll`

Removes user from course enrollment.

**Required Role:** Student

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "message": "Successfully unenrolled from course"
}
```

### Get Enrollment Status
**GET** `/api/courses/{courseId}/enrollment`

Returns user's enrollment status and progress.

**Required Role:** Student

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "is_enrolled": true,
    "enrolled_at": "2024-01-01T00:00:00.000000Z",
    "progress": 65.5,
    "completed_lessons": 8,
    "total_lessons": 12,
    "time_spent": 7200,
    "last_accessed_at": "2024-01-01T00:00:00.000000Z",
    "certificate_issued": false
  }
}
```

### Mark Lesson Complete
**POST** `/api/courses/{courseId}/lessons/{lessonId}/complete`

Marks a lesson as completed for the current user.

**Required Role:** Student (must be enrolled)

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "completion_time": 1200 // Optional: Time spent in seconds
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Lesson marked as complete",
  "data": {
    "lesson_id": 1,
    "completed_at": "2024-01-01T00:00:00.000000Z",
    "completion_time": 1200,
    "course_progress": 70.8,
    "next_lesson_id": 2
  }
}
```

### Get Course Progress
**GET** `/api/courses/{courseId}/progress`

Returns detailed progress for all lessons in a course.

**Required Role:** Student (must be enrolled)

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "course_id": 1,
    "overall_progress": 65.5,
    "completed_lessons": 8,
    "total_lessons": 12,
    "time_spent": 7200,
    "last_accessed_at": "2024-01-01T00:00:00.000000Z",
    "lessons": [
      {
        "id": 1,
        "title": "Getting Started",
        "is_completed": true,
        "completed_at": "2024-01-01T00:00:00.000000Z",
        "time_spent": 600
      },
      {
        "id": 2,
        "title": "Basic Concepts",
        "is_completed": false,
        "time_spent": 0
      }
    ]
  }
}
```

### Get Enrolled Courses
**GET** `/api/student/enrolled-courses`

Returns courses the current user is enrolled in with progress.

**Required Role:** Student

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `status` (string): Filter by completion status (in_progress, completed)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Introduction to React",
      "description": "Learn React from scratch",
      "thumbnail": "/storage/thumbnails/react-course.jpg",
      "instructor": {
        "name": "Jane Smith"
      },
      "progress": 65,
      "completed_lessons": 8,
      "total_lessons": 12,
      "time_spent": 7200,
      "enrolled_at": "2024-01-01T00:00:00.000000Z",
      "last_accessed_at": "2024-01-01T00:00:00.000000Z",
      "certificate_available": false
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 5
  }
}
```

### Issue Certificate
**POST** `/api/courses/{courseId}/certificate`

Issues completion certificate for course.

**Required Role:** Student (must have 100% progress)

**Headers:** `Authorization: Bearer {token}`

**Response (201):**
```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "data": {
    "certificate_id": 123,
    "certificate_url": "/storage/certificates/cert_123.pdf",
    "issued_at": "2024-01-01T00:00:00.000000Z",
    "verification_code": "CERT-ABC123XYZ"
  }
}
```

**Error Responses:**
- `403`: Course not completed
- `409`: Certificate already issued

### Get Certificate
**GET** `/api/certificates/{certificateId}`

Retrieves certificate details and verification.

**Required Role:** Public (with verification code) or Certificate Owner

**Query Parameters:**
- `verification_code` (string): Optional verification code for public access

**Response (200):**
```json
{
  "success": true,
  "data": {
    "certificate_id": 123,
    "student": {
      "name": "John Doe"
    },
    "course": {
      "title": "Introduction to React",
      "instructor": "Jane Smith"
    },
    "issued_at": "2024-01-01T00:00:00.000000Z",
    "verification_code": "CERT-ABC123XYZ",
    "certificate_url": "/storage/certificates/cert_123.pdf"
  }
}
```

---

## 💬 Comments Endpoints

### Get Course Comments
**GET** `/api/courses/{courseId}/comments`

Returns comments for a specific course.

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)

**Response:**
```json
{
  "success": true,
  "data": {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "content": "Great course!",
        "user": {
          "name": "John Doe",
          "avatar": null
        },
        "created_at": "2024-01-01T00:00:00.000000Z"
      }
    ],
    "per_page": 15,
    "total": 10
  }
}
```

### Add Comment
**POST** `/api/courses/{courseId}/comments`

Adds a comment to a course.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "This is a comment"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "This is a comment",
    "course_id": 1,
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00.000000Z"
  },
  "message": "Comment added successfully"
}
```

### Update Comment
**PUT** `/api/comments/{commentId}`

Updates a comment (author only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

### Delete Comment
**DELETE** `/api/comments/{commentId}`

Deletes a comment (author or course instructor).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## 🧮 Quiz Endpoints

### Generate Quiz with AI
**POST** `/api/quiz/generate`

Generates quiz questions using AI.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "topic": "React Hooks",
  "difficulty": "intermediate",
  "count": 5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "questions": [
      {
        "question": "What is useState used for?",
        "options": [
          "State management",
          "Routing",
          "Styling",
          "API calls"
        ],
        "correct_answer": 0
      }
    ]
  },
  "message": "Quiz generated successfully"
}
```

### Create Quiz
**POST** `/api/quizzes`

Creates a new quiz for a course.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "course_id": 1,
  "title": "React Basics Quiz",
  "questions": [
    {
      "question": "What is React?",
      "options": ["Library", "Framework", "Language", "Database"],
      "correct_answer": 0
    }
  ]
}
```

### Get Quiz
**GET** `/api/quizzes/{quizId}`

Returns quiz details.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "React Basics Quiz",
    "course_id": 1,
    "questions": [
      {
        "id": 1,
        "question": "What is React?",
        "options": ["Library", "Framework", "Language", "Database"]
      }
    ]
  }
}
```

### Submit Quiz Attempt
**POST** `/api/quizzes/{quizId}/attempt`

Submits answers for a quiz.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "answers": [0, 2, 1, 3, 0]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "score": 80,
    "total_questions": 5,
    "correct_answers": 4,
    "percentage": 80
  },
  "message": "Quiz submitted successfully"
}
```

---

## 👥 User Management Endpoints (Admin)

### Get All Users
**GET** `/api/admin/users`

Returns all users (admin only).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "email_verified_at": "2024-01-01T00:00:00.000000Z",
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ]
}
```

### Update User Role
**PUT** `/api/admin/users/{userId}/role`

Updates a user's role (admin only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "role": "instructor"
}
```

### Delete User
**DELETE** `/api/admin/users/{userId}`

Deletes a user (admin only).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 📊 Analytics Endpoints

### Get Dashboard Stats
**GET** `/api/admin/dashboard`

Returns platform statistics (admin only).

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "total_users": 1250,
    "total_courses": 45,
    "total_enrollments": 3200,
    "revenue": 15600.50,
    "recent_registrations": 25,
    "popular_courses": [
      {
        "id": 1,
        "title": "Introduction to React",
        "enrollments": 150
      }
    ]
  }
}
```

---

## 🔧 File Upload Endpoints

### Upload Thumbnail
**POST** `/api/upload/thumbnail`

Uploads course thumbnail image with validation and security checks.

**Required Role:** Instructor, Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body (multipart/form-data):**
```
file: [image file]
```

**File Validation Rules:**
- **Allowed types**: jpg, jpeg, png, webp
- **Max size**: 2MB (2,097,152 bytes)
- **Min dimensions**: 400x300px
- **Max dimensions**: 1920x1080px
- **Content validation**: MIME type verification, image header check

**Security Measures:**
- **Virus scanning** on upload
- **EXIF data stripping** for privacy
- **Filename sanitization** to prevent path traversal
- **Rate limiting**: 10 uploads per minute per user

**Response (201):**
```json
{
  "success": true,
  "data": {
    "url": "/storage/thumbnails/course_123_abc123.jpg",
    "filename": "course_123_abc123.jpg",
    "size": 1024000,
    "mime_type": "image/jpeg",
    "dimensions": {
      "width": 800,
      "height": 600
    }
  },
  "message": "Thumbnail uploaded successfully"
}
```

**Error Responses:**
- `422`: Invalid file type, size exceeded, dimensions invalid
- `413`: File too large
- `415`: Unsupported media type
- `429`: Rate limit exceeded

### Delete File
**DELETE** `/api/upload/files/{filename}`

Deletes uploaded file (thumbnail or resource).

**Required Role:** File owner, Admin

**Headers:** `Authorization: Bearer {token}`

**Security Validation:**
- **Ownership check**: Verify user owns the file
- **Usage check**: Ensure file is not in use by active courses
- **Path validation**: Prevent directory traversal attacks

**Response (200):**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

**Error Responses:**
- `404`: File not found
- `403`: No permission to delete file
- `409`: File is in use by active course

---

## 🛡️ Content Moderation Endpoints

### Moderate Comment
**PUT** `/api/comments/{commentId}/moderate`

Moderates comment content (admin/instructor only).

**Required Role:** Admin, Course Instructor

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "action": "approve|reject|flag",
  "reason": "Spam content detected", // Optional for reject/flag
  "notify_user": true // Optional: notify comment author
}
```

**Moderation Actions:**
- **approve**: Approve comment for public display
- **reject**: Remove comment from public view
- **flag**: Mark for review but keep visible

**Response (200):**
```json
{
  "success": true,
  "message": "Comment moderated successfully",
  "data": {
    "comment_id": 123,
    "status": "approved",
    "moderated_at": "2024-01-01T00:00:00.000000Z",
    "moderated_by": {
      "id": 2,
      "name": "Admin User"
    }
  }
}
```

### Get Moderation Queue
**GET** `/api/admin/moderation/queue`

Returns comments pending moderation.

**Required Role:** Admin

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `status` (string): Filter by status (pending, approved, rejected, flagged)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "content": "This comment needs review",
      "user": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "course": {
        "title": "Introduction to React"
      },
      "status": "pending",
      "spam_score": 0.75,
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 25
  }
}
```

---

## 🔧 System Management Endpoints (Admin)

### System Health Check
**GET** `/api/admin/health`

Comprehensive system health monitoring.

**Required Role:** Admin

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000000Z",
    "services": {
      "database": {
        "status": "healthy",
        "connections": 15,
        "slow_queries": 2,
        "response_time": 45
      },
      "queue": {
        "status": "healthy",
        "pending_jobs": 5,
        "failed_jobs": 0,
        "throughput": 120
      },
      "storage": {
        "status": "healthy",
        "disk_usage": "45.2GB / 100GB",
        "available_space": "54.8GB"
      },
      "cache": {
        "status": "healthy",
        "hit_rate": 94.5,
        "memory_usage": "256MB / 512MB"
      }
    },
    "metrics": {
      "active_users": 1250,
      "requests_per_minute": 450,
      "average_response_time": 120,
      "error_rate": 0.02
    }
  }
}
```

### Maintenance Mode Control
**POST** `/api/admin/maintenance`

Controls system maintenance mode.

**Required Role:** Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "enabled": true,
  "message": "System undergoing maintenance. We'll be back shortly.",
  "allowed_ips": ["192.168.1.100", "10.0.0.50"], // Optional: IPs that can access
  "retry_after": 3600 // Optional: Seconds until retry
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Maintenance mode updated",
  "data": {
    "maintenance_enabled": true,
    "message": "System undergoing maintenance. We'll be back shortly.",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  }
}
```

### Audit Logs
**GET** `/api/admin/audit-logs`

Retrieves system audit logs for security monitoring.

**Required Role:** Admin

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `action` (string): Filter by action type
- `user_id` (integer): Filter by user
- `date_from` (string): Start date (Y-m-d)
- `date_to` (string): End date (Y-m-d)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "user": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "action": "course_created",
      "resource_type": "course",
      "resource_id": 456,
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0...",
      "changes": {
        "before": null,
        "after": {
          "title": "New Course",
          "status": "draft"
        }
      },
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 50,
    "total": 1250
  }
}
```

---

## 📊 Analytics & Reporting Endpoints

### Platform Analytics
**GET** `/api/admin/analytics/platform`

Comprehensive platform analytics and metrics.

**Required Role:** Admin

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `period` (string): Time period (7d, 30d, 90d, 1y)
- `metrics` (array): Specific metrics to return

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_users": 5250,
      "total_courses": 125,
      "total_enrollments": 15420,
      "revenue": 125750.50,
      "completion_rate": 68.5
    },
    "growth": {
      "new_users": {
        "this_period": 450,
        "previous_period": 380,
        "growth_rate": 18.4
      },
      "new_enrollments": {
        "this_period": 1250,
        "previous_period": 980,
        "growth_rate": 27.6
      }
    },
    "engagement": {
      "average_session_duration": 1800,
      "courses_per_user": 2.9,
      "lessons_completion_rate": 72.3,
      "comment_engagement_rate": 15.6
    }
  }
}
```

### Course Analytics
**GET** `/api/instructor/courses/{courseId}/analytics`

Detailed analytics for specific course.

**Required Role:** Course Instructor, Admin

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "enrollment_stats": {
      "total_enrolled": 150,
      "active_students": 125,
      "completion_rate": 68.0,
      "dropoff_rate": 32.0
    },
    "engagement_metrics": {
      "average_completion_time": 7200,
      "lesson_completion_rates": [95, 88, 76, 65, 58],
      "comment_participation": 45.2,
      "quiz_average_score": 78.5
    },
    "revenue": {
      "total_revenue": 7495.00,
      "revenue_per_student": 49.97,
      "refund_rate": 2.1
    }
  }
}
```

---

## 🚨 Error Handling

### Common Error Responses

**Validation Error (422):**
```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password must be at least 8 characters."]
  }
}
```

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "Unauthenticated."
}
```

**Forbidden (403):**
```json
{
  "success": false,
  "message": "This action is unauthorized."
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Resource not found."
}
```

---

## 📝 SDK Examples

### JavaScript/Node.js

```javascript
// Registration
const register = async (userData) => {
  const response = await fetch('https://api.aymenab.com/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Authenticated request
const getCourses = async (token) => {
  const response = await fetch('https://api.aymenab.com/api/courses', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  return response.json();
};
```

### Python

```python
import requests

# Registration
def register_user(userData):
    response = requests.post(
        'https://api.aymenab.com/register',
        json=userData
    )
    return response.json()

# Authenticated request
def get_courses(token):
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    response = requests.get(
        'https://api.aymenab.com/api/courses',
        headers=headers
    )
    return response.json()
```

---

## 🔄 Rate Limiting

API endpoints are rate-limited to prevent abuse:
- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 60 requests per minute
- **File uploads**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1640995200
```

---

## 📞 Support

For API support and questions:
- **Documentation**: This guide
- **Issues**: Create GitHub issue
- **Email**: support@act-elearning.com
- **Status Page**: https://status.act-elearning.com

---

*Last updated: January 2026*
