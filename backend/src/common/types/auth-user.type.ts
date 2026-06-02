import { UserStatus } from '@prisma/client';

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  status: UserStatus;
  roles: string[];
};
