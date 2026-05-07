import type {
  Movie,
  MusicTrack,
  PodcastEpisode,
  RecentMediaRef,
} from '../../types/media';
import type { LibraryPayload } from './library-repository';
import type { ColorMode, DeviceKind, DeviceSnapshot } from '../../state/devices/store';

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
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  subtitle?: string;
  type?: string;
  powerState?: string;
  level?: { current?: number };
  mode?: { current?: string; available?: Array<{ id: string; label: string }> };
  colorState?: { mode?: string; kelvin?: number; hue?: number; saturation?: number };
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
  const id = raw.slug ?? raw._id ?? raw.id ?? '';

  const kind: DeviceKind =
    raw.type === 'tv' ? 'tv' :
    raw.type === 'light' ? 'light' :
    raw.type === 'speaker' ? 'speaker' :
    'generic';

  return {
    id,
    kind,
    ...(raw.name !== undefined && { name: raw.name }),
    ...(raw.subtitle !== undefined && { subtitle: raw.subtitle }),
    enabled: raw.powerState === 'on',
    ...(typeof raw.level?.current === 'number' && {
      level: Math.min(100, Math.max(0, Math.round(raw.level.current))),
    }),
    ...(raw.mode?.current !== undefined && { inputSource: raw.mode.current }),
    ...(raw.mode?.available !== undefined && {
      availableSources: raw.mode.available.map((m) => m.id),
    }),
    ...(raw.colorState?.mode !== undefined && {
      colorMode: raw.colorState.mode as ColorMode,
    }),
    ...(typeof raw.colorState?.kelvin === 'number' && { colorTemperatureK: raw.colorState.kelvin }),
    ...(typeof raw.colorState?.hue === 'number' && { hue: raw.colorState.hue }),
    ...(typeof raw.colorState?.saturation === 'number' && { saturation: raw.colorState.saturation }),
  };
}
