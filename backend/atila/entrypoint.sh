#!/bin/sh

# Wait for database to be ready (optional, but good practice. For now, we trust wait-for-it or depends_on somewhat, or just fail and restart)
# Simpler approach: Apply migrations

echo "Apply database migrations"
python manage.py migrate

echo "Creating default admin user"
python create_admin_script.py

echo "Starting server"
if [ "$DEBUG" = "True" ]; then
    echo "Running in DEVELOPMENT mode (runserver)"
    python manage.py runserver 0.0.0.0:8000
else
    echo "Running in PRODUCTION mode (gunicorn)"
    # Cloud Run injects the PORT environment variable (default 8080)
    # We bind to 0.0.0.0:$PORT
    gunicorn atila.wsgi:application --bind 0.0.0.0:${PORT:-8080}
fi
