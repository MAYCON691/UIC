import { api } from '@/lib/http';
import type { TeamUser } from '@/lib/types';

export type EditableRole = 'ADMIN' | 'MONITORISTA';

export interface CreateUserInput {
  username: string;
  fullName: string;
  password: string;
  role: EditableRole;
}

export interface UpdateUserInput {
  fullName: string;
  role: EditableRole;
  active: boolean;
  password?: string;
}

export const usersService = {
  list: () => api.get<TeamUser[]>('/users').then((r) => r.data),

  get: (id: number) => api.get<TeamUser>(`/users/${id}`).then((r) => r.data),

  create: (input: CreateUserInput) => api.post('/users', input).then((r) => r.data),

  update: (id: number, input: UpdateUserInput) => api.patch(`/users/${id}`, input).then((r) => r.data),

  remove: (id: number) => api.delete(`/users/${id}`).then((r) => r.data),
};
