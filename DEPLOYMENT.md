# Deployment Guide

This guide covers deploying Noir to **Render** (recommended) using **Supabase** for PostgreSQL and file storage. A Docker Compose VPS deployment is also documented.

---

## Table of Contents

1. [Render + Supabase Deployment (Recommended)](#1-render--supabase-deployment)
2. [Supabase Setup](#2-supabase-setup)
3. [Google OAuth Setup](#3-google-oauth-setup)
4. [VPS Deployment (Docker Compose)](#4-vps-deployment)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Render + Supabase Deployment

### Prerequisites

- GitHub account with the repo pushed
- Render account at [render.com](https://render.com)
- Supabase project (see [Section 2](#2-supabase-setup))

---

### Step 1 — Push code to GitHub

```bash
git add -A
git commit -m "feat: production configuration"
git push origin main
```

---

### Step 2 — Deploy the Backend (Web Service)

1. Go to [render.com/dashboard](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `noir-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `gunicorn config.wsgi:application --workers 2 --bind 0.0.0.0:$PORT --timeout 120`

4. Under **Environment Variables**, add all of these:

| Variable | Value |
|---|---|
| `DJANGO_SETTINGS_MODULE` | `config.settings.production` |
| `DJANGO_SECRET_KEY` | Generate a strong random string |
| `DJANGO_DEBUG` | `False` |
| `DJANGO_ENV` | `production` |
| `DJANGO_ALLOWED_HOSTS` | `noir-backend.onrender.com` (your actual service hostname) |
| `DATABASE_URL` | From Supabase (see Section 2) |
| `CORS_ALLOWED_ORIGINS` | `https://noir-frontend.onrender.com` |
| `CSRF_TRUSTED_ORIGINS` | `https://noir-frontend.onrender.com,https://noir-backend.onrender.com` |
| `GOOGLE_OAUTH_CLIENT_ID` | From Google Cloud Console |
| `AUTH_THROTTLE_RATE` | `10/hour` |
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `15` |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `7` |
| `SUPABASE_URL` | `https://<project>.supabase.co` |
| `SUPABASE_BUCKET` | `noir_journal` |
| `SUPABASE_KEY` | Supabase service key |
| `SUPABASE_S3_ACCESS_KEY_ID` | From Supabase S3 credentials (see Section 2) |
| `SUPABASE_S3_SECRET_ACCESS_KEY` | From Supabase S3 credentials |
| `SUPABASE_S3_REGION` | `ap-southeast-1` |
| `SECURE_SSL_REDIRECT` | `True` |

5. Click **Create Web Service**

---

### Step 3 — Migrations run automatically

Migrations and superuser creation run automatically via `backend/entrypoint.sh` on every deploy.

To create a superuser, set these env vars in the backend service **before** deploying:

| Variable | Value |
|---|---|
| `DJANGO_SUPERUSER_USERNAME` | your desired admin username |
| `DJANGO_SUPERUSER_EMAIL` | your admin email |
| `DJANGO_SUPERUSER_PASSWORD` | your admin password |

> **Note**: The Shell tab is only available on paid Render plans. The entrypoint script approach works on free tier.

---

### Step 4 — Deploy the Frontend (Static Site)

1. Go to Render dashboard → **New → Static Site**
2. Connect the same GitHub repo
3. Configure:
   - **Name**: `noir-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Publish Directory**: `dist`

4. Under **Environment Variables**, add:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://noir-backend.onrender.com` (your actual backend URL) |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |

5. Under **Redirects/Rewrites**, add a rewrite rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: Rewrite

   This makes React Router work correctly (all paths serve `index.html`).

6. Click **Create Static Site**

---

### Step 5 — Connect frontend URL to backend CORS

After both services are deployed, update the backend environment variables:

- `CORS_ALLOWED_ORIGINS` → your actual Render frontend URL
- `CSRF_TRUSTED_ORIGINS` → your actual Render frontend + backend URLs
- `DJANGO_ALLOWED_HOSTS` → your actual Render backend hostname

Trigger a **Manual Deploy** on the backend after updating env vars.

---

### Step 6 — Google OAuth redirect URIs

In Google Cloud Console → Your OAuth Client:

- **Authorized JavaScript origins**: add `https://noir-frontend.onrender.com`
- **Authorized redirect URIs**: add `https://noir-frontend.onrender.com`

---

## 2. Supabase Setup

### PostgreSQL Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string → URI**
3. Copy the connection string — this is your `DATABASE_URL`

### Storage Bucket

1. Go to **Storage → New Bucket**
2. Name: `noir_journal`
3. Set to **Public** (so uploaded files are accessible without auth)

### S3-Compatible Credentials

Supabase Storage is S3-compatible. To get credentials:

1. Go to **Storage → S3 Access**
2. Click **Generate new credentials**
3. Copy:
   - **Access Key ID** → `SUPABASE_S3_ACCESS_KEY_ID`
   - **Secret Access Key** → `SUPABASE_S3_SECRET_ACCESS_KEY`
4. The S3 endpoint is: `https://<project>.supabase.co/storage/v1/s3`

> **Region**: Use `ap-southeast-1` if your Supabase project is in Southeast Asia, otherwise check your project settings for the correct region.

---

## 3. Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. **Authorized JavaScript origins**:
   - `http://localhost:5173` (local dev)
   - `https://noir-frontend.onrender.com` (production)
5. **Authorized redirect URIs**:
   - `http://localhost:5173`
   - `https://noir-frontend.onrender.com`
6. Copy the **Client ID** → use as `GOOGLE_OAUTH_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`

---

## 4. VPS Deployment (Docker Compose)

For deploying to a DigitalOcean Droplet or similar Ubuntu VPS:

### Prerequisites

- Ubuntu 22.04+ VPS with Docker and docker-compose installed
- Domain name pointed at your server IP

### Setup

```bash
git clone https://github.com/yourusername/noir.git
cd noir
cp .env.example .env
# Edit .env with production values
nano .env
```

Set in `.env`:
```
DJANGO_SETTINGS_MODULE=config.settings.production
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECURE_SSL_REDIRECT=True
```

### Deploy

```bash
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

### SSL with Certbot

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com
```

---

## 5. Troubleshooting

### `DisallowedHost` error
Add your hostname to `DJANGO_ALLOWED_HOSTS` env var (comma-separated).

### CORS errors in browser
Ensure `CORS_ALLOWED_ORIGINS` includes your exact frontend URL (with `https://`, no trailing slash).

### CSRF errors on POST requests
Add your frontend and backend URLs to `CSRF_TRUSTED_ORIGINS`.

### Media files not showing
In production, files are served from Supabase Storage. Check:
- `SUPABASE_S3_ACCESS_KEY_ID` and `SUPABASE_S3_SECRET_ACCESS_KEY` are set
- The `noir_journal` bucket exists and is set to **Public**
- `SUPABASE_URL` matches your Supabase project URL exactly

### Static files not loading (404)
`collectstatic` runs automatically via `entrypoint.sh`. If missing, check the deploy logs for errors.

### Google OAuth `client_id not set correctly`
Vite bakes env vars at **build time**. If `VITE_GOOGLE_CLIENT_ID` is set in Render but the button still shows the wrong ID:
1. Ensure the value is committed in `frontend/.env.production` in the repo
2. Trigger a **Manual Deploy** after adding/changing env vars — static sites don't auto-rebuild on env changes

### Google OAuth `origin not allowed` (403)
Add your exact frontend URL to **Authorized JavaScript origins** in Google Cloud Console. Changes can take up to a few hours to propagate.

### Database `failed to resolve host 'db'`
The backend is using development settings. Set `DJANGO_SETTINGS_MODULE=config.settings.production` in Render backend environment.

### Database IPv6 / `Network is unreachable`
Render free tier only supports IPv4. Use the **Session pooler** connection string from Supabase (not the Direct Connection):
- Go to Supabase → **Connect** → **Session pooler** → copy URI
- The hostname will be `aws-X-region.pooler.supabase.com` on port `5432`

### `Tenant or user not found` on pooler connection
The pooler region in the URL doesn't match your Supabase project region. Use the URI from **Supabase → Connect** directly — don't construct it manually.

### Frontend API calls hitting frontend URL (405 errors)
`VITE_API_URL` was not set at build time. The app falls back to `/api/v1` which the static site serves as 404/405. Fix: commit `frontend/.env.production` with the correct `VITE_API_URL` and redeploy.

### Frontend deployed as Docker service instead of Static Site
If Render is running nginx and you see the Docker logs, the service type is wrong. Delete the service and recreate as **Static Site** (not Web Service). The `nginx.conf` in the repo is for local Docker only.

### Render free tier spin-down
Free tier services spin down after inactivity. The first request after spin-down may take 30+ seconds. Upgrade to a paid plan to avoid this.
