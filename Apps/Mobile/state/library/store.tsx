import React, { createContext, useContext, useMemo, useReducer } from 'react';
import {
  MOVIES,
  MUSIC_TRACKS,
  PODCAST_EPISODES,
  RECENT_MEDIA,
} from '../../data/media-library';
import type {
  MediaItem,
  Movie,
  MusicTrack,
  PodcastEpisode,
  RecentMediaRef,
} from '../../types/media';

const MAX_RECENTS = 8;

export type LibraryState = {
  music: MusicTrack[];
  movies: Movie[];
  podcasts: PodcastEpisode[];
  recents: RecentMediaRef[];
};

const INITIAL_LIBRARY: LibraryState = {
  music: MUSIC_TRACKS,
  movies: MOVIES,
  podcasts: PODCAST_EPISODES,
  recents: RECENT_MEDIA,
};

type LibraryAction =
  | { type: 'note-played'; item: MediaItem | RecentMediaRef; progress?: number }
  | { type: 'set-progress'; mediaId: string; progress: number }
  | { type: 'hydrate'; payload: Partial<LibraryState> }
  | { type: 'reset' };

const toRecent = (item: MediaItem | RecentMediaRef, progress?: number): RecentMediaRef => ({
  id: item.id,
  category: item.category,
  title: item.title,
  subtitle: item.subtitle,
  durationSeconds: item.durationSeconds,
  artworkUrl: item.artworkUrl,
  progress,
});

const reducer = (state: LibraryState, action: LibraryAction): LibraryState => {
  switch (action.type) {
    case 'note-played': {
      const recent = toRecent(action.item, action.progress ?? 0);
      const filtered = state.recents.filter((r) => r.id !== recent.id);
      const next = [recent, ...filtered];
      if (next.length > MAX_RECENTS) next.length = MAX_RECENTS;
      return { ...state, recents: next };
    }
    case 'set-progress': {
      const recents = state.recents.map((r) =>
        r.id === action.mediaId ? { ...r, progress: Math.min(1, Math.max(0, action.progress)) } : r
      );
      return { ...state, recents };
    }
    case 'hydrate':
      return {
        music: action.payload.music ?? state.music,
        movies: action.payload.movies ?? state.movies,
        podcasts: action.payload.podcasts ?? state.podcasts,
        recents: action.payload.recents ?? state.recents,
      };
    case 'reset':
      return INITIAL_LIBRARY;
    default:
      return state;
  }
};

type LibraryContextValue = {
  state: LibraryState;
  notePlayed: (item: MediaItem | RecentMediaRef, progress?: number) => void;
  setProgress: (mediaId: string, progress: number) => void;
  hydrate: (payload: Partial<LibraryState>) => void;
  reset: () => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_LIBRARY);

  const value = useMemo<LibraryContextValue>(
    () => ({
      state,
      notePlayed: (item, progress) => dispatch({ type: 'note-played', item, progress }),
      setProgress: (mediaId, progress) => dispatch({ type: 'set-progress', mediaId, progress }),
      hydrate: (payload) => dispatch({ type: 'hydrate', payload }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibraryStore(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibraryStore must be used within LibraryProvider');
  return ctx;
}

export const __TEST_ONLY = { reducer, INITIAL_LIBRARY, MAX_RECENTS };
