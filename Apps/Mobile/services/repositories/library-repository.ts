import type { Movie, MusicTrack, PodcastEpisode, RecentMediaRef } from '../../types/media';

export type LibraryPayload = {
  music: MusicTrack[];
  movies: Movie[];
  podcasts: PodcastEpisode[];
  recents: RecentMediaRef[];
};

export interface LibraryRepository {
  fetchLibrary(): Promise<LibraryPayload>;
}
