import type { Episode, Playlist, Podcast, Song } from '../types';

export const songs: Song[] = [
  {
    id: 's1',
    title: 'Neon Horizon',
    artist: 'Nova Vale',
    album: 'Afterglow City',
    duration: 372,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    art: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=900&q=80',
    genre: 'Electronic',
  },
  {
    id: 's2',
    title: 'Pacific Tide',
    artist: 'Luma Coast',
    album: 'Velvet Skies',
    duration: 342,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    art: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80',
    genre: 'Dream Pop',
  },
];

export const podcasts: Podcast[] = [
  {
    id: 'p1',
    title: 'Sonic Architecture',
    author: 'Nova Vale',
    description: 'Discussions on music composition and spatial audio.',
    art: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    category: 'Technology',
  },
];

export const episodes: Episode[] = [
  {
    id: 'e1',
    showId: 'p1',
    title: 'Ep 1: Analog Synthesis in the Digital Age',
    description: 'How modern producers blend vintage circuitry with software instruments.',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
    duration: 1840,
    art: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
  },
];

export const playlists: Playlist[] = [];
