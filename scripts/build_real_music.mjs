import fs from 'fs';
import path from 'path';

const songQueries = [
  { id: 's-bohemian-rhapsody', q: 'queen bohemian rhapsody', genre: 'Classic', year: '1975' },
  { id: 's-blinding-lights', q: 'the weeknd blinding lights', genre: 'Modern pop', year: '2020' },
  { id: 's-billie-jean', q: 'michael jackson billie jean', genre: 'Classic', year: '1982' },
  { id: 's-hotel-california', q: 'eagles hotel california', genre: 'Classic', year: '1976' },
  { id: 's-smells-like-teen-spirit', q: 'nirvana smells like teen spirit', genre: '90s', year: '1991' },
  { id: 's-around-the-world', q: 'daft punk around the world', genre: 'Electronic', year: '1997' },
  { id: 's-dreams', q: 'fleetwood mac dreams', genre: 'Classic', year: '1977' },
  { id: 's-comfortably-numb', q: 'pink floyd comfortably numb', genre: 'Classic', year: '1979' },
  { id: 's-stairway-to-heaven', q: 'led zeppelin stairway to heaven', genre: 'Classic', year: '1971' },
  { id: 's-heroes', q: 'david bowie heroes single', genre: 'Classic', year: '1977' },
  { id: 's-creep', q: 'radiohead creep', genre: '90s', year: '1993' },
  { id: 's-back-in-black', q: 'ac/dc back in black', genre: 'Classic', year: '1980' },
  { id: 's-so-what', q: 'miles davis so what', genre: 'Jazz', year: '1959' },
  { id: 's-come-together', q: 'the beatles come together', genre: 'Classic', year: '1969' },
  { id: 's-sweet-child-o-mine', q: "guns n roses sweet child o mine", genre: 'Classic', year: '1987' },
  { id: 's-wonderwall', q: 'oasis wonderwall', genre: '90s', year: '1995' },
  { id: 's-every-breath-you-take', q: 'the police every breath you take', genre: 'Classic', year: '1983' },
  { id: 's-levitating', q: 'dua lipa levitating', genre: 'Modern pop', year: '2020' },
  { id: 's-like-a-rolling-stone', q: 'bob dylan like a rolling stone', genre: 'Classic', year: '1965' },
  { id: 's-blue-monday', q: 'new order blue monday', genre: 'Electronic', year: '1983' },
  { id: 's-take-five', q: 'dave brubeck take five', genre: 'Jazz', year: '1959' },
  { id: 's-as-it-was', q: 'harry styles as it was', genre: 'Modern pop', year: '2022' },
  { id: 's-paint-it-black', q: 'the rolling stones paint it black', genre: 'Classic', year: '1966' },
  { id: 's-losing-my-religion', q: 'r.e.m. losing my religion', genre: '90s', year: '1991' },
  { id: 's-get-lucky', q: 'daft punk get lucky', genre: 'Electronic', year: '2013' },
  { id: 's-purple-rain', q: 'prince purple rain', genre: 'Classic', year: '1984' },
  { id: 's-bad-guy', q: 'billie eilish bad guy', genre: 'Modern pop', year: '2019' },
  { id: 's-superstition', q: 'stevie wonder superstition', genre: 'Classic', year: '1972' },
  { id: 's-black-hole-sun', q: 'soundgarden black hole sun', genre: '90s', year: '1994' },
  { id: 's-nightcall', q: 'kavinsky nightcall', genre: 'Electronic', year: '2013' },
  { id: 's-giant-steps', q: 'john coltrane giant steps', genre: 'Jazz', year: '1960' },
  { id: 's-lovesong', q: 'the cure lovesong', genre: '90s', year: '1989' },
  { id: 's-sultans-of-swing', q: 'dire straits sultans of swing', genre: 'Classic', year: '1978' },
  { id: 's-bitter-sweet-symphony', q: 'the verve bitter sweet symphony', genre: '90s', year: '1997' },
  { id: 's-starboy', q: 'the weeknd starboy', genre: 'Modern pop', year: '2016' },
  { id: 's-feel-good-inc', q: 'gorillaz feel good inc', genre: 'Electronic', year: '2005' },
  { id: 's-feeling-good', q: 'nina simone feeling good', genre: 'Jazz', year: '1965' },
  { id: 's-enter-sandman', q: 'metallica enter sandman', genre: '90s', year: '1991' },
  { id: 's-stayin-alive', q: 'bee gees stayin alive', genre: 'Classic', year: '1977' },
  { id: 's-enjoy-the-silence', q: 'depeche mode enjoy the silence', genre: '90s', year: '1990' },
  { id: 's-midnight-city', q: 'm83 midnight city', genre: 'Electronic', year: '2011' },
  { id: 's-autumn-leaves', q: 'bill evans autumn leaves', genre: 'Jazz', year: '1960' },
  { id: 's-fly-me-to-the-moon', q: 'frank sinatra fly me to the moon', genre: 'Classic', year: '1964' },
  { id: 's-teardrop', q: 'massive attack teardrop', genre: '90s', year: '1998' },
  { id: 's-rolling-in-the-deep', q: 'adele rolling in the deep', genre: 'Modern pop', year: '2011' },
  { id: 's-sentimental-mood', q: 'duke ellington in a sentimental mood', genre: 'Jazz', year: '1963' },
  { id: 's-london-calling', q: 'the clash london calling', genre: 'Classic', year: '1979' },
  { id: 's-under-the-bridge', q: 'red hot chili peppers under the bridge', genre: '90s', year: '1991' },
  { id: 's-yellow', q: 'coldplay yellow', genre: 'Modern pop', year: '2000' },
  { id: 's-flowers', q: 'miley cyrus flowers', genre: 'Modern pop', year: '2023' },
];

