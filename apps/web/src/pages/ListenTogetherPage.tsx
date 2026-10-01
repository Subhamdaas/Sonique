import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Radio,
  Plus,
  Play,
  Pause,
  Send,
  Copy,
  Check,
  LogOut,
  Sparkles,
  Music,
  Flame,
  Heart,
  Smile,
  Disc,
} from 'lucide-react';
import { Button, Card, SectionHeader } from '../components/ui';
import { useRoomStore } from '../store/roomStore';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';
import { Track } from '../types';

export default function ListenTogetherPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const player = usePlayerStore();
  const {
    activeRoom,
    isHost,
    isLoading,
    error,
    joinRoom,
    leaveRoom,
    broadcastPlayback,
    addToQueue,
    removeFromQueue,
    sendMessage,
  } = useRoomStore();

  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [createName, setCreateName] = useState('');
  const [createGenre, setCreateGenre] = useState('Electronic / Chill');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [catalogTracks, setCatalogTracks] = useState<Track[]>([]);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch available public rooms for Lobby
  useEffect(() => {
    if (!code) {
      api.getFeatured().then((res) => {
        setCatalogTracks(res.featuredTracks || []);
      }).catch(() => {});

      api.getRooms().then(setPublicRooms).catch(() => {});
    }
  }, [code]);

  // Join Room when URL contains code
  useEffect(() => {
    if (code) {
      joinRoom(code, {
        id: user?.id,
        name: user?.name || 'Guest Listener',
        avatarUrl: user?.avatarUrl || undefined,
      }).catch((err) => {
        console.error('Failed to join room:', err);
      });
    } else {
      leaveRoom();
    }
  }, [code, user, joinRoom, leaveRoom]);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages]);

  // Broadcast Host playback changes to Room
  useEffect(() => {
    if (isHost && activeRoom && player.current) {
      broadcastPlayback(player.current as Track, player.isPlaying, player.progress);
    }
  }, [player.isPlaying, player.current?.id, isHost]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const room = await api.createRoom({
        name: createName.trim() || 'Sonique Vibe Session',
        genre: createGenre,
        isPublic: true,
        hostId: user?.id || 'guest-host',
        hostName: user?.name || 'Session Host',
      });
      setShowCreateModal(false);
      if (room && room.code) {
        navigate(`/room/${room.code}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyCode = () => {
    if (activeRoom?.code) {
      navigator.clipboard.writeText(activeRoom.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput, {
      name: user?.name || 'Guest',
      avatarUrl: user?.avatarUrl || undefined,
    });
    setChatInput('');
  };

  const sendEmojiReaction = (emoji: string) => {
    sendMessage(emoji, {
      name: user?.name || 'Guest',
      avatarUrl: user?.avatarUrl || undefined,
    });
  };

  // -------------------------------------------------------------
  // LOBBY VIEW (Browse & Join Rooms)
  // -------------------------------------------------------------
  if (!code || !activeRoom) {
    return (
      <div className="listenTogetherLobby">
        <div className="hero" style={{ background: 'linear-gradient(135deg, #101626 0%, #0d111a 100%)' }}>
          <div className="heroCopy">
            <div className="eyebrow">
              <span className="liveDot" /> REAL-TIME WEBSOCKET ROOMS
            </div>
            <h1>
              Listen <em>together</em> in sync.
            </h1>
            <p>
              Join collaborative listening rooms, share a live queue, chat with friends, and experience music in real-time.
            </p>
            <div className="heroActions">
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus size={16} /> Create a Room
              </Button>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Enter 8-digit Room Code"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--line)',
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '13px',
                  }}
                />
                <Button
                  variant="soft"
                  disabled={!joinCodeInput.trim()}
                  onClick={() => navigate(`/room/${joinCodeInput.trim()}`)}
                >
                  Join
                </Button>
              </div>
            </div>
          </div>
          <div className="heroArt">
            <div
              style={{
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #6366f1, #a855f7)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 0 80px rgba(99,102,241,0.4)',
                animation: 'spin 20s linear infinite',
              }}
            >
              <Disc size={120} color="#fff" />
            </div>
          </div>
        </div>

        {/* Create Room Modal */}
        {showCreateModal && (
          <div
            className="modalBackdrop"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="modalCard"
              style={{
                background: 'var(--surface-raised, #18181b)',
                padding: '28px',
                borderRadius: '20px',
                width: '90%',
                maxWidth: '440px',
                border: '1px solid var(--line)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>Create a Listening Room</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '14px' }}>
                Set up a synchronized stage for your friends or community.
              </p>
              <form onSubmit={handleCreateRoom}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>
                  Room Name
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Midnight Synthwave & Coding"
                  autoFocus
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--surface, #09090b)',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    color: '#fff',
                    marginBottom: '16px',
                  }}
                />

                <label style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginBottom: '6px' }}>
                  Genre / Vibe Tag
                </label>
                <select
                  value={createGenre}
                  onChange={(e) => setCreateGenre(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'var(--surface, #09090b)',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    color: '#fff',
                    marginBottom: '24px',
                  }}
                >
                  <option value="Electronic / Chill">Electronic / Chill</option>
                  <option value="Lofi / Study Beats">Lofi / Study Beats</option>
                  <option value="Dream Pop / Indie">Dream Pop / Indie</option>
                  <option value="Acoustic / Folk">Acoustic / Folk</option>
                  <option value="All Genres & Vibes">All Genres & Vibes</option>
                </select>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <Button type="button" variant="soft" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Room</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <SectionHeader title="Live Public Listening Rooms" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px', marginTop: '16px' }}>
          {publicRooms.map((r) => (
            <Card key={r.code} className="roomCard" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="liveDot" />
                    <strong style={{ fontSize: '16px' }}>{r.name}</strong>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                    {r.genre} · Hosted by {r.hostName}
                  </span>
                </div>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'rgba(99,102,241,0.15)',
                    color: 'var(--accent, #b6f55b)',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {r.memberCount} listening
                </div>
              </div>

              {r.currentTrack && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: '10px',
                  }}
                >
                  <img
                    src={r.currentTrack.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&q=80'}
                    alt={r.currentTrack.title}
                    style={{ width: '38px', height: '38px', borderRadius: '6px' }}
                  />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ fontSize: '12px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.currentTrack.title}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{r.currentTrack.artist}</span>
                  </div>
                </div>
              )}

              <Button onClick={() => navigate(`/room/${r.code}`)}>
                <Radio size={16} /> Join Session
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // LIVE ROOM STAGE (Synchronized Listening Session)
  // -------------------------------------------------------------
  const curTrack = activeRoom.currentTrack;

  return (
    <div className="liveRoomContainer" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', padding: '10px 0' }}>
      {/* LEFT COLUMN: Hero Stage & Collaborative Queue */}
      <div>
        {/* Room Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: 'var(--panel, #0e111a)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="liveDot" />
              <h2 style={{ margin: 0, fontSize: '20px' }}>{activeRoom.name}</h2>
              <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '999px' }}>
                {activeRoom.genre}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
              Hosted by <strong style={{ color: '#fff' }}>{activeRoom.hostName}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={handleCopyCode}
              className="btn soft"
              style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {copiedCode ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
              {activeRoom.code}
            </button>
            <button
              onClick={() => navigate('/listen-together')}
              className="btn soft"
              style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}
            >
              <LogOut size={14} /> Leave
            </button>
          </div>
        </div>

        {/* Hero Synchronized Vinyl Stage */}
        <Card
          style={{
            padding: '36px',
            textAlign: 'center',
            background: 'radial-gradient(circle at 50% 30%, rgba(99,102,241,0.15), rgba(7,9,16,0.95))',
            border: '1px solid var(--line)',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {curTrack ? (
            <div>
              <div
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '50%',
                  margin: '0 auto 24px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  border: '6px solid rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                  position: 'relative',
                  animation: player.isPlaying ? 'spin 18s linear infinite' : 'none',
                }}
              >
                <img
                  src={curTrack.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80'}
                  alt={curTrack.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#070910',
                    border: '3px solid #fff',
                  }}
                />
              </div>

              <h1 style={{ fontSize: '28px', margin: '0 0 6px', letterSpacing: '-0.02em' }}>{curTrack.title}</h1>
              <p style={{ color: 'var(--muted)', fontSize: '15px', margin: 0 }}>{curTrack.artist}</p>

              {isHost && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <Button onClick={() => player.toggle()}>
                    {player.isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    {player.isPlaying ? 'Pause for all' : 'Play for all'}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '40px 0', color: 'var(--muted)' }}>
              <h3>No track currently playing</h3>
              <p>Add a track to the queue or choose from catalog.</p>
            </div>
          )}
        </Card>

        {/* Collaborative Room Queue */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '18px' }}>Collaborative Queue ({activeRoom.queue.length})</h3>
            <Button variant="soft" onClick={() => setShowSongPicker(!showSongPicker)}>
              <Plus size={15} /> Add song to queue
            </Button>
          </div>

          {/* Quick Song Picker Drawer */}
          {showSongPicker && (
            <Card style={{ padding: '16px', marginBottom: '16px', background: 'var(--panel, #0e111a)' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>Select song to queue:</div>
              <div style={{ display: 'grid', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {catalogTracks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      addToQueue(t);
                      setShowSongPicker(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={t.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&q=80'}
                      alt={t.title}
                      style={{ width: '32px', height: '32px', borderRadius: '6px' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: '12px', display: 'block' }}>{t.title}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{t.artist}</span>
                    </div>
                    <Plus size={16} color="var(--accent)" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeRoom.queue.length > 0 ? (
            <div className="listCard">
              {activeRoom.queue.map((track, idx) => (
                <div
                  key={track.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <span style={{ color: 'var(--muted)', fontSize: '12px', width: '20px' }}>{idx + 1}</span>
                  <img
                    src={track.coverUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=100&q=80'}
                    alt={track.title}
                    style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: '13px', display: 'block' }}>{track.title}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{track.artist}</span>
                  </div>
                  {isHost && (
                    <button
                      onClick={() => removeFromQueue(idx)}
                      style={{ background: 'none', border: 0, color: 'var(--muted)', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="emptyHint" style={{ padding: '24px' }}>
              No songs in room queue yet. Be the first to suggest one!
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Listeners & Live Chat Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Connected Listeners Presence */}
        <Card style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Users size={16} color="var(--accent)" />
            <strong style={{ fontSize: '14px' }}>Active Listeners ({activeRoom.members.length})</strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {activeRoom.members.map((m) => (
              <div
                key={m.socketId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '999px',
                  background: m.isHost ? 'rgba(182,245,91,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${m.isHost ? 'rgba(182,245,91,0.3)' : 'var(--line)'}`,
                  fontSize: '12px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: m.isHost ? 'var(--accent, #b6f55b)' : '#6366f1',
                    color: '#000',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span>{m.name}</span>
                {m.isHost && (
                  <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--accent)' }}>HOST</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Live Chat Stream */}
        <Card
          style={{
            flex: 1,
            minHeight: '440px',
            maxHeight: '560px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--line)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong style={{ fontSize: '14px' }}>Live Room Chat</strong>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['🔥', '❤️', '👏', '🎵', '⚡'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => sendEmojiReaction(emoji)}
                  style={{
                    background: 'none',
                    border: 0,
                    cursor: 'pointer',
                    fontSize: '15px',
                    padding: '2px 4px',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            {activeRoom.messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  background: msg.isHost ? 'rgba(182,245,91,0.08)' : 'rgba(255,255,255,0.03)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <strong style={{ fontSize: '11px', color: msg.isHost ? 'var(--accent)' : '#fff' }}>
                    {msg.sender} {msg.isHost && '(Host)'}
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#e4e4e7', wordBreak: 'break-word' }}>
                  {msg.text}
                </p>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendChat}
            style={{
              padding: '12px',
              borderTop: '1px solid var(--line)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Send message to room..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--line)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '13px',
              }}
            />
            <Button type="submit" disabled={!chatInput.trim()} style={{ padding: '0 14px' }}>
              <Send size={15} />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
