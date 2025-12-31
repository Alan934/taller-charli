import { request } from '../lib/apiClient';
import { AuthResponse, UserProfile } from '../types/auth';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export const authApi = {
  login: (payload: LoginInput) => request<AuthResponse>('/auth/login', { body: payload }),
  register: (payload: RegisterInput) => request<AuthResponse>('/auth/register', { body: payload }),
  profile: (token: string) => request<UserProfile>('/auth/profile', { token }),
};
