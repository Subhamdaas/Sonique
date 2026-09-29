import { Album, Artist, Playlist, PodcastEpisode, PodcastShow, Track, UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

const TOKEN_KEY = 'sonique_access_token';
const REFRESH_KEY = 'sonique_refresh_token';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

function getStoredRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY) || null;
  } catch {
    return null;
  }
}

export function saveTokens(accessToken: string | null, refreshToken: string | null) {
  try {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    if (refreshToken) {
      localStorage.setItem(REFRESH_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_KEY);
    }
    // Clean up any legacy aura keys
    localStorage.removeItem('aura_access_token');
    localStorage.removeItem('aura_refresh_token');
  } catch {}
}

let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      saveTokens(null, null);
      return null;
    }

    const data = await res.json();
    if (data.accessToken) {
      saveTokens(data.accessToken, data.refreshToken || refreshToken);
      return data.accessToken;
    }
    saveTokens(null, null);
    return null;
  } catch {
    saveTokens(null, null);
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
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
      // Await pending refresh
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
      : data.message || 'Request failed';
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
  // Auth
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
      const token = refreshToken || getStoredRefreshToken();
      await request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: token }),
      });
    } catch {
      // Fallback: clear tokens locally even if API fails
    } finally {
      saveTokens(null, null);
    }
  },
  me: () => request<UserProfile>('/users/me'),
  updateMe: (input: { name?: string; username?: string }) =>
    request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // File Upload (Storage)
  uploadFile: async (
    file: File,
  ): Promise<{ url: string; filename: string; size: number; mimetype: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getStoredToken();

    const response = await fetch(`${API_URL}/storage/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },

  // Catalog
  getFeatured: () =>
    request<{
      featuredTracks: Track[];
      topPlaylists: Playlist[];
      newReleases: Album[];
      popularArtists: Artist[];
    }>('/catalog/featured'),
  getGenres: () => request<{ name: string; coverUrl: string }[]>('/catalog/genres'),
  getArtists: () => request<Artist[]>('/catalog/artists'),
  getArtist: (id: string) => request<Artist>(`/catalog/artists/${id}`),
  getAlbums: () => request<Album[]>('/catalog/albums'),
  getAlbum: (id: string) => request<Album>(`/catalog/albums/${id}`),

  // Tracks
  getTracks: () => request<Track[]>('/tracks'),
  getTrack: (id: string) => request<Track>(`/tracks/${id}`),
  createTrack: (input: {
    title: string;
    artist: string;
    album?: string;
    duration: number;
    audioUrl: string;
    coverUrl?: string;
    genre?: string;
  }) =>
    request<Track>('/tracks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTrack: (
    id: string,
    input: {
      title?: string;
      artist?: string;
      album?: string;
      duration?: number;
      audioUrl?: string;
      coverUrl?: string;
      genre?: string;
    },
  ) =>
    request<Track>(`/tracks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteTrack: (id: string) =>
    request<{ message: string; id: string }>(`/tracks/${id}`, {
      method: 'DELETE',
    }),

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

  // Likes
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
      `/podcasts/shows${category ? `?category=${encodeURIComponent(category)}` : ''}`,
    ),
  getPodcastShow: (id: string) => request<PodcastShow>(`/podcasts/shows/${id}`),
  getPodcastEpisode: (id: string) =>
    request<PodcastEpisode>(`/podcasts/episodes/${id}`),

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

  // Analytics
  getOverviewAnalytics: () => request<any>('/analytics/overview'),
  getArtistAnalytics: (id: string) => request<any>(`/analytics/artist/${id}`),

  // Health
  getHealth: () =>
    request<{
      status: string;
      timestamp: string;
      uptimeSeconds: number;
      version: string;
      services: { database: string; redis: string };
    }>('/health'),
};
