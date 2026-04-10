import api from './index';

export interface Asset {
  id: number;
  name: string;
  cover: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  apy: number;
  durationDays: number;
  status: number;
}

export const getAllAssets = () => {
  return api.get('/api/assets');
};

export const getAsset = (id: number) => {
  return api.get(`/api/assets/${id}`);
};
