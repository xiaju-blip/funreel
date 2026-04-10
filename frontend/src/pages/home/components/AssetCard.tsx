import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './AssetCard.css';

interface AssetCardProps {
  asset: {
    id: number;
    name: string;
    cover: string;
    apy: number;
    raisedAmount: number;
    targetAmount: number;
  };
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const progress = (asset.raisedAmount / asset.targetAmount) * 100;

  return (
    <div className="asset-card" onClick={() => navigate(`/assets/${asset.id}`)}>
      <div className="asset-cover">
        <img src={asset.cover || '/default-asset.jpg'} alt={asset.name} />
      </div>
      <div className="asset-info">
        <h3 className="asset-name">{asset.name}</h3>
        <div className="asset-apy">{t('assets:apy') || 'APY'}: {asset.apy}%</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-text">
          {asset.raisedAmount.toFixed(0)} / {asset.targetAmount.toFixed(0)} USDT
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
