# BASTION — Laravel API

REST API for BASTION (Laravel 12, Sanctum token auth, MySQL). Full setup and the endpoint table are in the
[root README](../README.md).

```bash
composer install
cp .env.example .env          # then set DB_USERNAME / DB_PASSWORD if needed
php artisan key:generate
php artisan migrate --seed    # create the empty MySQL database "bastion" first
php artisan serve             # http://localhost:8000
php artisan test              # optional: feature tests
```
