# LinkSnip

URL shortener with analytics. Paste long link, get short one. No sign-up needed. Terminal aesthetic.

## Tech

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL
- **Deploy**: Render (backend), Cloudflare Pages (frontend)

## Local Setup

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14

### Database

```bash
# create database
createdb urlshortener

# or via psql
psql -c "CREATE DATABASE urlshortener;"
```

Run the schema:

```bash
psql -d urlshortener -f database/schema.sql
```

### Backend

```bash
cd backend
npm install
cp .env.example .env # fill in DATABASE_URL, BASE_URL, CORS_ORIGIN
npm run dev # runs on http://localhost:5000
```

### Frontend

```bash
cd frontend
npm install
npm run dev # runs on http://localhost:5173
```

## Environment Variables

```env
# backend/.env
PORT=5000
DATABASE_URL=postgres://user:pass@localhost:5432/urlshortener
BASE_URL=http://localhost:5000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

## Docker (quick start)

```bash
docker compose up --build
```

Frontend at `http://localhost:5173`, backend at `http://localhost:5000`.

## API

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/shorten` | Create short URL. Body: `{ url, customCode?, expiresAt? }` |
| GET | `/:code` | Redirect to original URL, increments click count |
| GET | `/api/urls` | List all URLs with stats |
| DELETE | `/api/urls/:code` | Delete a URL |

### Shorten Request

```bash
curl -X POST http://localhost:5000/api/shorten \
 -H "Content-Type: application/json" \
 -d '{"original_url": "https://example.com/very/long/path"}'
```

Response:

```json
{
 "shortUrl": "http://localhost:5000/aB12Cd",
 "original_url": "https://example.com/very/long/path",
 "clicks": 0,
 "created_at": "2026-01-15T10:30:00Z",
 "expires_at": null
}
```

## Features

- Short code generation (6 chars, alphanumeric)
- Custom short codes
- Click tracking
- Expiration dates
- Search/filter in dashboard
- Copy-to-clipboard
- Cold start detection for free-tier deployments
- Terminal-style loading animation

## Database Schema

```sql
urls
 id UUID (PK)
 short_code VARCHAR(20) UNIQUE
 original_url TEXT
 clicks INTEGER DEFAULT 0
 created_at TIMESTAMP
 expires_at TIMESTAMP (nullable)
 user_id VARCHAR(255) (nullable)
```

## Deployment

### Render (backend)

Push `render.yaml` or use Render dashboard. The config deploys Express on the free tier with automatic PostgreSQL provisioning.

Environment variables marked `sync: false` must be set manually in the Render dashboard:
- `DATABASE_URL` — Render provides this automatically if you use their PostgreSQL
- `BASE_URL` — your Render app URL (e.g., `https://link-snip-api.onrender.com`)
- `CORS_ORIGIN` — your frontend URL

### Cloudflare Pages (frontend)

```bash
cd frontend
npm run build
```

Upload the `dist/` folder to Cloudflare Pages.

Set environment variable in Cloudflare dashboard:
- `VITE_API_URL` — your backend URL

## License

MIT