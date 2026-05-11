import { fetchApi } from './apiClient';
import { RegisterPayload, LoginPayload, AuthResponse } from '@/types';

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    return fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /** Returns the role string of the currently authenticated user, e.g. "BROKER" or "ADMIN". */
  getRole: (): Promise<string> => fetchApi<string>('/auth/get-role'),
};

