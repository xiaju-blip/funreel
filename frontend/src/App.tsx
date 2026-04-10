import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from './store/userStore';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/home/Home';
import { Routes, Route } from 'react-router-dom';
import DramaList from './pages/drama/DramaList';
import AssetList from './pages/assets/AssetList';
import TradeMarket from './pages/market/TradeMarket';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/Profile';
import DramaDetail from './pages/drama/DramaDetail';
import Player from './pages/player/Player';

function App() {
  const { i18n } = useTranslation();
  const { token, isAuthenticated, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage恢复语言设置
    const savedLang = localStorage.getItem('language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dramas" element={<DramaList />} />
          <Route path="/dramas/:id" element={<DramaDetail />} />
          <Route path="/player/:dramaId/:episodeId" element={<Player />} />
          <Route path="/assets" element={<AssetList />} />
          <Route path="/market" element={<TradeMarket />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
