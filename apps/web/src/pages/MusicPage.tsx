import VinylTurntable from '../components/VinylTurntable';

export default function MusicPage() {
  return (
    <div className="retroMusicPageStage" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '10px 0' }}>
      <div style={{ width: '100%', maxWidth: '520px' }}>
        <VinylTurntable />
      </div>
    </div>
  );
}
