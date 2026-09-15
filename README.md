# 🎵 Sonique — Next-Gen Music & Podcast Streaming Platform

**Sonique** is a modern, distributed full-stack music and podcast streaming platform built with NestJS, Prisma ORM, PostgreSQL (Supabase), Redis, React + Vite (TypeScript), and React Native (Expo).

---

## 🌟 Key Highlights & Features

- **🎧 Expansive 1,770+ Track Catalog**: Seeded with rich multi-lingual discographies across:
  - **90's Bollywood & Evergreen Hindi**: Kumar Sanu, Alka Yagnik, Udit Narayan, Kishore Kumar, Lata Mangeshkar, R.D. Burman, Sonu Nigam, KK, Mohit Chauhan, Indipop, and Bappi Lahiri.
  - **Kannada Sandalwood & Folk**: Dr. Rajkumar, S.P. Balasubrahmanyam, Sanjith Hegde, Armaan Malik, Vijay Prakash, KGF, Kantara, and Bhavageethe.
  - **Odia & Ollywood Classics & Folk**: Akshaya Mohanty, Pranab Patnaik, Humane Sagar, Asima Panda, Sambalpuri Dalkhai, and Gita Govinda.
  - **God / Prayer / Bhajans / Devotional Sanctuary**: Shri Hanuman Chalisa, Gayatri Mantra, Shiv Tandav Stotram, Puri Jagannath Bhajans by Bhikari Bala, Lord Krishna Bhajans, Carnatic Suprabhatam, Sufi Qawwali, and Peaceful Gospel Hymns.
  - **90's English Pop, Rock & EDM**: Backstreet Boys, Britney Spears, Spice Girls, Michael Jackson, Whitney Houston, Nirvana, Queen, Oasis, Avicii, and Calvin Harris.
  - **Midnight Lo-Fi & Study Chill**: Indian Lo-Fi rain beats, study jazz, and vaporwave.
  - **Multi-Lingual Podcasts**: The Ranveer Show, Geeta Saar, Kannada Kahi, Odia Galpa, Huberman Lab, and Lex Fridman.
- **⚡ High Performance Audio Engine**: Dual-stream HTML5 audio playback with real CDN links, queue management, volume memory, repeat, shuffle, and seek bar.
- **👥 Real-time "Listen Together" Rooms**: Socket.IO collaborative synchronized listening with live room chat and floating reactions.
- **💎 Glassmorphic Dark UI**: Modern Spotify-inspired aesthetics with responsive navigation, playlists, liked songs, dynamic explore filters, and search.
- **🔐 Secure Authentication**: JWT token rotation with Bcrypt password hashing and role-based access control (`LISTENER`, `ARTIST`, `ADMIN`).
- **📱 Cross-Platform Support**: Web Client (`apps/web`), Backend API (`apps/api`), and Mobile App (`apps/mobile`).

---

## 🛠 Project Structure

```
Sonique
├── apps
│   ├── api              # NestJS Backend API (Port 4000)
│   ├── web              # React + Vite Web Client (Port 5173)
│   └── mobile           # React Native + Expo Mobile Application
├── packages
│   └── shared           # Universal TypeScript models & contracts
├── prisma               # Prisma ORM Schema & Multi-lingual Seed Scripts
├── docs                 # System architecture, API docs, and deployment guides
└── docker-compose.yml   # Multi-container orchestration
```

---

## ⚡ Quick Start

### 1. Backend Setup (`apps/api`)
```bash
cd apps/api
npm install
cp .env.example .env
# Configure DATABASE_URL in .env
npx prisma generate
npx tsx src/seed.ts
npm run dev
```
*API runs on `http://localhost:4000/api`*

### 2. Web Client Setup (`apps/web`)
```bash
cd apps/web
npm install
npm run dev
```
*Web App runs on `http://localhost:5173`*

---

## 🛡 Security & Environment

All sensitive environment variables, tokens, and database credentials are kept securely in `.env` files and excluded via `.gitignore`. Refer to `.env.example` in `apps/api` and `apps/web` for required environment keys.

