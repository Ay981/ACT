# ACT Platform Deployment Guide (Render + Vercel)

This guide is tailored for hosting the **Backend on Render** and the **Frontend on Vercel**.

## Part 1: Backend Deployment (Render)

We will deploy the Laravel backend as a Docker container on Render.

### 1. Database Setup
Render provides managed PostgreSQL, which works great with Laravel.

1.  Create a **New PostgreSQL** database on Render.
2.  Note the **Internal Connection URL** (for internal use) or **External Connection URL**.
3.  *Note:* Since Laravel uses MySQL by default, but Render offers Postgres, you have two choices:
    *   **Option A (Recommended for Render):** Use Render's Postgres. You will need to set `DB_CONNECTION=pgsql` in your environment variables.
    *   **Option B:** Use an external MySQL provider (like PlanetScale or Aiven) and connect to it.

### 2. Web Service Setup
1.  Push your code to GitHub/GitLab.
2.  In Render, create a **New Web Service**.
3.  Connect your repository.
4.  **Root Directory**: `act-backend` (Important!).
5.  **Runtime**: Select **Docker**. (It will automatically pick up the `Dockerfile` we created).
6.  **Region**: Choose the same region as your database.

### 3. Environment Variables
In the Render dashboard for your service, go to **Environment** and add the following keys:

| Key | Value | Note |
| :--- | :--- | :--- |
| `APP_ENV` | `production` | |
| `APP_KEY` | `base64:...` | Run `php artisan key:generate --show` locally to get one. |
| `APP_DEBUG` | `false` | |
| `APP_URL` | `https://your-app-name.onrender.com` | Your Render URL. |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL. |
| `DB_CONNECTION` | `pgsql` | If using Render DB. |
| `DB_HOST` | `...` | From Render DB details. |
| `DB_PORT` | `5432` | |
| `DB_DATABASE` | `...` | |
| `DB_USERNAME` | `...` | |
| `DB_PASSWORD` | `...` | |
| `GEMINI_API_KEY` | `...` | Your AI key. |
| `SANCTUM_STATEFUL_DOMAINS` | `your-frontend.vercel.app` | **CRITICAL**: No `https://`. |
| `SESSION_DOMAIN` | `.onrender.com` | Optional, helps with cookies. |

### 4. Post-Deploy Migration
Ref: [Laravel on Render Docs](https://render.com/docs/deploy-laravel)
Once deployed, the app will run, but the database will be empty. You need to migrate.
Render supports "Shell" access or you can define a "Build Command" (for native) or a "Job".
For Docker:
1.  Wait for the service to be "Live".
2.  Go to the **Shell** tab in Render dashboard.
3.  Run: `php artisan migrate --force`
4.  Run: `php artisan db:seed --force` (If you want initial data).

---

## Part 2: Frontend Deployment (Vercel)

We will deploy the React frontend to Vercel.

### 1. Import Project
1.  Go to Vercel Dashboard -> **Add New...** -> **Project**.
2.  Import your git repository.

### 2. Project Configuration
1.  **Framework Preset**: Vite (Vercel should auto-detect).
2.  **Root Directory**: Edit this and select `act-frontend`.
3.  **Build Command**: `npm run build` (Default).
4.  **Output Directory**: `dist` (Default).

### 3. Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-app-name.onrender.com` | Your Render Backend URL. |

### 4. Deploy
Click **Deploy**.

---

## Part 3: Connecting Them

1.  Once Vercel deploys, copy the domain (e.g., `act-frontend-xyz.vercel.app`).
2.  Go back to **Render** -> Environment Variables.
3.  Update `FRONTEND_URL` to `https://act-frontend-xyz.vercel.app`.
4.  Update `SANCTUM_STATEFUL_DOMAINS` to `act-frontend-xyz.vercel.app` (No http/https!).
5.  Save changes in Render (this will redeploy the backend).

## Troubleshooting

-   **CORS Errors**: Check `act-backend/config/cors.php` and ensure `FRONTEND_URL` in Render matches your Vercel domain exactly.
-   **404 on Refresh**: We added `vercel.json` to handle SPA rewrites, so this should work automatically.
-   **Database Errors**: Ensure your IP is allowed if using an external DB, or that you are using the "Internal Connection URL" if both are on Render (private networking).
