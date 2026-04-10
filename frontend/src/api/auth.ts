import api from './index';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
  inviteCode?: string;
}

export interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  avatar: string;
  kycLevel: number;
  vipLevel: number;
  language: string;
  inviteCode: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return api.post('/api/auth/login/email', data);
};

export const register = (data: RegisterRequest): Promise<{success: boolean; userId: number}> => {
  return api.post('/api/auth/register', data);
};

export const sendCode = (email: string): Promise<{success: boolean}> => {
  return api.post('/api/auth/send-code', {email});
};

export const getMe = (): Promise<UserInfo> => {
  return api.get('/api/auth/me');
};

export const logout = (): Promise<void> => {
  return api.post('/api/auth/logout');
};
