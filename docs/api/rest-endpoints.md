# Sonique - REST API Endpoints Specification

Base URL: `http://localhost:4000/api`

## 1. Authentication (`/auth`)
- `POST /auth/register` - Create a new user account `{ email, password, name }`
- `POST /auth/login` - Authenticate user `{ email, password }` -> `{ accessToken, refreshToken, user }`
- `POST /auth/refresh` - Rotate refresh token `{ refreshToken }`
- `POST /auth/logout` - Invalidate session
- `GET /auth/me` - Retrieve current authenticated user profile

## 2. Catalog & Tracks (`/catalog`, `/tracks`)
- `GET /catalog/featured` - Return curated home feed (trending, fresh releases, top artists)
- `GET /catalog/artists` - List catalog artists
- `GET /catalog/artists/:id` - Fetch artist details with albums & top tracks
- `GET /catalog/albums` - List catalog albums
- `GET /catalog/albums/:id` - Fetch album with tracklist
- `GET /catalog/genres` - List available genres
- `GET /tracks` - Query all tracks with pagination & search filters
- `GET /tracks/:id` - Fetch track details
- `POST /tracks` - Create track (authenticated, artist/admin role)
- `POST /tracks/:id/play` - Increment track play counter

## 3. Playlists & Likes (`/playlists`, `/likes`)
- `GET /playlists` - Fetch user's personal playlists
- `GET /playlists/public` - Fetch public community playlists
- `GET /playlists/:id` - Fetch playlist details and ordered tracks
- `POST /playlists` - Create a new playlist
- `POST /playlists/:id/tracks` - Add track to playlist `{ trackId }`
- `DELETE /playlists/:id/tracks/:trackId` - Remove track from playlist
- `PUT /playlists/:id/tracks/reorder` - Reorder playlist track positions `{ trackIds: string[] }`
- `GET /likes` - Fetch current user's liked tracks
- `POST /likes/toggle/:trackId` - Toggle like/unlike on a track

## 4. Playback & Telemetry (`/playback`)
- `POST /playback/event` - Record listening telemetry `{ trackId, listenedSeconds, completed }`
- `GET /playback/history` - Fetch recent listening history for authenticated user

## 5. Podcasts (`/podcasts`)
- `GET /podcasts/shows` - List all podcast shows
- `GET /podcasts/shows/:id` - Fetch show details and episode list
- `GET /podcasts/episodes/:id` - Fetch episode details

## 6. Recommendations (`/recommendations`)
- `GET /recommendations/personalized` - Compute personalized recommendations based on listening history
- `GET /recommendations/similar/:trackId` - Find similar tracks by genre and artist

## 7. Subscriptions (`/subscriptions`)
- `GET /subscriptions/current` - Check active subscription status & tier
- `POST /subscriptions/upgrade` - Upgrade user to `PREMIUM`
- `POST /subscriptions/cancel` - Cancel active subscription

## 8. Analytics (`/analytics`)
- `GET /analytics/overview` - Platform high-level stats (total users, tracks, streams, active subscriptions)
- `GET /analytics/artist/:id` - Artist-specific performance metrics and stream counts

## 9. Media Uploads & Storage (`/storage`)
- `POST /storage/upload` - Multipart form file upload (`file: File`, `type: 'audio' | 'image'`) -> `{ url, filename, size, mimetype }`

## 10. Health & Diagnostics (`/health`)
- `GET /health` - Service health check status for database & Redis
