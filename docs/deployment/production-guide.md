# Sonique - Production Deployment Guide

This guide outlines deployment strategies for the Sonique monorepo services across containerized cloud environments (Docker / AWS ECS / Render / Fly.io / GCP Cloud Run / Supabase).

## Prerequisites
- PostgreSQL 15+ database (e.g., Supabase / AWS RDS).
- Redis 7+ instance (e.g., Upstash / Redis Cloud / AWS ElastiCache).
- Node.js 20+ runtime.
- Object Storage / S3-compatible bucket (e.g., AWS S3 / Cloudflare R2 / Supabase Storage).

---

## Environment Variables Configuration

### Backend API (`apps/api/.env`)
```env
PORT=4000
NODE_ENV=production
DATABASE_URL=postgresql://<user>:<password>@<host>:6543/<database>?pgbouncer=true
DIRECT_URL=postgresql://<user>:<password>@<host>:5432/<database>
REDIS_URL=redis://<user>:<password>@<redis-host>:6379
JWT_SECRET=<generate-a-secure-secret>
JWT_REFRESH_SECRET=<generate-a-secure-secret>
FRONTEND_URL=https://<your-frontend-domain>
UPLOAD_DIR=/var/data/uploads
```

### Web Client (`.env.production`)
```env
VITE_API_URL=https://<your-api-domain>/api
VITE_SOCKET_URL=https://<your-api-domain>
```

---

## Docker Production Deployment

Run multi-container production build with Docker Compose:
```bash
docker-compose up -d --build
```

### Docker Compose Architecture
- **`api`**: NestJS application container with multi-stage build.
- **`web`**: NGINX server serving production Vite bundle.
- **`redis`**: High-availability in-memory cache with persistence enabled.
- **`postgres`**: Local containerized database fallback or connected to managed Supabase.

---

## Database Migration & Seeding
```bash
# In apps/api
npx prisma migrate deploy
npx prisma db seed
```
