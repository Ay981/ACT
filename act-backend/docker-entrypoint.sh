#!/bin/bash
set -e

echo "Starting application entrypoint..."

# Wait for database to be ready (for Render.com)
# Supports both DATABASE_URL (Render standard) and individual DB_* variables
if [ -n "$DATABASE_URL" ] || [ -n "$DB_HOST" ]; then
    echo "Waiting for database connection..."
    max_attempts=30
    attempt=0
    # Try to connect - Laravel will parse DATABASE_URL automatically
    until php -r "
        try {
            if (getenv('DATABASE_URL')) {
                // Parse DATABASE_URL (postgres://user:pass@host:port/db)
                \$url = parse_url(getenv('DATABASE_URL'));
                \$dsn = 'pgsql:host='.\$url['host'].';port='.(\$url['port'] ?? 5432).';dbname='.ltrim(\$url['path'], '/');
                \$pdo = new PDO(\$dsn, \$url['user'], \$url['pass'] ?? '');
            } else {
                // Use individual DB_* variables
                \$pdo = new PDO(
                    'pgsql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: '5432').';dbname='.getenv('DB_DATABASE'),
                    getenv('DB_USERNAME'),
                    getenv('DB_PASSWORD')
                );
            }
            exit(0);
        } catch (Exception \$e) {
            exit(1);
        }
    " 2>/dev/null || [ $attempt -ge $max_attempts ]; do
        attempt=$((attempt + 1))
        echo "Database connection attempt $attempt/$max_attempts..."
        sleep 2
    done
    if [ $attempt -lt $max_attempts ]; then
        echo "Database is ready!"
    else
        echo "Warning: Could not verify database connection, but continuing..."
    fi
fi

# Clear and cache configuration for production
php artisan config:clear || true
php artisan cache:clear || true
php artisan route:clear || true
php artisan view:clear || true

# Cache configuration for better performance (only if APP_ENV is production)
if [ "$APP_ENV" = "production" ]; then
    php artisan config:cache || true
    php artisan route:cache || true
    php artisan view:cache || true
fi

# Run migrations
echo "Running database migrations..."
php artisan migrate --force || {
    echo "Migration failed, but continuing..."
}

# Ensure storage permissions are correct
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache || true
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache || true

echo "Starting Apache server..."
exec apache2-foreground