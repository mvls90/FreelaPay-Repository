// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password, totp_code) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password, totp_code });
          
          if (data.requires_2fa) {
            set({ isLoading: false });
            return { requires_2fa: true };
          }

          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          });

          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', userData);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
          });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        delete api.defaults.headers.common['Authorization'];
      },

      updateUser: (userData) => {
        set((state) => ({ user: { ...state.user, ...userData } }));
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return null;

        try {
          const { data } = await api.post('/auth/refresh', { refreshToken });
          set({ accessToken: data.accessToken });
          api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          return data.accessToken;
        } catch {
          get().logout();
          return null;
        }
      },
    }),
    {
      name: 'freeapi-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// src/store/notificationStore.js
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => {
    const unread = notifications.filter(n => !n.is_read).length;
    set({ notifications, unreadCount: unread });
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount: 0,
    }));
  },
}));
