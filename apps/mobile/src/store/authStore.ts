import { create } from 'zustand';
import { api, saveTokens, getStoredToken, getStoredRefreshToken } from '../services/api';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  subscription: any | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  subscription: null,
  accessToken: getStoredToken(),
  refreshToken: getStoredRefreshToken(),
  isLoading: false,
  error: null,


  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login({ email, password });
      await saveTokens(data.accessToken, data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Login failed. Please check your credentials.',
      });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.register({ name, email, password });
      await saveTokens(data.accessToken, data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Registration failed. Please try again.',
      });
      throw err;
    }
  },

  logout: async () => {
    const { refreshToken } = get();
    try {
      await api.logout(refreshToken || undefined);
    } catch {
      // Proceed with local logout regardless of network failure
    } finally {
      await saveTokens(null, null);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null,
      });
    }
  },

  hydrate: async () => {
    const token = getStoredToken();
    const refreshToken = getStoredRefreshToken();

    if (!token && !refreshToken) {
      return;
    }

    set({ isLoading: true });
    try {
      if (token) {
        const user = await api.me();
        set({ user, accessToken: token, isLoading: false });
        return;
      }
    } catch {
      // Token might be expired, attempt refresh
    }

    if (refreshToken) {
      try {
        const data = await api.refresh(refreshToken);
        await saveTokens(data.accessToken, data.refreshToken);
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isLoading: false,
        });
        return;
      } catch {
        await saveTokens(null, null);
        set({ user: null, accessToken: null, refreshToken: null, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),

  updateUser: (updated) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null,
    })),
}));
