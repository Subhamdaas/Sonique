import { Album, Artist, Playlist, PodcastEpisode, PodcastShow, Track, UserProfile } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

function getStoredToken(): string | null {
  try {
    return localStorage.getItem('sonique_access_token') || localStorage.getItem('aura_access_token') || null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

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
  me: () => request<UserProfile>('/users/me'),
  updateMe: (input: { name?: string; username?: string }) =>
    request<UserProfile>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),

  // File Upload (Storage)
  uploadFile: async (file: File): Promise<{ url: string; filename: string; size: number; mimetype: string }> => {
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

  // Recommendations
  getPersonalizedRecommendations: (userId?: string) =>
    request<{
      genres: string[];
      recommendedTracks: Track[];
      discoverWeekly: Track[];
    }>(`/recommendations/personalized${userId ? `?userId=${userId}` : ''}`),
  getSimilarTracks: (trackId: string) =>
    request<Track[]>(`/recommendations/similar/${trackId}`),

  // Subscriptions & Monetization
  getCurrentSubscription: (userId?: string) =>
    request<{
      plan: 'FREE' | 'PREMIUM';
      isActive: boolean;
      currentPeriodEnd?: string;
      features: {
        audioQuality: string;
        offlineDownloads: boolean;
        listenTogetherRooms: string;
        adFree: boolean;
      };
    }>(`/subscriptions/current${userId ? `?userId=${userId}` : ''}`),
  upgradeToPremium: (userId: string, plan: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') =>
    request<{ success: boolean; message: string; subscription: any }>(
      '/subscriptions/upgrade',
      {
        method: 'POST',
        body: JSON.stringify({ userId, plan }),
      }
    ),
  cancelSubscription: (userId: string) =>
    request<{ success: boolean; message: string }>(
      '/subscriptions/cancel',
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    ),

  // Analytics
  getAnalyticsOverview: () =>
    request<{
      stats: {
        totalStreams: number;
        totalUsers: number;
        totalTracks: number;
        totalPlaylists: number;
        dailyActiveListeners: number;
      };
      topTracks: Track[];
      recentStreamEvents: any[];
    }>('/analytics/overview'),
  getArtistMetrics: (artistId: string) =>
    request<any>(`/analytics/artist/${artistId}`),

  // Tracks
  getTracks: () => request<Track[]>('/tracks'),
  getTrack: (id: string) => request<Track>(`/tracks/${id}`),
  createTrack: (input: {
    title: string;
    artist: string;
    duration: number;
    audioUrl: string;
    album?: string;
    coverUrl?: string;
    genre?: string;
  }) =>
    request<Track>('/tracks', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  updateTrack: (
    id: string,
    input: Partial<{
      title: string;
      artist: string;
      duration: number;
      audioUrl: string;
      album: string;
      coverUrl: string;
      genre: string;
    }>,
  ) =>
    request<Track>(`/tracks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }),
  deleteTrack: (id: string) =>
    request<{ message: string; id: string }>(`/tracks/${id}`, {
      method: 'DELETE',
    }),

  // Playlists
  getPublicPlaylists: () => request<Playlist[]>('/playlists'),
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
