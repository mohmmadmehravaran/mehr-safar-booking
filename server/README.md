# Mehr Safar Booking API

Production-ready REST API for the **Mehr Safar** hotel booking platform.
Built from scratch with **Node.js + Express + TypeScript + Prisma**.

This backend replaces the frontend\'s `localStorage` persistence with a real,
secure, server-side data layer: hotels, rooms, users, bookings, reviews, and the
site-builder configuration are all stored in a database and served over a clean JSON API.

---

## ✨ Features

- **TypeScript** end-to-end, strict mode
- **Layered architecture**: routes → middleware → controllers → services → Prisma
- **Auth**: JWT for both end-users and admins, passwords hashed with bcrypt
- **Validation**: every request validated/coerced with Zod
- **Security**: helmet, CORS allow-list, rate limiting, payload limits
- **Database**: Prisma ORM, SQLite by default (swap to PostgreSQL in one line)
- **Seed**: original sample data (12 hotels, 25 rooms, bookings, reviews) migrated automatically
- **Booking engine**: capacity + date-overlap availability checks, public tracking codes
- **Tested**: Vitest + Supertest smoke suite
- **Deploy-ready**: Dockerfile, `render.yaml`, GitHub Actions CI

---

## 🚀 Quick start

```bash
cd server
cp .env.example .env          # then edit JWT_SECRET, admin password, CORS_ORIGINS
npm install
npx prisma generate
npx prisma db push            # create the SQLite schema
npm run db:seed               # load sample hotels + admin
npm run dev                   # http://localhost:4000
```

Health check: `GET http://localhost:4000/health`
API root: `GET http://localhost:4000/api`

Default admin (change it!): **admin / admin123**

---

## 🔧 Environment variables

| Var | Description | Default |
|-----|-------------|---------|
| `NODE_ENV` | `development` \| `test` \| `production` | `development` |
| `PORT` | HTTP port | `4000` |
| `DATABASE_URL` | Prisma connection string | `file:./dev.db` |
| `JWT_SECRET` | Secret for signing tokens (**required**, ≥16 chars) | – |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CORS_ORIGINS` | Comma-separated allowed origins, or `*` | `*` |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seeded admin account | `admin` / `admin123` |

---

## 📚 API reference

Base path: `/api`. All responses are `{ "success": true, ... }` or
`{ "success": false, "error": { "message": ... } }`.

### Auth
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/auth/register` | – | `fullName, phone, email, password` |
| POST | `/auth/login` | – | `emailOrPhone, password` |
| POST | `/auth/login-phone` | – | `phone` (passwordless / one-step) |
| GET  | `/auth/me` | user | – |
| PATCH| `/auth/profile` | user | `fullName, email, phone` |
| POST | `/auth/admin/login` | – | `username, password` |

### Hotels
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/hotels` | – | filters: `city, search, type, minPrice, maxPrice, stars=4,5, featured, sort, page, limit` |
| GET | `/hotels/:id` | – | single hotel + rooms |
| GET | `/hotels/:id/reviews` | – | reviews for a hotel |
| POST | `/hotels` | admin | create hotel (+rooms) |
| PUT | `/hotels/:id` | admin | update hotel (+rooms) |
| DELETE | `/hotels/:id` | admin | delete |

### Bookings
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/bookings` | optional | create booking; validates capacity & availability |
| GET | `/bookings/track/:code` | – | public tracking by code |
| GET | `/bookings/me` | user | my bookings |
| GET | `/bookings` | admin | all bookings |
| PATCH | `/bookings/:id/status` | admin | `status: pending\|confirmed\|cancelled` |

### Reviews
| Method | Path | Auth | Body |
|--------|------|------|------|
| POST | `/reviews` | optional | `hotelId, userName, rating, comment` |

### Users (admin)
| Method | Path | Auth |
|--------|------|------|
| GET | `/users` | admin |
| PUT | `/users/:id` | admin |
| DELETE | `/users/:id` | admin |

### Site config (visual editor blob)
| Method | Path | Auth |
|--------|------|------|
| GET | `/site-config` | – |
| PUT | `/site-config` | admin |

---

## 🧪 Scripts

```bash
npm run dev          # hot-reload dev server
npm run build        # prisma generate + tsc -> dist/
npm start            # run compiled server
npm run db:seed      # seed sample data
npm run db:reset     # wipe + re-migrate + seed
npm run typecheck    # tsc --noEmit
npm test             # vitest smoke suite
npm run lint         # eslint
```

---

## 🐘 Switching to PostgreSQL

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. `npx prisma migrate deploy && npm run db:seed`.

---

## ☁️ Deployment

GitHub Pages only hosts static files, so the **frontend** stays on Pages while the
**API** runs on a Node host. Two ready-made options are included:

### Render (free, recommended)
Push to GitHub, then in Render: **New → Blueprint** and select this repo.
`render.yaml` (root dir `server`) provisions the web service, generates a `JWT_SECRET`,
runs migrations + seed, and exposes `/health`. Set `CORS_ORIGINS` to your Pages URL
and `ADMIN_PASSWORD` to a strong value.

### Docker (anywhere)
```bash
cd server
docker build -t mehr-safar-api .
docker run -p 4000:4000 -e JWT_SECRET=$(openssl rand -hex 32) \
  -e CORS_ORIGINS=https://your-frontend.example mehr-safar-api
```

After deploy, point the frontend at the API base URL (e.g. set `VITE_API_BASE`)
and replace the `localStorage` calls in `src/context/*` with `fetch` calls to these endpoints.

---

## 🏗️ Project structure

```
server/
├── prisma/
│   ├── schema.prisma     # data models
│   ├── seed.ts           # idempotent seeder
│   └── seed-data.json    # migrated sample data
├── src/
│   ├── config/env.ts     # validated env
│   ├── lib/              # prisma, jwt, password
│   ├── middleware/       # auth, validate, error, rate-limit
│   ├── schemas/          # Zod request schemas
│   ├── services/         # business logic
│   ├── controllers/      # thin HTTP handlers
│   ├── routes/           # express routers
│   ├── utils/            # ApiError, asyncHandler, json
│   ├── app.ts            # express app factory
│   └── index.ts          # server bootstrap
├── Dockerfile
└── render.yaml
```

MIT licensed.
