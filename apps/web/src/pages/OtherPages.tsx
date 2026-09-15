import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Music2,
  Podcast,
  ShieldCheck,
  UploadCloud,
  Users,
  Settings,
  LogOut,
  Plus,
  Sparkles,
  Check,
  Crown,
  Zap,
  FileAudio,
  ImageIcon,
} from 'lucide-react';
import { Button, Card, SectionHeader } from '../components/ui';
import { SongRow } from '../components/media';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { api } from '../services/api';
import { Track } from '../types';

export function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { myPlaylists, likedTracks } = useLibraryStore();
  const player = usePlayerStore();
  const navigate = useNavigate();
  const [history, setHistory] = useState<Track[]>([]);
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    if (user) {
      api.getHistory(5).then(setHistory).catch(() => {});
      api.getCurrentSubscription(user.id).then(setSub).catch(() => {});
    }
  }, [user]);

  if (!user) {
    return (
      <div className="searchEmpty" style={{ padding: '64px 16px' }}>
        <h2>You are not signed in</h2>
        <p>Sign in or create an account to view your listening profile and library.</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/login')}>Sign in</Button>
          <Button variant="soft" onClick={() => navigate('/register')}>
            Create account
          </Button>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SQ';

  return (
    <div>
      <div className="profileHeader" style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '24px 0' }}>
        <div className="avatar large">{initials}</div>
        <div style={{ flex: 1 }}>
          <span className="eyebrow">PROFILE</span>
          <h1 style={{ margin: '8px 0', fontSize: '42px' }}>{user.name}</h1>
          <p style={{ color: 'var(--muted)', margin: 0 }}>
            {user.role} · {myPlaylists.length} playlists · {likedTracks.length} liked tracks · Plan: <strong style={{ color: 'var(--accent)' }}>{sub?.plan || 'FREE'}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="soft" onClick={() => navigate('/premium')}>
            <Crown size={16} /> Manage Plan
          </Button>
          <Button
            variant="soft"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={16} /> Sign out
          </Button>
        </div>
      </div>

      <div className="statsGrid">
        <Stat n={String(likedTracks.length)} l="Liked songs" />
        <Stat n={String(myPlaylists.length)} l="Your playlists" />
        <Stat n={String(history.length)} l="Recent tracks" />
        <Stat n={sub?.plan || 'FREE'} l="Subscription Tier" />
      </div>

      <SectionHeader title="Recently played" />
      {history.length > 0 ? (
        <div className="listCard">
          {history.map((s, i) => (
            <SongRow
              key={s.id || i}
              song={s}
              index={i}
              onPlay={() => player.setCurrent(s, history)}
            />
          ))}
        </div>
      ) : (
        <div className="emptyHint">No playback history recorded yet. Play a song to see it here!</div>
      )}
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <Card style={{ padding: '20px' }}>
      <strong className="statNum" style={{ fontSize: '28px', display: 'block', marginBottom: '4px' }}>{n}</strong>
      <span className="muted">{l}</span>
    </Card>
  );
}

