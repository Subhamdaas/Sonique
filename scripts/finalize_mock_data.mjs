import fs from 'fs';
import crypto from 'crypto';

function decryptUrl(enc) {
  const key = Buffer.from('38346591', 'utf8');
  const decipher = crypto.createDecipheriv('des-ecb', key, '');
  let decrypted = decipher.update(enc, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted.replace('_96.mp4', '_320.mp4');
}

async function main() {
  const list = JSON.parse(fs.readFileSync('scripts/resolved_full_songs.json', 'utf8'));
  const missing = [
    { id: 's-mayabini-bana', q: 'Mayabini Bana Jochhona', genre: 'Odia', badge: 'Odia Classic', year: '1998' },
    { id: 's-tu-asibu-boli', q: 'Tu Asibu Boli Humane Sagar', genre: 'Odia', badge: 'Odia Hit', year: '2021' }
  ];

  for (const item of missing) {
    try {
      const url = 'https://www.jiosaavn.com/api.php?__call=search.getResults&q=' + encodeURIComponent(item.q) + '&_format=json&_marker=0&api_version=4&ctx=web6dot0&n=1';
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const data = await res.json();
      const track = data.results && data.results[0];
      if (track && track.more_info?.encrypted_media_url) {
        const mediaUrl = decryptUrl(track.more_info.encrypted_media_url);
        const duration = parseInt(track.more_info.duration || '240', 10);
        const cover = (track.image || '').replace('150x150.jpg', '500x500.jpg');
        const cleanTitle = (track.title || item.q).replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&');
        const primaryArtist = track.more_info?.artistMap?.primary_artists?.map(a => a.name).join(', ') || track.subtitle || 'Humane Sagar';
        list.splice(13, 0, {
          id: item.id,
          title: cleanTitle,
          artist: primaryArtist.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&'),
          album: (track.more_info?.album || item.genre).replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&amp;/g, '&'),
          duration,
          audioUrl: mediaUrl,
          coverUrl: cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
          genre: item.genre,
          likes: Math.floor(Math.random() * 500) + 500,
          badge: item.badge,
          year: track.more_info?.year || item.year
        });
        console.log('Added:', cleanTitle);
      }
    } catch (e) {
      console.error('Error adding Odia song:', item.q, e.message);
    }
  }

  // Refine artist names for famous tracks so that lead vocalists appear properly:
  const artistMapOverrides = {
    's-tum-hi-ho': 'Arijit Singh & Mithoon',
    's-kesariya': 'Arijit Singh & Pritam',
    's-chaleya': 'Arijit Singh & Shilpa Rao',
    's-apna-bana-le': 'Arijit Singh & Sachin-Jigar',
    's-pehle-bhi-main': 'Vishal Mishra',
    's-channa-mereya': 'Arijit Singh & Pritam',
    's-shayad': 'Arijit Singh & Pritam',
    's-raataan-lambiyan': 'Jubin Nautiyal & Asees Kaur',
    's-ghungroo': 'Arijit Singh & Shilpa Rao',
    's-kalank': 'Arijit Singh & Pritam',
    's-rangabati': 'Surojit & Iman Chakraborty',
    's-priya-re': 'Humane Sagar',
    's-janu-tame': 'Humane Sagar',
    's-naatu-naatu': 'Rahul Sipligunj & Kaala Bhairava',
    's-oo-antava': 'Indravathi Chauhan & Devi Sri Prasad',
    's-butta-bomma': 'Armaan Malik & Thaman S',
    's-srivalli': 'Sid Sriram & Devi Sri Prasad',
    's-ramuloo-ramulaa': 'Anurag Kulkarni & Mangli',
    's-saami-saami': 'Mounika Yadav & Devi Sri Prasad',
    's-starboy': 'The Weeknd ft. Daft Punk',
    's-shape-of-you': 'Ed Sheeran',
    's-believer': 'Imagine Dragons',
    's-blinding-lights': 'The Weeknd',
    's-levitating': 'Dua Lipa',
    's-as-it-was': 'Harry Styles',
    's-flowers': 'Miley Cyrus',
    's-bad-guy': 'Billie Eilish',
    's-yellow': 'Coldplay',
    's-rolling-in-the-deep': 'Adele',
    's-bohemian-rhapsody': 'Queen',
    's-billie-jean': 'Michael Jackson',
    's-hotel-california': 'Eagles',
    's-smells-like-teen-spirit': 'Nirvana',
    's-sweet-child-o-mine': "Guns N' Roses",
    's-comfortably-numb': 'Pink Floyd',
    's-stairway-to-heaven': 'Led Zeppelin',
    's-back-in-black': 'AC/DC',
    's-every-breath-you-take': 'The Police',
    's-stayin-alive': 'Bee Gees',
    's-fly-me-to-the-moon': 'Frank Sinatra',
    's-stand-by-me': 'Ben E. King',
    's-wonderwall': 'Oasis',
    's-enjoy-the-silence': 'Depeche Mode',
    's-get-lucky': 'Daft Punk ft. Pharrell Williams',
    's-so-what': 'Miles Davis'
  };

  for (const s of list) {
    if (artistMapOverrides[s.id]) {
      s.artist = artistMapOverrides[s.id];
    }
  }

  console.log(`Final count: ${list.length} tracks.`);

  const fileContent = `import type { Track, Playlist, PodcastShow, PodcastEpisode } from '../types';

export interface RetroSong extends Track {
  likes?: number;
  badge?: string;
  year?: string;
}

export const initialSongs: RetroSong[] = ${JSON.stringify(list, null, 2)};

export interface FavoritePlaylist {
  id: string;
  title: string;
  songCount: number;
  coverUrl: string;
  tracks: RetroSong[];
}

export const favoritePlaylists: FavoritePlaylist[] = [
  {
    id: 'pl-hindi-viral',
    title: 'Hindi Romance & Viral Hits',
    songCount: initialSongs.filter((s) => s.genre === 'Hindi').length,
    coverUrl: 'https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg',
    tracks: initialSongs.filter((s) => s.genre === 'Hindi'),
  },
  {
    id: 'pl-odia-superhits',
    title: 'Odia Nostalgia & Folk Beats',
    songCount: initialSongs.filter((s) => s.genre === 'Odia').length,
    coverUrl: 'https://c.saavncdn.com/181/Rangabati-Bengali-2019-20190709142827-500x500.jpg',
    tracks: initialSongs.filter((s) => s.genre === 'Odia'),
  },
  {
    id: 'pl-tollywood-blockbusters',
    title: 'Tollywood Mass & Viral Beats',
    songCount: initialSongs.filter((s) => s.genre === 'Tollywood').length,
    coverUrl: 'https://c.saavncdn.com/001/RRR-Telugu-2021-20220324140003-500x500.jpg',
    tracks: initialSongs.filter((s) => s.genre === 'Tollywood'),
  },
  {
    id: 'pl-hollywood-charts',
    title: 'Hollywood Global Viral Hits',
    songCount: initialSongs.filter((s) => s.genre === 'Hollywood').length,
    coverUrl: 'https://c.saavncdn.com/396/Starboy-English-2016-500x500.jpg',
    tracks: initialSongs.filter((s) => s.genre === 'Hollywood'),
  },
  {
    id: 'pl-classic-rock-gold',
    title: 'Vinyl Legends: Classic Era',
    songCount: initialSongs.filter((s) => s.genre === 'Classic').length,
    coverUrl: 'https://c.saavncdn.com/264/Bohemian-Rhapsody-The-Original-Soundtrack-English-2018-20181019000540-500x500.jpg',
    tracks: initialSongs.filter((s) => s.genre === 'Classic'),
  },
];

export const categoriesList = [
  'All',
  'Hindi',
  'Odia',
  'Hollywood',
  'Tollywood',
  'Classic',
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

  fs.writeFileSync('src/data/mockData.ts', fileContent, 'utf8');
  console.log('Successfully wrote src/data/mockData.ts with all 50 full songs!');
}

main().catch(console.error);
