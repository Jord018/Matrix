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
php artisan serve

# frontend (http://localhost:5173, proxies /api to the backend)
cd frontend
npm install
npm run dev            # BACKEND_URL=http://127.0.0.1:8123 npm run dev  if port 8000 is blocked
```

> The backend uses the existing Supabase tables. Never run `php artisan migrate` against it.

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

<!-- sonar PR gate test -->
