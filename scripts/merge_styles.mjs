import fs from 'fs';

const baseCss = fs.readFileSync('src/styles.css', 'utf8');

const additionalCss = `

/* ==========================================================================
   ADDITIONAL CANONICAL APPS/WEB COMPONENT & SUBPAGE STYLING
   ========================================================================== */

/* Main Scroll Area within Console */
.retroMainScrollArea {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
  padding-right: 6px;
}

/* MIDDLE FEATURE SECTION (CLEAN PLACEHOLDER WAITING FOR USER REFERENCE) */
.middleFeatureSection {
  margin: 16px 0 20px 0;
  width: 100%;
}

.middleFeatureBox {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 84px;
  background: rgba(0, 0, 0, 0.03);
  border: 1.5px dashed rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  padding: 16px 20px;
  text-align: center;
  transition: all 0.2s ease;
}

.middleFeatureBox:hover {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.4);
}

.middleFeatureSlotBadge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #000000;
  color: #ffffff;
  padding: 3px 10px;
  border-radius: 9999px;
  font-family: var(--font-pixel);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.middleFeatureTitle {
  font-family: var(--font-heading);
  font-size: 13px;
  font-weight: 700;
  color: #111111;
}

.middleFeatureSubtext {
  font-size: 11px;
  color: #555555;
  max-width: 440px;
}

/* PERSISTENT RETRO PLAYER BAR (ACROSS SUBPAGES) */
.persistentRetroPlayerBar {
  margin-top: 14px;
  background: #dedfe3;
  border: 1.5px solid var(--color-black);
  border-radius: 18px;
  padding: 10px 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.persistentBarInner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.persistentTrackInfo {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
  max-width: 280px;
}

.persistentMiniVinyl {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #111111;
  border: 1.5px solid #000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  flex-shrink: 0;
}

.persistentMiniVinyl.spinning {
  animation: retroSpin 3s linear infinite;
}

.persistentCoverThumb {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.persistentTrackMeta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.persistentTrackTitle {
  font-family: var(--font-pixel);
  font-size: 13px;
  font-weight: 700;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.persistentTrackArtist {
  font-size: 11px;
  color: #444444;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.persistentLikeBtn {
  color: #000000;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.persistentLikeBtn.liked {
  color: #e11d48;
}

.persistentCenterControls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 520px;
}

.persistentControlsRow {
  display: flex;
  align-items: center;
  gap: 12px;
}

.persistentControlBtn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.2);
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
}

.persistentPlayBtn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1.5px solid #000000;
  background: #000000;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.persistentProgressRow {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.persistentTime {
  font-family: var(--font-digital);
  font-size: 10px;
  color: #333333;
  min-width: 32px;
}

.persistentProgressBar {
  flex: 1;
  height: 5px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 9999px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.persistentProgressFill {
  height: 100%;
  background: #000000;
  border-radius: 9999px;
}

.persistentRightExtras {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
  justify-content: flex-end;
}

.persistentVolumeBar {
  width: 80px;
  accent-color: #000000;
  cursor: pointer;
}

/* RETRO DETAIL PAGES (PLAYLIST, ALBUM, ARTIST, PODCAST, EPISODE) */
.retroDetailPage {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 4px 24px 4px;
  width: 100%;
}

.retroDetailHero {
  display: flex;
  align-items: flex-end;
  gap: 24px;
  background: rgba(255, 255, 255, 0.4);
  border: 1.5px solid var(--color-black);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
}

.retroDetailCover {
  width: 160px;
  height: 160px;
  border-radius: 14px;
  object-fit: cover;
  border: 1.5px solid #000000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  background: #111;
}

.retroDetailCover.round {
  border-radius: 50%;
}

.retroDetailMeta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.retroDetailType {
  font-family: var(--font-pixel);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #333333;
}

.retroDetailTitle {
  font-family: var(--font-brand);
  font-size: 32px;
  font-weight: 800;
  color: #000000;
  line-height: 1.15;
}

.retroDetailDesc {
  font-size: 13px;
  color: #444444;
  line-height: 1.4;
  max-width: 600px;
}

.retroDetailSubmeta {
  font-size: 12px;
  color: #222222;
  font-weight: 600;
  margin-top: 4px;
}

.retroDetailActions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 10px;
}

.retroPrimaryActionBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #000000;
  color: #ffffff;
  padding: 10px 22px;
  border-radius: 9999px;
  font-family: var(--font-pixel);
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
}

.retroSecondaryActionBtn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #000000;
  border: 1.5px solid #000000;
  padding: 9px 20px;
  border-radius: 9999px;
  font-family: var(--font-pixel);
  font-size: 12px;
  font-weight: 700;
}

/* RETRO TRACK TABLE */
.retroTableContainer {
  background: #ffffff;
  border: 1.5px solid var(--color-black);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
}

.retroTable {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.retroTableHead {
  background: #e6e8ec;
  border-bottom: 1.5px solid #000000;
}

.retroTableTh {
  text-align: left;
  padding: 12px 16px;
  font-family: var(--font-pixel);
  font-size: 11px;
  font-weight: 700;
  color: #111111;
  letter-spacing: 0.5px;
}

.retroTrackRow {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  transition: background 0.15s ease;
  cursor: pointer;
}

.retroTrackRow:hover {
  background: #f4f5f8;
}

.retroTrackRow.playing {
  background: #ebeef2;
}

.retroTableTd {
  padding: 12px 16px;
  vertical-align: middle;
}

.retroTrackIndex {
  font-family: var(--font-digital);
  font-size: 12px;
  color: #555555;
  width: 36px;
}

.retroTrackCellMain {
  display: flex;
  align-items: center;
  gap: 12px;
}

.retroTrackThumb {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  border: 1px solid #000000;
  object-fit: cover;
  flex-shrink: 0;
}

.retroTrackTitles {
  display: flex;
  flex-direction: column;
}

.retroTrackName {
  font-family: var(--font-heading);
  font-size: 13.5px;
  font-weight: 700;
  color: #000000;
}

.retroTrackArtistName {
  font-size: 11.5px;
  color: #444444;
}

.retroTrackAlbumName {
  font-size: 12.5px;
  color: #333333;
}

.retroTrackDuration {
  font-family: var(--font-digital);
  font-size: 12px;
  color: #333333;
  text-align: right;
}

.retroTrackActions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

/* EMPTY STATES & SKELETONS */
.retroEmptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  border: 1.5px dashed rgba(0, 0, 0, 0.25);
  border-radius: 18px;
}

.retroEmptyTitle {
  font-family: var(--font-pixel);
  font-size: 16px;
  font-weight: 700;
  color: #000000;
}

.retroEmptyDesc {
  font-size: 13px;
  color: #555555;
  max-width: 400px;
}

.retroSkeleton {
  background: linear-gradient(90deg, #d8dbe0 25%, #e8ebf0 50%, #d8dbe0 75%);
  background-size: 200% 100%;
  animation: retroShimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes retroShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* RETRO AUTH PAGES (LOGIN / REGISTER) */
.retroAuthContainer {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.retroAuthCard {
  width: 100%;
  max-width: 440px;
  background: #dedfe3;
  border: 2px solid var(--color-black);
  border-radius: 24px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.2);
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.retroAuthHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.retroAuthTitle {
  font-family: var(--font-brand);
  font-size: 26px;
  font-weight: 800;
  color: #000000;
}

.retroAuthSubtitle {
  font-size: 13px;
  color: #444444;
}

.retroAuthForm {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.retroFormField {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.retroFormLabel {
  font-family: var(--font-pixel);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #111111;
}

.retroFormInput {
  background: #ffffff;
  border: 1.5px solid var(--color-black);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  color: #000000;
}

.retroFormInput:focus {
  outline: none;
  box-shadow: 0 0 0 2px #000000;
}

.retroSubmitBtn {
  background: #000000;
  color: #ffffff;
  padding: 12px;
  border-radius: 12px;
  font-family: var(--font-pixel);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  margin-top: 6px;
}

.retroAuthFooter {
  text-align: center;
  font-size: 12px;
  color: #444444;
}

.retroAuthLink {
  color: #000000;
  font-weight: 700;
  text-decoration: underline;
}

.retroAuthError {
  background: #fee2e2;
  border: 1px solid #ef4444;
  color: #b91c1c;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
}
`;

fs.writeFileSync('apps/web/src/styles.css', baseCss + additionalCss, 'utf8');
console.log('Successfully written apps/web/src/styles.css');
