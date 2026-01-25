FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd

# Enable Apache modules
RUN a2enmod rewrite headers

# Fix Apache error: More than one MPM loaded
RUN a2dismod mpm_event mpm_worker || true
RUN a2enmod mpm_prefork

# Configure Apache DocumentRoot to point to public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Use production PHP configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Set working directory
WORKDIR /var/www/html

# Install Composer (copy first for better caching)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files first (for better layer caching)
COPY composer.json composer.lock ./

# Install PHP dependencies without scripts (artisan doesn't exist yet)
# Scripts will run after we copy all files
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts

# Copy application files
COPY . .

# Now run composer scripts (package discovery, etc.) since artisan exists
# This runs the post-install scripts that were skipped earlier
RUN composer dump-autoload --optimize --no-interaction && \
    php artisan package:discover --ansi || true

# Copy and set permissions for entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create storage directories and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 80 (Render will map this automatically)
EXPOSE 80

# Health check for Render.com
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Run migrations then start Apache
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
