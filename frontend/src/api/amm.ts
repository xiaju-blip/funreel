import api from './index';

export interface PoolInfo {
  id: number;
  assetId: number;
  assetName: string;
  baseToken: string;
  reserveIpt: number;
  reserveBase: number;
  feeRate: number;
}

export const getPools = () => {
  return api.get('/api/amm/pools');
};

export const ammSwap = (
  poolId: number,
  direction: 'buy_ipt' | 'sell_ipt',
  amountIn: number,
  minOut: number,
) => {
  return api.post('/api/amm/swap', {
    poolId,
    direction,
    amountIn,
    minOut,
  });
};
