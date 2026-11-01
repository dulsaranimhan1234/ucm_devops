# University Club Management System

UCM combines a React and Vite frontend, a Node.js and Express API, and a MySQL database. Docker Compose runs all three services together.

## Run the full app

1. Install and start Docker Desktop.
2. Copy `.env.example` to `.env` in the project root.
3. Replace both example values with private values. Use a strong MySQL password and a long random JWT secret.
4. Start the services:

   ```sh
   docker compose up -d --build
   ```

5. Open the app at [http://localhost:3000](http://localhost:3000).

The API is also reachable at [http://localhost:5001](http://localhost:5001), and MySQL is published on port `3307` for local database tools. The frontend sends `/api` requests through Nginx to the backend. Compose waits for MySQL and the API to become healthy before starting dependent services.

## Run the frontend in development mode

Keep Docker running and start the database and API with `docker compose up -d database backend`. Then install frontend dependencies and start Vite:

```sh
cd frontend
npm ci
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite forwards API requests to `http://localhost:5001`; set `VITE_PROXY_TARGET` if the backend is at a different address. To run the production-style frontend instead, use the full Compose setup above.

## Useful commands

```sh
docker compose ps                 # service status and health
docker compose logs -f             # follow logs
docker compose logs -f backend     # inspect API startup and database errors
docker compose stop                # stop services; keep database data
docker compose down                # remove containers and network; keep database data
```

MySQL files live in the named `mysql_data` Docker volume and survive `stop` and `down`. `docker compose down -v` deletes that volume and its database contents; use it only when you intentionally want to reset the database.

If a service does not start, check that `.env` exists and contains both required values, then review `docker compose ps` and the service logs. The backend reports missing database or JWT settings before it starts.

Never commit `.env`, database backups, or generated files. Keep `.env.example` as the safe template.
