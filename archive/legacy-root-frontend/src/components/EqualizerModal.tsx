import { useState, useEffect } from 'react';
import { X, Sliders, Volume2, Sparkles } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EqualizerModal({ isOpen, onClose }: EqualizerModalProps) {
  const [bass, setBass] = useState(4);
  const [mid, setMid] = useState(0);
  const [treble, setTreble] = useState(2);
  const [vinylWarmth, setVinylWarmth] = useState(true);
  const [vuLeft, setVuLeft] = useState(45);
  const [vuRight, setVuRight] = useState(50);
  const player = usePlayerStore();

  // Animate VU meters when playing
  useEffect(() => {
    if (!isOpen || !player.isPlaying) {
      setVuLeft(10);
      setVuRight(12);
      return;
    }
    const interval = setInterval(() => {
      setVuLeft(30 + Math.floor(Math.random() * 55));
      setVuRight(35 + Math.floor(Math.random() * 55));
    }, 120);
    return () => clearInterval(interval);
  }, [isOpen, player.isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="retroModalBackdrop" onClick={onClose}>
      <div className="equalizerChassis" onClick={(e) => e.stopPropagation()}>
        {/* Hardware Header */}
        <div className="eqHeaderRow">
          <div className="eqTitleWrap">
            <Sliders size={20} />
            <h3 className="eqTitlePixel">ANALOG EQ &amp; MASTERING</h3>
          </div>
          <button className="eqCloseBtn" onClick={onClose} title="Close Equalizer">
            <X size={18} />
          </button>
        </div>

        {/* Vintage Dual VU Meters */}
        <div className="vuMeterSection">
          <div className="vuMeterBox">
            <div className="vuMeterScale">
              <span>-20</span>
              <span>-10</span>
              <span>-5</span>
              <span>0</span>
              <span className="vuRed">+3</span>
            </div>
            <div className="vuNeedleWrap">
              <div
                className="vuNeedle"
                style={{ transform: `rotate(${-45 + (vuLeft / 100) * 90}deg)` }}
              />
            </div>
            <span className="vuChannelLabel">CH-L (LEFT)</span>
          </div>

          <div className="vuMeterBox">
            <div className="vuMeterScale">
              <span>-20</span>
              <span>-10</span>
              <span>-5</span>
              <span>0</span>
              <span className="vuRed">+3</span>
            </div>
            <div className="vuNeedleWrap">
              <div
                className="vuNeedle"
                style={{ transform: `rotate(${-45 + (vuRight / 100) * 90}deg)` }}
              />
            </div>
            <span className="vuChannelLabel">CH-R (RIGHT)</span>
          </div>
        </div>

        {/* 3-Band Sliders */}
        <div className="eqSlidersGrid">
          {/* Bass */}
          <div className="eqFaderColumn">
            <span className="faderValuePixel">{bass > 0 ? `+${bass}` : bass} dB</span>
            <div className="faderTrackWrap">
              <input
                type="range"
                min="-12"
                max="12"
                value={bass}
                onChange={(e) => setBass(Number(e.target.value))}
                className="faderVerticalInput"
              />
            </div>
            <span className="faderLabelPixel">BASS (100Hz)</span>
          </div>

          {/* Mid */}
          <div className="eqFaderColumn">
            <span className="faderValuePixel">{mid > 0 ? `+${mid}` : mid} dB</span>
            <div className="faderTrackWrap">
              <input
                type="range"
                min="-12"
                max="12"
                value={mid}
                onChange={(e) => setMid(Number(e.target.value))}
                className="faderVerticalInput"
              />
            </div>
            <span className="faderLabelPixel">MID (1kHz)</span>
          </div>

          {/* Treble */}
          <div className="eqFaderColumn">
            <span className="faderValuePixel">{treble > 0 ? `+${treble}` : treble} dB</span>
            <div className="faderTrackWrap">
              <input
                type="range"
                min="-12"
                max="12"
                value={treble}
                onChange={(e) => setTreble(Number(e.target.value))}
                className="faderVerticalInput"
              />
            </div>
            <span className="faderLabelPixel">TREBLE (10kHz)</span>
          </div>
        </div>

        {/* Vintage Warmth Toggle */}
        <div className="warmthToggleRow">
          <button
            className={`warmthToggleBtn ${vinylWarmth ? 'active' : ''}`}
            onClick={() => setVinylWarmth(!vinylWarmth)}
          >
            <Sparkles size={16} />
            <span>VINYL TUBE WARMTH: {vinylWarmth ? 'ON (33 RPM)' : 'BYPASS'}</span>
          </button>
          <button
            className="eqResetBtn"
            onClick={() => {
              setBass(0);
              setMid(0);
              setTreble(0);
            }}
          >
            RESET FLAT
          </button>
        </div>
      </div>
    </div>
  );
}
