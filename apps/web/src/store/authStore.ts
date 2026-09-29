import { create } from 'zustand';
import { api, saveTokens } from '../services/api';
import { UserProfile } from '../types';

type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('sonique_access_token');
  } catch {
    return null;
  }
};

const getStoredRefreshToken = () => {
  try {
    return localStorage.getItem('sonique_refresh_token');
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: getStoredToken(),
  refreshToken: getStoredRefreshToken(),
  loading: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const data = await api.login({ email, password });
      saveTokens(data.accessToken, data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        loading: false,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e.message || 'Unable to sign in',
      });
      throw e;
    }
  },

  async register(name, email, password) {
    set({ loading: true, error: null });
    try {
      const data = await api.register({ name, email, password });
      saveTokens(data.accessToken, data.refreshToken);
      set({
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        loading: false,
      });
    } catch (e: any) {
      set({
        loading: false,
        error: e.message || 'Unable to register',
      });
      throw e;
    }
  },

  async logout() {
    const { refreshToken } = get();
    try {
      await api.logout(refreshToken || undefined);
    } catch {
      // safe fallback
    } finally {
      saveTokens(null, null);
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        error: null,
      });
    }
  },

  async hydrate() {
    const { accessToken, refreshToken } = get();
    if (!accessToken && !refreshToken) return;

    try {
      if (accessToken) {
        const user = await api.me();
        set({ user });
        return;
      }
    } catch {}

    if (refreshToken) {
      try {
        const data = await api.refresh(refreshToken);
        saveTokens(data.accessToken, data.refreshToken);
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } catch {
        saveTokens(null, null);
        set({ user: null, accessToken: null, refreshToken: null });
      }
    }
  },
}));
