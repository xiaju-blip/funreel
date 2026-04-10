import { create } from 'zustand';
import { UserInfo } from '../api/auth';

interface UserState {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: UserInfo | null, token: string | null) => void;
  logout: () => void;
  updateLanguage: (language: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ user, token, isAuthenticated: !!token });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateLanguage: (language) => {
    set((state) => ({
      ...state,
      user: state.user ? { ...state.user, language } : null,
    }));
  },
}));
