# Use the official Node.js runtime as the base image
# FROM node:18 as build
# ARG CLIENT_PATH="/subroblock/client/"
# # Set the working directory in the container
# WORKDIR /app

# # Copy package.json and package-lock.json to the working directory
# COPY ${CLIENT_PATH}package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the entire application code to the container
# COPY ${CLIENT_PATH} .

# # Build the React app for production
# RUN npm run build

# Use Nginx as the production server
FROM nginx:alpine

# Copy the built React app to Nginx's web server directory
# COPY --from=build /app/build /etc/nginx/html
# --------------------------------------------------------
# # Use the official Nginx base image
# FROM nginx:latest

ARG CURRENT_PATH="/subroblock/nginx/"

COPY ${CURRENT_PATH}index.html /etc/nginx/html/
COPY ./static/ /etc/nginx/html/v1/static/

# Make Dir for Nginx Logs
RUN mkdir -p /etc/logs
RUN mkdir -p /app/logs
RUN mkdir -p /app/static
RUN mkdir -p /run

# Remove the default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/nginx.conf

# Copy your custom Nginx configuration file
COPY ${CURRENT_PATH}nginx.conf /etc/nginx/
COPY ${CURRENT_PATH}server.crt /etc/nginx/conf.d/rootCA.crt
COPY ${CURRENT_PATH}server.key /etc/nginx/conf.d/rootCA.key

# COPY ./static/ /app/static/
COPY ${CURRENT_PATH}favicon.ico /var/www/media/images/

# Copy gunicorn to conf dir
COPY ${CURRENT_PATH}gunicorn.socket /etc/systemd/system/gunicorn.socket

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]