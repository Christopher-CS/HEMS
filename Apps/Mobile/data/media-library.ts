import type {
  Movie,
  MusicTrack,
  PodcastEpisode,
  RecentMediaRef,
} from '../types/media';

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-001',
    category: 'music',
    title: 'Lithonia',
    subtitle: 'Childish Gambino',
    artist: 'Childish Gambino',
    album: 'Bando Stone & The New World',
    genre: 'Hip Hop',
    durationSeconds: 179,
    audioUrl: '/audio/Childish Gambino - Lithonia.mp3',
    artworkUrl: 'https://upload.wikimedia.org/wikipedia/en/2/2d/Bando_Stone_and_The_New_World.png',
  },
  {
    id: 'track-002',
    category: 'music',
    title: '(forever_________)',
    subtitle: 'glass beach',
    artist: 'glass beach',
    album: 'the first glass beach album',
    genre: 'Indie Rock',
    durationSeconds: 108,
    audioUrl: '/audio/glass beach - (forever_________).mp3',
    artworkUrl: 'https://f4.bcbits.com/img/a0854720793_10.jpg',
  },
  {
    id: 'track-003',
    category: 'music',
    title: 'classic j dies and goes to hell part 1',
    subtitle: 'glass beach',
    artist: 'glass beach',
    album: 'the first glass beach album',
    genre: 'Indie Rock',
    durationSeconds: 304,
    audioUrl: '/audio/glass beach - classic j dies and goes to hell part 1.mp3',
    artworkUrl: 'https://f4.bcbits.com/img/a0854720793_10.jpg',
  },
  {
    id: 'track-004',
    category: 'music',
    title: 'Weekend Friend',
    subtitle: 'Goth Babe',
    artist: 'Goth Babe',
    album: 'Weekend Friend',
    genre: 'Indie Pop',
    durationSeconds: 209,
    audioUrl: '/audio/Goth Babe - Weekend Friend.mp3',
    artworkUrl: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/56/20/f9/5620f97d-e9b0-bcf3-7dc0-8caefdbb842d/196006664647.jpg/1200x1200bf-60.jpg',
  },
  {
    id: 'track-005',
    category: 'music',
    title: 'Harness Your Hopes (B-side)',
    subtitle: 'Pavement',
    artist: 'Pavement',
    album: 'Brighten the Corners: Nicene Creedence Edition',
    genre: 'Indie Rock',
    durationSeconds: 207,
    audioUrl: '/audio/Pavement - Harness Your Hopes (B-side).mp3',
    artworkUrl: 'https://upload.wikimedia.org/wikipedia/en/4/47/Pavement_-_Brighten_the_Corners.jpg',
  },
  {
    id: 'track-006',
    category: 'music',
    title: 'do-re-mi-fa-so-la-ti-do',
    subtitle: 'Porter Robinson',
    artist: 'Porter Robinson',
    album: 'Nurture',
    genre: 'Electronic',
    durationSeconds: 214,
    audioUrl: '/audio/Porter Robinson - do-re-mi-fa-so-la-ti-do.mp3',
    artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
  },
  {
    id: 'track-007',
    category: 'music',
    title: 'Get Your Wish',
    subtitle: 'Porter Robinson',
    artist: 'Porter Robinson',
    album: 'Nurture',
    genre: 'Electronic',
    durationSeconds: 218,
    audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
    artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
  },
  {
    id: 'track-008',
    category: 'music',
    title: 'Something Comforting',
    subtitle: 'Porter Robinson',
    artist: 'Porter Robinson',
    album: 'Nurture',
    genre: 'Electronic',
    durationSeconds: 281,
    audioUrl: '/audio/Porter Robinson - Something Comforting.mp3',
    artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
  },
];

export const MOVIES: Movie[] = [];

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'pod-001',
    category: 'podcasts',
    title: 'When Video Games Were Brown',
    subtitle: 'AHOY',
    showName: 'AHOY',
    publishedOn: '2026-05-08',
    durationSeconds: 1354,
    audioUrl: '/podcast/AHOY - When Video Games were Brown.mp3',
    artworkUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_nIylOw4ycI0skl4g1i2as8jYtOJ9zS_G4M7h5gLQ=s900-c-k-c0x00ffffff-no-rj',
  },
  {
    id: 'pod-002',
    category: 'podcasts',
    title: 'Death to Nickels',
    subtitle: '99% Invisible',
    showName: '99% Invisible',
    publishedOn: '2026-05-08',
    durationSeconds: 455,
    audioUrl: '/podcast/Death to Nickels.mp3',
    artworkUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/99_Invisible_cover_art.png',
  },
  {
    id: 'pod-003',
    category: 'podcasts',
    title: "Alzheimer's and the Brain",
    subtitle: 'VSauce',
    showName: 'VSauce',
    publishedOn: '2026-05-08',
    durationSeconds: 901,
    audioUrl: "/podcast/VSauce - Alzheimer's and the Brain.mp3",
    artworkUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_lIA8Vn0pxb0k5mv0W1A0M4d8lY0AMFyxh2WCU8=s900-c-k-c0x00ffffff-no-rj',
  },
];

export const RECENT_MEDIA: RecentMediaRef[] = [
  {
    id: 'track-007',
    category: 'music',
    title: 'Get Your Wish',
    subtitle: 'Porter Robinson',
    durationSeconds: MUSIC_TRACKS[6].durationSeconds,
    artworkUrl: MUSIC_TRACKS[6].artworkUrl,
    audioUrl: MUSIC_TRACKS[6].audioUrl,
    progress: 0.6,
  },
  {
    id: 'pod-003',
    category: 'podcasts',
    title: "Alzheimer's and the Brain",
    subtitle: 'VSauce',
    durationSeconds: PODCAST_EPISODES[2].durationSeconds,
    artworkUrl: PODCAST_EPISODES[2].artworkUrl,
    audioUrl: PODCAST_EPISODES[2].audioUrl,
    progress: 0.22,
  },
];

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes >= 10) {
    return `${minutes} min`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
