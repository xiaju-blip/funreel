import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { login } from '../../api/auth';
import './Auth.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.token);
      setUser(response.user, response.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>{t('auth:login') || 'Login'}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('auth:email') || 'Email'}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth:password') || 'Password'}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (t('common:loading') || 'Loading...') : (t('auth:login') || 'Login')}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            {t('auth:noAccount') || "Don't have an account?"}{' '}
            <Link to="/register">{t('auth:register') || 'Register'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
