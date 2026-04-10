import api from './index';

export const getBalance = () => {
  return api.get('/api/points/balance');
};

export const getHistory = (page: number = 1) => {
  return api.get(`/api/points/history?page=${page}`);
};
