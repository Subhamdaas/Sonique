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
  getFeatured: async () => {
    try {
      return await request<{
        featuredTracks: Track[];
        topPlaylists: Playlist[];
        newReleases: Album[];
        popularArtists: Artist[];
      }>('/catalog/featured');
    } catch {
      const { initialSongs, favoritePlaylists, mockAlbums, mockArtists } = await import('../data/mockData');
      return {
        featuredTracks: initialSongs as any,
        topPlaylists: favoritePlaylists.map((p) => ({
          id: p.id,
          title: p.title,
          coverUrl: p.coverUrl,
          _count: { tracks: p.songCount },
        })) as any,
        newReleases: mockAlbums as any,
        popularArtists: mockArtists as any,
      };
    }
  },

  getGenres: async () => {
    try {
      return await request<{ name: string; coverUrl: string }[]>('/catalog/genres');
    } catch {
      const { categoriesList } = await import('../data/mockData');
      return categoriesList.filter((c) => c !== 'All').map((name) => ({ name, coverUrl: '' }));
    }
  },

  getArtists: async () => {
    try {
      return await request<Artist[]>('/catalog/artists');
    } catch {
      const { mockArtists } = await import('../data/mockData');
      return mockArtists as any;
    }
  },

  getArtist: async (id: string) => {
    try {
      return await request<Artist>(`/catalog/artists/${id}`);
    } catch {
      const { mockArtists, initialSongs } = await import('../data/mockData');
      const found = mockArtists.find((a) => a.id === id);
      if (found) return found as any;
      // Fallback artist by track match
      const song = initialSongs.find((s) => s.artist.toLowerCase().includes(id.toLowerCase()) || s.id === id);
      return {
        id,
        name: song ? song.artist : 'Featured Artist',
        bio: 'High-fidelity Sonique artist performing across modern and vintage catalog recordings.',
        imageUrl: song?.coverUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        monthlyListeners: 1250000,
        genres: [song?.genre || 'Classic'],
        tracks: song ? [song] : initialSongs.slice(0, 5),
      } as any;
    }
  },

  getAlbums: async () => {
    try {
      return await request<Album[]>('/catalog/albums');
    } catch {
      const { mockAlbums } = await import('../data/mockData');
      return mockAlbums as any;
    }
  },

  getAlbum: async (id: string) => {
    try {
      return await request<Album>(`/catalog/albums/${id}`);
    } catch {
      const { mockAlbums, initialSongs } = await import('../data/mockData');
      const found = mockAlbums.find((a) => a.id === id);
      if (found) return found as any;
      const song = initialSongs.find((s) => s.album?.toLowerCase().includes(id.toLowerCase()) || s.id === id);
      return {
        id,
        title: song?.album || 'Album Collection',
        artist: { name: song?.artist || 'Sonique Artist' },
        releaseYear: 2023,
        coverUrl: song?.coverUrl || 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=600&q=80',
        genre: song?.genre || 'Classic',
        tracks: song ? [song] : initialSongs.slice(0, 6),
      } as any;
    }
  },

  // Tracks
  getTracks: async () => {
    try {
      return await request<Track[]>('/tracks');
    } catch {
      const { initialSongs } = await import('../data/mockData');
      return initialSongs as any;
    }
  },

  getTrack: async (id: string) => {
    try {
      return await request<Track>(`/tracks/${id}`);
    } catch {
      const { initialSongs } = await import('../data/mockData');
      const found = initialSongs.find((t) => t.id === id);
      if (found) return found as any;
      return initialSongs[0] as any;
    }
  },

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
  getPersonalizedRecommendations: async (userId?: string) => {
    try {
      return await request<{
        recommendedTracks: Track[];
        discoverWeekly: Track[];
        genres: string[];
      }>(
        `/recommendations/personalized${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`,
      );
    } catch {
      const { initialSongs, categoriesList } = await import('../data/mockData');
      return {
        recommendedTracks: initialSongs.slice(0, 6) as any,
        discoverWeekly: initialSongs.slice(6, 12) as any,
        genres: categoriesList.filter((c) => c !== 'All'),
      };
    }
  },

  getSimilarTracks: async (trackId: string) => {
    try {
      return await request<Track[]>(`/recommendations/similar/${trackId}`);
    } catch {
      const { initialSongs } = await import('../data/mockData');
      const current = initialSongs.find((s) => s.id === trackId);
      const sameGenre = current
        ? initialSongs.filter((s) => s.genre === current.genre && s.id !== trackId)
        : initialSongs.filter((s) => s.id !== trackId);
      return (sameGenre.length > 0 ? sameGenre : initialSongs).slice(0, 5) as any;
    }
  },

  // Playlists
  getPlaylists: async () => {
    try {
      return await request<Playlist[]>('/playlists');
    } catch {
      const { favoritePlaylists } = await import('../data/mockData');
      return favoritePlaylists.map((p) => ({
        id: p.id,
        title: p.title,
        coverUrl: p.coverUrl,
        tracks: p.tracks as any,
        _count: { tracks: p.songCount },
      })) as any;
    }
  },

  getMyPlaylists: async () => {
    try {
      return await request<Playlist[]>('/playlists/me');
    } catch {
      const { favoritePlaylists } = await import('../data/mockData');
      return favoritePlaylists.slice(0, 3).map((p) => ({
        id: p.id,
        title: p.title,
        coverUrl: p.coverUrl,
        tracks: p.tracks as any,
        _count: { tracks: p.songCount },
      })) as any;
    }
  },

  getPlaylist: async (id: string) => {
    try {
      return await request<Playlist>(`/playlists/${id}`);
    } catch {
      const { favoritePlaylists, initialSongs } = await import('../data/mockData');
      const found = favoritePlaylists.find((p) => p.id === id);
      if (found) {
        return {
          id: found.id,
          title: found.title,
          coverUrl: found.coverUrl,
          description: 'Curated vinyl playlist with authentic audiophile mastering.',
          tracks: found.tracks.map((t) => ({ track: t })),
          _count: { tracks: found.tracks.length },
        } as any;
      }
      return {
        id,
        title: 'Sonique Curated Playlist',
        description: 'Authentic vinyl audio collection.',
        coverUrl: initialSongs[0]?.coverUrl || '',
        tracks: initialSongs.slice(0, 8).map((t) => ({ track: t })),
        _count: { tracks: Math.min(8, initialSongs.length) },
      } as any;
    }
  },

  createPlaylist: async (input: {
    title: string;
    description?: string;
    coverUrl?: string;
    isPublic?: boolean;
  }) => {
    try {
      return await request<Playlist>('/playlists', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch {
      return {
        id: `pl-${Date.now()}`,
        title: input.title,
        description: input.description,
        coverUrl: input.coverUrl || 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80',
        tracks: [],
        _count: { tracks: 0 },
      } as any;
    }
  },

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
  getLikedTracks: async () => {
    try {
      return await request<Track[]>('/likes');
    } catch {
      const { initialSongs } = await import('../data/mockData');
      return initialSongs.slice(0, 5) as any;
    }
  },

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
  search: async (q: string, type?: string) => {
    try {
      return await request<{
        query: string;
        tracks: Track[];
        artists: Artist[];
        albums: Album[];
        playlists: Playlist[];
        podcasts: PodcastShow[];
      }>(`/search?q=${encodeURIComponent(q)}${type ? `&type=${type}` : ''}`);
    } catch {
      const { initialSongs, mockArtists, mockAlbums, favoritePlaylists, mockPodcasts } = await import('../data/mockData');
      const query = q.toLowerCase().trim();
      const matchedTracks = initialSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.artist.toLowerCase().includes(query) ||
          s.genre?.toLowerCase().includes(query) ||
          s.album?.toLowerCase().includes(query)
      );
      const matchedArtists = mockArtists.filter((a) => a.name.toLowerCase().includes(query) || a.genres?.some((g: string) => g.toLowerCase().includes(query)));
      const matchedAlbums = mockAlbums.filter((al) => al.title.toLowerCase().includes(query) || al.artist?.name?.toLowerCase().includes(query));
      const matchedPlaylists = favoritePlaylists
        .filter((p) => p.title.toLowerCase().includes(query))
        .map((p) => ({
          id: p.id,
          title: p.title,
          coverUrl: p.coverUrl,
          _count: { tracks: p.songCount },
        }));
      const matchedPodcasts = mockPodcasts.filter(
        (pod) => pod.title.toLowerCase().includes(query) || pod.author.toLowerCase().includes(query) || pod.category?.toLowerCase().includes(query)
      );

      return {
        query: q,
        tracks: matchedTracks as any,
        artists: matchedArtists as any,
        albums: matchedAlbums as any,
        playlists: matchedPlaylists as any,
        podcasts: matchedPodcasts as any,
      };
    }
  },

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
  getPlaybackState: () => request<any>('/playback/state'),
  updatePlaybackState: (data: {
    trackId?: string;
    positionSeconds?: number;
    queue?: any;
    queueIndex?: number;
    volume?: number;
    isMuted?: boolean;
    shuffle?: boolean;
    repeatMode?: string;
  }) =>
    request<any>('/playback/state', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deletePlaybackState: () =>
    request<{ success: boolean }>('/playback/state', {
      method: 'DELETE',
    }),

  // Podcasts
  getPodcastShows: async (category?: string) => {
    try {
      return await request<PodcastShow[]>(
        `/podcasts/shows${category ? `?category=${encodeURIComponent(category)}` : ''}`,
      );
    } catch {
      const { mockPodcasts } = await import('../data/mockData');
      if (category && category !== 'ALL') {
        return mockPodcasts.filter((p) => p.category?.toLowerCase() === category.toLowerCase()) as any;
      }
      return mockPodcasts as any;
    }
  },

  getPodcastShow: async (id: string) => {
    try {
      return await request<PodcastShow>(`/podcasts/shows/${id}`);
    } catch {
      const { mockPodcasts } = await import('../data/mockData');
      const found = mockPodcasts.find((p) => p.id === id);
      if (found) return found as any;
      return mockPodcasts[0] as any;
    }
  },

  getPodcastEpisode: async (id: string) => {
    try {
      return await request<PodcastEpisode>(`/podcasts/episodes/${id}`);
    } catch {
      const { mockEpisodes } = await import('../data/mockData');
      const found = mockEpisodes.find((e) => e.id === id);
      if (found) return found as any;
      return mockEpisodes[0] as any;
    }
  },

  // Live Rooms & Broadcasts
  getRooms: async () => {
    try {
      return await request<any[]>('/rooms');
    } catch {
      const { mockRooms } = await import('../data/mockData');
      return mockRooms;
    }
  },

  getRoom: async (code: string) => {
    try {
      return await request<any>(`/rooms/${code}`);
    } catch {
      const { mockRooms } = await import('../data/mockData');
      const found = mockRooms.find((r) => r.code === code);
      if (found) return found;
      return {
        code,
        name: 'Live Communal Session',
        genre: 'Communal Vinyl',
        hostName: 'DJ Host',
        isPublic: true,
        memberCount: 6,
        messages: [],
      };
    }
  },

  createRoom: async (input: { name: string; genre?: string; isPublic?: boolean; hostId?: string; hostName?: string }) => {
    try {
      return await request<any>('/rooms', {
        method: 'POST',
        body: JSON.stringify(input),
      });
    } catch {
      const code = `room-${Date.now().toString(36)}`;
      const newRoom = {
        code,
        name: input.name,
        genre: input.genre || 'Classic / Retro Beats',
        hostName: input.hostName || 'Session Host',
        isPublic: input.isPublic !== false,
        memberCount: 1,
        messages: [],
      };
      return newRoom;
    }
  },

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
