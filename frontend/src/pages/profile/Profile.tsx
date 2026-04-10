import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { getMyInviteStats } from '../../api/invite';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const [inviteStats, setInviteStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getMyInviteStats();
        setInviteStats(response);
      } catch (e) {
        console.error('Failed to fetch invite stats', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="container profile-page">
        <p>Please login first.</p>
        <Link to="/login" className="btn btn-primary">{t('common:login') || 'Login'}</Link>
      </div>
    );
  }

  return (
    <div className="container profile-page">
      <h1 className="page-title">{t('profile:profile') || 'My Profile'}</h1>

      <div className="profile-card">
        <div className="profile-header">
          <img
            src={user.avatar || '/default-avatar.png'}
            alt={user.nickname || user.email}
            className="avatar"
          />
          <div className="profile-info">
            <h2>{user.nickname || user.email}</h2>
            <p className="vip-level">{t('profile:vipLevel') || 'VIP Level'}: {user.vipLevel}</p>
            <p className="kyc-level">{t('profile:kycLevel') || 'KYC Level'}: {user.kycLevel}</p>
          </div>
        </div>
      </div>

      <div className="profile-menu">
        <div className="menu-item">
          <Link to="/my/investments">
            {t('profile:myInvestments') || 'My Investments'}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/my/orders">
            {t('profile:tradeOrders') || 'Trade Orders'}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/my/points">
            {t('profile:myPoints') || 'My Points'}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/my/stake">
            {t('profile:myStake') || 'My Staking'}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/invite">
            {t('profile:inviteFriends') || 'Invite Friends'}
          </Link>
        </div>
        <div className="menu-item">
          <Link to="/shop">
            {t('profile:pointsShop') || 'Points Mall'}
          </Link>
        </div>
      </div>

      {inviteStats && (
        <div className="invite-stats">
          <h3>{t('profile:inviteStats') || 'Invitation Statistics'}</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{inviteStats.directCount}</div>
              <div className="stat-label">{t('profile:directInvites') || 'Direct Invites'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{inviteStats.indirectCount}</div>
              <div className="stat-label">{t('profile:indirectInvites') || 'Indirect Invites'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{inviteStats.totalPoints}</div>
              <div className="stat-label">{t('profile:totalPoints') || 'Total Points Earned'}</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{inviteStats.totalToken?.toFixed(2)}</div>
              <div className="stat-label">{t('profile:totalREEL') || 'Total REEL Earned'}</div>
            </div>
          </div>

          <div className="invite-code">
            <p>{t('invite:myCode') || 'My Invite Code'}:</p>
            <code>{user.inviteCode}</code>
            <button onClick={() => navigator.clipboard.writeText(user.inviteCode || '')}>
              {t('common:copy') || 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
