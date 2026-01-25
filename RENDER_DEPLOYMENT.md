# Render.com Deployment Guide

This guide will help you deploy the ACT E-Learning platform to Render.com using Docker.

## Prerequisites

1. A GitHub/GitLab repository with your code
2. A Render.com account (free tier available)
3. (Optional) A Vercel account for frontend deployment

## Step 1: Prepare Your Repository

Ensure your code is pushed to GitHub/GitLab. The repository should have:
- `act-backend/` directory with the Laravel backend
- `act-backend/Dockerfile` (already created)
- `act-backend/render.yaml` (already created)
- `act-backend/.env.example` (for reference)

## Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `act-database` (or your preferred name)
   - **Database**: `act_db` (or leave default)
   - **User**: `act_user` (or leave default)
   - **Region**: Choose closest to your users (e.g., `Oregon`)
   - **PostgreSQL Version**: Latest stable
   - **Plan**: `Starter` (free tier) or higher
4. Click **Create Database**
5. **Important**: Note down the **Internal Database URL** (you'll need this)

## Step 3: Create Web Service on Render

1. In Render Dashboard, click **New +** → **Web Service**
2. Connect your GitHub/GitLab repository
3. Configure the service:
   - **Name**: `act-backend` (or your preferred name)
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `act-backend` ⚠️ **CRITICAL**
   - **Runtime**: `Docker`
   - **Dockerfile Path**: `act-backend/Dockerfile` (or just `Dockerfile` if root directory is set)
   - **Docker Context**: `act-backend` (or `.` if root directory is set)
   - **Instance Type**: `Starter` (free tier) or higher
   - **Health Check Path**: `/health`

## Step 4: Configure Environment Variables

Following [Render's Official Laravel Guide](https://render.com/docs/deploy-laravel), you only need **3 essential variables**:

### Essential Variables (Required)

| Key | Value | How to Get |
|-----|-------|------------|
| `DATABASE_URL` | Internal Database URL | Copy from PostgreSQL service dashboard |
| `DB_CONNECTION` | `pgsql` | Static value |
| `APP_KEY` | `base64:...` | Run `php artisan key:generate --show` locally |

**Generate APP_KEY:**
```bash
cd act-backend
php artisan key:generate --show
```

Copy the output (starts with `base64:`) and paste it as `APP_KEY` in Render.

**Get DATABASE_URL:**
- Go to your PostgreSQL service in Render
- Copy the **Internal Database URL** (format: `postgres://user:password@host:port/database`)
- Paste it as `DATABASE_URL` in your Web Service environment variables

> **Note:** Laravel automatically parses `DATABASE_URL` - you don't need individual `DB_HOST`, `DB_PORT`, etc. variables!

### Optional Variables (Recommended for Production)

After initial deployment, add these for better configuration:

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-service-name.onrender.com

# Frontend (update after deploying frontend)
FRONTEND_URL=https://your-frontend.vercel.app
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app

# Session & Security
SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SESSION_HTTP_ONLY=true
SESSION_LIFETIME=120

# Cache & Queue
CACHE_STORE=database
QUEUE_CONNECTION=database

# Logging
LOG_LEVEL=error
LOG_CHANNEL=stack

# Mail (configure if needed)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# AI Services (if using)
GEMINI_API_KEY=your-gemini-api-key
```

### Linking Database (Alternative Method)

Instead of manually copying `DATABASE_URL`, you can:
1. In your Web Service settings, go to **Connections**
2. Click **Link Database**
3. Select your PostgreSQL database
4. Render will automatically set `DATABASE_URL` for you

## Step 5: Deploy

1. Click **Save Changes** in Render
2. Render will automatically:
   - Build the Docker image
   - Run the container
   - Execute migrations (via docker-entrypoint.sh)
   - Start the web service

3. Wait for deployment to complete (usually 5-10 minutes)

4. Check the **Logs** tab to ensure:
   - Database connection is successful
   - Migrations ran successfully
   - Apache started without errors

## Step 6: Verify Deployment

1. Visit your service URL: `https://your-service-name.onrender.com`
2. Check health endpoint: `https://your-service-name.onrender.com/health`
3. You should see:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "..."
   }
   ```

## Step 7: Run Database Migrations (if needed)

If migrations didn't run automatically:

1. Go to your Web Service → **Shell** tab
2. Run:
   ```bash
   php artisan migrate --force
   ```
3. (Optional) Seed initial data:
   ```bash
   php artisan db:seed --force
   ```

## Step 8: Deploy Frontend (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com)
2. Import your repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `act-frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-service-name.onrender.com`
5. Deploy

## Step 9: Update Backend CORS Settings

After frontend is deployed:

1. Go back to Render → Your Web Service → **Environment**
2. Update:
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`
   - `SANCTUM_STATEFUL_DOMAINS`: `your-frontend.vercel.app` (NO `https://`)
3. Save (this will trigger a redeploy)

## Troubleshooting

### Database Connection Issues

- Ensure you're using the **Internal Database URL** (not External) if both services are on Render
- Check that `DB_CONNECTION=pgsql` is set
- Verify `DATABASE_URL` is correctly formatted: `postgres://user:password@host:port/database`
- Try linking the database in Render dashboard instead of manual `DATABASE_URL`

### CORS Errors

- Ensure `FRONTEND_URL` matches your frontend domain exactly
- Ensure `SANCTUM_STATEFUL_DOMAINS` has NO `https://` prefix
- Check `config/cors.php` allows your frontend domain

### 503 Errors / Health Check Failing

- Check logs in Render dashboard
- Ensure database is accessible
- Verify migrations completed successfully
- Check that `/health` endpoint is accessible

### Session/Cookie Issues

- Ensure `SESSION_SECURE_COOKIE=true` in production
- Set `SESSION_SAME_SITE=lax` (or `none` if needed)
- Verify `SESSION_DOMAIN` is empty or set correctly

### Build Failures

- Check Dockerfile syntax
- Ensure all dependencies are in `composer.json`
- Check build logs for specific errors

### Performance Issues

- Upgrade to a paid plan for better performance
- Enable caching (already configured to use database)
- Consider using Redis for cache/sessions (requires Redis addon)

## Environment-Specific Notes

### Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Consider upgrading to paid plan for production

### Database Backups

Render automatically backs up PostgreSQL databases. For production, consider:
- Regular manual backups
- Setting up automated backups
- Using a managed database service

## Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_KEY` is set and secure
- [ ] Database credentials are secure
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] CORS is properly configured
- [ ] Environment variables are not committed to git
- [ ] `.env` is in `.gitignore`

## Next Steps

1. Set up custom domain (optional)
2. Configure email service (Mailgun, SendGrid, etc.)
3. Set up monitoring and alerts
4. Configure CI/CD for automatic deployments
5. Set up SSL certificates (automatic on Render)

## Support

- [Render Documentation](https://render.com/docs)
- [Laravel Deployment](https://laravel.com/docs/deployment)
- Check application logs in Render dashboard
