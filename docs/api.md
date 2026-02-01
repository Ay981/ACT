# ACT E-Learning Platform API Documentation

## Overview
The ACT E-Learning Platform provides a RESTful API for managing courses, users, quizzes, and learning content. All endpoints return JSON responses and use standard HTTP status codes.

---

## Base URL
- **Production:** `https://act-elearning.aymenab.com/api`
- **Local Development:** `http://localhost:8000/api`

---

## Authentication
The API uses Laravel Sanctum for token-based authentication. Include the token in the Authorization header:

```http
Authorization: Bearer {your_sanctum_token}
```

### Authentication Flow
1. **Register:** `POST /register` → Receive OTP via email
2. **Verify OTP:** `POST /verify-otp` → Receive authentication token
3. **Login:** `POST /login` → Receive authentication token
4. **Access Protected Routes:** Include Bearer token in headers

---

## Core Endpoints

### User
- `POST /register` — Register a new user
- `POST /login` — Login and receive token
- `POST /verify-otp` — Verify OTP for registration
- `GET /user` — Get authenticated user profile

### Courses
- `GET /courses` — List all courses
- `GET /courses/{id}` — Get course details
- `POST /courses` — Create a new course (Instructor/Admin)
- `PUT /courses/{id}` — Update course (Instructor/Admin)
- `DELETE /courses/{id}` — Delete course (Instructor/Admin)

### Lessons
- `GET /courses/{id}/lessons` — List lessons in a course
- `GET /lessons/{id}` — Get lesson details
- `POST /courses/{id}/lessons` — Add lesson to course


### Quizzes
- `GET /quizzes` — List all quizzes (Instructor/Admin)
- `POST /quizzes` — Create a new quiz (Instructor/Admin)
- `GET /quizzes/{id}` — Get quiz details
- `PUT /quizzes/{id}` — Update quiz (Instructor/Admin)
- `DELETE /quizzes/{id}` — Delete quiz (Instructor/Admin)
- `POST /quiz/generate` — AI-generate quiz (Instructor/Admin)
- `POST /quizzes/{id}/attempt` — Attempt a quiz (Student)
- `GET /quizzes/{id}/attempts` — List attempts for a quiz (Instructor/Admin)
- `GET /my-attempts` — List my quiz attempts (Student)

### Admin Endpoints
- `GET /admin/dashboard` — Admin dashboard stats
- `GET /admin/reports` — List user/content reports
- `POST /admin/reports/{id}/action` — Take action on a report
- `GET /admin/instructors` — List instructors
- `DELETE /admin/instructors/{id}` — Remove instructor
- `POST /admin/instructors/{id}/approve` — Approve instructor
- `GET /admin/maintenance` — Get maintenance mode status
- `POST /admin/maintenance` — Toggle maintenance mode
- `POST /admin/broadcast` — Broadcast message to users

### Comments
- `GET /courses/{id}/comments` — List comments
- `POST /courses/{id}/comments` — Add comment

---

## Error Handling
All errors return a JSON response with an `error` message and appropriate HTTP status code.

---

## More
For a full list of endpoints and request/response examples, see the [Developer Guide](developer-guide.md) or inspect the API routes in `act-backend/routes/api.php`.
