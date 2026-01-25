# Render.com Deployment - Simple Guide

Based on [Render's Official Laravel + Docker Guide](https://render.com/docs/deploy-laravel)

## Quick Start (3 Steps)

### Step 1: Create PostgreSQL Database
1. Render Dashboard → **New +** → **PostgreSQL**
2. Choose name, region, plan
3. Click **Create**
4. **Copy the Internal Database URL**

### Step 2: Create Web Service
1. **New +** → **Web Service**
2. Connect your repository
3. **Root Directory**: `act-backend` ⚠️
4. **Runtime**: **Docker**
5. **Region**: Same as database

### Step 3: Set 3 Environment Variables

In **Environment** tab, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Internal Database URL from Step 1 |
| `DB_CONNECTION` | `pgsql` |
| `APP_KEY` | Run `php artisan key:generate --show` locally |

**Done!** Your app will deploy automatically.

## Generate APP_KEY

```bash
cd act-backend
php artisan key:generate --show
```

Copy the output and paste as `APP_KEY` value.

## Verify

After deployment (5-10 min):
- Visit: `https://your-service.onrender.com`
- Health check: `https://your-service.onrender.com/health`

## Optional: Link Database

Instead of manual `DATABASE_URL`:
1. Web Service → **Connections**
2. **Link Database** → Select your PostgreSQL
3. Render sets `DATABASE_URL` automatically

## Additional Variables (Optional)

Add these after initial deployment:

```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-service.onrender.com
FRONTEND_URL=https://your-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
```

## Troubleshooting

- **Build fails**: Check Root Directory = `act-backend`
- **Database error**: Use Internal Database URL (not External)
- **503 error**: Check logs, migrations should run automatically
- **Slow first request**: Normal on free tier (15min spin-down)

## Full Documentation

- Quick reference: `QUICK_DEPLOY.md`
- Detailed guide: `RENDER_DEPLOYMENT.md`
- Official Render guide: https://render.com/docs/deploy-laravel
