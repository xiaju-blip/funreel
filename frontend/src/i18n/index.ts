import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common_zh from '../../public/locales/zh/common.json';
import common_en from '../../public/locales/en/common.json';
import home_zh from '../../public/locales/zh/home.json';
import home_en from '../../public/locales/en/home.json';
import trade_zh from '../../public/locales/zh/trade.json';
import trade_en from '../../public/locales/en/trade.json';
import drama_zh from '../../public/locales/zh/drama.json';
import drama_en from '../../public/locales/en/drama.json';

const resources = {
  zh: {
    common: common_zh,
    home: home_zh,
    trade: trade_zh,
    drama: drama_zh,
  },
  en: {
    common: common_en,
    home: home_en,
    trade: trade_en,
    drama: drama_en,
  },
};

const defaultLanguage = localStorage.getItem('language') || 
  (navigator.language.startsWith('zh') ? 'zh' : 'en');

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: defaultLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
