export type Role = {
  id: string;
  code: string;
  name: string;
  description?: string | null;
};

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  status: 'ACTIVE' | 'LOCKED';
  roles: string[];
};

export type UserListItem = {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: 'ACTIVE' | 'LOCKED';
  roles: Role[];
  createdAt: string;
  updatedAt: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  errorCode: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
};
