# Quick Deploy Checklist for Render.com

Based on [Render's Official Laravel Guide](https://render.com/docs/deploy-laravel)

## Before Deploying

1. ✅ Push code to GitHub/GitLab
2. ✅ Generate `APP_KEY`: `cd act-backend && php artisan key:generate --show`
3. ✅ Note your frontend URL (if deploying separately)

## Render.com Setup (3 Steps - 5 minutes)

### 1. Create PostgreSQL Database
- Go to Render Dashboard → **New +** → **PostgreSQL**
- Name: `act-database` (or any name)
- Region: Choose closest to your users
- Plan: Starter (free) or higher
- Click **Create Database**
- **Copy the Internal Database URL** (you'll need this)

### 2. Create Web Service
- **New +** → **Web Service**
- Connect your GitHub/GitLab repository
- Configure:
  - **Name**: `act-backend` (or your preferred name)
  - **Root Directory**: `act-backend` ⚠️ **CRITICAL**
  - **Runtime**: **Docker**
  - **Region**: Same as your database
  - **Health Check Path**: `/health` (optional but recommended)

### 3. Set Environment Variables

In the **Environment** section, add these 3 variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | The **Internal Database URL** from step 1 |
| `DB_CONNECTION` | `pgsql` |
| `APP_KEY` | Output from `php artisan key:generate --show` |

**That's it!** Render will automatically:
- Build your Docker image
- Run migrations
- Start your application

### 4. (Optional) Additional Variables

After initial deployment, you may want to add:

```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-service.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

## Verify Deployment

1. Wait for build to complete (5-10 minutes)
2. Visit: `https://your-service.onrender.com`
3. Check health: `https://your-service.onrender.com/health`
   - Should return: `{"status":"healthy","database":"connected"}`

## Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Root Directory is set to `act-backend` |
| Database error | Verify `DATABASE_URL` is the Internal URL |
| 503 Error | Check logs, ensure migrations ran successfully |
| CORS Error | Set `FRONTEND_URL` and `SANCTUM_STATEFUL_DOMAINS` |
| Slow first request | Normal on free tier (15min spin-down) |

## Pro Tips

- Use **Internal Database URL** (not External) for better performance
- Link database in Render dashboard for automatic `DATABASE_URL`
- Free tier services spin down after 15min inactivity
- Consider paid plan for production use

## Full Guide
See `RENDER_DEPLOYMENT.md` for detailed instructions and troubleshooting.
