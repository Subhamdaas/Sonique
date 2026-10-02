import { create } from 'zustand';
import { api } from '../services/api';
import { Playlist, Track } from '../types';

interface LibraryState {
  playlists: Playlist[];
  myPlaylists: Playlist[];
  likedTracks: Track[];
  likedTrackIds: Set<string>;
  history: Track[];
  isLoading: boolean;
  error: string | null;

  fetchLibrary: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
  fetchLikedTracks: () => Promise<void>;
  fetchHistory: () => Promise<void>;
  toggleLike: (track: Track) => Promise<boolean>;
  createPlaylist: (
    titleOrInput: string | { title: string; description?: string },
    description?: string,
  ) => Promise<Playlist>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  playlists: [],
  myPlaylists: [],
  likedTracks: [],
  likedTrackIds: new Set<string>(),
  history: [],
  isLoading: false,
  error: null,

  fetchLibrary: async () => {
    set({ isLoading: true, error: null });
    try {
      const [playlists, likes, history] = await Promise.all([
        api.getMyPlaylists().catch(() => []),
        api.getLikedTracks().catch(() => []),
        api.getHistory(20).catch(() => []),
      ]);

      const likedIds = new Set<string>(likes.map((t: Track) => t.id));
      set({
        playlists: playlists || [],
        myPlaylists: playlists || [],
        likedTracks: likes || [],
        likedTrackIds: likedIds,
        history: history || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Failed to load library',
      });
    }
  },

  fetchPlaylists: async () => {
    try {
      const playlists = await api.getMyPlaylists();
      set({ playlists: playlists || [], myPlaylists: playlists || [] });
    } catch {}
  },

  fetchLikedTracks: async () => {
    try {
      const likes = await api.getLikedTracks();
      const likedIds = new Set<string>(likes.map((t: Track) => t.id));
      set({ likedTracks: likes || [], likedTrackIds: likedIds });
    } catch {}
  },

  fetchHistory: async () => {
    try {
      const history = await api.getHistory(20);
      set({ history: history || [] });
    } catch {}
  },

  toggleLike: async (track: Track) => {
    const { likedTrackIds, likedTracks } = get();
    const isCurrentlyLiked = likedTrackIds.has(track.id);

    // Optimistic update
    const updatedIds = new Set(likedTrackIds);
    let updatedTracks = [...likedTracks];

    if (isCurrentlyLiked) {
      updatedIds.delete(track.id);
      updatedTracks = updatedTracks.filter((t) => t.id !== track.id);
    } else {
      updatedIds.add(track.id);
      updatedTracks = [track, ...updatedTracks];
    }

    set({ likedTrackIds: updatedIds, likedTracks: updatedTracks });

    try {
      if (isCurrentlyLiked) {
        await api.unlikeTrack(track.id);
      } else {
        await api.likeTrack(track.id);
      }
      return !isCurrentlyLiked;
    } catch {
      // Rollback on failure
      set({ likedTrackIds, likedTracks });
      return isCurrentlyLiked;
    }
  },

  createPlaylist: async (titleOrInput, description) => {
    try {
      const payload =
        typeof titleOrInput === 'string'
          ? { title: titleOrInput, description }
          : titleOrInput;

      const pl = await api.createPlaylist(payload);
      set((state) => ({
        playlists: [pl, ...state.playlists],
        myPlaylists: [pl, ...state.myPlaylists],
      }));
      return pl;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create playlist');
    }
  },

  deletePlaylist: async (playlistId) => {
    try {
      await api.deletePlaylist(playlistId);
      set((state) => ({
        playlists: state.playlists.filter((p) => p.id !== playlistId),
        myPlaylists: state.myPlaylists.filter((p) => p.id !== playlistId),
      }));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete playlist');
    }
  },

  addTrackToPlaylist: async (playlistId, trackId) => {
    try {
      await api.addTrackToPlaylist(playlistId, trackId);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add track');
    }
  },

  removeTrackFromPlaylist: async (playlistId, trackId) => {
    try {
      await api.removeTrackFromPlaylist(playlistId, trackId);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to remove track');
    }
  },
}));
