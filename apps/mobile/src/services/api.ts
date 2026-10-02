import { ENV } from '../config/env';
import { storage } from './storage';
import {
  Album,
  Artist,
  Playlist,
  PodcastEpisode,
  PodcastShow,
  Track,
  UserProfile,
} from '../types';

const TOKEN_KEY = 'sonique_access_token';
const REFRESH_KEY = 'sonique_refresh_token';

let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

// Initialize tokens from persistent storage
storage.getItem(TOKEN_KEY).then((t) => {
  memoryAccessToken = t;
});
storage.getItem(REFRESH_KEY).then((t) => {
  memoryRefreshToken = t;
});

export async function saveTokens(
  accessToken: string | null,
  refreshToken: string | null,
) {
  memoryAccessToken = accessToken;
  memoryRefreshToken = refreshToken;

  if (accessToken) {
    await storage.setItem(TOKEN_KEY, accessToken);
  } else {
    await storage.removeItem(TOKEN_KEY);
  }

  if (refreshToken) {
    await storage.setItem(REFRESH_KEY, refreshToken);
  } else {
    await storage.removeItem(REFRESH_KEY);
  }
}

export function getStoredToken(): string | null {
  return memoryAccessToken;
}

export function getStoredRefreshToken(): string | null {
  return memoryRefreshToken;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = memoryRefreshToken || (await storage.getItem(REFRESH_KEY));
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${ENV.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await saveTokens(null, null);
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      await saveTokens(data.accessToken, data.refreshToken || refreshToken);
      return data.accessToken;
    }
    await saveTokens(null, null);
    return null;
  } catch {
    await saveTokens(null, null);
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const token = memoryAccessToken || (await storage.getItem(TOKEN_KEY));
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${ENV.API_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized with token refresh and single retry
  if (response.status === 401 && !isRetry && !path.startsWith('/auth/')) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await attemptTokenRefresh();
      isRefreshing = false;
      onRefreshed(newToken);

      if (newToken) {
        return request<T>(path, options, true);
      }
    } else {
      const retryToken = await new Promise<string | null>((resolve) => {
        refreshSubscribers.push(resolve);
      });
      if (retryToken) {
        return request<T>(path, options, true);
      }
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: UserProfile;
};

export const api = {
  // Authentication
  register: (input: { name: string; email: string; password: string }) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  login: (input: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  refresh: (refreshToken: string) =>
    request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  logout: async (refreshToken?: string) => {
    try {
      const token = refreshToken || memoryRefreshToken || (await storage.getItem(REFRESH_KEY));
      await request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token }),
      });
    } catch {
      // Fallback: clear tokens locally even if API fails
    } finally {
      await saveTokens(null, null);
    }
  },

  me: () => request<UserProfile>('/users/me'),

  updateMe: (input: { name?: string; username?: string }) =>
    request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // Catalog
  getFeatured: () =>
    request<{
      featuredTracks: Track[];
      topPlaylists: Playlist[];
      newReleases: Album[];
      popularArtists: Artist[];
    }>('/catalog/featured'),

  getGenres: () => request<{ name: string; coverUrl?: string }[]>('/catalog/genres'),

  getArtists: () => request<Artist[]>('/catalog/artists'),

  getArtist: (id: string) => request<Artist>(`/catalog/artists/${id}`),

  getAlbums: () => request<Album[]>('/catalog/albums'),

  getAlbum: (id: string) => request<Album>(`/catalog/albums/${id}`),

  // Tracks
  getTracks: () => request<Track[]>('/tracks'),

  getTrack: (id: string) => request<Track>(`/tracks/${id}`),

  // Recommendations
  getPersonalizedRecommendations: (userId?: string) =>
    request<{
      recommendedTracks: Track[];
      discoverWeekly: Track[];
      genres: string[];
    }>(
      `/recommendations/personalized${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`,
    ),

  getSimilarTracks: (trackId: string) =>
    request<Track[]>(`/recommendations/similar/${trackId}`),

  // Playlists
  getPlaylists: () => request<Playlist[]>('/playlists'),

  getMyPlaylists: () => request<Playlist[]>('/playlists/me'),

  getPlaylist: (id: string) => request<Playlist>(`/playlists/${id}`),

  createPlaylist: (input: {
    title: string;
    description?: string;
    coverUrl?: string;
    isPublic?: boolean;
  }) =>
    request<Playlist>('/playlists', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  updatePlaylist: (
    id: string,
    input: {
      title?: string;
      description?: string;
      coverUrl?: string;
      isPublic?: boolean;
    },
  ) =>
    request<Playlist>(`/playlists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  deletePlaylist: (id: string) =>
    request<{ message: string; id: string }>(`/playlists/${id}`, {
      method: 'DELETE',
    }),

  addTrackToPlaylist: (playlistId: string, trackId: string) =>
    request<any>(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    }),

  removeTrackFromPlaylist: (playlistId: string, trackId: string) =>
    request<{ message: string }>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
    }),

  // Likes & Library
  getLikedTracks: () => request<Track[]>('/likes'),

  getLikeStatus: (trackId: string) =>
    request<{ trackId: string; liked: boolean }>(`/likes/${trackId}/status`),

  likeTrack: (trackId: string) =>
    request<{ message: string; liked: boolean; trackId: string }>(
      `/likes/${trackId}`,
      { method: 'POST' },
    ),

  unlikeTrack: (trackId: string) =>
    request<{ message: string; liked: boolean; trackId: string }>(
      `/likes/${trackId}`,
      { method: 'DELETE' },
    ),

  // Search
  search: (q: string, type?: string) =>
    request<{
      query: string;
      tracks: Track[];
      artists: Artist[];
      albums: Album[];
      playlists: Playlist[];
      podcasts: PodcastShow[];
    }>(`/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`),

  // Playback & History
  recordPlaybackEvent: (trackId: string, durationPlayed?: number) =>
    request<{ success: boolean; trackId: string; currentPlays: number }>(
      '/playback/events',
      {
        method: 'POST',
        body: JSON.stringify({ trackId, durationPlayed }),
      },
    ),

  getHistory: (limit = 20) =>
    request<Track[]>(`/playback/history?limit=${limit}`),

  getTopTracks: (limit = 10) =>
    request<Track[]>(`/playback/top?limit=${limit}`),

  // Podcasts
  getPodcastShows: (category?: string) =>
    request<PodcastShow[]>(
      `/podcasts/shows${category && category !== 'ALL' ? `?category=${encodeURIComponent(category)}` : ''}`,
    ),

  getPodcasts: (category?: string) =>
    request<PodcastShow[]>(
      `/podcasts/shows${category && category !== 'ALL' ? `?category=${encodeURIComponent(category)}` : ''}`,
    ),

  getPodcastShow: (id: string) =>
    request<PodcastShow>(`/podcasts/shows/${id}`),

  getPodcastEpisodes: (showId: string) =>
    request<PodcastEpisode[]>(`/podcasts/shows/${showId}/episodes`),

  getPodcastEpisode: (id: string) =>
    request<PodcastEpisode>(`/podcasts/episodes/${id}`),

  // Aliases for entity lookups
  getPlaylistById: (id: string) => request<Playlist>(`/playlists/${id}`),
  getAlbumById: (id: string) => request<Album>(`/catalog/albums/${id}`),
  getArtistById: (id: string) => request<Artist>(`/catalog/artists/${id}`),

  // Live Collaborative Rooms
  getRooms: () => request<any[]>('/rooms'),

  getRoom: (code: string) => request<any>(`/rooms/${code}`),

  createRoom: (input: {
    name: string;
    genre?: string;
    isPublic?: boolean;
    hostId?: string;
    hostName?: string;
  }) =>
    request<any>('/rooms', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  // Subscriptions
  getCurrentSubscription: () => request<any>('/subscriptions/current'),

  upgradeSubscription: (plan?: 'MONTHLY' | 'ANNUAL') =>
    request<any>('/subscriptions/upgrade', {
      method: 'POST',
      body: JSON.stringify({ plan: plan || 'MONTHLY' }),
    }),

  cancelSubscription: () =>
    request<any>('/subscriptions/cancel', {
      method: 'POST',
    }),
};

export const apiService = api;

