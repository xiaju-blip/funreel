import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getDramas } from '../../api/dramas';
import './DramaList.css';

interface Drama {
  id: number;
  title: { zh: string; en: string };
  cover: string;
  totalEpisodes: number;
  vipLevel: number;
}

const DramaList = () => {
  const { t, i18n } = useTranslation();
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDramas = async () => {
      try {
        const response = await getDramas();
        setDramas(response.data);
      } catch (e) {
        console.error('Failed to fetch dramas', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDramas();
  }, []);

  const currentLang = i18n.language;

  if (loading) {
    return <div className="container loading">{t('common:loading')}</div>;
  }

  return (
    <div className="container drama-list-page">
      <h1 className="page-title">{t('drama:shortDramas') || 'Short Dramas'}</h1>
      <div className="dramas-grid">
        {dramas.map((drama) => (
          <Link to={`/dramas/${drama.id}`} key={drama.id} className="drama-card-link">
            <div className="drama-card">
              <div className="drama-cover">
                <img src={drama.cover || '/default-drama.jpg'} alt={currentLang === 'zh' ? drama.title.zh : drama.title.en} />
                {drama.vipLevel > 0 && (
                  <div className="vip-badge">VIP {drama.vipLevel}</div>
                )}
              </div>
              <div className="drama-info">
                <h3 className="drama-title">
                  {currentLang === 'zh' ? drama.title.zh : drama.title.en}
                </h3>
                <p className="drama-meta">
                  {t('drama:totalEpisodes') || 'Total Episodes'}: {drama.totalEpisodes}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DramaList;
