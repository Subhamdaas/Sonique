export type Role = 'USER' | 'ARTIST' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'PREMIUM';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: Role;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  verified?: boolean;
  monthlyListeners?: number;
  tracks?: Track[];
  albums?: Album[];
}

export interface Album {
  id: string;
  title: string;
  coverUrl?: string | null;
  releaseYear?: number | null;
  artistId: string;
  artist?: Artist;
  tracks?: Track[];
}

export interface Track {
  id: string;
  title: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string | null;
  genre?: string | null;
  playCount: number;
  artistId: string;
  albumId?: string | null;
  artist?: Artist;
  album?: Album;
  createdAt: string | Date;
}

export interface PlaylistTrack {
  id: string;
  playlistId: string;
  trackId: string;
  position: number;
  track: Track;
}

export interface Playlist {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
  tracks?: PlaylistTrack[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface PodcastShow {
  id: string;
  title: string;
  host: string;
  description?: string | null;
  coverUrl?: string | null;
  category?: string | null;
  episodes?: PodcastEpisode[];
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description?: string | null;
  audioUrl: string;
  duration: number;
  publishedAt: string | Date;
  showId: string;
  show?: PodcastShow;
}

export interface RoomMember {
  id: string;
  name: string;
  avatarUrl?: string;
  isHost: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string | Date;
}

export interface Room {
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  currentTrack: Track | null;
  isPlaying: boolean;
  playbackPosition: number;
  members: RoomMember[];
  queue: Track[];
  chat: ChatMessage[];
  createdAt: string | Date;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  startDate: string | Date;
  endDate?: string | Date | null;
  isActive: boolean;
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalTracks: number;
  totalStreams: number;
  activeSubscriptions: number;
  topTracks: Track[];
}

export const SOCKET_EVENTS = {
  // Client -> Server
  JOIN_ROOM: 'joinRoom',
  LEAVE_ROOM: 'leaveRoom',
  PLAYBACK_CONTROL: 'playbackControl',
  SYNC_REQUEST: 'syncRequest',
  ADD_TO_QUEUE: 'addToQueue',
  REMOVE_FROM_QUEUE: 'removeFromQueue',
  SEND_CHAT: 'sendChat',
  SEND_REACTION: 'sendReaction',

  // Server -> Client
  ROOM_STATE: 'roomState',
  USER_JOINED: 'userJoined',
  USER_LEFT: 'userLeft',
  PLAYBACK_UPDATED: 'playbackUpdated',
  SYNC_RESPONSE: 'syncResponse',
  QUEUE_UPDATED: 'queueUpdated',
  NEW_CHAT: 'newChat',
  NEW_REACTION: 'newReaction',
  ERROR: 'error',
} as const;
