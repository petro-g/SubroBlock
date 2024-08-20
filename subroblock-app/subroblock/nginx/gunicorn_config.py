import multiprocessing

# Gunicorn configuration file for Django

# Bind to the Unix socket
bind = "unix:/run/gunicorn.sock"

# Number of worker processes
workers = (multiprocessing.cpu_count() * 2) + 1

# Worker class for handling requests
worker_class = "gevent"

# Number of threads per worker process
threads = 2

# Set the maximum number of requests a worker will process before restarting
max_requests = 1000

# Timeout for worker processes to gracefully exit
timeout = 300

# Set the working directory of the application
chdir = "/app"

# Specify the location of your Django application
module = "subroblock.wsgi:application"

# Logging
accesslog = "/app/logs/gunicorn_access.log"
errorlog = "/app/logs/gunicorn_error.log"
loglevel = "info"
