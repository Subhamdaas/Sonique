import { X, Check, Bell, User, Disc, Radio, Shield } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: 'New Vinyl Drop',
      desc: 'Emily Bryan released "Daily Chaos" in 33⅓ RPM High-Fidelity.',
      time: '12m ago',
    },
    {
      id: 2,
      title: 'Turntable Calibrated',
      desc: 'Stylus tracking weight optimized to 1.8g for maximum stereo dynamics.',
      time: '1h ago',
    },
    {
      id: 3,
      title: 'Trending in Classic',
      desc: '"The Suffering" reached #1 on the retro charts with 392+ likes.',
      time: '3h ago',
    },
  ];

  return (
    <div className="retroModalBackdrop" onClick={onClose}>
      <div className="retroPopupCard" onClick={(e) => e.stopPropagation()}>
        <div className="popupHeader">
          <div className="popupTitleWrap">
            <Bell size={18} />
            <span className="popupTitlePixel">NOTIFICATIONS</span>
          </div>
          <button className="popupCloseBtn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="popupItemsList">
          {notifications.map((n) => (
            <div key={n.id} className="popupItemRow">
              <div className="popupItemIcon">
                <Disc size={18} />
              </div>
              <div className="popupItemBody">
                <span className="popupItemTitle">{n.title}</span>
                <p className="popupItemDesc">{n.desc}</p>
                <span className="popupItemTime">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="retroModalBackdrop" onClick={onClose}>
      <div className="retroPopupCard" onClick={(e) => e.stopPropagation()}>
        <div className="popupHeader">
          <div className="popupTitleWrap">
            <User size={18} />
            <span className="popupTitlePixel">USER PROFILE</span>
          </div>
          <button className="popupCloseBtn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="profileModalBody">
          <div className="profileAvatarLarge">
            <User size={36} />
          </div>
          <h3 className="profileNamePixel">Audiophile Enthusiast</h3>
          <span className="profileHandle">@vinyl_master2d</span>

          <div className="profileStatsGrid">
            <div className="pStatCard">
              <span className="pStatValue">392</span>
              <span className="pStatLabel">LIKES</span>
            </div>
            <div className="pStatCard">
              <span className="pStatValue">4</span>
              <span className="pStatLabel">PLAYLISTS</span>
            </div>
            <div className="pStatCard">
              <span className="pStatValue">33⅓</span>
              <span className="pStatLabel">RPM HI-FI</span>
            </div>
          </div>

          <div className="profileBadgeRow">
            <Shield size={16} />
            <span>Master Audio Engine: Lossless WebAudio</span>
          </div>
        </div>
      </div>
    </div>
  );
}
