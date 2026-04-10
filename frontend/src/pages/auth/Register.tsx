import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { register, sendCode } from '../../api/auth';
import './Auth.css';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      setError('Please enter email');
      return;
    }
    setLoading(true);
    try {
      await sendCode(email);
      setCodeSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await register({ email, password, inviteCode });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1>{t('auth:register') || 'Register'}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>{t('auth:email') || 'Email'}</label>
            <div className="input-with-button">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleSendCode}
                disabled={loading || !email}
              >
                {codeSent ? (t('auth:resend') || 'Resend') : (t('auth:sendCode') || 'Send Code')}
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>{t('auth:verificationCode') || 'Verification Code'}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
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
          <div className="form-group">
            <label>{t('auth:confirmPassword') || 'Confirm Password'}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
          <div className="form-group">
            <label>{t('auth:inviteCode') || 'Invite Code (Optional)'}</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code if you have one"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? (t('common:loading') || 'Loading...') : (t('auth:register') || 'Register')}
          </button>
        </form>
        <div className="auth-footer">
          <p>
            {t('auth:hasAccount') || 'Already have an account?'}{' '}
            <Link to="/login">{t('auth:login') || 'Login'}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
