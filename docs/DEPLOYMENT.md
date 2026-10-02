# Sonique — Production Deployment Guide

This guide details deployment strategies and environment configurations for running Sonique across cloud infrastructures (Docker, Supabase, AWS, Render, Fly.io, or GCP).

---

## 1. Prerequisites

- **PostgreSQL Database**: PostgreSQL 15+ instance (e.g. Supabase, AWS RDS, or containerized PostgreSQL).
- **Redis Instance**: Redis 7+ instance (e.g. Upstash, Redis Cloud, or containerized Redis).
- **Node.js Environment**: Node.js 20+ LTS runtime.
- **Media Storage**: Supabase Storage / AWS S3 bucket for media asset hosting.

---

## 2. Environment Configuration

### 2.1 Backend API (`apps/api/.env`)

```env
# Server
PORT=4000
NODE_ENV=production

# Database (PostgreSQL / Supabase)
# Transaction pooler connection string:
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
# Direct migration connection string:
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require

# Redis Cache & Rate Limiting
REDIS_URL=redis://default:[PASSWORD]@[REDIS-HOST]:6379

# JWT Authentication
JWT_SECRET=your-secure-production-jwt-secret-key-at-least-32-chars
JWT_REFRESH_SECRET=your-secure-production-jwt-refresh-secret-key-at-least-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

# CORS & Client Domains
FRONTEND_URL=https://sonique.app

# Storage
UPLOAD_DIR=/app/uploads
```

### 2.2 Web Client (`apps/web/.env.production`)

```env
VITE_API_URL=https://api.sonique.app/api
VITE_SOCKET_URL=https://api.sonique.app
```

### 2.3 Mobile Client (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL=https://api.sonique.app/api
EXPO_PUBLIC_SOCKET_URL=https://api.sonique.app
```

---

## 3. Docker Multi-Container Deployment

Run the complete stack using Docker Compose:

```bash
docker-compose up -d --build
```

### Services Orchestrated
- **`api`**: NestJS application running on port `4000`.
- **`web`**: NGINX server serving the compiled production Vite bundle on port `5173`.
- **`postgres`**: PostgreSQL database with persistent volume `sonique-postgres`.
- **`redis`**: Redis instance with persistent volume `sonique-redis`.

---

## 4. Database Migrations & Seeding

Run Prisma migrations and catalog seed in your deployment pipeline:

```bash
# Apply pending schema migrations
npx prisma migrate deploy

# Seed multi-lingual tracks, artists, and playlists
npx tsx prisma/seed.ts
```

---

## 5. Production Security Checklist

1. **SSL/TLS**: Enforce HTTPS for all REST endpoints and WSS for WebSocket gateways.
2. **CORS**: Configure `FRONTEND_URL` strictly to allowed client origin domains.
3. **Rate Limiting**: The built-in [RateLimitGuard](file:///c:/SQL/SONIQUE/apps/api/src/common/rate-limit.guard.ts) protects sensitive endpoints (`/auth/login`, `/auth/register`) against brute force.
4. **Security Headers**: Helmet is enabled globally by default on the NestJS API gateway.
5. **Secret Protection**: Ensure `.env` files are never checked into version control.
