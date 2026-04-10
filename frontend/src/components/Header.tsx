import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import './Header.css';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, user, logout } = useUserStore();
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    setLanguageMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <span className="logo-text">FunReelRWA</span>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">{t('common:home')}</Link>
            <Link to="/dramas" className="nav-link">{t('common:drama')}</Link>
            <Link to="/assets" className="nav-link">{t('common:assets')}</Link>
            <Link to="/market" className="nav-link">{t('common:market')}</Link>
          </nav>

          <div className="header-right">
            <div className="language-switcher">
              <button
                className="language-button"
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
              >
                <span className="language-icon">🌐</span>
                <span className="current-language">{i18n.language === 'zh' ? '中文' : 'EN'}</span>
              </button>
              {languageMenuOpen && (
                <div className="language-dropdown">
                  <button
                    className={i18n.language === 'zh' ? 'active' : ''}
                    onClick={() => changeLanguage('zh')}
                  >
                    🇨🇳 简体中文
                  </button>
                  <button
                    className={i18n.language === 'en' ? 'active' : ''}
                    onClick={() => changeLanguage('en')}
                  >
                    🇬🇧 English
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="user-menu">
                <Link to="/profile" className="user-link">
                  {user?.nickname || t('common:mine')}
                </Link>
                <button className="logout-button" onClick={logout}>
                  {t('common:logout')}
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline">{t('common:login')}</Link>
                <Link to="/register" className="btn btn-primary">{t('common:register')}</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
