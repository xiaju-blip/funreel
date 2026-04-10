import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import api from '../../api';
import './Home.css';
import AssetCard from './components/AssetCard';
import DramaCard from './components/DramaCard';

interface Banner {
  id: number;
  image: string;
  title: { zh: string; en: string };
  link: string;
}

interface RecommendAsset {
  id: number;
  name: string;
  cover: string;
  apy: number;
  raisedAmount: number;
  targetAmount: number;
}

interface HotDrama {
  id: number;
  title: { zh: string; en: string };
  cover: string;
  totalEpisodes: number;
}

const Home = () => {
  const { t, i18n } = useTranslation();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [recommendAssets, setRecommendAssets] = useState<RecommendAsset[]>([]);
  const [hotDramas, setHotDramas] = useState<HotDrama[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAssets: 0,
    totalDividends: 0,
  });

  useEffect(() => {
    // TODO: 调用API获取首页数据
    // 示例数据
    setBanners([
      {
        id: 1,
        image: '/banner1.jpg',
        title: { zh: '新剧上线：爆款短剧等你来投', en: 'New Drama: Blockbuster Short Drama Investment' },
        link: '/dramas',
      },
    ]);

    setRecommendAssets([
      {
        id: 1,
        name: '都市无双赘婿',
        cover: '/asset1.jpg',
        apy: 18.5,
        raisedAmount: 500000,
        targetAmount: 1000000,
      },
    ]);

    setHotDramas([
      {
        id: 1,
        title: { zh: '都市无双赘婿', en: 'Urban Peerless Son-in-Law' },
        cover: '/drama1.jpg',
        totalEpisodes: 100,
      },
    ]);

    setStats({
      totalUsers: 125800,
      totalAssets: 125,
      totalDividends: 2580000,
    });
  }, []);

  const currentLanguage = i18n.language;

  return (
    <div className="home-page">
      {/* Banner 轮播 */}
      <section className="banner-section">
        <div className="banner-slide">
          {banners.length > 0 && (
            <>
              <div className="banner-content">
                <h1>{currentLanguage === 'zh' ? banners[0].title.zh : banners[0].title.en}</h1>
                <a href={banners[0].link} className="btn btn-primary">
                  {t('common:explore') || 'Explore Now'}
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 核心数据统计 */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
              <div className="stat-label">{t('home:totalUsers') || 'Total Users'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{stats.totalAssets}</div>
              <div className="stat-label">{t('home:totalAssets') || 'IP Assets'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">${stats.totalDividends.toLocaleString()}</div>
              <div className="stat-label">{t('home:totalDividends') || 'Total Dividends'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 推荐资产 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>{t('home:recommendAssets') || 'Recommended Assets'}</h2>
            <a href="/assets" className="view-all">{t('home:viewAll') || 'View All →'}</a>
          </div>
          <div className="assets-grid">
            {recommendAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      </section>

      {/* 热门短剧 */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>{t('home:hotDramas') || 'Hot Dramas'}</h2>
            <a href="/dramas" className="view-all">{t('home:viewAll') || 'View All →'}</a>
          </div>
          <div className="dramas-grid">
            {hotDramas.map((drama) => (
              <DramaCard key={drama.id} drama={drama} lang={currentLanguage} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
