# Sonique — Developer Setup & Workflow Guide

This document covers local development workflows, monorepo workspace commands, database setup, and testing procedures for Sonique.

---

## 1. Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Docker Desktop** (Optional, for local PostgreSQL & Redis container orchestration)

---

## 2. Quick Start

### 2.1 Clone & Install Dependencies

```bash
git clone https://github.com/your-org/sonique.git
cd sonique
npm install
```

### 2.2 Configure Environment Variables

```bash
# Root Web environment
cp .env.example .env

# Backend API environment
cp apps/api/.env.example apps/api/.env
```

### 2.3 Initialize Database & Seed Catalog

```bash
# Generate Prisma Client
npm --prefix apps/api run prisma:generate

# Apply migrations
npm --prefix apps/api run prisma:migrate

# Seed database with tracks, artists, and playlists
npx tsx prisma/seed.ts
```

---

## 3. Running Services Locally

### Running Web Client
```bash
npm run dev:web
# Accessible at http://localhost:5173
```

### Running Backend API
```bash
npm run dev:api
# Accessible at http://localhost:4000/api
```

### Running Mobile Client (Expo)
```bash
cd apps/mobile
npx expo start
```
- Press `a` for Android Emulator.
- Press `i` for iOS Simulator.
- Press `w` for Expo Web preview.

---

## 4. Workspace Scripts Reference

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Web client dev server (`apps/web`) |
| `npm run dev:web` | Starts Web client dev server |
| `npm run dev:api` | Starts NestJS API in watch mode (`apps/api`) |
| `npm run build` | Builds Web production bundle |
| `npm run build:web` | Builds Web client (`apps/web`) |
| `npm run build:api` | Compiles NestJS backend (`apps/api`) |
| `npm --prefix packages/shared run build` | Compiles `@sonique/shared` TypeScript types |
| `npm --prefix apps/mobile exec -- npx tsc --noEmit` | Typechecks mobile application |

---

## 5. Testing & Verification

Run verification across the entire monorepo before submitting changes:

```bash
# 1. Typecheck & Build Shared Contracts
npm --prefix packages/shared run build

# 2. Typecheck & Build Web Frontend
npm --prefix apps/web run build

# 3. Typecheck & Build Backend API
npm --prefix apps/api run build

# 4. Typecheck Mobile Client
npm --prefix apps/mobile exec -- npx tsc --noEmit
```
