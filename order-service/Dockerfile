FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    unzip \
    git \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --prefer-dist \
    --optimize-autoloader \
    --no-scripts

COPY . .

RUN composer dump-autoload --no-dev --optimize --no-scripts \
    && php artisan package:discover --ansi

EXPOSE 3003

CMD ["sh", "-c", "php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=3003"]
