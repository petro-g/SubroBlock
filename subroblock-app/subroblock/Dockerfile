# Use the official Python base image
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SUPERUSER_PASSWORD SubroBlock!
ENV DJANGO_SUPERUSER_USERNAME subroblock
ENV DJANGO_SUPERUSER_EMAIL user@subroblock.com


# Set the working directory in the container
WORKDIR /app

ARG AWS_DB_NAME
ARG AWS_USER
ARG AWS_PASSWORD
ARG AWS_HOST
ARG AWS_PORT

RUN mkdir -p /etc/logs
RUN mkdir -p /run
RUN mkdir -p /app/logs

# Copy the requirements file into the container
COPY requirements.txt /app/


# Install dependencies
RUN pip install --upgrade pip setuptools && pip install -r requirements.txt

# Copy the application code into the container
COPY /subroblock/nginx/entry.sh /entry.sh
COPY . /app/

RUN python manage.py migrate
RUN python manage.py collectstatic --no-input


# Create app super user if not exists
RUN python manage.py ensure_adminuser \
        --no-input \
        --username $DJANGO_SUPERUSER_USERNAME \
        --email $DJANGO_SUPERUSER_EMAIL

# Expose the Gunicorn port for Development

# Command to run when the container starts
RUN chmod +x /entry.sh
CMD ["/entry.sh"]
