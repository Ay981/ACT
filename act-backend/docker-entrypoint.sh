#!/bin/bash
set -e

# Run migrations (ignore errors if already migrated)
php artisan migrate --force || true

# Start Apache
exec apache2-foreground