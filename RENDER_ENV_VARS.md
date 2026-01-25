# Render Environment Variables - Complete List

Copy and paste these EXACTLY into your Render dashboard (Environment tab):

## Critical Variables (Required)

```
APP_DEBUG=false
APP_ENV=production
APP_KEY=base64:vqig5wqpgu8qzcFt95IITReI0zJhdGryVN+KmGglQ+M=
APP_URL=https://act-k1lm.onrender.com
CACHE_STORE=database
DATABASE_URL=postgresql://act_o99v_user:8htfqdr254rJQDD5NdPJfsS3HfBeVM0v@dpg-d5qp85koud1c73eaokc0-a/act_o99v
DB_CONNECTION=pgsql
FRONTEND_URL=https://act-elearning.aymenab.com
LOG_CHANNEL=stack
LOG_LEVEL=error
QUEUE_CONNECTION=database
SANCTUM_STATEFUL_DOMAINS=act-elearning.aymenab.com,act-k1lm.onrender.com
SESSION_DRIVER=database
SESSION_HTTP_ONLY=true
SESSION_LIFETIME=120
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=true
```

## Important Notes

1. **NO QUOTES** around values (except for APP_KEY if it has special chars, but usually not needed)
2. **NO SPACES** before or after the `=` sign
3. **SESSION_DOMAIN** should NOT be set (leave it empty/unset)
4. **SANCTUM_STATEFUL_DOMAINS** - NO `https://`, just the domain names separated by commas
5. **FRONTEND_URL** - WITH `https://` protocol

## After Setting Variables

1. Save in Render dashboard
2. Render will automatically redeploy
3. Wait 3-5 minutes for deployment
4. Clear browser cookies and test signup

## If CSRF Still Fails

1. Check browser console for cookie warnings
2. Verify cookies are being set (check Application/Storage tab in DevTools)
3. Make sure `XSRF-TOKEN` cookie exists after calling `/sanctum/csrf-cookie`
4. Check that cookies have `SameSite=None; Secure` attributes
