# Sonique — API & Real-Time Protocol Specification

The **Sonique** platform provides a unified backend interface composed of RESTful HTTP endpoints and a real-time WebSocket gateway for synchronized playback.

- **HTTP Base URL**: `http://localhost:4000/api` (Development) / `https://<api-domain>/api` (Production)
- **WebSocket Gateway**: `ws://localhost:4000/rooms` (Socket.IO namespace `/rooms`)
- **Authentication**: JWT Bearer Token in `Authorization: Bearer <accessToken>` header

---

## 1. REST API Endpoints

### 1.1 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register a new user account `{ email, password, name }` | No |
| `POST` | `/auth/login` | Authenticate user credentials `{ email, password }` | No |
| `POST` | `/auth/refresh` | Rotate refresh token `{ refreshToken }` | No |
| `POST` | `/auth/logout` | Invalidate active user session `{ refreshToken? }` | Yes |
| `GET` | `/auth/me` | Fetch authenticated user profile | Yes |

### 1.2 Users & Profiles (`/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/users/me` | Get current user's profile, role, and subscription info | Yes |
| `PATCH` | `/users/me` | Update current user profile `{ name?, username?, avatarUrl? }` | Yes |
| `GET` | `/users/:id` | Fetch public user profile and public playlists | No |

### 1.3 Catalog & Exploration (`/catalog`, `/tracks`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/catalog/featured` | Fetch curated home feed (featured tracks, albums, playlists, artists) | No |
| `GET` | `/catalog/artists` | List catalog artists with pagination | No |
| `GET` | `/catalog/artists/:id` | Fetch artist details, discography albums, and top tracks | No |
| `GET` | `/catalog/albums` | List catalog albums | No |
| `GET` | `/catalog/albums/:id` | Fetch album details with ordered tracklist | No |
| `GET` | `/catalog/genres` | List available catalog genres | No |
| `GET` | `/tracks` | Query all tracks with pagination and filter params | No |
| `GET` | `/tracks/:id` | Fetch specific track metadata | No |
| `POST` | `/tracks` | Create/upload a new track | Yes (`ARTIST` / `ADMIN`) |
| `POST` | `/tracks/:id/play` | Increment track play counter | No |

### 1.4 Search (`/search`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/search?q=:query&type=:type` | Unified search across tracks, artists, albums, playlists, and podcasts (`type`: `tracks` \| `artists` \| `albums` \| `podcasts` \| `all`) | No |

### 1.5 Playlists & Likes (`/playlists`, `/likes`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/playlists` | Fetch all public playlists | No |
| `GET` | `/playlists/me` | Fetch user's own playlists | Yes |
| `GET` | `/playlists/:id` | Fetch playlist metadata and track list | No |
| `POST` | `/playlists` | Create a playlist `{ title, description?, coverUrl?, isPublic? }` | Yes |
| `PATCH` | `/playlists/:id` | Update playlist metadata | Yes (Owner) |
| `DELETE` | `/playlists/:id` | Delete playlist | Yes (Owner) |
| `POST` | `/playlists/:id/tracks` | Add track to playlist `{ trackId }` | Yes (Owner) |
| `DELETE` | `/playlists/:id/tracks/:trackId` | Remove track from playlist | Yes (Owner) |
| `GET` | `/likes` | Fetch user's liked tracks | Yes |
| `GET` | `/likes/:trackId/status` | Check if track is liked by current user | Yes |
| `POST` | `/likes/:trackId` | Like a track | Yes |
| `DELETE` | `/likes/:trackId` | Unlike a track | Yes |

### 1.6 Playback & Telemetry (`/playback`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/playback/events` | Record listening telemetry `{ trackId, durationPlayed }` | Yes |
| `GET` | `/playback/history` | Retrieve user's recent listening history | Yes |
| `GET` | `/playback/top` | Retrieve user's top played tracks | Yes |

### 1.7 Podcasts (`/podcasts`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/podcasts/shows` | List podcast shows (supports `?category=` filter) | No |
| `GET` | `/podcasts/shows/:id` | Fetch show details | No |
| `GET` | `/podcasts/shows/:id/episodes` | List episodes for a specific podcast show | No |
| `GET` | `/podcasts/episodes/:id` | Fetch single podcast episode metadata and audio stream | No |

### 1.8 Recommendations (`/recommendations`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/recommendations/personalized` | Compute recommendations based on genre affinity and history | Optional |
| `GET` | `/recommendations/similar/:trackId` | Retrieve tracks musically similar to a given track ID | No |

### 1.9 Subscriptions & Tier Access (`/subscriptions`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/subscriptions/current` | Retrieve active subscription tier (`FREE` / `PREMIUM`) | Yes |
| `POST` | `/subscriptions/upgrade` | Upgrade account to `PREMIUM` tier | Yes |
| `POST` | `/subscriptions/cancel` | Cancel active subscription | Yes |

### 1.10 Media Storage & Uploads (`/storage`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/storage/upload` | Multipart file upload (`type: 'audio' \| 'image'`) -> `{ url, filename, size }` | Yes |

### 1.11 Health & Diagnostics (`/health`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Service health status for PostgreSQL and Redis | No |

---

## 2. Real-Time WebSockets Specification (Listen Together)

- **Gateway Namespace**: `/rooms`
- **Transport**: WebSocket with polling fallback (Socket.IO client v4)

### 2.1 Connection Initialization

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000/rooms', {
  auth: { token: accessToken },
  transports: ['websocket', 'polling'],
});
```

### 2.2 Client -> Server Events

#### `joinRoom`
Join an existing listening party room or initialize a new room instance:
```json
{
  "roomCode": "RETRO-8921",
  "user": {
    "id": "usr_abc123",
    "name": "Alex",
    "avatarUrl": "https://example.com/avatar.jpg"
  }
}
```

#### `leaveRoom`
Leave the current room session:
```json
{
  "roomId": "room_abc123"
}
```

#### `syncPlayback` (Host / DJ)
Broadcast playback state updates to all room listeners:
```json
{
  "roomId": "room_abc123",
  "action": "play", // 'play' | 'pause' | 'change_track'
  "track": {
    "id": "trk_456",
    "title": "Midnight City",
    "artist": "M83",
    "audioUrl": "https://..."
  },
  "position": 34.2
}
```

#### `chatMessage`
Post a message to the room's live chat stream:
```json
{
  "roomId": "room_abc123",
  "content": "This synth solo is legendary! 🔥"
}
```

#### `sendReaction`
Emit an animated floating emoji reaction:
```json
{
  "roomId": "room_abc123",
  "emoji": "🔥" // '🔥' | '🎧' | '❤️' | '✨' | '🚀' | '💯'
}
```

### 2.3 Server -> Client Events

- **`roomState`**: Emits full room metadata, host ID, current track, playback position, active member list, and chat history upon joining.
- **`userJoined`**: Notifies all connected room members that a new user has entered.
- **`userLeft`**: Notifies room members of a user's departure.
- **`playbackUpdated`**: Broadcasts host transport changes (`action`, `track`, `position`) to synchronize listeners.
- **`chatMessage`**: Delivers incoming chat messages to all room members in real time.
- **`reactionReceived`**: Delivers real-time emoji bursts to all room participants.
- **`error`**: Emits socket operation errors (`{ message: string }`).
