## simulator_torgi

Standalone frontend-only repository for the "Симулятор торгов" service.

### Structure

- `frontend/` - Next.js 15 + TypeScript + Tailwind
- `Caddyfile` - reverse proxy for production HTTPS
- `docker-compose.yml` - local dev run
- `docker-compose.prod.yml` - production run

### Local run (without Docker)

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000/simulator-torgov/play`

### Local run (Docker dev)

```bash
docker compose up --build
```

Open: `http://localhost:3000/simulator-torgov/play`

### Production run (on server)

1. Create `.env`:

```bash
cp .env.prod.example .env
```

2. Set domain in `.env`:

```bash
SITE_DOMAIN=onreza.ru
```

3. Start production stack:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Update lots from Google Sheet (sale tab)

```bash
cd frontend
npm run lots:sync
```

If images need to be downloaded/re-downloaded:

```bash
cd frontend
DOWNLOAD_IMAGES=1 npm run lots:sync
```

