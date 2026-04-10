import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>FunReelRWA</h3>
            <p>{t('footer:description') || 'Global Short Drama IP Investment Platform'}</p>
          </div>
          <div className="footer-section">
            <h4>{t('footer:products') || 'Products'}</h4>
            <ul>
              <li>{t('footer:investment') || 'IP Investment'}</li>
              <li>{t('footer:trading') || 'Secondary Trading'}</li>
              <li>{t('footer:staking') || 'Staking'}</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t('footer:legal') || 'Legal'}</h4>
            <ul>
              <li>{t('footer:privacy') || 'Privacy Policy'}</li>
              <li>{t('footer:terms') || 'Terms of Service'}</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>{t('footer:community') || 'Community'}</h4>
            <ul>
              <li>Twitter</li>
              <li>Discord</li>
              <li>Telegram</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 FunReelRWA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
