routes of Next.js app

[pages/api](./api/README.md) contains client -> NextJs server -> real backend server requests

other folder contain layout of page and unique not reusable components for it's layout

keep route name 1 word, if possible, for easy routing and more elegant nested urls. people share links and see them every day. doesn't matter for backend, but for frontend it's important

try to avoid exposing GET params in url like `/api/endpoint?param=value`. Instead, if data sent - use POST request with body containing params
