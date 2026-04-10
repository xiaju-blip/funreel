import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getDramaDetail, getEpisodes } from '../../api/dramas';
import './DramaDetail.css';

interface Episode {
  id: number;
  episodeNum: number;
  title: { zh: string; en: string };
  duration: number;
}

interface Drama {
  id: number;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  coverImage: string;
  vipLevel: number;
  totalEpisodes: number;
}

const DramaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [drama, setDrama] = useState<Drama | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [detailRes, episodesRes] = await Promise.all([
          getDramaDetail(parseInt(id as string)),
          getEpisodes(parseInt(id as string)),
        ]);
        setDrama(detailRes.data);
        setEpisodes(episodesRes.data);
      } catch (e) {
        console.error('Failed to fetch drama detail', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const currentLang = i18n.language;

  if (loading) {
    return <div className="container loading">{t('common:loading')}</div>;
  }

  if (!drama) {
    return <div className="container">{t('drama:notFound') || 'Drama not found'}</div>;
  }

  const handlePlay = (episodeId: number) => {
    navigate(`/player/${id}/${episodeId}`);
  };

  return (
    <div className="container drama-detail-page">
      <div className="drama-header">
        <div className="drama-cover">
          <img src={drama.coverImage || '/default-drama.jpg'} alt={currentLang === 'zh' ? drama.title.zh : drama.title.en} />
          {drama.vipLevel > 0 && (
            <div className="vip-badge">VIP {drama.vipLevel}</div>
          )}
        </div>
        <div className="drama-info">
          <h1>{currentLang === 'zh' ? drama.title.zh : drama.title.en}</h1>
          <p className="description">
            {currentLang === 'zh' ? (drama.description as any).zh : (drama.description as any).en}
          </p>
          <div className="meta-row">
            <span className="meta-item">
              {t('drama:totalEpisodes') || 'Total Episodes'}: {drama.totalEpisodes}
            </span>
          </div>
        </div>
      </div>

      <div className="episodes-list">
        <h2>{t('drama:episodes') || 'Episodes'}</h2>
        <div className="episodes-grid">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="episode-card"
              onClick={() => handlePlay(episode.id)}
            >
              <div className="episode-number">{episode.episodeNum}</div>
              <div className="episode-title">
                {currentLang === 'zh' ? episode.title.zh : episode.title.en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DramaDetail;
