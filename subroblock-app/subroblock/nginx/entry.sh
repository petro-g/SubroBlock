#!/bin/bash

# Start Gunicorn (WSGI) for Django
gunicorn -c /app/subroblock/nginx/gunicorn_config.py subroblock.wsgi:application 
# &

# Start Celery worker for 'subroblock' app with INFO logging level.
# celery -A subroblock worker --loglevel=INFO &

# Start Daphne (ASGI) for Django Channels
# daphne -b 0.0.0.0 -p 8081 subroblock.asgi:application 
