# Noir — Personal Journal App

> A private, themeable journal web app built with Django REST Framework and React.

---

## Features

- **Journaling** — Create, edit, and delete entries with a live markdown editor
- **Moods & Tags** — Tag entries with color-coded labels; record your mood per entry
- **Search & Filter** — Full-text search with highlighting, mood/tag/date-range filters, infinite scroll
- **Themes** — 10 built-in themes (Light, Dark, Kuromi, Cinnamoroll, Bad Badtz-Maru, Noir, My Melody, Pompompurin) plus a custom theme builder with JSON export/import
- **Stickers** — Place and resize emoji stickers on entries from 4 themed packs
- **Handwriting Canvas** — Freehand drawing canvas per entry with pen/eraser tools and SVG export
- **Insights** — Mood trend chart, monthly recap, writing heatmap, streak tracking, and "On This Day" memories
- **Trash** — Soft delete with restore; permanent deletion from trash
- **Edit History** — Every save creates a version snapshot; restore any previous version
- **Shared Links** — Generate a public read-only link for any entry (no login required)
- **Image Attachments** — Attach images to entries
- **Entry Templates** — Start from pre-defined templates (Gratitude, Daily Reflection, etc.)
- **Autosave Draft** — New entries auto-save to localStorage with 1-second debounce
- **Account** — Change password, update display name/avatar, export all entries as ZIP, delete account
- **Google OAuth** — Sign in with Google in addition to email/password
- **Admin Panel** — Full-width admin with tag management, shared links, and settings pages
- **Security** — JWT auth, rate limiting, inactivity auto-lock, HTTPS in production

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 + CSS custom properties (`--j-*` tokens) |
| State / Data | TanStack React Query 5 + Axios |
| Routing | React Router DOM 6 |
| Markdown | @uiw/react-md-editor |
| Charts | recharts |
| OAuth (client) | @react-oauth/google |
| Backend | Django 5.1 + Django REST Framework 3.15 |
| Auth | JWT (djangorestframework-simplejwt) + Google OAuth (google-auth) |
| Database | PostgreSQL 16 (psycopg3) |
| Filtering | django-filter |
| Infrastructure | Docker + docker-compose |
| Production web | Nginx 1.27 (frontend), Gunicorn (backend) |

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
- _(Optional)_ Node.js 20+ for running the frontend outside Docker

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/noir.git
   cd noir
   ```

2. **Copy the environment file**

   ```bash
   cp .env.example .env
   ```

3. **Edit `.env`** with your values — at minimum change the secret key and database password (see [Environment Variables](#environment-variables) below)

4. **Start all services**

   ```bash
   docker-compose up --build
   ```

5. **Open the app** at [http://localhost:5173](http://localhost:5173)

### Creating a superuser

```bash
docker-compose exec backend python manage.py createsuperuser
```

The Django admin panel is at [http://localhost:8000/admin/](http://localhost:8000/admin/).

---

### Environment Variables

Copy `.env.example` to `.env` and fill in the values below.

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_SECRET_KEY` | _(required)_ | Django secret key — use a long random string in production |
| `DJANGO_DEBUG` | `True` | Set to `False` in production |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated list of allowed hostnames |
| `POSTGRES_DB` | `journal_db` | PostgreSQL database name |
| `POSTGRES_USER` | `journal_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | _(required)_ | PostgreSQL password — use a strong value |
| `POSTGRES_HOST` | `db` | Database host (service name in docker-compose) |
| `POSTGRES_PORT` | `5432` | Database port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated allowed CORS origins |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `15` | Access token lifetime in minutes |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `7` | Refresh token lifetime in days |
| `GOOGLE_OAUTH_CLIENT_ID` | _(optional)_ | Google OAuth 2.0 client ID (backend) |
| `AUTH_THROTTLE_RATE` | `10/hour` | Rate limit for auth endpoints |
| `SECURE_SSL_REDIRECT` | `True` | Redirect HTTP to HTTPS — set `False` for local dev |
| `DJANGO_SETTINGS_MODULE` | `config.settings.development` | Settings module to use |
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | API base URL consumed by the frontend build |
| `VITE_GOOGLE_CLIENT_ID` | _(optional)_ | Google OAuth client ID for the frontend |

---

## Development

The development docker-compose mounts source directories as volumes, so changes are reflected immediately — frontend via Vite HMR, backend via Django's auto-reloader with `runserver`.

### Frontend (http://localhost:5173)

```bash
# Inside the container
docker-compose exec frontend sh

# Or locally (requires Node.js 20+)
cd frontend
npm install
npm run dev       # dev server with HMR
npm run build     # production build
npm run lint      # ESLint
```

### Backend (http://localhost:8000)

```bash
# Run database migrations
docker-compose exec backend python manage.py migrate

# Create a superuser
docker-compose exec backend python manage.py createsuperuser

# Collect static files
docker-compose exec backend python manage.py collectstatic --noinput

# Run tests
docker-compose exec backend pytest

# Django shell
docker-compose exec backend python manage.py shell
```

---

## Themes

Noir ships with 10 built-in themes selectable from the sidebar:

| Theme | Description |
|-------|-------------|
| Light | Clean default light mode |
| Dark | Comfortable dark mode |
| Kuromi | Kawaii goth — deep purple + fuchsia |
| Cinnamoroll | Soft baby blue + lavender |
| Bad Badtz-Maru | Bold black/white + electric yellow |
| Noir | OLED black + `#c8f135` lime accent |
| My Melody | Pink and white Sanrio aesthetic |
| Pompompurin | Warm golden yellow + brown |

The **Custom Theme Builder** (Settings → Custom Theme) lets you define your own palette, preview it live, and export/import it as a JSON file.

See [THEMING.md](THEMING.md) for the full theming guide, CSS token reference, and instructions for adding new themes.

---

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full production deployment guide covering:

- VPS (DigitalOcean / Ubuntu 22.04) with Docker Compose
- Google OAuth setup in Google Cloud Console
- SSL with Let's Encrypt / Certbot
- Render.com alternative PaaS deployment

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit using conventional commits: `git commit -m "feat: add my feature"`
4. Push and open a pull request against `main`

Please ensure all tests pass and new features include appropriate test coverage (minimum 80%).

---

## License

MIT License — see the LICENSE file for details.
