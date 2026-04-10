import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './DramaCard.css';

interface DramaCardProps {
  drama: {
    id: number;
    title: { zh: string; en: string };
    cover: string;
    totalEpisodes: number;
  };
  lang: string;
}

const DramaCard = ({ drama, lang }: DramaCardProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="drama-card" onClick={() => navigate(`/dramas/${drama.id}`)}>
      <div className="drama-cover">
        <img src={drama.cover || '/default-drama.jpg'} alt={lang === 'zh' ? drama.title.zh : drama.title.en} />
      </div>
      <div className="drama-info">
        <h3 className="drama-title">{lang === 'zh' ? drama.title.zh : drama.title.en}</h3>
        <p className="drama-meta">
          {t('drama:totalEpisodes') || 'Total Episodes'}: {drama.totalEpisodes}
        </p>
      </div>
    </div>
  );
};

export default DramaCard;
