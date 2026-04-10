import api from './index';

export interface StakePool {
  id: number;
  name: string;
  lockDays: number;
  baseApy: number;
  maxStake: number;
  minStake: number;
  penaltyRate: number;
}

export const getPools = () => {
  return api.get('/api/stake/pools');
};

export const deposit = (poolId: number, amount: number, autoCompound: boolean) => {
  return api.post('/api/stake/deposit', { poolId, amount, autoCompound });
};

export const getMyStakes = () => {
  return api.get('/api/stake/my');
};

export const claim = (stakeId: number) => {
  return api.post('/api/stake/claim', { stakeId });
};

export const withdraw = (stakeId: number) => {
  return api.post('/api/stake/withdraw', { stakeId });
};
