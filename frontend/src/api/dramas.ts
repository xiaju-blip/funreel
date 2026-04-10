import api from './index';

export interface Drama {
  id: number;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  coverImage: string;
  vipLevel: number;
  totalEpisodes: number;
}

export interface Episode {
  id: number;
  episodeNum: number;
  title: { zh: string; en: string };
  duration: number;
}

export const getDramas = () => {
  return api.get('/api/dramas');
};

export const getHotDramas = (limit: number = 10) => {
  return api.get(`/api/dramas/hot?limit=${limit}`);
};

export const getDramaDetail = (id: number) => {
  return api.get(`/api/dramas/${id}`);
};

export const getEpisodes = (dramaId: number) => {
  return api.get(`/api/dramas/${dramaId}/episodes`);
};
