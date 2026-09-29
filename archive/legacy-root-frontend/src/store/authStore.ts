import { create } from 'zustand';
import { api } from '../services/api';
import { UserProfile } from '../types';

type AuthState = {
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
};

const load = (key: string) => localStorage.getItem(key) || localStorage.getItem(key.replace('sonique_', 'aura_'));
const save = (key: string, value: string | null) => {
  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
    localStorage.removeItem(key.replace('sonique_', 'aura_'));
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: load('sonique_access_token'),
  refreshToken: load('sonique_refresh_token'),
  loading: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const data = await api.login({ email, password });
      save('sonique_access_token', data.accessToken);
      save('sonique_refresh_token', data.refreshToken);
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
      save('sonique_access_token', data.accessToken);
      save('sonique_refresh_token', data.refreshToken);
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

  logout() {
    save('sonique_access_token', null);
    save('sonique_refresh_token', null);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      error: null,
    });
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
        save('sonique_access_token', data.accessToken);
        save('sonique_refresh_token', data.refreshToken);
        set({
          user: data.user,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        return;
      } catch {}
    }
    get().logout();
  },
}));
