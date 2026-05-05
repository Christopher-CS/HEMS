import {
  MOVIES,
  MUSIC_TRACKS,
  PODCAST_EPISODES,
  RECENT_MEDIA,
} from '../../data/media-library';
import type { LibraryPayload, LibraryRepository } from './library-repository';

export function createMockLibraryRepository(): LibraryRepository {
  return {
    async fetchLibrary(): Promise<LibraryPayload> {
      return {
        music: MUSIC_TRACKS,
        movies: MOVIES,
        podcasts: PODCAST_EPISODES,
        recents: RECENT_MEDIA,
      };
    },
  };
}
