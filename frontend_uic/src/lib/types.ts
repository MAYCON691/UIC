export type Role = 'SUPERADMIN' | 'ADMIN' | 'MONITORISTA';

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface TeamUser extends User {
  storageBytes: number;
  _count: { files: number; channels: number };
}

export interface Category {
  id: number;
  name: string;
  channelId: number;
  _count: { files: number };
}

export interface Channel {
  id: number;
  name: string;
  userId: number;
  _count: { files: number };
  categories: Category[];
}

export interface FileItem {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  userId: number;
  channelId: number;
  categoryId: number;
  channel: { id: number; name: string };
  category: { id: number; name: string };
  user: { id: number; fullName: string; username: string };
}

export interface FilesPage {
  items: FileItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}