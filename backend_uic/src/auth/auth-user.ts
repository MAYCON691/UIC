import { Role } from '@prisma/client';

export class AuthUser {
  id!: number;
  username!: string;
  fullName!: string;
  role!: Role;
}