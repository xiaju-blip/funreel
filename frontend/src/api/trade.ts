import api from './index';

export const getMyOrders = () => {
  return api.get('/api/orders/my');
};
