import { api } from '@/lib/http';
import type { User } from '@/lib/types';

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const authService = {
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  updateProfile: (fullName: string) =>
    api.patch<User>('/auth/profile', { fullName }).then((r) => r.data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/auth/password', { currentPassword, newPassword }).then((r) => r.data),
};
