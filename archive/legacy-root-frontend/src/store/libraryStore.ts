import { create } from 'zustand';
import { Playlist, Track } from '../types';
import { api } from '../services/api';

interface LibraryState {
  likedTracks: Track[];
  likedTrackIds: Set<string>;
  myPlaylists: Playlist[];
  isLoading: boolean;
  error: string | null;

  fetchLibrary: () => Promise<void>;
  toggleLike: (track: Track) => Promise<void>;
  createPlaylist: (input: { title: string; description?: string }) => Promise<Playlist>;
  deletePlaylist: (id: string) => Promise<void>;
  addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedTracks: [],
  likedTrackIds: new Set<string>(),
  myPlaylists: [],
  isLoading: false,
  error: null,

  fetchLibrary: async () => {
    set({ isLoading: true, error: null });
    try {
      const [liked, playlists] = await Promise.all([
        api.getLikedTracks().catch(() => []),
        api.getMyPlaylists().catch(() => []),
      ]);

      const idSet = new Set(liked.map((t) => t.id));
      set({
        likedTracks: liked,
        likedTrackIds: idSet,
        myPlaylists: playlists,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  toggleLike: async (track: Track) => {
    const { likedTrackIds, likedTracks } = get();
    const isLiked = likedTrackIds.has(track.id);

    // Optimistic update
    const nextIds = new Set(likedTrackIds);
    let nextTracks = [...likedTracks];

    if (isLiked) {
      nextIds.delete(track.id);
      nextTracks = nextTracks.filter((t) => t.id !== track.id);
    } else {
      nextIds.add(track.id);
      nextTracks = [track, ...nextTracks];
    }

    set({ likedTrackIds: nextIds, likedTracks: nextTracks });

    try {
      if (isLiked) {
        await api.unlikeTrack(track.id);
      } else {
        await api.likeTrack(track.id);
      }
    } catch (err: any) {
      // Revert on error
      set({ likedTrackIds, likedTracks, error: err.message });
    }
  },

  createPlaylist: async (input: { title: string; description?: string }) => {
    const newPlaylist = await api.createPlaylist(input);
    set((s) => ({
      myPlaylists: [newPlaylist, ...s.myPlaylists],
    }));
    return newPlaylist;
  },

  deletePlaylist: async (id: string) => {
    await api.deletePlaylist(id);
    set((s) => ({
      myPlaylists: s.myPlaylists.filter((p) => p.id !== id),
    }));
  },

  addTrackToPlaylist: async (playlistId: string, trackId: string) => {
    await api.addTrackToPlaylist(playlistId, trackId);
    // Refresh playlists count
    get().fetchLibrary();
  },
}));
