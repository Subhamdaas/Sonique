export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId?: string | null;
  album?: string | null;
  albumId?: string | null;
  duration: number;
  audioUrl: string;
  coverUrl?: string | null;
  art?: string; // compatibility
  genre?: string | null;
  plays?: number;
  uploadedById?: string;
  createdAt?: string;
  artistRef?: Artist | null;
  albumRef?: Album | null;
  liked?: boolean;
}

export type Song = Track;

export interface Artist {
  id: string;
  name: string;
  bio?: string | null;
  imageUrl?: string | null;
  image?: string; // compatibility
  verified?: boolean;
  genres?: string[];
  albums?: Album[];
  tracks?: Track[];
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  releaseYear?: number | null;
  year?: number; // compatibility
  coverUrl?: string | null;
  art?: string; // compatibility
  genre?: string | null;
  artist?: Artist;
  tracks?: Track[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  art?: string; // compatibility
  isPublic?: boolean;
  ownerId?: string;
  owner?: { id: string; name: string; username?: string | null; avatarUrl?: string | null } | string;
  tracks?: { id: string; track: Track; position: number }[] | string[];
  songs?: any[]; // compatibility
  _count?: { tracks: number };
}

export interface PodcastShow {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  art?: string; // compatibility
  author: string;
  creator?: string; // compatibility
  category?: string | null;
  followers?: string | number; // compatibility
  episodes?: PodcastEpisode[];
  _count?: { episodes: number };
}

export type Podcast = PodcastShow;

export interface PodcastEpisode {
  id: string;
  showId?: string;
  podcastId?: string; // compatibility
  title: string;
  description?: string | null;
  audioUrl: string;
  coverUrl?: string | null;
  art?: string; // compatibility
  duration: number;
  publishedAt?: string;
  date?: string; // compatibility
  season?: number; // compatibility
  show?: PodcastShow;
  artist?: string; // show/author compatibility for player
}

export type Episode = PodcastEpisode;

export type Playable =
  | (Track & { type?: 'song' | 'track'; art?: string })
  | (PodcastEpisode & { type?: 'episode'; art?: string });

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username?: string | null;
  role: string;
  avatarUrl?: string | null;
  createdAt?: string;
}
