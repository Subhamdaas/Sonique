# Aura Stream - Production Deployment Guide

This guide outlines deployment strategies for the Aura Stream monorepo services across containerized cloud environments (Docker / AWS ECS / Render / Fly.io / GCP Cloud Run / Supabase).

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
DATABASE_URL=postgresql://postgres.xxxx:yyyy@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxxx:yyyy@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
REDIS_URL=redis://default:token@redis-instance.upstash.io:6379
JWT_SECRET=super_secret_jwt_key_aura_stream_prod_2026
JWT_REFRESH_SECRET=super_secret_refresh_jwt_key_aura_stream_prod_2026
FRONTEND_URL=https://aurastream.app
UPLOAD_DIR=/var/data/uploads
```

### Web Client (`.env.production`)
```env
VITE_API_BASE_URL=https://api.aurastream.app/api
VITE_SOCKET_URL=https://api.aurastream.app
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
