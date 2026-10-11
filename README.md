# Matrix — Mouse Jerry Game Key Store (re-engineered)

SE327 term project: re-implementation of the SE262 Mouse Jerry web store.

| Component | Original (SE262) | Re-engineered |
| :--- | :--- | :--- |
| UI | Bootstrap 5 | Tailwind CSS 4 |
| Frontend | EJS (server-rendered) | Vue 3 SPA + Vue Router (`frontend/`) |
| Backend | Node.js + Express | PHP Laravel 13 JSON API (`backend/`) |
| Database | MongoDB | PostgreSQL (Supabase) |

## Run locally

```bash
# backend  (http://127.0.0.1:8000)
cd backend
composer install
cp .env.example .env   # then set DB_PASSWORD
php artisan key:generate
composer serve         # PORT=8123 composer serve  (PowerShell: $env:PORT=8123; composer serve)

# frontend (http://localhost:5173, proxies /api to the backend)
cd frontend
npm install
npm run dev            # BACKEND_URL=http://127.0.0.1:8123 npm run dev  if port 8000 is blocked
```

> The backend uses the existing Supabase tables. Never run `php artisan migrate` against it.

> Use `composer serve` rather than `php artisan serve`: it turns on opcache (~0.01s per request instead of ~0.13s)
> and avoids artisan serve's random ~0.35s stalls on Windows. Open shops poll `/api/catalog-version` every 0.5s
> to pick up back-office changes, so a slow dev server makes those updates lag.

## Tests

```bash
cd backend && php artisan test
cd frontend && npm test          # npm run coverage for a coverage report
```

## Git workflow

- `main` is protected: no direct pushes, changes land via pull request.
- Branch per change: `feature/<name>`, `fix/<name>`, `chore/<name>`, `refactor/<name>`.
- A PR can merge only when the `backend` and `frontend` CI jobs pass, including the
  SonarQube Cloud quality gate for each app (`jord018_matrix-backend`, `jord018_matrix-frontend`).
