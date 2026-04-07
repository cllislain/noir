#!/bin/sh
set -e

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py createsuperuser --no-input 2>/dev/null || true

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2
