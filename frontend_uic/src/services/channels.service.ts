import { api } from '@/lib/http';
import type { Category, Channel } from '@/lib/types';

export const channelsService = {
  list: (userId: number) =>
    api.get<Channel[]>('/channels', { params: { userId } }).then((r) => r.data),

  create: (name: string) => api.post<Channel>('/channels', { name }).then((r) => r.data),

  rename: (id: number, name: string) => api.patch(`/channels/${id}`, { name }).then((r) => r.data),

  remove: (id: number) => api.delete(`/channels/${id}`).then((r) => r.data),

  createCategory: (channelId: number, name: string) =>
    api.post<Category>(`/channels/${channelId}/categories`, { name }).then((r) => r.data),

  renameCategory: (id: number, name: string) =>
    api.patch(`/categories/${id}`, { name }).then((r) => r.data),

  removeCategory: (id: number) => api.delete(`/categories/${id}`).then((r) => r.data),
};
