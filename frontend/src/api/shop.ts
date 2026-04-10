import api from './index';

export interface ShopItem {
  id: number;
  name: string;
  type: number;
  points: number;
  tokenAmount?: number;
}

export const getItems = () => {
  return api.get('/api/shop/items');
};

export const exchange = (itemId: number, quantity: number) => {
  return api.post('/api/shop/exchange', { itemId, quantity });
};
