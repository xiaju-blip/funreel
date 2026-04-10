import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;
    if (response) {
      // 统一错误处理
      console.error('API Error:', response.data);
    } else {
      console.error('Network Error:', error);
    }
    return Promise.reject(error);
  },
);

export default api;

// API 模块导出
export * from './auth';
export * from './assets';
export * from './dramas';
export * from './watch';
export * from './trade';
export * from './amm';
export * from './points';
export * from './shop';
export * from './stake';
export * from './tasks';
export * from './invite';
