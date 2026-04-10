import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getPools, ammSwap } from '../../api/amm';
import './TradeMarket.css';

interface PoolInfo {
  id: number;
  assetId: number;
  assetName: string;
  baseToken: string;
  reserveIpt: number;
  reserveBase: number;
  feeRate: number;
}

const TradeMarket = () => {
  const { t } = useTranslation();
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [selectedPool, setSelectedPool] = useState<PoolInfo | null>(null);
  const [direction, setDirection] = useState<'buy_ipt' | 'sell_ipt'>('buy_ipt');
  const [amountIn, setAmountIn] = useState('');
  const [minOut, setMinOut] = useState('');
  const [priceImpact, setPriceImpact] = useState(0);
  const [expectedOut, setExpectedOut] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPools = async () => {
      try {
        const response = await getPools();
        setPools(response.data);
        if (response.data.length > 0) {
          setSelectedPool(response.data[0]);
        }
      } catch (e) {
        console.error('Failed to fetch pools', e);
      }
    };
    fetchPools();
  }, []);

  // 计算预期输出（恒定乘积）
  useEffect(() => {
    if (!selectedPool || !amountIn || parseFloat(amountIn) <= 0) {
      setExpectedOut(0);
      setPriceImpact(0);
      return;
    }

    const amount = parseFloat(amountIn);
    const feeRate = selectedPool.feeRate;
    const amountInAfterFee = amount * (1 - feeRate);
    
    let out: number;
    if (direction === 'buy_ipt') {
      out = (selectedPool.reserveIpt * amountInAfterFee) / (selectedPool.reserveBase + amountInAfterFee);
    } else {
      out = (selectedPool.reserveBase * amountInAfterFee) / (selectedPool.reserveIpt + amountInAfterFee);
    }

    setExpectedOut(out);

    // 计算价格影响
    const spotPrice = direction === 'buy_ipt'
      ? selectedPool.reserveBase / selectedPool.reserveIpt
      : selectedPool.reserveIpt / selectedPool.reserveBase;
    const executionPrice = amount / out;
    const impact = Math.abs((executionPrice - spotPrice) / spotPrice * 100);
    setPriceImpact(impact);

    // 设置最小输出（滑点保护，默认 0.5%）
    const minOutValue = out * 0.995;
    setMinOut(minOutValue.toFixed(6));
  }, [selectedPool, direction, amountIn]);

  const handleSwap = async () => {
    if (!selectedPool || !amountIn || !minOut) return;
    setLoading(true);

    try {
      const result = await ammSwap(
        selectedPool.id,
        direction,
        parseFloat(amountIn),
        parseFloat(minOut)
      );

      if (result.success) {
        // 刷新池子数据
        // 成功后重置输入
        setAmountIn('');
        alert(`${t('trade:swapSuccess') || 'Swap succeeded'}! ${result.amountOut} received`);
      } else {
        alert(`${t('trade:swapFailed') || 'Swap failed'}: ${result.error}`);
      }
    } catch (e) {
      console.error('Swap failed', e);
      alert('Swap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container trade-market-page">
      <h1 className="page-title">{t('trade:market') || 'Trading Market'}</h1>

      <div className="trade-layout">
        <div className="pool-list">
          <h3>{t('trade:availablePools') || 'Available Pools'}</h3>
          {pools.map((pool) => (
            <div
              key={pool.id}
              className={`pool-item ${selectedPool?.id === pool.id ? 'active' : ''}`}
              onClick={() => setSelectedPool(pool)}
            >
              <div className="pool-asset">{pool.assetName}</div>
              <div className="pool-pair">
                IPT / {pool.baseToken}
              </div>
            </div>
          ))}
        </div>

        {selectedPool && (
          <div className="swap-card">
            <h2>{selectedPool.assetName} - {selectedPool.baseToken}</h2>

            <div className="direction-selector">
              <button
                className={direction === 'buy_ipt' ? 'active' : ''}
                onClick={() => setDirection('buy_ipt')}
              >
                {t('trade:buy') || 'Buy'} IPT
              </button>
              <button
                className={direction === 'sell_ipt' ? 'active' : ''}
                onClick={() => setDirection('sell_ipt')}
              >
                {t('trade:sell') || 'Sell'} IPT
              </button>
            </div>

            <div className="input-group">
              <label>
                {direction === 'buy_ipt'
                  ? `${selectedPool.baseToken} ${t('trade:amountIn') || 'Amount In'}`
                  : `IPT ${t('trade:amountIn') || 'Amount In'}`
                }
              </label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div className="price-info">
              <div className="price-row">
                <span>{t('trade:expectedOutput') || 'Expected Output'}:</span>
                <span className="value">
                  {expectedOut > 0 ? expectedOut.toFixed(6) : '0'}
                  {direction === 'buy_ipt' ? ' IPT' : ` ${selectedPool.baseToken}`}
                </span>
              </div>
              <div className="price-row">
                <span>{t('trade:priceImpact') || 'Price Impact'}:</span>
                <span className={`value ${priceImpact > 5 ? 'high-impact' : ''}`}>
                  {priceImpact.toFixed(2)}%
                </span>
              </div>
              <div className="price-row">
                <span>{t('trade:fee') || 'Fee'}:</span>
                <span className="value">{(selectedPool.feeRate * 100).toFixed(2)}%</span>
              </div>
            </div>

            <div className="input-group">
              <label>{t('trade:minOutput') || 'Minimum Output (slippage protection)'}:</label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={minOut}
                onChange={(e) => setMinOut(e.target.value)}
                placeholder="Minimum amount you will receive"
              />
            </div>

            <button
              className="btn btn-primary btn-block swap-button"
              onClick={handleSwap}
              disabled={loading || !amountIn || parseFloat(amountIn) <= 0}
            >
              {loading ? (t('common:loading') || 'Processing...') : (t('trade:swap') || 'Swap')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeMarket;
