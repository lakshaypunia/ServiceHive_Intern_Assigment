import type { User } from '../types';

const TOKEN_KEY = 'sld_token';
const USER_KEY = 'sld_user';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => { localStorage.setItem(TOKEN_KEY, token); };
export const clearToken = (): void => { localStorage.removeItem(TOKEN_KEY); };

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredUser = (): void => { localStorage.removeItem(USER_KEY); };