export function CreatorPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [duration, setDuration] = useState('210');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleAudioFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress('Uploading audio file to storage...');
    try {
      const res = await api.uploadFile(file);
      setAudioUrl(res.url);
      setUploadProgress(`Audio uploaded: ${file.name}`);
    } catch (err: any) {
      setUploadProgress(`Audio upload error: ${err.message}`);
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress('Uploading artwork file...');
    try {
      const res = await api.uploadFile(file);
      setCoverUrl(res.url);
      setUploadProgress(`Cover art uploaded: ${file.name}`);
    } catch (err: any) {
      setUploadProgress(`Cover upload error: ${err.message}`);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setUploading(true);
    setStatusMsg(null);
    try {
      await api.createTrack({
        title: title.trim(),
        artist: artist.trim() || user.name,
        duration: parseInt(duration, 10) || 180,
        audioUrl: audioUrl.trim(),
        coverUrl: coverUrl.trim() || undefined,
      });
      setStatusMsg('Track published successfully to Sonique catalog!');
      setTitle('');
      setArtist('');
      setAudioUrl('');
      setCoverUrl('');
      setUploadProgress(null);
    } catch (err: any) {
      setStatusMsg(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout title="Creator Studio" icon={<Music2 />}>
      <div className="dashboardHero">
        <div>
          <span className="eyebrow">CREATOR STUDIO</span>
          <h1>Publish your music to the world.</h1>
          <p>Upload direct audio files, stream links, or YouTube videos to share your music with listeners.</p>
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '24px 0' }}>
        <Card style={{ padding: '24px' }}>
          <h3>Upload & Publish Track</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '13px' }}>
            Choose a local audio file or paste an audio stream / YouTube link.
          </p>

          {statusMsg && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                background: statusMsg.includes('error')
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(34, 197, 94, 0.15)',
                color: statusMsg.includes('error') ? '#f87171' : '#4ade80',
              }}
            >
              {statusMsg}
            </div>
          )}

          {uploadProgress && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                marginBottom: '14px',
                background: 'rgba(99,102,241,0.15)',
                color: '#818cf8',
                fontSize: '12px',
              }}
            >
              {uploadProgress}
            </div>
          )}

          <form onSubmit={handleUpload}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              Track Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Celestial Echoes"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--surface, #09090b)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                color: '#fff',
                marginBottom: '14px',
              }}
            />

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              Artist Name
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder={user?.name || 'Artist name'}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'var(--surface, #09090b)',
                border: '1px solid var(--line)',
                borderRadius: '8px',
                color: '#fff',
                marginBottom: '14px',
              }}
            />

            {/* Audio Source: Direct File or URL */}
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              Audio Source (File Upload or Stream URL)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="https://... or choose file ->"
                required
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--surface, #09090b)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <FileAudio size={16} />
                <span>Upload .mp3</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Cover Image: File or URL */}
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--muted)' }}>
              Cover Artwork (File Upload or Image URL)
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://... or choose image ->"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  background: 'var(--surface, #09090b)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--line)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                <ImageIcon size={16} />
                <span>Upload Art</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <Button type="submit" disabled={uploading}>
              <UploadCloud size={16} /> {uploading ? 'Publishing...' : 'Publish Track'}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export function PricingPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [sub, setSub] = useState<any>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.getCurrentSubscription(user.id).then(setSub).catch(() => {});
    }
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUpgrading(true);
    setMsg(null);
    try {
      const res = await api.upgradeToPremium(user.id, 'MONTHLY');
      setMsg(res.message);
      api.getCurrentSubscription(user.id).then(setSub);
    } catch (err: any) {
      setMsg(`Upgrade error: ${err.message}`);
    } finally {
      setUpgrading(false);
    }
  };

  const isPremium = sub?.plan === 'PREMIUM';

  return (
    <div>
      <div className="pageIntro" style={{ textAlign: 'center', padding: '40px 0 20px' }}>
        <div className="eyebrow" style={{ justifyContent: 'center' }}>
          <Crown size={14} color="var(--accent)" /> SONIQUE PREMIUM
        </div>
        <h1>Unlock Hi-Fi Sound & Unlimited Rooms</h1>
        <p style={{ maxWidth: '540px', margin: '0 auto' }}>
          Experience studio-grade lossless audio, ad-free streaming, and unlimited real-time collaborative rooms.
        </p>
      </div>

      {msg && (
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto 24px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(34, 197, 94, 0.15)',
            color: '#4ade80',
            textAlign: 'center',
          }}
        >
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', maxWidth: '800px', margin: '0 auto' }}>
        {/* Free Plan Card */}
        <Card style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3 style={{ fontSize: '22px', margin: '0 0 6px' }}>Sonique Free</h3>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>$0</span>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}> / forever</span>
          </div>
          <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} color="var(--accent)" /> Standard Audio (160kbps)
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} color="var(--accent)" /> Full Music & Podcast Catalog
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} color="var(--accent)" /> 3 Collaborative Rooms / day
            </div>
          </div>
          <Button variant="soft" disabled style={{ marginTop: 'auto' }}>
            {!isPremium ? 'Current Plan' : 'Free Tier'}
          </Button>
        </Card>

        {/* Premium Plan Card */}
        <Card
          style={{
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            background: 'linear-gradient(145deg, rgba(99,102,241,0.15), rgba(182,245,91,0.08))',
            border: '1px solid var(--accent)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'var(--accent, #b6f55b)',
              color: '#070910',
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '999px',
            }}
          >
            POPULAR
          </div>
          <div>
            <h3 style={{ fontSize: '22px', margin: '0 0 6px' }}>Sonique Premium</h3>
            <span style={{ fontSize: '32px', fontWeight: 800 }}>$9.99</span>
            <span style={{ color: 'var(--muted)', fontSize: '13px' }}> / month</span>
          </div>
          <div style={{ display: 'grid', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} color="var(--accent)" /> Lossless Hi-Fi Audio (320kbps / FLAC)
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} color="var(--accent)" /> Unlimited VIP Collaborative Rooms
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} color="var(--accent)" /> Offline Track Caching & Downloads
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Check size={16} color="var(--accent)" /> 100% Ad-Free Listening
            </div>
          </div>
          <Button onClick={handleUpgrade} disabled={upgrading || isPremium} style={{ marginTop: 'auto' }}>
            {isPremium ? '✓ Active Plan' : upgrading ? 'Upgrading...' : 'Upgrade to Premium'}
          </Button>
        </Card>
      </div>
    </div>
  );
}

export function AdminPage() {
  const [health, setHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => {});
    api.getAnalyticsOverview().then(setAnalytics).catch(() => {});
  }, []);

  return (
    <DashboardLayout title="Admin & Ops Control" icon={<ShieldCheck />}>
      <div className="dashboardHero">
        <div>
          <span className="eyebrow">PLATFORM HEALTH & METRICS</span>
          <h1>Real-time platform operations.</h1>
          <p>Operational health metrics, database latency, and Redis connection state.</p>
        </div>
      </div>

      <div className="statsGrid">
        <Stat n={health?.status === 'ok' ? 'HEALTHY' : 'CHECKING'} l="System Status" />
        <Stat
          n={health ? `${health.uptimeSeconds}s` : '0s'}
          l="Backend Uptime"
        />
        <Stat n={String(analytics?.stats?.totalStreams || 0)} l="Total Stream Plays" />
        <Stat n={String(analytics?.stats?.totalUsers || 0)} l="Registered Listeners" />
      </div>

      {analytics?.topTracks?.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <SectionHeader title="Top Platform Tracks" />
          <div className="listCard">
            {analytics.topTracks.map((t: Track, idx: number) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span style={{ color: 'var(--muted)', width: '20px' }}>{idx + 1}</span>
                <img
                  src={t.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&q=80'}
                  alt={t.title}
                  style={{ width: '40px', height: '40px', borderRadius: '6px' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '13px', display: 'block' }}>{t.title}</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{t.artist}</span>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700 }}>
                  {t.plays || 0} plays
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function DashboardLayout({
  children,
  title,
  icon,
}: {
  children: any;
  title: string;
  icon: any;
  }) {
  return (
    <div>
      <div className="dashboardTop">
        <div className="dashboardIcon">{icon}</div>
        <div>
          <span className="eyebrow">SONIQUE PLATFORM</span>
          <h1>{title}</h1>
        </div>
      </div>
      {children}
    </div>
  );
}
