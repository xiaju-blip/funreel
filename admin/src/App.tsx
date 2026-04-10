import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import { useTranslation } from 'react-i18next';
import './i18n';
import AssetManager from './pages/assets/AssetManager';
import UserManager from './pages/users/UserManager';
import DramaManager from './pages/dramas/DramaManager';
import TradeManager from './pages/trade/TradeManager';
import RiskManager from './pages/risk/RiskManager';
import FinancialManager from './pages/financial/FinancialManager';

const { Header, Sider, Content } = Layout;

function App() {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 恢复语言设置
  useEffect(() => {
    const savedLang = localStorage.getItem('admin-language');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('admin-language', lang);
  };

  return (
    <BrowserRouter>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div className="logo" style={{ height: 64, background: '#001529', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: collapsed ? 14 : 16 }}>
              {collapsed ? 'F' : 'FunReel Admin'}
            </span>
          </div>
          <Menu theme="dark" defaultSelectedKeys={['assets']} mode="inline">
            <Menu.Item key="assets">
              <span>{t('menu:assets') || 'Assets'}</span>
            </Menu.Item>
            <Menu.Item key="users">
              <span>{t('menu:users') || 'Users'}</span>
            </Menu.Item>
            <Menu.Item key="dramas">
              <span>{t('menu:dramas') || 'Dramas'}</span>
            </Menu.Item>
            <Menu.Item key="trade">
              <span>{t('menu:trade') || 'Trade'}</span>
            </Menu.Item>
            <Menu.Item key="financial">
              <span>{t('menu:financial') || 'Finance'}</span>
            </Menu.Item>
            <Menu.Item key="risk">
              <span>{t('menu:risk') || 'Risk & Security'}</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ padding: '0 16px', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <div>
              <button onClick={() => changeLanguage('zh')} style={{ margin: '0 4px', padding: '4px 8px' }}>中文</button>
              <button onClick={() => changeLanguage('en')} style={{ margin: '0 4px', padding: '4px 8px' }}>EN</button>
            </div>
          </Header>
          <Content style={{ margin: '16px', background: colorBgContainer, padding: 16, borderRadius: 8 }}>
            <Routes>
              <Route path="/" element={<AssetManager />} />
              <Route path="/assets" element={<AssetManager />} />
              <Route path="/users" element={<UserManager />} />
              <Route path="/dramas" element={<DramaManager />} />
              <Route path="/trade" element={<TradeManager />} />
              <Route path="/financial" element={<FinancialManager />} />
              <Route path="/risk" element={<RiskManager />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
