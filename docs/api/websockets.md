# Sonique - Real-Time Collaborative WebSockets Specification

Gateway Namespace: `/rooms`  
Protocol: Socket.IO (WebSocket / Polling fallback)

## Connection & Auth
Connect with auth token in query or handshake auth:
```ts
import { io } from 'socket.io-client';
const socket = io('http://localhost:4000/rooms', {
  auth: { token: accessToken }
});
```

---

## Client -> Server Events

### 1. `joinRoom`
Join or initialize a room session.
```json
{
  "roomCode": "VIBE-8921",
  "user": {
    "id": "usr_123",
    "name": "Alex",
    "avatarUrl": "https://..."
  }
}
```

### 2. `leaveRoom`
Leave the current room.
```json
{
  "roomCode": "VIBE-8921"
}
```

### 3. `playbackControl` (Host Only)
Broadcast play/pause or track change.
```json
{
  "roomCode": "VIBE-8921",
  "action": "play", // 'play' | 'pause' | 'change_track'
  "track": { "id": "trk_1", "title": "Track Title", ... },
  "position": 42.5
}
```

### 4. `syncRequest`
Listener requests latest host playback position.
```json
{
  "roomCode": "VIBE-8921"
}
```

### 5. `addToQueue` / `removeFromQueue`
Modify shared collaborative room queue.
```json
{
  "roomCode": "VIBE-8921",
  "track": { "id": "trk_2", ... }
}
```

### 6. `sendChat`
Post chat message to live room feed.
```json
{
  "roomCode": "VIBE-8921",
  "message": "This drop is incredible! 🔥"
}
```

### 7. `sendReaction`
Emit animated emoji reaction.
```json
{
  "roomCode": "VIBE-8921",
  "emoji": "🔥" // '🔥' | '❤️' | '🎉' | '⚡' | '🎧'
}
```

---

## Server -> Client Events

- `roomState`: Emits full room metadata, member list, and active queue upon joining.
- `userJoined`: Emits member arrival notification to all room peers.
- `userLeft`: Emits member departure.
- `playbackUpdated`: Broadcasts state changes (`isPlaying`, `currentTrack`, `playbackPosition`).
- `syncResponse`: Returns host's precise timestamp for drift compensation.
- `queueUpdated`: Broadcasts updated track queue.
- `newChat`: Delivers incoming chat message.
- `newReaction`: Triggers floating emoji burst on connected clients.
