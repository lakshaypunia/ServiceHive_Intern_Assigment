import api from './axios';
import type { ApiResponse, AuthResponse, User } from '../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'sales_user';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const registerApi = (data: RegisterPayload) =>
  api.post<ApiResponse<AuthResponse>>('/auth/register', data);

export const loginApi = (data: LoginPayload) =>
  api.post<ApiResponse<AuthResponse>>('/auth/login', data);

export const getMeApi = () =>
  api.get<ApiResponse<User>>('/auth/me');
