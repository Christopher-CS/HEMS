import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type { MediaCategory } from '../../types/media';

export type NowPlaying = {
  mediaId: string;
  category: MediaCategory;
  title: string;
  subtitle?: string;
  durationSeconds: number;
  positionSeconds: number;
  isPlaying: boolean;
  artworkUrl?: string;
  /** Resolved from library metadata when present — used by LibraryAudioPlayer. */
  audioUrl?: string;
};

export type QueuedMedia = Omit<NowPlaying, 'positionSeconds' | 'isPlaying'>;

export type PlaybackState = {
  current: NowPlaying | null;
  queue: QueuedMedia[];
};

const INITIAL_PLAYBACK: PlaybackState = {
  current: null,
  queue: [],
};

type PlaybackAction =
  | { type: 'set-now-playing'; media: NowPlaying }
  | { type: 'clear-now-playing' }
  | { type: 'enqueue'; media: QueuedMedia }
  | { type: 'clear-queue' }
  | { type: 'remove-from-queue'; index: number }
  | { type: 'set-position'; positionSeconds: number }
  | { type: 'set-playing'; isPlaying: boolean }
  | { type: 'reset' };

const clampPosition = (current: number, max: number) =>
  Math.min(Math.max(0, Math.round(current)), Math.max(0, Math.round(max)));

const reducer = (state: PlaybackState, action: PlaybackAction): PlaybackState => {
  switch (action.type) {
    case 'set-now-playing':
      return { ...state, current: action.media };
    case 'clear-now-playing':
      if (!state.current) return state;
      return { ...state, current: null };
    case 'enqueue':
      return { ...state, queue: [...state.queue, action.media] };
    case 'clear-queue':
      return { ...state, queue: [] };
    case 'remove-from-queue':
      if (action.index < 0 || action.index >= state.queue.length) return state;
      return {
        ...state,
        queue: state.queue.filter((_, index) => index !== action.index),
      };
    case 'set-position': {
      if (!state.current) return state;
      const next = clampPosition(action.positionSeconds, state.current.durationSeconds);
      if (state.current.positionSeconds === next) return state;
      return {
        ...state,
        current: { ...state.current, positionSeconds: next },
      };
    }
    case 'set-playing': {
      if (!state.current) return state;
      if (state.current.isPlaying === action.isPlaying) return state;
      return {
        ...state,
        current: { ...state.current, isPlaying: action.isPlaying },
      };
    }
    case 'reset':
      return INITIAL_PLAYBACK;
    default:
      return state;
  }
};

type PlaybackContextValue = {
  state: PlaybackState;
  setNowPlaying: (media: NowPlaying) => void;
  clearNowPlaying: () => void;
  enqueue: (media: QueuedMedia) => void;
  clearQueue: () => void;
  removeFromQueue: (index: number) => void;
  setPosition: (positionSeconds: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  reset: () => void;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

export function PlaybackProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_PLAYBACK);

  const value = useMemo<PlaybackContextValue>(
    () => ({
      state,
      setNowPlaying: (media) => dispatch({ type: 'set-now-playing', media }),
      clearNowPlaying: () => dispatch({ type: 'clear-now-playing' }),
      enqueue: (media) => dispatch({ type: 'enqueue', media }),
      clearQueue: () => dispatch({ type: 'clear-queue' }),
      removeFromQueue: (index) => dispatch({ type: 'remove-from-queue', index }),
      setPosition: (positionSeconds) => dispatch({ type: 'set-position', positionSeconds }),
      setPlaying: (isPlaying) => dispatch({ type: 'set-playing', isPlaying }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state]
  );

  return <PlaybackContext.Provider value={value}>{children}</PlaybackContext.Provider>;
}

export function usePlaybackStore(): PlaybackContextValue {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error('usePlaybackStore must be used within PlaybackProvider');
  return ctx;
}

export const __TEST_ONLY = { reducer, INITIAL_PLAYBACK };
