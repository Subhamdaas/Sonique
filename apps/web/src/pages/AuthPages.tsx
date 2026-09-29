import { useState } from 'react';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import soniqueLogo from '../assets/sonique-logo.jpg';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'Invalid email or password');
    }
  };

  return (
    <div className="retroAuthContainer">
      <div className="retroAuthCard">
        {/* Sonique Logo Header */}
        <div className="retroAuthLogo" onClick={() => navigate('/')}>
          <img src={soniqueLogo} alt="Sonique" className="retroAuthLogoImg" />
          <div className="retroAuthBrand">
            <span className="retroAuthBrandTitle">Sonique</span>
            <span className="retroAuthBrandSub">AUDIOPHILE VINYL STREAMING</span>
          </div>
        </div>

        <h1 className="retroAuthTitle">Sign In to Your Account</h1>

        {(localError || error) && (
          <div className="retroAuthError">
            <AlertCircle size={16} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="retroAuthForm">
          <div className="retroFormField">
            <label>Email address</label>
            <div className="retroInputWrap">
              <Mail size={16} className="retroInputIcon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
              />
            </div>
          </div>

          <div className="retroFormField">
            <label>Password</label>
            <div className="retroInputWrap">
              <Lock size={16} className="retroInputIcon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="retroBlackBtn fullWidth" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="retroAuthFooter">
          <span>Don't have an account?</span>
          <Link to="/register" className="retroAuthLink">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!name.trim() || !email.trim() || !password) {
      setLocalError('Please fill out all fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/');
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="retroAuthContainer">
      <div className="retroAuthCard">
        {/* Sonique Logo Header */}
        <div className="retroAuthLogo" onClick={() => navigate('/')}>
          <img src={soniqueLogo} alt="Sonique" className="retroAuthLogoImg" />
          <div className="retroAuthBrand">
            <span className="retroAuthBrandTitle">Sonique</span>
            <span className="retroAuthBrandSub">AUDIOPHILE VINYL STREAMING</span>
          </div>
        </div>

        <h1 className="retroAuthTitle">Create Your Account</h1>

        {(localError || error) && (
          <div className="retroAuthError">
            <AlertCircle size={16} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="retroAuthForm">
          <div className="retroFormField">
            <label>Full Name</label>
            <div className="retroInputWrap">
              <User size={16} className="retroInputIcon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Miles Davis"
                required
              />
            </div>
          </div>

          <div className="retroFormField">
            <label>Email address</label>
            <div className="retroInputWrap">
              <Mail size={16} className="retroInputIcon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
              />
            </div>
          </div>

          <div className="retroFormField">
            <label>Password (min. 6 characters)</label>
            <div className="retroInputWrap">
              <Lock size={16} className="retroInputIcon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" className="retroBlackBtn fullWidth" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="retroAuthFooter">
          <span>Already have an account?</span>
          <Link to="/login" className="retroAuthLink">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