async function main() {
  const songs = [];
  console.log(`Starting to fetch real music for ${songQueries.length} tracks...`);

  for (let i = 0; i < songQueries.length; i++) {
    const item = songQueries[i];
    let fetched = false;
    for (let attempt = 0; attempt < 4 && !fetched; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(r => setTimeout(r, 1200 * attempt));
        }
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(item.q)}&media=music&limit=1`;
        const res = await fetch(url);
        const text = await res.text();
        if (text.startsWith('Rate limit')) {
          console.warn(`[${i + 1}/${songQueries.length}] Rate limited, backing off... (attempt ${attempt + 1})`);
          continue;
        }
        const data = JSON.parse(text);
        const track = data.results && data.results[0];

        if (track && track.previewUrl) {
          const cover = (track.artworkUrl100 || '').replace('100x100bb', '600x600bb');
          const durationSec = track.trackTimeMillis ? Math.round(track.trackTimeMillis / 1000) : 215;
          songs.push({
            id: item.id,
            title: track.trackName || item.q,
            artist: track.artistName || 'Artist',
            album: track.collectionName || 'Album',
            duration: durationSec,
            audioUrl: track.previewUrl,
            coverUrl: cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
            genre: item.genre,
            likes: Math.floor(Math.random() * 800) + 400,
            badge: item.genre,
            year: item.year,
          });
          console.log(`[${i + 1}/${songQueries.length}] OK: ${track.trackName} by ${track.artistName}`);
          fetched = true;
        }
      } catch (err) {
        console.error(`Error fetching ${item.q} (attempt ${attempt + 1}):`, err.message);
      }
    }

    if (!fetched) {
      console.warn(`[${i + 1}/${songQueries.length}] Fallback for: ${item.q}`);
      songs.push({
        id: item.id,
        title: item.q.split(' ').slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join(' '),
        artist: item.q.split(' ')[0][0].toUpperCase() + item.q.split(' ')[0].slice(1),
        album: 'Greatest Hits',
        duration: 215,
        audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/a4/0c/33/a40c33eb-69be-b88d-e461-7fcbead3ea58/mzaf_17207436214532159846.plus.aac.p.m4a',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
        genre: item.genre,
        likes: 620,
        badge: item.genre,
        year: item.year,
      });
    }
    // Polite pause between queries
    await new Promise(r => setTimeout(r, 250));
  }

  const fileContent = `import type { Track, Playlist, PodcastShow, PodcastEpisode } from '../types';

export interface RetroSong extends Track {
  likes?: number;
  badge?: string;
  year?: string;
}

export const initialSongs: RetroSong[] = ${JSON.stringify(songs, null, 2)};

export interface FavoritePlaylist {
  id: string;
  title: string;
  songCount: number;
  coverUrl: string;
  tracks: RetroSong[];
}

export const favoritePlaylists: FavoritePlaylist[] = [
  {
    id: 'pl-classic-rock-gold',
    title: 'Vinyl Legends: Classic Era',
    songCount: 16,
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80',
    tracks: initialSongs.filter((s) => s.genre === 'Classic'),
  },
  {
    id: 'pl-golden-90s',
    title: '90s Alternative & Grunge',
    songCount: 12,
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80',
    tracks: initialSongs.filter((s) => s.genre === '90s'),
  },
  {
    id: 'pl-analog-electronic',
    title: 'Synthwave & Electronic Hi-Fi',
    songCount: 10,
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80',
    tracks: initialSongs.filter((s) => s.genre === 'Electronic'),
  },
  {
    id: 'pl-midnight-jazz',
    title: 'Blue Note Midnight Jazz',
    songCount: 8,
    coverUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=400&q=80',
    tracks: initialSongs.filter((s) => s.genre === 'Jazz'),
  },
  {
    id: 'pl-modern-chart',
    title: 'Modern Hits & Anthems',
    songCount: 10,
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=80',
    tracks: initialSongs.filter((s) => s.genre === 'Modern pop'),
  },
];

export const categoriesList = [
  'All',
  'Classic',
  '90s',
  'Electronic',
  'Jazz',
  'Modern pop',
];

// Fallback compatibility
export const songs = initialSongs;
export const playlists: Playlist[] = favoritePlaylists.map((p) => ({
  id: p.id,
  title: p.title,
  coverUrl: p.coverUrl,
  _count: { tracks: p.songCount },
}));
export const podcasts: PodcastShow[] = [];
export const episodes: PodcastEpisode[] = [];
`;

  fs.writeFileSync('c:/SQL/Music/src/data/mockData.ts', fileContent, 'utf-8');
  console.log('Successfully wrote 50 real songs into src/data/mockData.ts!');
}

main();
