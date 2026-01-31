# Copilot Instructions — Bazar4

**Purpose:** Quick, actionable guidance for AI coding agents to be productive in this repo (Angular frontend + Django backend).

## Big picture 🔧
- Frontend: Angular (client/). Built with Angular CLI (v15+). Entry point: `client/src/main.ts`.
- Backend: Django REST Framework (server/). Project root: `server/Backend/`. DB: SQLite file `server/Bazar4Database.sqlite3` (dev data included).
- API surface: all API endpoints live under `/api/`. Django URL includes per-app routes: `/api/users/`, `/api/agents/`, `/api/box/`.

## Core developer workflows ✅
- Frontend dev: from `client/` run `npm install` then `npm start` (alias for `ng serve`) to run on port 4200.
- Backend dev: create a Python virtualenv, install dependencies used by the project, then `python manage.py runserver` (defaults to port 8000).
- Typical local setup uses Angular dev environment which points to `http://127.0.0.1:8000/api/` (`client/src/environments/environment.development.ts`). CORS is allowed for dev (`CORS_ORIGIN_ALLOW_ALL = True`).
- Admin panel: Django admin exposed at `/sys/`.
- Auth endpoints: `POST /api/auth/token/` and `POST /api/auth/verify/` (see `server/Backend/urls.py`).

## Project-specific patterns & conventions 🔍
- JWT header: Backend expects `Authorization: JWT <token>` (not `Bearer`). See `client/src/app/core/interceptor/jwt.interceptor.ts`.
- Client stores current user as AES-encrypted JSON in localStorage key `currentUser`. Encryption key is in `AuthService` (`client/src/app/core/service/auth.service.ts`). Inspect/decrypt with that key for debugging.
- Path aliases are configured in `client/tsconfig.json`: `@core`, `@shared`, `@config` (use these when adding imports).
- Feature modules use PascalCase directories (e.g., `Accountant/`, `Seller/`, `admin/`) and per-module routing files named `*-routing.module.ts`.
- Translation files: `client/src/assets/i18n/*.json` (ngx-translate).
- Django apps organize API code under `server/Apps/<AppName>/api/` (serializers, views, urls).

## Where to look for examples 📚
- Auth flow: `client/src/app/core/service/auth.service.ts` (login, localStorage encryption)
- HTTP handling: `client/src/app/core/interceptor/jwt.interceptor.ts` and `error.interceptor.ts`
- Environment config: `client/src/environments/environment*.ts`
- Django URLs & auth: `server/Backend/urls.py`, `server/Backend/settings.py`
- Data models: `server/Apps/*/models.py` and corresponding `api/serializers.py` and `api/views.py`.

## Testing & linting
- Frontend tests: `npm test` (Karma/Jasmine). Lint: `npm run lint`.
- No explicit backend test harness discovered; check for `tests.py` or `TestCase` classes when adding tests.

## Quick debugging tips 💡
- If API calls return 401: check `currentUser` in localStorage (encrypted), and the `JwtInterceptor` header format.
- To add DB changes: update `models.py` and run Django migrations (`makemigrations` / `migrate`). The repo includes `Bazar4Database.sqlite3` — be cautious when modifying seed data.
- If API base URL needs changing, update the appropriate `environment.*.ts` and rebuild.

---
If anything above is missing or unclear, tell me which area (backend, frontend, auth, build) to expand and I will iterate. ✅
