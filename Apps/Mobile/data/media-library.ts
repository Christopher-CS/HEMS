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
    title: 'Midnight Drive',
    subtitle: 'Nova Sound',
    artist: 'Nova Sound',
    album: 'Neon Horizon',
    genre: 'Synthwave',
    durationSeconds: 214,
    artworkUrl:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'track-002',
    category: 'music',
    title: 'Coastline',
    subtitle: 'Arlo Sage',
    artist: 'Arlo Sage',
    album: 'Low Tide',
    genre: 'Indie',
    durationSeconds: 198,
    artworkUrl:
      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'track-003',
    category: 'music',
    title: 'Afterglow',
    subtitle: 'The Ember Hours',
    artist: 'The Ember Hours',
    album: 'Hollow Rooms',
    genre: 'Alt Rock',
    durationSeconds: 242,
    artworkUrl:
      'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'track-004',
    category: 'music',
    title: 'Paperweight',
    subtitle: 'Juno Wilder',
    artist: 'Juno Wilder',
    album: 'Small Machines',
    genre: 'Electronic',
    durationSeconds: 176,
    artworkUrl:
      'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'track-005',
    category: 'music',
    title: 'Harbor Lights',
    subtitle: 'Mira Aoki',
    artist: 'Mira Aoki',
    album: 'Quiet Engines',
    genre: 'Ambient',
    durationSeconds: 305,
    artworkUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'track-006',
    category: 'music',
    title: 'Chasing Static',
    subtitle: 'Hollow Talk',
    artist: 'Hollow Talk',
    album: 'Analog Ghosts',
    genre: 'Post Rock',
    durationSeconds: 267,
    artworkUrl:
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop',
  },
];

export const MOVIES: Movie[] = [
  {
    id: 'movie-001',
    category: 'movies',
    title: 'The Cartographer',
    subtitle: 'Drama',
    director: 'Anya Holloway',
    year: 2024,
    rating: 'PG-13',
    genre: 'Drama',
    durationSeconds: 7260,
    artworkUrl:
      'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'movie-002',
    category: 'movies',
    title: 'Orbital',
    subtitle: 'Sci-Fi Thriller',
    director: 'Marcus Reed',
    year: 2023,
    rating: 'PG-13',
    genre: 'Sci-Fi',
    durationSeconds: 8040,
    artworkUrl:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'movie-003',
    category: 'movies',
    title: 'Paper Lanterns',
    subtitle: 'Animated',
    director: 'Kenji Sato',
    year: 2022,
    rating: 'PG',
    genre: 'Animation',
    durationSeconds: 5880,
    artworkUrl:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'movie-004',
    category: 'movies',
    title: 'Last Light on 5th',
    subtitle: 'Mystery',
    director: 'Ivy Pace',
    year: 2025,
    rating: 'R',
    genre: 'Mystery',
    durationSeconds: 6960,
    artworkUrl:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'movie-005',
    category: 'movies',
    title: 'Coded Hearts',
    subtitle: 'Romance',
    director: 'Leah Okafor',
    year: 2024,
    rating: 'PG-13',
    genre: 'Romance',
    durationSeconds: 6300,
    artworkUrl:
      'https://images.unsplash.com/photo-1518676590629-3dcba9c5a555?q=80&w=500&auto=format&fit=crop',
  },
  {
    id: 'movie-006',
    category: 'movies',
    title: 'Signal Lost',
    subtitle: 'Horror',
    director: 'Rex Alban',
    year: 2023,
    rating: 'R',
    genre: 'Horror',
    durationSeconds: 5640,
    artworkUrl:
      'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=500&auto=format&fit=crop',
  },
];

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    id: 'pod-001',
    category: 'podcasts',
    title: 'The Edge of Quiet Cities',
    subtitle: 'Urban Field Notes',
    showName: 'Urban Field Notes',
    episodeNumber: 42,
    publishedOn: '2026-03-18',
    durationSeconds: 2820,
    artworkUrl:
      'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'pod-002',
    category: 'podcasts',
    title: 'Why We Build What We Build',
    subtitle: 'Inside the Studio',
    showName: 'Inside the Studio',
    episodeNumber: 11,
    publishedOn: '2026-03-22',
    durationSeconds: 3480,
    artworkUrl:
      'https://images.unsplash.com/photo-1589903308904-1010c2294adc?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'pod-003',
    category: 'podcasts',
    title: 'Markets, Meaning, and Machines',
    subtitle: 'Signal/Noise',
    showName: 'Signal/Noise',
    episodeNumber: 208,
    publishedOn: '2026-03-25',
    durationSeconds: 4020,
    artworkUrl:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'pod-004',
    category: 'podcasts',
    title: 'A Short History of Home',
    subtitle: 'Rooms & Ruins',
    showName: 'Rooms & Ruins',
    episodeNumber: 5,
    publishedOn: '2026-04-01',
    durationSeconds: 2640,
    artworkUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'pod-005',
    category: 'podcasts',
    title: 'Soft Power',
    subtitle: 'Dinner Table Diplomacy',
    showName: 'Dinner Table Diplomacy',
    episodeNumber: 76,
    publishedOn: '2026-04-08',
    durationSeconds: 3120,
    artworkUrl:
      'https://images.unsplash.com/photo-1504385778850-5b5aed68999b?q=80&w=400&auto=format&fit=crop',
  },
];

export const RECENT_MEDIA: RecentMediaRef[] = [
  {
    id: 'movie-002',
    category: 'movies',
    title: 'Orbital',
    subtitle: 'Paused at 47m',
    artworkUrl: MOVIES[1].artworkUrl,
    progress: 0.35,
  },
  {
    id: 'track-001',
    category: 'music',
    title: 'Midnight Drive',
    subtitle: 'Nova Sound',
    artworkUrl: MUSIC_TRACKS[0].artworkUrl,
    progress: 0.6,
  },
  {
    id: 'pod-003',
    category: 'podcasts',
    title: 'Markets, Meaning, and Machines',
    subtitle: 'Signal/Noise · Ep 208',
    artworkUrl: PODCAST_EPISODES[2].artworkUrl,
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
