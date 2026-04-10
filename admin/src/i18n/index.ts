import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import common_zh from '../locales/zh/common.json';
import common_en from '../locales/en/common.json';
import menu_zh from '../locales/zh/menu.json';
import menu_en from '../locales/en/menu.json';

const resources = {
  zh: {
    common: common_zh,
    menu: menu_zh,
  },
  en: {
    common: common_en,
    menu: menu_en,
  },
};

const defaultLanguage = localStorage.getItem('admin-language') || 
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
