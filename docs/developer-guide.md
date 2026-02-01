# ACT E-Learning Platform - Developer Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Tech Stack & Architecture](#tech-stack--architecture)
3. [Environment Setup](#environment-setup)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Documentation](#api-documentation)
6. [Database Overview](#database-overview)
7. [Developer Workflows](#developer-workflows)
8. [Security Considerations](#security-considerations)
9. [Deployment Overview](#deployment-overview)
10. [Troubleshooting](#troubleshooting)
11. [Future Roadmap](#future-roadmap)

---

## System Overview

The ACT E-Learning Platform is a modern, scalable learning management system built with a microservices-oriented architecture. The system follows a clean separation of concerns with a React frontend consuming a Laravel REST API.

### Architecture Components

**Frontend Layer (React)**
- Single Page Application (SPA) built with React 18 and Vite
- Hosted at [https://act-elearning.aymenab.com](https://act-elearning.aymenab.com)
- Component-based architecture with reusable UI components
- State management through React Context API
- Responsive design using TailwindCSS
- Client-side routing with React Router

**Backend Layer (Laravel API)**
- RESTful API built on Laravel 11
- Token-based authentication using Laravel Sanctum
- Role-based access control (RBAC)
- Resource controllers with standardized response format
- Queue system for background processing (email notifications)

**Data Layer**
- MySQL database with Eloquent ORM
- Optimized indexing for performance
- Foreign key constraints for data integrity
- Soft deletes for audit trail

**External Services**
- YouTube API for video content hosting
- Google Drive API for resource storage
- SMTP service for email notifications (OTP)

---

## Tech Stack & Architecture

### Frontend Stack
- **React 18** - UI framework with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API communication
- **Lucide Icons** - Icon library

### Backend Stack
- **Laravel 11** - PHP framework with modern features
- **MySQL 8.0** - Relational database
- **Laravel Sanctum** - API authentication
- **Eloquent ORM** - Database abstraction layer
- **Laravel Queues** - Background job processing
- **Laravel Mail** - Email notification system

---

## Environment Setup

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer
- Git

### Backend Setup

1. **Clone Repository**
```bash
git clone https://github.com/Ay981/ACT.git
cd ACT/act-backend
```

2. **Install Dependencies**
```bash
composer install
```

3. **Environment Configuration**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Database Setup**
```bash
mysql -u root -p
CREATE DATABASE act_elearning;
```

5. **Configure .env**
```env
APP_NAME="ACT E-Learning"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=act_elearning
DB_USERNAME=root
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls

FRONTEND_URL=http://localhost:5173
```

6. **Run Migrations**
```bash
php artisan migrate
php artisan db:seed
```

7. **Start Development Server**
```bash
php artisan serve
```

### Frontend Setup

1. **Navigate to Frontend Directory**
```bash
cd ../act-frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```env
VITE_API_BASE_URL=http://localhost:8000
```

4. **Start Development Server**
```bash
npm run dev
```

---

## Authentication & Authorization

### Authentication Flow

The platform uses a two-factor authentication system with email verification:

1. **Registration**
   - User submits registration form
   - System generates 6-digit OTP
   - OTP sent via email
   - User account created with `email_verified_at = null`

2. **Email Verification**
   - User submits OTP
   - System validates OTP
   - Account verified and Sanctum token issued
   - User redirected to dashboard

3. **Session Management**
   - Token stored in browser localStorage
   - Token included in Authorization header for API requests
   - Automatic token refresh on page reload

### Role-Based Access Control (RBAC)

**User Roles:**
- **Student**: Can browse, enroll, and participate in courses
- **Instructor**: Can create and manage courses, requires admin approval
- **Admin**: Full system access and user management

**Permission Matrix:**
```
Resource           | Student | Instructor | Admin
-------------------|---------|-----------|------
View Courses       | ✓       | ✓         | ✓
Enroll Courses     | ✓       | ✓         | ✓
Create Courses     | ✗       | ✓         | ✓
Manage Users       | ✗       | ✗         | ✓
System Analytics   | ✗       | ✗         | ✓
```

---

## API Documentation

### Base Configuration

**Base URL:** `https://api.aymenab.com`
**Development URL:** `http://localhost:8000`

### Standard Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token} // For authenticated endpoints
```

### Response Format

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

---

## Authentication Endpoints

### Register User
**POST** `/register`

Creates a new user account and sends OTP verification email.

**Required Role:** Public

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

### Verify OTP
**POST** `/verify-otp`

Verifies email OTP and issues authentication token.

**Required Role:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "token": "1|abc123def456...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Login
**POST** `/login`

Authenticates user with email and password.

**Required Role:** Public

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
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

---

## Course Management Endpoints

### List Courses
**GET** `/api/courses`

Returns paginated list of published courses.

**Required Role:** Public

**Query Parameters:**
- `page` (integer): Page number
- `per_page` (integer): Items per page
- `category` (string): Filter by category
- `level` (string): Filter by level
- `search` (string): Search in title/description

**Response (200):**
```json
{
  "success": true,
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
      "rating": 4.5
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 25
  }
}
```

### Create Course
**POST** `/api/instructor/courses`

Creates a new course.

**Required Role:** Instructor, Admin

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

**Response (201):**
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
    "instructor_id": 2
  },
  "message": "Course created successfully"
}
```

---

## Comments & Interactions Endpoints

### Get Course Comments
**GET** `/api/courses/{courseId}/comments`

Returns paginated comments for course.

**Required Role:** Public

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "Great course!",
      "user": {
        "id": 1,
        "name": "John Doe",
        "avatar": null
      },
      "likes_count": 5,
      "dislikes_count": 1,
      "user_reaction": "like",
      "created_at": "2024-01-01T00:00:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 10
  }
}
```

### Add Comment
**POST** `/api/courses/{courseId}/comments`

Adds comment to course.

**Required Role:** Student, Instructor, Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "content": "This is a comment"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "This is a comment",
    "course_id": 1,
    "user_id": 1,
    "likes_count": 0,
    "dislikes_count": 0,
    "created_at": "2024-01-01T00:00:00.000000Z"
  },
  "message": "Comment added successfully"
}
```

### React to Comment
**POST** `/api/comments/{commentId}/react`

Adds or updates user reaction to comment.

**Required Role:** Student, Instructor, Admin

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reaction": "like" // "like" or "dislike"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Reaction added successfully",
  "data": {
    "likes_count": 6,
    "dislikes_count": 1,
    "user_reaction": "like"
  }
}
```

---

## Database Overview

### Core Tables

**Users Table**
```sql
users
├── id (bigint, primary)
├── name (string)
├── email (string, unique)
├── email_verified_at (timestamp, nullable)
├── password (string)
├── role (enum: student, instructor, admin)
├── created_at (timestamp)
├── updated_at (timestamp)
└── deleted_at (timestamp, nullable)
```

**Courses Table**
```sql
courses
├── id (bigint, primary)
├── instructor_id (bigint, foreign key → users.id)
├── title (string)
├── description (text)
├── category (string)
├── level (enum: Beginner, Intermediate, Advanced)
├── price (decimal)
├── thumbnail (string, nullable)
├── created_at (timestamp)
├── updated_at (timestamp)
└── deleted_at (timestamp, nullable)
```

**Comments Table**
```sql
comments
├── id (bigint, primary)
├── course_id (bigint, foreign key → courses.id)
├── user_id (bigint, foreign key → users.id)
├── content (text)
├── likes_count (integer, default: 0)
├── dislikes_count (integer, default: 0)
├── created_at (timestamp)
├── updated_at (timestamp)
└── deleted_at (timestamp, nullable)
```

**Comment Reactions Table**
```sql
comment_reactions
├── id (bigint, primary)
├── comment_id (bigint, foreign key → comments.id)
├── user_id (bigint, foreign key → users.id)
├── reaction (enum: like, dislike)
├── created_at (timestamp)
└── unique(comment_id, user_id)
```

### Key Relationships

- **Users → Courses**: One-to-Many (instructor relationship)
- **Users → Comments**: One-to-Many
- **Courses → Comments**: One-to-Many
- **Comments → Comment Reactions**: One-to-Many

---

## Security Considerations

### Token Storage
- Store tokens in localStorage with httpOnly cookies for enhanced security
- Implement token refresh mechanism
- Clear tokens on logout
- Use HTTPS in production

### CORS Configuration
```php
// config/cors.php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_methods' => ['*'],
'allowed_origins' => ['https://act-elearning.aymenab.com'],
'allowed_headers' => ['*'],
'supports_credentials' => true
```

### Rate Limiting
```php
// app/Http/Kernel.php
'api' => [
    'throttle:60,1',
    \Illuminate\Routing\Middleware\ThrottleRequests::class,
],
```

### Input Validation
- Use Laravel's validation rules for all inputs
- Sanitize user input to prevent XSS
- Validate file uploads with proper MIME types
- Implement CSRF protection for state-changing operations

---

## Deployment Overview

### Environment Variables

**Production .env**
```env
APP_NAME="ACT E-Learning"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://act-elearning.aymenab.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_PORT=3306
DB_DATABASE=act_elearning
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls

FRONTEND_URL=https://act-elearning.aymenab.com
```

### Production Checklist
- [ ] Set `APP_ENV=production` and `APP_DEBUG=false`
- [ ] Configure HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring/logging
- [ ] Test all user flows
- [ ] Verify email delivery
- [ ] Set up domain and DNS
- [ ] Optimize database indexes
- [ ] Configure CDN for static assets

---

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure frontend URL is in `config/cors.php`
- Check that API base URL is correct in frontend `.env`
- Verify preflight requests are handled correctly

**Authentication Issues**
- Clear browser cookies for the domain
- Verify Sanctum configuration
- Check CSRF token handling
- Ensure token is properly formatted in Authorization header

**Database Connection Issues**
- Verify database credentials in `.env`
- Check database server is running
- Ensure database exists and user has permissions
- Run `php artisan config:cache` after changes

**Email Not Sending**
- Verify SMTP configuration in `.env`
- Check email provider settings
- Review Laravel logs: `php artisan log:clear`
- Test with different email provider if needed

**Performance Issues**
- Run: `php artisan config:cache`
- Run: `php artisan route:cache`
- Check database indexes
- Monitor server resources
- Enable query logging for slow queries

---

## Future Roadmap

### Phase 1: Core Enhancements
- Real-time chat system
- Advanced analytics dashboard
- Mobile app development
- Video streaming optimization
- Advanced quiz features

### Phase 2: Enterprise Features
- Multi-tenant support
- Advanced reporting
- API rate limiting per user
- Content delivery network integration
- Advanced user management

### Phase 3: AI & ML Integration
- Personalized learning paths
- AI-powered course recommendations
- Automated content moderation
- Predictive analytics
- Natural language processing

### Technical Debt
- Implement comprehensive testing suite
- Migrate to microservices architecture
- Add comprehensive API documentation
- Implement caching strategies
- Optimize database queries

---

*Last updated: January 2026*
