# Sonique - Architecture System Overview

Sonique is a modern, high-performance distributed audio streaming platform offering real-time music and podcast streaming, collaborative listening rooms, personalized recommendations, lossless audio quality tiers, and artist analytics.

## System Architecture

```mermaid
graph TD
    ClientWeb["Web Client (React + TS + Vite)"] -->|HTTPS / WSS| API["NestJS Gateway API (Port 4000)"]
    ClientMobile["Mobile Client (React Native + Expo)"] -->|HTTPS / WSS| API

    subgraph "Backend Services (apps/api)"
        API --> Auth["Auth & Users Module"]
        API --> Catalog["Catalog & Tracks Module"]
        API --> Playlists["Playlists & Likes Module"]
        API --> Rooms["Collaborative Rooms (Socket.IO)"]
        API --> Storage["Storage & Upload Pipeline"]
        API --> Recs["Recommendation Engine"]
        API --> Subs["Subscriptions & Tier Gating"]
        API --> Analytics["Analytics & Telemetry"]
    end

    subgraph "Data & Persistence Layer"
        Auth --> Postgres[("PostgreSQL (Supabase)")]
        Catalog --> Postgres
        Playlists --> Postgres
        Recs --> Postgres
        Subs --> Postgres
        Analytics --> Postgres
        
        Rooms --> Redis[("Redis Cache & Rate Limiting")]
        API --> Redis
    end

    subgraph "Streaming Engine"
        Storage --> StaticUploads["Static CDN / Local File Pipeline"]
        ClientWeb -->|Audio Stream| StaticUploads
        ClientWeb -->|Hybrid Engine| YouTubeEmbed["YouTube IFrame Stream Engine"]
    end
```

## Core Modules & Design Decisions

1. **Hybrid Playback Engine**:
   - Standard direct MP3/WAV/AAC streams played via HTML5 `<audio>`.
   - Dynamic YouTube audio streams embedded via headless YouTube IFrame API.
   - 5-second periodic playback telemetry emitted to `/api/playback/event` to track user stream records and listening history without degrading client performance.

2. **Real-time Synchronization (Listen Together)**:
   - WebSocket rooms running over Socket.IO (`/rooms` namespace).
   - Dynamic host-to-listener synchronization (<250ms drift compensation).
   - In-memory room manager with fallback caching.

3. **Tiered Access & Monetization**:
   - `FREE`: 128kbps AAC playback, standard catalog browsing.
   - `PREMIUM`: 320kbps High-Fidelity Lossless audio, collaborative room hosting, ad-free listening, and offline caching.

4. **Recommendation Engine**:
   - Genre affinity scoring computed against user's recent listening history.
   - Dynamic "Discover Weekly" generation algorithm.
