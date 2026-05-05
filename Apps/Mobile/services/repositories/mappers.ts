import type {
  Movie,
  MusicTrack,
  PodcastEpisode,
  RecentMediaRef,
} from '../../types/media';
import type { LibraryPayload } from './library-repository';
import type { DeviceSnapshot } from '../../state/devices/store';

type RawMusic = {
  id: string;
  title: string;
  subtitle?: string;
  artist: string;
  album: string;
  genre?: string;
  durationSeconds: number;
  artworkUrl?: string;
};

type RawMovie = {
  id: string;
  title: string;
  subtitle?: string;
  director: string;
  year: number;
  rating?: string;
  genre?: string;
  durationSeconds: number;
  artworkUrl?: string;
};

type RawPodcast = {
  id: string;
  title: string;
  subtitle?: string;
  showName: string;
  episodeNumber?: number;
  publishedOn?: string;
  durationSeconds: number;
  artworkUrl?: string;
};

type RawRecent = {
  id: string;
  category: 'music' | 'movies' | 'podcasts';
  title: string;
  subtitle: string;
  durationSeconds: number;
  artworkUrl?: string;
  progress?: number;
};

export type RawLibraryPayload = {
  music?: RawMusic[];
  movies?: RawMovie[];
  podcasts?: RawPodcast[];
  recents?: RawRecent[];
};

export type RawDevice = {
  id?: string;
  _id?: string;
  name?: string;
  subtitle?: string;
  enabled?: boolean;
  level?: number;
};

const toMusic = (raw: RawMusic): MusicTrack => ({
  id: raw.id,
  category: 'music',
  title: raw.title,
  subtitle: raw.subtitle ?? raw.artist,
  artist: raw.artist,
  album: raw.album,
  genre: raw.genre,
  durationSeconds: raw.durationSeconds,
  artworkUrl: raw.artworkUrl,
});

const toMovie = (raw: RawMovie): Movie => ({
  id: raw.id,
  category: 'movies',
  title: raw.title,
  subtitle: raw.subtitle ?? raw.genre ?? '',
  director: raw.director,
  year: raw.year,
  rating: raw.rating,
  genre: raw.genre,
  durationSeconds: raw.durationSeconds,
  artworkUrl: raw.artworkUrl,
});

const toPodcast = (raw: RawPodcast): PodcastEpisode => ({
  id: raw.id,
  category: 'podcasts',
  title: raw.title,
  subtitle: raw.subtitle ?? raw.showName,
  showName: raw.showName,
  episodeNumber: raw.episodeNumber,
  publishedOn: raw.publishedOn,
  durationSeconds: raw.durationSeconds,
  artworkUrl: raw.artworkUrl,
});

const toRecent = (raw: RawRecent): RecentMediaRef => ({
  id: raw.id,
  category: raw.category,
  title: raw.title,
  subtitle: raw.subtitle,
  durationSeconds: raw.durationSeconds,
  artworkUrl: raw.artworkUrl,
  progress: raw.progress,
});

export function mapLibraryPayload(raw: RawLibraryPayload | null | undefined): LibraryPayload {
  return {
    music: (raw?.music ?? []).map(toMusic),
    movies: (raw?.movies ?? []).map(toMovie),
    podcasts: (raw?.podcasts ?? []).map(toPodcast),
    recents: (raw?.recents ?? []).map(toRecent),
  };
}

export function mapDevice(raw: RawDevice): Omit<Partial<DeviceSnapshot>, 'id'> & { id: string } {
  const id = raw.id ?? raw._id ?? '';
  return {
    id,
    name: raw.name,
    subtitle: raw.subtitle,
    enabled: raw.enabled,
    level: typeof raw.level === 'number' ? Math.min(100, Math.max(0, Math.round(raw.level))) : undefined,
  };
}
