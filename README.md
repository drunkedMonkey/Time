# Time

App de gestión de agenda para negocios, con citas asignadas manualmente o agendadas automáticamente vía WhatsApp.

## Estructura

- `backend/` — API en Laravel + PostgreSQL
- `frontend/` — SPA en Vue3 + TypeScript + Vite

## Desarrollo

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```
