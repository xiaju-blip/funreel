import api from './index';

export const getMyInviteCode = () => {
  return api.get('/api/invite/code');
};

export const getMyInviteStats = () => {
  return api.get('/api/invite/stats');
};

export const getMyInviteRecords = (page: number = 1) => {
  return api.get(`/api/invite/records?page=${page}`);
};

export const bindInviteCode = (inviteCode: string) => {
  return api.post('/api/invite/bind', { inviteCode });
};
