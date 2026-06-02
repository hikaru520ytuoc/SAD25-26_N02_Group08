import { apiFetch } from '@/lib/api-client';
import type { AuthUser } from '@/types/auth';

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResult = {
  accessToken: string;
  user: AuthUser;
};

export function login(input: LoginInput) {
  return apiFetch<LoginResult>('/api/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(input),
  });
}

export function getMe() {
  return apiFetch<AuthUser>('/api/auth/me', {
    method: 'GET',
  });
}
