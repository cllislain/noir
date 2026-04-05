# Technical Reference

A developer-facing document describing the architecture, data flow, and internals of this journaling web application.

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Repository Layout](#2-repository-layout)
3. [Infrastructure & Containers](#3-infrastructure--containers)
4. [Backend](#4-backend)
   - [Django Project Structure](#41-django-project-structure)
   - [Custom User Model](#42-custom-user-model)
   - [Data Models](#43-data-models)
   - [Authentication](#44-authentication)
   - [REST API Design](#45-rest-api-design)
   - [Filtering, Search & Ordering](#46-filtering-search--ordering)
   - [Pagination](#47-pagination)
   - [Insights Endpoints](#48-insights-endpoints)
   - [Settings & Configuration](#49-settings--configuration)
5. [Frontend](#5-frontend)
   - [Project Layout](#51-project-layout)
   - [Routing & Route Protection](#52-routing--route-protection)
   - [Auth Layer](#53-auth-layer)
   - [API Client](#54-api-client)
   - [Server State — React Query](#55-server-state--react-query)
   - [Theming System](#56-theming-system)
   - [Component Conventions](#57-component-conventions)
6. [Fullstack Data Flow](#6-fullstack-data-flow)
   - [Request Lifecycle](#61-request-lifecycle)
   - [Auth Flow](#62-auth-flow)
   - [Token Refresh Race Condition Guard](#63-token-refresh-race-condition-guard)
   - [Soft-Delete / Trash Flow](#64-soft-delete--trash-flow)
7. [API Reference](#7-api-reference)

---

## 1. Stack Overview

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18 |
| Language | TypeScript | — |
| Build tool | Vite | 8 |
| Styling | Tailwind CSS + CSS custom properties (`--j-*`) | 3 |
| Server state | TanStack React Query | 5 |
| Routing | React Router DOM | 6 |
| HTTP client | Axios | 1.7 |
| Markdown editor | @uiw/react-md-editor | 4 |
| Charts | Recharts | 2 |
| Backend framework | Django | 5.1 |
| API layer | Django REST Framework | 3.15 |
| Auth | djangorestframework-simplejwt | — |
| Filtering | django-filter | — |
| Database | PostgreSQL | 16 |
| DB driver | psycopg3 | — |
| Container runtime | Docker + docker-compose | — |
| Production web server | Gunicorn + Nginx | — |

---

## 2. Repository Layout

```
journal-web-app/
├── docker-compose.yml       # Orchestrates db / backend / frontend services
├── backend/
│   ├── config/              # Django project config (settings, urls, wsgi)
│   │   └── settings/
│   │       ├── base.py      # Shared settings
│   │       ├── development.py
│   │       └── production.py
│   └── apps/
│       ├── accounts/        # User model, auth endpoints
│       ├── entries/         # Journal entries, trash, insights
│       └── tags/            # User-owned tags
└── frontend/
    ├── src/
    │   ├── api/             # Axios client + typed endpoint wrappers
    │   ├── auth/            # AuthContext, AuthProvider, ProtectedRoute, useAuth
    │   ├── components/      # Shared UI components
    │   ├── features/        # Feature-level hooks (entries, insights, search, tags)
    │   ├── pages/           # Route-level page components
    │   ├── theme/           # ThemeContext, ThemeProvider, theme definitions
    │   ├── toast/           # Toast notification context + provider
    │   └── types/           # Shared TypeScript interfaces
    └── tests/               # Vitest unit/component tests + MSW mocks
```

---

## 3. Infrastructure & Containers

Three Docker services are defined in `docker-compose.yml`:

| Service | Image / Build | Port | Notes |
|---|---|---|---|
| `db` | `postgres:16-alpine` | 5433 → 5432 | Health-checked with `pg_isready` before backend starts |
| `backend` | `./backend/Dockerfile` | 8000 | Runs migrations + collectstatic on startup, then Gunicorn with 2 workers |
| `frontend` | `./frontend/Dockerfile` target `dev` | 5173 | Vite dev server with polling enabled for file-watch inside Docker |

**Backend Dockerfile** uses `python:3.12-slim`, installs `libpq-dev` / `gcc` for psycopg3 compilation, then copies `requirements.txt` and source.

**Frontend Dockerfile** has three stages:
- `dev` — Node 20 Alpine, runs `npm run dev --host 0.0.0.0`
- `build` — Node 20 Alpine, runs `npm run build` to produce `/app/dist`
- `prod` — Nginx 1.27 Alpine, copies `/app/dist` into the nginx document root and applies `nginx.conf`

**Nginx** in production serves the built SPA and proxies `/api/` requests to `http://backend:8000`, so the frontend never needs to know the backend's host directly.

**Vite dev proxy** (`vite.config.ts`) proxies `/api` → `http://backend:8000` during development, mirroring production behavior so no CORS issue arises while developing.

---

## 4. Backend

### 4.1 Django Project Structure

The Django project lives in `backend/config/`. The `ROOT_URLCONF` is `config.urls`, which mounts three app-level URL namespaces:

```
/admin/             → Django admin
/api/v1/auth/       → apps.accounts.urls
/api/v1/entries/    → apps.entries.urls  (DefaultRouter)
/api/v1/tags/       → apps.tags.urls
```

All apps live under `backend/apps/` and are registered in `INSTALLED_APPS` as `apps.accounts`, `apps.entries`, `apps.tags`.

The active settings module is selected via the `DJANGO_SETTINGS_MODULE` environment variable (set to `config.settings.development` in `docker-compose.yml`). Secret values are read from the environment using `python-decouple`.

### 4.2 Custom User Model

```python
# apps/accounts/models.py
class User(AbstractUser):
    id = UUIDField(primary_key=True, default=uuid4)
    email = EmailField(unique=True)
    USERNAME_FIELD = "email"   # login with email, not username
```

- `AUTH_USER_MODEL = "accounts.User"` in `base.py` makes this the project-wide user.
- UUID primary keys are used on all models to avoid enumerable integer IDs.

### 4.3 Data Models

**Entry**

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | Auto-generated |
| `author` | FK → User | Cascade delete |
| `title` | CharField (255) | — |
| `body` | TextField | Markdown content |
| `mood` | CharField choices | `happy / neutral / sad / anxious / grateful` |
| `is_favorite` | BooleanField | — |
| `tags` | M2M → Tag | — |
| `stickers` | JSONField | List of `{id, emoji, x, y, size}` objects |
| `canvas_data` | TextField | SVG / base64 handwriting data |
| `is_deleted` | BooleanField (db_index) | Soft-delete flag |
| `deleted_at` | DateTimeField (nullable) | Set on soft-delete |
| `created_at` / `updated_at` | DateTimeField | auto_now_add / auto_now |

`Entry.soft_delete()` and `Entry.restore()` are model-level methods that update only the relevant fields via `save(update_fields=[...])`.

**Tag**

| Field | Type | Notes |
|---|---|---|
| `id` | UUID PK | — |
| `owner` | FK → User | Cascade delete |
| `name` | CharField (50) | Unique per owner |
| `color` | CharField (7) | Hex color string |

`unique_together = ("owner", "name")` enforces per-user tag uniqueness at the database level.

### 4.4 Authentication

JWT-based via `djangorestframework-simplejwt`.

| Endpoint | Method | Auth required | Description |
|---|---|---|---|
| `/api/v1/auth/register/` | POST | No | Creates user, returns tokens + user object |
| `/api/v1/auth/login/` | POST | No | Returns access + refresh tokens |
| `/api/v1/auth/refresh/` | POST | No | Rotates refresh token, returns new access |
| `/api/v1/auth/logout/` | POST | Yes | Blacklists the submitted refresh token |
| `/api/v1/auth/me/` | GET | Yes | Returns the authenticated user's profile |

**Token lifetimes** (configurable via env):

| Token | Default lifetime |
|---|---|
| Access | 15 minutes |
| Refresh | 7 days |

`ROTATE_REFRESH_TOKENS = True` and `BLACKLIST_AFTER_ROTATION = True` mean every use of the refresh token issues a new pair and invalidates the old one. The `rest_framework_simplejwt.token_blacklist` app stores blacklisted JTIs in the database.

All protected views use `DEFAULT_PERMISSION_CLASSES = (IsAuthenticated,)` and `DEFAULT_AUTHENTICATION_CLASSES = (JWTAuthentication,)` from `REST_FRAMEWORK` settings, so no per-view decoration is needed.

### 4.5 REST API Design

`apps/entries/views.py` exposes a single `EntryViewSet(ModelViewSet)` registered on a `DefaultRouter`. The router automatically generates standard CRUD routes, and extra `@action` decorators add custom endpoints:

| Action | Method | URL | Description |
|---|---|---|---|
| `list` | GET | `/entries/` | Active entries (paginated, filterable) |
| `retrieve` | GET | `/entries/{id}/` | Single entry detail |
| `create` | POST | `/entries/` | Create new entry |
| `update` / `partial_update` | PUT / PATCH | `/entries/{id}/` | Full / partial update |
| `destroy` | DELETE | `/entries/{id}/` | Soft-delete (overrides default hard-delete) |
| `trash` | GET | `/entries/trash/` | List soft-deleted entries |
| `restore` | POST | `/entries/{id}/restore/` | Restore from trash |
| `hard_delete` | DELETE | `/entries/{id}/hard-delete/` | Permanently delete from trash |
| `heatmap` | GET | `/entries/insights/heatmap/` | Entry counts per day for a month |
| `mood_trend` | GET | `/entries/insights/mood-trend/` | Daily per-mood counts over N days |
| `monthly_recap` | GET | `/entries/insights/monthly-recap/` | Month totals, mood distribution, top tags |
| `on_this_day` | GET | `/entries/insights/on-this-day/` | Past entries on the same calendar date |
| `streak` | GET | `/entries/insights/streak/` | Current streak, longest streak, today's count |

**`get_queryset`** automatically scopes to `author=request.user` and switches between `is_deleted=False` (normal) and `is_deleted=True` (trash) based on the current action. This means users can never access each other's entries.

**`get_serializer_class`** dispatches four serializers per action:
- `EntryListSerializer` — lightweight (no full body) for list views
- `EntryDetailSerializer` — full representation for retrieve/restore
- `EntryWriteSerializer` — accepts `tag_ids: list[UUID]` for create/update
- `EntryTrashSerializer` — includes `deleted_at` for trash list

### 4.6 Filtering, Search & Ordering

`EntryFilter` (django-filter):

| Filter param | Model field | Lookup |
|---|---|---|
| `tags` | `tags__id` | `in` (comma-separated UUIDs) |
| `mood` | `mood` | `exact` |
| `is_favorite` | `is_favorite` | boolean |
| `created_after` | `created_at` | `gte` |
| `created_before` | `created_at` | `lte` |

DRF `SearchFilter` searches `title` and `body` (full-text ILIKE).

DRF `OrderingFilter` allows ordering by `created_at`, `updated_at`, `title`.

### 4.7 Pagination

`DEFAULT_PAGINATION_CLASS = PageNumberPagination` with `PAGE_SIZE = 20`. Responses follow the DRF envelope:

```json
{
  "count": 47,
  "next": "http://…/entries/?page=3",
  "previous": "http://…/entries/?page=1",
  "results": [...]
}
```

### 4.8 Insights Endpoints

All insights endpoints are `@action(detail=False)` on `EntryViewSet`, scoped to `request.user`.

- **Heatmap** — Accepts `?year=&month=`, returns `[{date, count}]` for each day of that month using `TruncDate` + `Count`.
- **Mood Trend** — Accepts `?days=N` (default 90, max 365), returns `[{date, happy, neutral, sad, anxious, grateful}]` via a single annotated queryset.
- **Monthly Recap** — Returns `total_entries`, `mood_distribution`, and top 5 `top_tags` for the current calendar month.
- **On This Day** — Returns entries from previous years that share the same month/day, with a computed `years_ago` field.
- **Streak** — Accepts `?tz=` (IANA timezone name), computes current streak and longest streak from the entry date history.

### 4.9 Settings & Configuration

All secrets are read from environment variables via `python-decouple`. Required vars:

| Variable | Used for |
|---|---|
| `DJANGO_SECRET_KEY` | Django `SECRET_KEY` |
| `POSTGRES_DB` / `USER` / `PASSWORD` / `HOST` / `PORT` | Database connection |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | Access token lifetime (default 15) |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | Refresh token lifetime (default 7) |
| `ALLOWED_HOSTS` | Django `ALLOWED_HOSTS` (Csv) |
| `CORS_ALLOWED_ORIGINS` | CORS whitelist (Csv) |

---

## 5. Frontend

### 5.1 Project Layout

```
src/
├── api/
│   ├── client.ts        # Axios instance + request/response interceptors
│   └── endpoints.ts     # Typed API functions (authApi, entriesApi, insightsApi, tagsApi)
├── auth/
│   ├── AuthContext.tsx  # React context interface
│   ├── AuthProvider.tsx # Session bootstrap, login/logout/register logic
│   ├── ProtectedRoute.tsx
│   └── useAuth.ts       # useContext wrapper
├── components/          # Shared presentational components
├── features/
│   ├── entries/         # useEntries, useInfiniteEntries, useEntry, mutations
│   ├── insights/        # useInsights hooks
│   ├── search/          # useSearch hook (filter state)
│   └── tags/            # useTags, tag mutation hooks
├── pages/               # Route-level page components
├── theme/
│   ├── ThemeContext.tsx
│   ├── ThemeProvider.tsx
│   └── themes.ts        # THEMES array — id, label, htmlClass, swatches, icon
├── toast/               # ToastContext + ToastProvider
└── types/index.ts       # Shared TypeScript interfaces
```

The `@` path alias (configured in `tsconfig.json` and `vite.config.ts`) resolves to `src/`, so all imports use `@/api/client` style rather than relative paths.

### 5.2 Routing & Route Protection

`App.tsx` composes providers in order (outermost to innermost):

```
ThemeProvider
  ToastProvider
    BrowserRouter
      AuthProvider
        Routes
```

Public routes: `/login`, `/register`.

All other routes are wrapped in `<ProtectedRoute>`, which renders a loading spinner while `AuthProvider` is bootstrapping (checking `localStorage` on mount), then redirects to `/login` if `isAuthenticated` is false. The `location` is passed as redirect state so the user is returned to the originally requested page after login.

| Path | Component |
|---|---|
| `/` | `DashboardPage` |
| `/entries/new` | `EntryFormPage` |
| `/entries/:id` | `EntryPage` |
| `/entries/:id/edit` | `EntryFormPage` |
| `/trash` | `TrashPage` |
| `/insights` | `InsightsPage` |
| `*` | `NotFoundPage` |

### 5.3 Auth Layer

`AuthProvider` manages authentication state:

1. **On mount** — reads `access_token` from `localStorage`, calls `GET /api/v1/auth/me/` to rehydrate the `user` object. Clears tokens on failure.
2. **Login** — calls `POST /auth/login/`, stores both tokens in `localStorage`, then fetches `/auth/me/` to populate `user`.
3. **Register** — calls `POST /auth/register/`, stores tokens, sets `user` from the response body (no second request needed).
4. **Logout** — calls `POST /auth/logout/` with the refresh token (best-effort blacklist), then clears both tokens, nulls `user`, and calls `queryClient.clear()` to wipe all cached data.
5. **Forced logout** — the Axios response interceptor fires a `auth:logout` custom DOM event when a token refresh fails. `AuthProvider` listens for this and clears state.

### 5.4 API Client

`src/api/client.ts` creates a single Axios instance with `baseURL = "/api/v1"`.

**Request interceptor** — attaches `Authorization: Bearer <access_token>` from `localStorage` to every outgoing request.

**Response interceptor** — on a `401` response:
1. Skips retry if the failing request was already a retry, or if it was a login/refresh call.
2. If a refresh is already in progress (another request raced to this point), queues the request and resolves it once the refresh completes.
3. Otherwise, reads `refresh_token` from `localStorage`, calls `POST /auth/refresh/`, stores the new access token, drains the pending queue with the new token, and retries the original request.
4. If no refresh token exists, dispatches `auth:logout` to force the user back to the login page.

### 5.5 Server State — React Query

All server data is managed by TanStack React Query. Cache keys follow a hierarchical array pattern:

| Key | Data |
|---|---|
| `["entries", filters]` | Paginated entry list |
| `["entries", "infinite", filters]` | Infinite scroll entry list |
| `["entries", id]` | Single entry |
| `["entries", "trash"]` | Trash list |
| `["entries", "streak"]` | Streak data |
| `["tags"]` | All tags |
| `["insights", ...]` | Insight data |

Mutations call `queryClient.invalidateQueries` on success to trigger refetches of affected keys. For example, `useDeleteEntry` invalidates `["entries"]`, `["entries", "trash"]`, and `["entries", "streak"]`.

**Infinite scrolling** (`useInfiniteEntries`) uses `useInfiniteQuery`. The `getNextPageParam` function parses `?page=N` from DRF's `next` URL string. An `IntersectionObserver` sentinel element at the bottom of the list triggers `fetchNextPage` when it enters the viewport (200px rootMargin).

### 5.6 Theming System

The theme system applies CSS custom properties (`--j-*` tokens) to the `<html>` element via a class name (`theme-light`, `theme-dark`, `theme-kuromi`, etc.). Tailwind utilities then reference these tokens through the Tailwind config.

`themes.ts` exports a `THEMES` array. To add a new theme:
1. Add a `Theme` entry to the array with `id`, `label`, `htmlClass`, `swatches`, and `icon`.
2. Add a matching `.theme-<htmlClass> { --j-*: ... }` block in `src/styles/global.css`.

The `ThemeProvider` reads from and writes to `localStorage` under the key `journal-theme`. `ThemeSwitcher` iterates the `THEMES` array, making it automatically pick up any new themes.

### 5.7 Component Conventions

- **Styling** — Tailwind utility classes for layout; `--j-*` CSS variables for colors so all themes are respected. No inline `style` objects for colors.
- **Loading states** — skeleton cards (Tailwind `animate-pulse`) shown while data is fetching, not a global spinner.
- **Toast notifications** — `ToastContext` provides an `addToast()` function; mutations call it on success/error.
- **Sort persistence** — sort order is stored in `localStorage` under `journal-sort` and restored on page load inside `useSearch`.

---

## 6. Fullstack Data Flow

### 6.1 Request Lifecycle

```
User action (click / form submit)
  │
  ▼
React Query mutation / query hook
  │
  ▼
endpoint function in endpoints.ts  (e.g. entriesApi.create(data))
  │
  ▼
Axios request interceptor → attaches Bearer token
  │
  ▼
HTTP request  →  Vite proxy (dev) / Nginx (prod)  →  Gunicorn
  │
  ▼
Django middleware stack (CORS, CSRF, Auth)
  │
  ▼
JWTAuthentication resolves request.user
  │
  ▼
EntryViewSet.get_queryset() — filters to request.user's data
  │
  ▼
DjangoFilterBackend + SearchFilter + OrderingFilter applied
  │
  ▼
PageNumberPagination wraps results
  │
  ▼
Serializer → JSON response
  │
  ▼
Axios response interceptor (pass-through on 2xx)
  │
  ▼
React Query caches response → component re-renders
```

### 6.2 Auth Flow

```
POST /auth/login/
  └─ djangorestframework-simplejwt validates credentials
  └─ Returns { access, refresh }
     │
     Frontend stores both in localStorage
     │
  Every subsequent request:
     └─ Axios interceptor reads access from localStorage
     └─ Authorization: Bearer <access> header added

POST /auth/logout/
  └─ Refresh token passed in body
  └─ simplejwt blacklists the JTI
  └─ Frontend clears localStorage + React Query cache
```

### 6.3 Token Refresh Race Condition Guard

When multiple requests fail simultaneously with a 401:

1. The first request sets `isRefreshing = true` and calls `/auth/refresh/`.
2. Every subsequent 401 during that window pushes a resolver into `pendingRequests[]`.
3. When the refresh resolves, `processQueue(newToken)` calls every pending resolver, retrying their original requests with the new token.
4. `isRefreshing` is reset to `false` so the next independent refresh cycle can begin.

This prevents multiple simultaneous refresh calls that would all fail after the first one rotates the token.

### 6.4 Soft-Delete / Trash Flow

```
User clicks "Delete" on an entry
  │
  ▼
useDeleteEntry mutation → DELETE /api/v1/entries/{id}/
  │
  ▼
EntryViewSet.perform_destroy()
  │  (does NOT call instance.delete())
  └─ instance.soft_delete()
       └─ sets is_deleted=True, deleted_at=now()
       └─ save(update_fields=[...])
  │
  ▼
204 No Content response
  │
  ▼
React Query invalidates ["entries"] + ["entries","trash"] + ["entries","streak"]
  │
  ▼
Entry disappears from dashboard, appears in TrashPage

User clicks "Delete forever" on a trash entry
  │
  ▼
useHardDeleteEntry → DELETE /api/v1/entries/{id}/hard-delete/
  └─ EntryViewSet.hard_delete() → entry.delete() (real DB delete)
```

---

## 7. API Reference

### Auth

| Method | Endpoint | Body | Returns |
|---|---|---|---|
| POST | `/api/v1/auth/register/` | `{email, username, password, password_confirm}` | `{user, access, refresh}` |
| POST | `/api/v1/auth/login/` | `{email, password}` | `{access, refresh}` |
| POST | `/api/v1/auth/refresh/` | `{refresh}` | `{access, refresh}` |
| POST | `/api/v1/auth/logout/` | `{refresh}` | 204 |
| GET | `/api/v1/auth/me/` | — | `User` |

### Entries

| Method | Endpoint | Query params | Returns |
|---|---|---|---|
| GET | `/api/v1/entries/` | `search, tags, mood, is_favorite, created_after, created_before, ordering, page, page_size` | `PaginatedResponse<Entry>` |
| POST | `/api/v1/entries/` | — | `Entry` |
| GET | `/api/v1/entries/{id}/` | — | `Entry` |
| PATCH | `/api/v1/entries/{id}/` | — | `Entry` |
| DELETE | `/api/v1/entries/{id}/` | — | 204 (soft-delete) |
| GET | `/api/v1/entries/trash/` | `page, page_size` | `PaginatedResponse<Entry>` |
| POST | `/api/v1/entries/{id}/restore/` | — | `Entry` |
| DELETE | `/api/v1/entries/{id}/hard-delete/` | — | 204 |

### Insights

| Method | Endpoint | Query params | Returns |
|---|---|---|---|
| GET | `/api/v1/entries/insights/heatmap/` | `year, month` | `[{date, count}]` |
| GET | `/api/v1/entries/insights/mood-trend/` | `days` (default 90, max 365) | `[MoodTrendPoint]` |
| GET | `/api/v1/entries/insights/monthly-recap/` | — | `MonthlyRecap` |
| GET | `/api/v1/entries/insights/on-this-day/` | — | `[OnThisDayEntry]` |
| GET | `/api/v1/entries/insights/streak/` | `tz` (IANA timezone) | `StreakData` |

### Tags

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/api/v1/tags/` | `Tag[]` |
| POST | `/api/v1/tags/` | `Tag` |
| PATCH | `/api/v1/tags/{id}/` | `Tag` |
| DELETE | `/api/v1/tags/{id}/` | 204 |
