import { useState } from 'react';
import { Mail, Lock, User, Radio, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

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
    <div className="spotifyAuthContainer">
      <div className="spotifyAuthCard">
        {/* Spotify Logo Header */}
        <div className="spotifyAuthLogo" onClick={() => navigate('/')}>
          <Radio size={36} color="#1ed760" />
          <span>Sonique</span>
        </div>

        <h1 className="spotifyAuthTitle">Log in to Sonique</h1>

        {(localError || error) && (
          <div className="spotifyAuthError">
            <AlertCircle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="spotifyAuthForm">
          <div className="spotifyFormField">
            <label>Email or username</label>
            <div className="spotifyInputWrap">
              <Mail size={18} className="inputIcon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or username"
                required
              />
            </div>
          </div>

          <div className="spotifyFormField">
            <label>Password</label>
            <div className="spotifyInputWrap">
              <Lock size={18} className="inputIcon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
            </div>
          </div>

          <div className="spotifyAuthMeta">
            <label className="spotifyCheckbox">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <button type="button" className="spotifyLinkBtn">
              Forgot your password?
            </button>
          </div>

          <button type="submit" className="spotifyPrimaryBtn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="spotifyAuthDivider" />

        <div className="spotifyAuthFooter">
          <span>Don't have an account?</span>
          <button type="button" onClick={() => navigate('/register')} className="spotifySecondaryBtn">
            Sign up for Sonique
          </button>
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
      setLocalError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
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
    <div className="spotifyAuthContainer">
      <div className="spotifyAuthCard">
        {/* Spotify Logo Header */}
        <div className="spotifyAuthLogo" onClick={() => navigate('/')}>
          <Radio size={36} color="#1ed760" />
          <span>Sonique</span>
        </div>

        <h1 className="spotifyAuthTitle">Sign up for free to start listening</h1>

        {(localError || error) && (
          <div className="spotifyAuthError">
            <AlertCircle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="spotifyAuthForm">
          <div className="spotifyFormField">
            <label>What's your name?</label>
            <div className="spotifyInputWrap">
              <User size={18} className="inputIcon" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="This appears on your profile"
                required
              />
            </div>
          </div>

          <div className="spotifyFormField">
            <label>What's your email?</label>
            <div className="spotifyInputWrap">
              <Mail size={18} className="inputIcon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                required
              />
            </div>
          </div>

          <div className="spotifyFormField">
            <label>Create a password</label>
            <div className="spotifyInputWrap">
              <Lock size={18} className="inputIcon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
            </div>
          </div>

          <p className="spotifyLegalText">
            By clicking on sign-up, you agree to Sonique's Terms and Conditions of Use and Privacy Policy.
          </p>

          <button type="submit" className="spotifyPrimaryBtn" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="spotifyAuthDivider" />

        <div className="spotifyAuthFooter">
          <span>Already have an account?</span>
          <button type="button" onClick={() => navigate('/login')} className="spotifySecondaryBtn">
            Log in here
          </button>
        </div>
      </div>
    </div>
  );
}
