export type Role = 'USER' | 'ARTIST' | 'ADMIN';
export type SubscriptionTier = 'FREE' | 'PREMIUM';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username?: string;
  avatarUrl?: string | null;
  role: Role;
  subscription?: {
    tier: SubscriptionTier;
    status: string;
    expiresAt?: string;
    plan?: string;
  };
  createdAt?: string | Date;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'FREE' | 'PREMIUM' | 'premium' | 'free';
  status: 'active' | 'inactive' | 'cancelled';
  expiresAt?: string | null;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  avatarUrl?: string | null;
  art?: string | null;
  genres?: string[];
  genre?: string;
  verified?: boolean;
  monthlyListeners?: number;
  tracks?: Track[];
  albums?: Album[];
}

export interface Album {
  id: string;
  title: string;
  coverUrl?: string | null;
  art?: string | null;
  releaseYear?: number | null;
  year?: number | null;
  artistId: string;
  artist?: Artist | string;
  tracks?: Track[];
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  audioUrl: string;
  coverUrl?: string | null;
  art?: string | null;
  genre?: string | null;
  album?: string | null;
  albumId?: string | null;
  artistId?: string;
  playCount?: number;
  type?: 'track' | 'episode' | 'radio';
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
  art?: string | null;
  isPublic?: boolean;
  userId?: string;
  owner?: string | { id: string; name: string };
  tracks?: (PlaylistTrack | Track)[];
  songCount?: number;
  createdAt?: string | Date;
}

export interface PodcastShow {
  id: string;
  title: string;
  host?: string;
  publisher?: string;
  author?: string;
  description?: string | null;
  coverUrl?: string | null;
  art?: string | null;
  category?: string | null;
  episodes?: PodcastEpisode[];
  _count?: {
    episodes: number;
  };
}

export interface PodcastEpisode {
  id: string;
  title: string;
  showTitle?: string;
  description?: string | null;
  audioUrl: string;
  coverUrl?: string | null;
  art?: string | null;
  duration: number;
  publishedAt?: string | Date;
  podcastId?: string;
}

export interface RoomMember {
  id: string;
  userId: string;
  name: string;
  avatarUrl?: string | null;
  isHost?: boolean;
  joinedAt?: string | Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  text?: string;
  content?: string;
  createdAt: string | Date;
}

export interface Room {
  id: string;
  name: string;
  code?: string;
  hostId: string;
  hostName?: string;
  genre?: string;
  isPublic: boolean;
  currentTrack?: Track | null;
  isPlaying?: boolean;
  playbackPosition?: number;
  members?: RoomMember[];
  chat?: ChatMessage[];
  createdAt?: string | Date;
}
