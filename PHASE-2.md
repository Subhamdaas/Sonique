# Sonique — Phase 2: Authentication & Users

## Included
- NestJS API in `apps/api`
- PostgreSQL + Prisma schema in `prisma/schema.prisma`
- JWT access + refresh tokens
- Password hashing with bcrypt
- Registration/login/refresh endpoints
- Protected `/api/users/me` endpoint
- React auth store with local token persistence
- Login/Register pages connected to the API
- Docker Compose for PostgreSQL + Redis

## Local setup

### 1. Start infrastructure
```bash
docker compose up -d
```

### 2. Backend
```bash
cd apps/api
copy .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

API: `http://localhost:4000`

### 3. Frontend
From the project root:
```bash
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/users/me` (Bearer token)
- `PATCH /api/users/me` (Bearer token)

## Example registration
```json
{
  "name": "Ava Listener",
  "email": "ava@example.com",
  "password": "strongpassword123"
}
```
