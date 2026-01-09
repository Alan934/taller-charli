import { request } from '../lib/apiClient';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  bookingId?: number;
  createdAt: string;
}

export const notificationsService = {
  getAll: (token: string) => request<Notification[]>('/notifications', { token }),
  getUnreadCount: (token: string) => request<number>('/notifications/unread-count', { token }),
  markAsRead: (id: string, token: string) => request<void>(`/notifications/${id}/read`, { method: 'PATCH', token }),
  markAllAsRead: (token: string) => request<void>('/notifications/read-all', { method: 'PATCH', token }),
};
