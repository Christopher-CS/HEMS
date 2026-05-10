export type MediaCategory = 'music' | 'movies' | 'podcasts';

export interface MediaItemBase {
  id: string;
  title: string;
  subtitle: string;
  durationSeconds: number;
  artworkUrl?: string;
  category: MediaCategory;
}

export interface MusicTrack extends MediaItemBase {
  category: 'music';
  artist: string;
  album: string;
  genre?: string;
  /** Optional stream URL: absolute https URL or path starting with `/` (resolved with backend base URL). */
  audioUrl?: string;
}

export interface Movie extends MediaItemBase {
  category: 'movies';
  director: string;
  year: number;
  rating?: string;
  genre?: string;
}

export interface PodcastEpisode extends MediaItemBase {
  category: 'podcasts';
  showName: string;
  episodeNumber?: number;
  publishedOn?: string;
  audioUrl?: string;
}

export type MediaItem = MusicTrack | Movie | PodcastEpisode;

export type LibraryActionType = 'PLAY' | 'QUEUE' | 'PREVIEW';

export interface RecentMediaRef {
  id: string;
  category: MediaCategory;
  title: string;
  subtitle: string;
  durationSeconds: number;
  artworkUrl?: string;
  audioUrl?: string;
  progress?: number;
}
