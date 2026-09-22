FROM php:8.4-cli-alpine

# Install dependensi sistem, SQLite, dan Node.js untuk build frontend
RUN apk add --no-cache nodejs npm git curl sqlite-dev libpng-dev libzip-dev zip
RUN docker-php-ext-install pdo pdo_sqlite gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY . .

# Install dependensi Laravel dan Build React Vite
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# Setup direktori SQLite & Storage
RUN touch database/database.sqlite
RUN chown -R www-data:www-data storage bootstrap/cache database
RUN chmod -R 775 storage bootstrap/cache database

EXPOSE 10000

# Jalankan migrasi dan server Laravel otomatis
CMD php artisan storage:link && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}