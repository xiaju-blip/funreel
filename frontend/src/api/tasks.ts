import api from './index';

export const getTasks = (type?: number) => {
  let url = '/api/tasks/list';
  if (type !== undefined) {
    url += `?type=${type}`;
  }
  return api.get(url);
};

export const claim = (taskId: number) => {
  return api.post('/api/tasks/claim', { taskId });
};
