# ACT E-Learning Platform

A comprehensive e-learning management system built with Laravel (backend) and React (frontend). This platform supports multiple user roles including students, instructors, and administrators, with features for course creation, enrollment, quizzes, and progress tracking.

## 🚀 Features

### For Students
- **Browse & Enroll** in courses
- **Watch video lessons** and download resources
- **Take quizzes** and track progress
- **Comment & interact** with course content
- **Dashboard** for enrolled courses and progress

### For Instructors
- **Create & manage courses** with rich details
- **Upload video lessons** and PDF resources
- **Set course pricing** and manage enrollments
- **Create quizzes** for assessments
- **Track student progress** and engagement
- **AI-powered course outline generation**

### For Administrators
- **User management** (approve instructors, manage users)
- **System oversight** and analytics
- **Content moderation**
- **Broadcast messages** to users

## 🛠 Tech Stack

### Backend
- **Laravel 11** - PHP Framework
- **Sanctum** - API Authentication
- **MySQL** - Database
- **File Storage** - Local/Cloud storage for course materials

### Frontend
- **React 18** - UI Framework
- **Vite** - Build Tool
- **React Router** - Navigation
- **TailwindCSS** - Styling
- **Lucide Icons** - Icon Library

### Key Features
- **RESTful API** architecture
- **JWT/Sanctum authentication**
- **File upload handling** (videos, PDFs, images)
- **Real-time updates**
- **Responsive design**
- **CORS handling** for cross-origin requests

## 📋 Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm/yarn
- MySQL/MariaDB
- Git

## 🚀 Installation

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd ACT
```

2. **Install PHP dependencies**
```bash
cd act-backend
composer install
```

3. **Environment setup**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configure your .env file**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=act_elearning
DB_USERNAME=your_username
DB_PASSWORD=your_password

# For frontend URL
FRONTEND_URL=http://localhost:5173
```

5. **Database setup**
```bash
php artisan migrate
php artisan db:seed
```

6. **Create storage link**
```bash
php artisan storage:link
```

7. **Start the backend server**
```bash
php artisan serve
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd act-frontend
```

2. **Install Node.js dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env.local
```

4. **Configure your frontend environment**
```env
VITE_API_BASE_URL=http://localhost:8000
```

5. **Start the development server**
```bash
npm run dev
```

## 🏗️ Project Structure

```
ACT/
├── act-backend/                 # Laravel Backend
│   ├── app/
│   │   ├── Http/Controllers/    # API Controllers
│   │   ├── Models/              # Eloquent Models
│   │   └── Middleware/          # Custom Middleware
│   ├── database/
│   │   ├── migrations/          # Database Migrations
│   │   └── seeders/             # Database Seeders
│   ├── routes/                  # API Routes
│   └── storage/                 # File Storage
├── act-frontend/                # React Frontend
│   ├── src/
│   │   ├── components/          # Reusable Components
│   │   ├── pages/               # Page Components
│   │   ├── layouts/             # Layout Components
│   │   ├── lib/                 # API & Utilities
│   │   └── hooks/               # Custom Hooks
│   └── public/                  # Static Assets
└── README.md                    # This file
```

## 🔐 Authentication

The platform uses **Laravel Sanctum** for API authentication:

- **Students**: Register and enroll in courses
- **Instructors**: Require admin approval before creating courses
- **Administrators**: Full system access

### Admin Access
Administrators have full system access for user management and oversight.

## 📚 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `POST /api/verify-otp` - OTP verification

### Courses
- `GET /api/courses` - Public course listing
- `GET /api/courses/{id}` - Course details
- `POST /api/instructor/courses` - Create course (Instructor)
- `PUT /api/instructor/courses/{id}` - Update course (Instructor)
- `POST /api/courses/{id}/enroll` - Enroll in course (Student)

### Lessons
- `POST /api/instructor/courses/{id}/lessons` - Add lesson (Instructor)
- `PUT /api/instructor/courses/{courseId}/lessons/{lessonId}` - Update lesson
- `DELETE /api/instructor/courses/{courseId}/lessons/{lessonId}` - Delete lesson

### Quizzes
- `GET /api/quizzes` - User quizzes
- `POST /api/quizzes` - Create quiz (Instructor)
- `POST /api/quizzes/{id}/submit` - Submit quiz attempt

## 🎯 Key Features Implementation

### File Upload System
- **Videos**: Stored in `storage/app/public/videos`
- **PDFs/Resources**: Stored in `storage/app/public/resources`
- **Thumbnails**: Stored in `storage/app/public/thumbnails`
- **Access**: Via proxy endpoint `/api/storage-proxy/{filename}`

### Course Editing
- **Real-time updates** with FormData handling
- **File upload support** for thumbnails and materials
- **AI integration** for course outline generation
- **Lesson management** with drag-and-drop ordering

### Progress Tracking
- **Course completion** percentages
- **Quiz scores** and attempts
- **Watch time** tracking for videos
- **Student engagement** metrics

## 🔧 Configuration

### CORS Setup
The application handles CORS through Laravel's built-in CORS middleware. Ensure your frontend URL is properly configured in `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:5173', 'https://yourdomain.com'],
```

### File Storage
Configure your filesystem in `config/filesystems.php`:

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

## 🧪 Testing

### Backend Tests
```bash
cd act-backend
php artisan test
```

### Frontend Tests
```bash
cd act-frontend
npm run test
```

## 🚀 Deployment

### Backend Deployment
1. **Configure production environment**
2. **Set up database**
3. **Run migrations**: `php artisan migrate --force`
4. **Optimize**: `php artisan config:cache && php artisan route:cache`
5. **Set up file permissions** for storage directory

### Frontend Deployment
1. **Build for production**: `npm run build`
2. **Deploy `dist/` folder** to your web server
3. **Configure environment variables**

## � API Endpoints

### 🔐 Authentication
- `POST /register` - User registration with OTP
- `POST /verify-otp` - Email verification
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /api/token/refresh` - Token refresh
- `GET /api/user` - Get current user
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password

