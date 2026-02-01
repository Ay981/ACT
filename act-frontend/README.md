# ACT E-Learning Frontend

The React-based frontend for the ACT E-Learning Platform, a comprehensive learning management system.

**Live URL:** [https://act-elearning.aymenab.com](https://act-elearning.aymenab.com)

## 🚀 Features

- **Modern UI/UX**: Built with TailwindCSS and responsive design.
- **Role-Based Dashboards**: Distinct interfaces for Students, Instructors, and Admins.
- **Dark Mode Support**: Seamless light/dark theme switching.
- **Interactive Quizzes**: Real-time quiz taking and result analysis.
- **Course Management**: Rich course browsing, enrollment, and lesson viewing.

## 🛠 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Routing**: React Router DOM 6
- **Icons**: Lucide React
- **HTTP Client**: Axios

## 📦 Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React Contexts (Auth, Theme)
├── layouts/        # Page layouts (AppLayout, etc.)
├── lib/            # Utilities and API helpers
├── pages/          # Application pages/routes
└── global.css      # Global styles and Tailwind imports
```

## 🔧 Setup & Development

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Setup**
    Copy `.env.example` to `.env` (if available) or create `.env`:
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 🌐 Deployment

The frontend is configured to be deployed on static hosting services (like Vercel or Render) or served via a web server (Nginx/Apache). The live version is hosted at [act-elearning.aymenab.com](https://act-elearning.aymenab.com).
