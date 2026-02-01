# ACT E-Learning Platform

**Live Demo:** [https://act-elearning.aymenab.com](https://act-elearning.aymenab.com)

ACT E-Learning is a modern, full-stack learning management system for students, instructors, and administrators. It provides robust course management, interactive learning, quizzes, and real-time analytics.

---

## Features

- Student, Instructor, and Admin roles
- Course creation, enrollment, and management
- Video lessons & downloadable resources
- Quizzes, attempts, and scoring
- Comments, messaging, and notifications
- Progress tracking dashboards
- Secure authentication (Laravel Sanctum)
- Dark mode support

---

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **Backend:** Laravel 11, MySQL
- **Authentication:** Laravel Sanctum
- **Deployment:** Vercel (Frontend), Custom VPS (Backend)

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Composer
- PHP 8.2+
- MySQL

### 1. Clone the Repository
```bash
git clone https://github.com/aymenab/act-elearning.git
cd act-elearning
```

### 2. Setup Frontend
```bash
cd act-frontend
npm install
npm run dev
```

### 3. Setup Backend
```bash
cd ../act-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

---

## Documentation

- [API Reference](docs/api.md)
- [Developer Guide](docs/developer-guide.md)
- [Deployment](DEPLOYMENT.md)

---

## Contributing

Contributions are welcome! Please read the [developer guide](docs/developer-guide.md) and open an issue or pull request.

---

## License

[MIT](LICENSE)