### 📚 Courses
- `GET /api/courses` - List all courses (public)
- `GET /api/courses/{id}` - Get course details
- `POST /api/instructor/courses` - Create course
- `PUT /api/instructor/courses/{id}` - Update course
- `DELETE /api/instructor/courses/{id}` - Delete course

### 📖 Lessons
- `POST /api/instructor/courses/{courseId}/lessons` - Add lesson
- `PUT /api/instructor/courses/{courseId}/lessons/{lessonId}` - Update lesson
- `DELETE /api/instructor/courses/{courseId}/lessons/{lessonId}` - Delete lesson

### 🎓 Enrollment & Progress
- `POST /api/courses/{courseId}/enroll` - Enroll in course
- `DELETE /api/courses/{courseId}/enroll` - Unenroll from course
- `GET /api/courses/{courseId}/enrollment` - Get enrollment status
- `POST /api/courses/{courseId}/lessons/{lessonId}/complete` - Mark lesson complete
- `GET /api/courses/{courseId}/progress` - Get course progress
- `GET /api/student/enrolled-courses` - Get enrolled courses
- `POST /api/courses/{courseId}/certificate` - Issue certificate
- `GET /api/certificates/{certificateId}` - Get certificate

### 💬 Comments & Interactions
- `GET /api/courses/{courseId}/comments` - Get course comments
- `POST /api/courses/{courseId}/comments` - Add comment
- `PUT /api/comments/{commentId}` - Update comment
- `DELETE /api/comments/{commentId}` - Delete comment
- `POST /api/comments/{commentId}/react` - React to comment
- `PUT /api/comments/{commentId}/moderate` - Moderate comment
- `GET /api/admin/moderation/queue` - Get moderation queue

### 💬 Chat System
- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/{roomId}` - Get chat room details
- `POST /api/chat/rooms/{roomId}/join` - Join chat room
- `POST /api/chat/rooms/{roomId}/leave` - Leave chat room
- `GET /api/chat/rooms/{roomId}/messages` - Get chat messages
- `POST /api/chat/rooms/{roomId}/messages` - Send message
- `PUT /api/chat/messages/{messageId}` - Edit message
- `DELETE /api/chat/messages/{messageId}` - Delete message
- `GET /api/chat/rooms/{roomId}/members` - Get room members
- `POST /api/chat/rooms/{roomId}/typing` - Send typing indicator
- `GET /api/chat/online-users` - Get online users

### 📝 Quizzes & Assessments
- `POST /api/quiz/generate` - Generate quiz with AI
- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes/{quizId}` - Get quiz
- `POST /api/quizzes/{quizId}/attempt` - Submit quiz attempt
- `GET /api/quizzes/{quizId}/results` - Get quiz results

### 👥 User Management (Admin)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/{userId}/role` - Update user role
- `DELETE /api/admin/users/{userId}` - Delete user

### 📁 File Management
- `POST /api/upload/thumbnail` - Upload thumbnail
- `DELETE /api/upload/files/{filename}` - Delete file

### 🔧 System Management (Admin)
- `GET /api/admin/health` - System health check
- `POST /api/admin/maintenance` - Maintenance mode control
- `GET /api/admin/audit-logs` - Get audit logs
- `GET /api/admin/dashboard` - Dashboard statistics

### 📊 Analytics & Reporting
- `GET /api/admin/analytics/platform` - Platform analytics
- `GET /api/instructor/courses/{courseId}/analytics` - Course analytics

### 📋 API Documentation
For detailed API documentation including request/response examples, validation rules, and error handling, see:
- **[API Documentation](docs/api.md)** - Complete API reference
- **[Developer Guide](docs/developer-guide.md)** - Development workflows and architecture

## �� Contributors

- **Rami** - [GitHub Profile](https://github.com/Ra58ad) - Project Lead & development team
- **Aymen Abdulkerim** - development team
- **Bemnet Eyob** - Development Team
- **Nahim Teklu** - Development Team
- **Rame Mahamat** - Development Team
- **Sead Bushra** - Development Team
- **Sofonias Yoseph** - Development Team

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**CORS Errors**
- Ensure frontend URL is in `config/cors.php`
- Check that API base URL is correct in frontend `.env`

**File Upload Issues**
- Verify `storage:link` has been run
- Check file permissions in storage directory
- Ensure PHP upload limits are sufficient

**Authentication Issues**
- Clear browser cookies for the domain
- Verify Sanctum configuration
- Check CSRF token handling

### Debug Mode
Enable debug mode in `.env` for detailed error information:
```env
APP_DEBUG=true
```

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review the API documentation

---

**Built with ❤️ for modern e-learning**
