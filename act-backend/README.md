# ACT E-Learning Backend API

The Laravel-based REST API powering the ACT E-Learning Platform.

**API Base URL:** `https://act-elearning.aymenab.com/api` (Live)

## 🚀 Features

- **RESTful Architecture**: Clean resource-oriented endpoints.
- **Authentication**: Secure token-based auth using Laravel Sanctum.
- **Role-Based Access Control**: Middleware for Admin, Instructor, and Student roles.
- **Course Management**: CRUD operations for courses, lessons, and resources.
- **Quiz Engine**: Logic for quiz creation, attempts, and scoring.
- **File Storage**: Handling for course thumbnails, profile pictures, and resources.

## 🛠 Tech Stack

- **Framework**: Laravel 11
- **Database**: MySQL
- **Auth**: Laravel Sanctum
- **External Integration**: Gemini AI (for content), Mail handling.

## 🔧 Setup & Development

1.  **Install Dependencies**
    ```bash
    composer install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env` and configure your database and app settings.
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```

3.  **Database Migration**
    ```bash
    php artisan migrate --seed
    ```

4.  **Run Development Server**
    ```bash
    php artisan serve
    ```

## 📂 Key Directories

- `app/Http/Controllers`: API Logic.
- `app/Models`: Eloquent Data Models.
- `routes/api.php`: API Route Definitions.
- `database/migrations`: Database Schema.

## 🌐 Deployment

The backend is live at [act-elearning.aymenab.com](https://act-elearning.aymenab.com). Ensure your web server (Nginx/Apache) points to the `public` directory.
