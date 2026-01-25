FROM php:8.2-apache

# Install system dependencies and PHP extensions in one layer
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install -j$(nproc) pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Configure Apache (combine operations)
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN a2dismod mpm_event mpm_worker || true \
    && a2enmod rewrite headers mpm_prefork \
    && sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf \
    && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
    && echo "<Directory ${APACHE_DOCUMENT_ROOT}>" >> /etc/apache2/apache2.conf \
    && echo "    Options Indexes FollowSymLinks" >> /etc/apache2/apache2.conf \
    && echo "    AllowOverride All" >> /etc/apache2/apache2.conf \
    && echo "    Require all granted" >> /etc/apache2/apache2.conf \
    && echo "</Directory>" >> /etc/apache2/apache2.conf \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Set working directory
WORKDIR /var/www/html

# Install Composer (copy first for better caching)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy composer files first (for better layer caching)
COPY composer.json composer.lock ./

# Install PHP dependencies without scripts (artisan doesn't exist yet)
# Use --prefer-dist and --no-scripts for faster install
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts --no-plugins

# Copy application files
COPY . .

# Run package discovery (quick operation)
RUN php artisan package:discover --ansi || true

# Copy entrypoint and set up storage in one step
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p storage/framework/{sessions,views,cache} storage/logs bootstrap/cache \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 80 (Render will map this automatically)
EXPOSE 80

# Health check for Render.com
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Run migrations then start Apache
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
