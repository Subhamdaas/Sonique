import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Users, Plus, Disc3, X, Sparkles, Volume2 } from 'lucide-react';
import { api } from '../services/api';

export default function LivePage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomGenre, setNewRoomGenre] = useState('Classic / Retro Beats');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api
      .getRooms()
      .then((data) => {
        if (mounted) {
          setRooms(data || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setRooms([]);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreating(true);
    try {
      const res = await api.createRoom({
        name: newRoomName.trim(),
        genre: newRoomGenre,
        isPublic: true,
      });
      setIsCreateModalOpen(false);
      setNewRoomName('');
      if (res && res.code) {
        navigate(`/room/${res.code}`);
      }
    } catch (err: any) {
      console.warn('Failed to create room:', err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="retroLivePage">
      {/* Top Header & Content Switcher */}
      <div className="livePageHeader">
        <div className="liveHeaderLeft">
          <div className="pageHeaderBadge liveBadgeRed">
            <span className="liveBlinkDot" />
            <span>LIVE AUDIO BROADCASTS</span>
          </div>
          <h1 className="liveMainHeading">Live Sessions & Communal Rooms</h1>
          <p className="liveSubtitle">
            Synchronized vinyl playback lounges, live DJ sets, and communal audiophile listening.
          </p>
        </div>

        {/* Minimal Contextual Switcher (Requirement 9) */}
        <div className="retroContentSwitcher" role="tablist" aria-label="Content Experience">
          <button
            className="switcherPill"
            onClick={() => navigate('/')}
            role="tab"
            aria-selected="false"
          >
            MUSIC
          </button>
          <button
            className="switcherPill"
            onClick={() => navigate('/podcasts')}
            role="tab"
            aria-selected="false"
          >
            PODCASTS
          </button>
          <button
            className="switcherPill active"
            role="tab"
            aria-selected="true"
          >
            LIVE
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="liveActionBar">
        <div className="liveStatsSummary">
          <span className="liveRoomsCount">
            {rooms.length} {rooms.length === 1 ? 'Room Active' : 'Rooms Active'}
          </span>
        </div>

        <button
          className="createRoomActionBtn"
          onClick={() => setIsCreateModalOpen(true)}
          aria-label="Host a new listening room"
        >
          <Plus size={15} />
          <span>START A LIVE ROOM</span>
        </button>
      </div>

      {/* LIVE NOW Section */}
      <section className="liveSectionContainer" aria-label="Active Live Sessions">
        <div className="sectionSubHeader">
          <div className="sectionTitleGroup">
            <Radio size={16} />
            <h2 className="sectionTitlePixel">LIVE NOW</h2>
          </div>
        </div>

        {loading ? (
          <div className="retroLoadingMsg">Scanning live frequencies...</div>
        ) : rooms.length > 0 ? (
          <div className="liveCardsGrid">
            {rooms.map((room) => {
              const listenerCount = room.memberCount || (room.members ? room.members.length : 0);
              return (
                <div
                  key={room.code}
                  className="liveCardItem"
                  onClick={() => navigate(`/room/${room.code}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Join live room ${room.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') navigate(`/room/${room.code}`);
                  }}
                >
                  <div className="liveCardCoverWrap">
                    <div className="liveBadgePill">
                      <span className="liveBlinkDot" />
                      <span>LIVE</span>
                    </div>

                    <div className="liveCoverVisual">
                      <Disc3 size={48} className="liveRotatingDisc" />
                    </div>

                    <div className="liveListenersBadge">
                      <Users size={12} />
                      <span>{listenerCount} {listenerCount === 1 ? 'listener' : 'listeners'}</span>
                    </div>
                  </div>

                  <div className="liveCardBody">
                    <span className="liveRoomGenre">{room.genre || 'Communal Vinyl'}</span>
                    <h3 className="liveRoomTitle">{room.name}</h3>
                    <span className="liveHostLabel">Host: {room.hostName || 'Community DJ'}</span>

                    {room.currentTrack && (
                      <div className="liveNowPlayingTrack">
                        <Volume2 size={12} />
                        <span>Now Playing: {room.currentTrack.title}</span>
                      </div>
                    )}

                    <button
                      className="joinRoomBtn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/room/${room.code}`);
                      }}
                      aria-label={`Tune into ${room.name}`}
                    >
                      <span>TUNE IN</span>
                      <span className="arrowSpan">→</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="retroEmptyStateBox" style={{ margin: '30px 0' }}>
            <Radio size={36} color="#444" />
            <span className="retroEmptyTitle">No live sessions right now</span>
            <span className="retroEmptyDesc">
              Start your own synchronized lounge and invite listeners worldwide to join.
            </span>
            <button
              className="retroPrimaryActionBtn"
              style={{ marginTop: 12 }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={14} />
              <span>START FIRST ROOM</span>
            </button>
          </div>
        )}
      </section>

      {/* UPCOMING & FEATURED LIVE SESSIONS */}
      <section className="liveSectionContainer" aria-label="Upcoming Sessions">
        <div className="sectionSubHeader">
          <div className="sectionTitleGroup">
            <Sparkles size={16} />
            <h2 className="sectionTitlePixel">UPCOMING SESSIONS</h2>
          </div>
        </div>

        <div className="upcomingScheduleGrid">
          <div className="upcomingScheduleCard">
            <div className="upcomingDateBadge">
              <span className="dateDay">TODAY</span>
              <span className="dateTime">21:00 UTC</span>
            </div>
            <div className="upcomingInfo">
              <span className="upcomingGenre">ANALOG SYNTH</span>
              <h3 className="upcomingTitle">Moog Synthesizers & Modular Jams</h3>
              <span className="upcomingHost">By RetroSynth Labs</span>
            </div>
            <button
              className="upcomingReminderBtn"
              onClick={() => alert('Reminder set for Moog Synthesizers Live!')}
            >
              SET REMINDER
            </button>
          </div>

          <div className="upcomingScheduleCard">
            <div className="upcomingDateBadge">
              <span className="dateDay">TOMORROW</span>
              <span className="dateTime">18:00 UTC</span>
            </div>
            <div className="upcomingInfo">
              <span className="upcomingGenre">JAZZ ON WAX</span>
              <h3 className="upcomingTitle">Blue Note 1960s Deep Cuts</h3>
              <span className="upcomingHost">By Vinyl Collector Club</span>
            </div>
            <button
              className="upcomingReminderBtn"
              onClick={() => alert('Reminder set for Blue Note Deep Cuts Live!')}
            >
              SET REMINDER
            </button>
          </div>
        </div>
      </section>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div
          className="equalizerModalBackdrop"
          onClick={() => setIsCreateModalOpen(false)}
          role="dialog"
          aria-label="Create Live Room"
        >
          <div
            className="retroPopupCard"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440 }}
          >
            <div className="popupHeader">
              <div className="popupTitleWrap">
                <Radio size={18} />
                <span className="popupTitlePixel">HOST A LIVE ROOM</span>
              </div>
              <button
                className="popupCloseBtn"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="createRoomForm">
              <div className="retroFormField">
                <label className="retroFormLabel">ROOM NAME</label>
                <input
                  type="text"
                  className="retroFormInput"
                  placeholder="e.g. Midnight Vinyl Session"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="retroFormField">
                <label className="retroFormLabel">GENRE / THEME</label>
                <select
                  className="retroFormInput"
                  value={newRoomGenre}
                  onChange={(e) => setNewRoomGenre(e.target.value)}
                >
                  <option value="Classic / Retro Beats">Classic / Retro Beats</option>
                  <option value="Lo-Fi & Ambient Vinyl">Lo-Fi & Ambient Vinyl</option>
                  <option value="Hindi & Bollywood Classics">Hindi & Bollywood Classics</option>
                  <option value="Odia Heritage Folk">Odia Heritage Folk</option>
                  <option value="Rock & Alternative">Rock & Alternative</option>
                  <option value="Jazz & Blues">Jazz & Blues</option>
                  <option value="Electronic & Modular">Electronic & Modular</option>
                </select>
              </div>

              <div className="modalActionsRow" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="retroSecondaryActionBtn"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="retroPrimaryActionBtn"
                  disabled={creating || !newRoomName.trim()}
                >
                  {creating ? 'LAUNCHING...' : 'LAUNCH ROOM →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
