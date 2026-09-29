import fs from 'fs';

const currentCss = fs.readFileSync('apps/web/src/styles.css', 'utf8');

const upNextQueueAndAdvancedCss = `

/* ==========================================================================
   UP NEXT QUEUE & ADVANCED PLAYER FEATURES
   ========================================================================== */

/* Up Next Queue Section */
.retroUpNextQueueSection {
  margin: 16px 0 20px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.queueHeaderBox {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1.5px solid var(--color-black);
  padding-bottom: 8px;
}

.queueHeaderLeft {
  display: flex;
  align-items: center;
  gap: 10px;
}

.queueIconPill {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--color-black);
  color: var(--color-white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.queueHeadingPixel {
  font-family: var(--font-pixel);
  font-size: 15px;
  font-weight: 800;
  color: var(--color-black);
  letter-spacing: 0.5px;
}

.queueCountBadge {
  font-size: 11px;
  color: #333333;
  font-family: var(--font-digital);
  background: rgba(0, 0, 0, 0.08);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.queueHeaderActions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.smartQueueToggleBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 10px;
  font-family: var(--font-pixel);
  font-weight: 700;
  border: 1.5px solid var(--color-black);
  background: transparent;
  color: var(--color-black);
  transition: all 0.15s ease;
}

.smartQueueToggleBtn.active {
  background: var(--color-black);
  color: var(--color-white);
}

.queueClearBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 9999px;
  font-size: 10px;
  font-family: var(--font-pixel);
  font-weight: 700;
  border: 1px solid rgba(0, 0, 0, 0.3);
  color: #333333;
}

.queueClearBtn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.queueTableCard {
  background: #dedfe3;
  border: 1.5px solid var(--color-black);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.queueRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  transition: background 0.15s ease;
  cursor: pointer;
}

.queueRow.nowPlaying {
  background: #e6e8ec;
  border-bottom: 1.5px solid var(--color-black);
}

.queueRow.upcoming:hover {
  background: #e2e4e8;
}

.queueRow.dragging {
  opacity: 0.4;
}

.queueRowLeft {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.queueItemIndexNumber {
  font-family: var(--font-digital);
  font-size: 11px;
  color: #666666;
  width: 16px;
  text-align: center;
}

.queueCoverWrap {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  border: 1px solid var(--color-black);
  overflow: hidden;
  flex-shrink: 0;
  background: #111111;
  display: flex;
  align-items: center;
  justify-content: center;
}

.queueCoverImg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.queueCoverImg.spinningMini {
  animation: retroSpin 4s linear infinite;
}

.queueCoverPlaceholder {
  color: #888888;
}

.liveAudioIndicator {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding-bottom: 6px;
}

.liveAudioIndicator span {
  width: 3px;
  height: 12px;
  background: #ffffff;
  border-radius: 1px;
  animation: soundWave 0.8s ease-in-out infinite alternate;
}

.liveAudioIndicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.liveAudioIndicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes soundWave {
  0% { height: 4px; }
  100% { height: 16px; }
}

.queueRowPlayHover {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.88);
  display: none;
  align-items: center;
  justify-content: center;
}

.queueRow.upcoming:hover .queueRowPlayHover {
  display: flex;
}

.queueMetaColumn {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nowPlayingBadgeRow {
  margin-bottom: 2px;
}

.nowPlayingBadge {
  background: var(--color-black);
  color: var(--color-white);
  font-size: 8px;
  font-family: var(--font-pixel);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 700;
}

.queueTrackTitle {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-black);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queueTrackArtist {
  font-size: 11px;
  color: #444444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queueRowRight {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.queueDurationDigital {
  font-family: var(--font-digital);
  font-size: 12px;
  color: #333333;
}

.queueItemControls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.queueMiniCtrlBtn,
.queueRemoveBtn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333333;
  background: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.15s ease;
}

.queueRemoveBtn:hover {
  background: var(--color-black);
  color: var(--color-white);
}

.upcomingTracksScrollList {
  max-height: 240px;
  overflow-y: auto;
}

.queueEmptyStateBox {
  padding: 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.queueEmptyTitle {
  font-family: var(--font-pixel);
  font-size: 13px;
  font-weight: 700;
  color: #333333;
}

.queueEmptySub {
  font-size: 11px;
  color: #666666;
}

.smartQueueSuggestionsArea {
  background: rgba(0, 0, 0, 0.03);
  border-top: 1.5px dashed rgba(0, 0, 0, 0.2);
  padding: 8px 12px;
}

.smartQueueHeaderBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 6px 6px 6px;
}

.smartHeaderTitle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-pixel);
  font-size: 10px;
  font-weight: 700;
  color: #111111;
}

.smartSubtext {
  font-size: 10px;
  color: #666666;
}

.smartTracksList {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.smartRow {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  padding: 6px 10px;
}

.addSmartToQueueBtn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--color-black);
  color: var(--color-white);
  font-family: var(--font-pixel);
  font-size: 9px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 9999px;
  cursor: pointer;
}

/* Autoplay Resume Banner */
.autoplayResumeBanner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #000000;
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 14px;
  margin-bottom: 14px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
}

.resumeBannerLeft {
  display: flex;
  align-items: center;
  gap: 12px;
}

.resumePulseDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: pulseGlow 1.5s infinite;
}

@keyframes pulseGlow {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.resumeBannerMeta {
  display: flex;
  flex-direction: column;
}

.resumeBannerHeading {
  font-family: var(--font-pixel);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.resumeBannerSub {
  font-size: 11px;
  color: #cccccc;
}

.resumeActionBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  color: #000000;
  padding: 6px 14px;
  border-radius: 9999px;
  font-family: var(--font-pixel);
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.turntableAutoplayResumeAlert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #000000;
  color: #ffffff;
  padding: 8px 14px;
  border-radius: 12px;
  margin: 10px 0;
}

.resumeAlertText {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.turntableResumeBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #ffffff;
  color: #000000;
  padding: 4px 10px;
  border-radius: 9999px;
  font-family: var(--font-pixel);
  font-size: 10px;
  font-weight: 700;
}

/* Turntable Advanced Action Buttons & Dropdowns */
.relativeActionWrap {
  position: relative;
}

.turntableActionIconBtn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: #000000;
  cursor: pointer;
  transition: all 0.15s ease;
}

.turntableActionIconBtn:hover,
.turntableActionIconBtn.active {
  background: #000000;
  color: #ffffff;
}

.speedBadgeBtn {
  width: 36px;
}

.speedBadgeText {
  font-family: var(--font-pixel);
  font-size: 10px;
  font-weight: 700;
}

.retroActionDropdown {
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  background: #dedfe3;
  border: 1.5px solid #000000;
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
  z-index: 60;
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdownTitle {
  font-family: var(--font-pixel);
  font-size: 9px;
  font-weight: 800;
  color: #444444;
  padding: 2px 6px;
  letter-spacing: 0.5px;
}

.dropdownOption {
  text-align: left;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-family: var(--font-heading);
  font-weight: 600;
  color: #000000;
  background: transparent;
  cursor: pointer;
}

.dropdownOption:hover,
.dropdownOption.selected {
  background: #000000;
  color: #ffffff;
}

/* Turntable Lyrics Overlay */
.turntableLyricsOverlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  border-radius: 24px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.turntableLyricsCard {
  width: 100%;
  height: 100%;
  background: #dedfe3;
  border: 2px solid #000000;
  border-radius: 18px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
}

.lyricsHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1.5px solid #000000;
  padding-bottom: 12px;
}

.lyricsEyebrow {
  font-family: var(--font-pixel);
  font-size: 9px;
  font-weight: 800;
  color: #555555;
  letter-spacing: 1px;
}

.lyricsTrackTitle {
  font-family: var(--font-brand);
  font-size: 20px;
  font-weight: 800;
  color: #000000;
}

.lyricsTrackArtist {
  font-size: 12px;
  color: #444444;
}

.lyricsCloseBtn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
}

.lyricsBody {
  flex: 1;
  overflow-y: auto;
  padding: 18px 6px;
}

.lyricsTextContent {
  font-size: 14px;
  line-height: 1.8;
  color: #111111;
  white-space: pre-wrap;
  font-family: var(--font-heading);
}

.lyricsUnavailableState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #666666;
  font-size: 13px;
}

/* Keyboard Shortcuts Modal */
.shortcutsModalCard {
  max-width: 480px;
}

.shortcutsListGrid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcutRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.shortcutKey {
  background: #000000;
  color: #ffffff;
  font-family: var(--font-digital);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.shortcutAction {
  font-size: 12px;
  font-weight: 600;
  color: #111111;
}

.shortcutFooterNote {
  font-size: 11px;
  color: #666666;
  text-align: center;
  margin-top: 6px;
}
`;

fs.writeFileSync('apps/web/src/styles.css', currentCss + upNextQueueAndAdvancedCss, 'utf8');
console.log('Appended UpNextQueue and Advanced CSS to apps/web/src/styles.css');
