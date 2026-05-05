import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { CommandLogEntry } from '../../services/transport/types';

const STORAGE_KEY = '@hems/debug-settings/v1';
const MAX_LOG_ENTRIES = 50;

export type TransportMode = 'mock' | 'live';

export type DebugSettings = {
  mode: TransportMode;
  latencyMs: number;
  failRate: number;
};

export type DebugState = DebugSettings & {
  hydrated: boolean;
  log: CommandLogEntry[];
};

const DEFAULT_SETTINGS: DebugSettings = {
  mode: 'mock',
  latencyMs: 250,
  failRate: 0,
};

type DebugAction =
  | { type: 'hydrate'; settings: DebugSettings }
  | { type: 'set-mode'; mode: TransportMode }
  | { type: 'set-latency'; latencyMs: number }
  | { type: 'set-fail-rate'; failRate: number }
  | { type: 'log-entry'; entry: CommandLogEntry }
  | { type: 'clear-log' };

const initialState: DebugState = {
  ...DEFAULT_SETTINGS,
  hydrated: false,
  log: [],
};

const reducer = (state: DebugState, action: DebugAction): DebugState => {
  switch (action.type) {
    case 'hydrate':
      return { ...state, ...action.settings, hydrated: true };
    case 'set-mode':
      return { ...state, mode: action.mode };
    case 'set-latency':
      return { ...state, latencyMs: Math.max(0, Math.round(action.latencyMs)) };
    case 'set-fail-rate':
      return { ...state, failRate: Math.min(1, Math.max(0, action.failRate)) };
    case 'log-entry': {
      const next = [action.entry, ...state.log];
      if (next.length > MAX_LOG_ENTRIES) next.length = MAX_LOG_ENTRIES;
      return { ...state, log: next };
    }
    case 'clear-log':
      return { ...state, log: [] };
    default:
      return state;
  }
};

type DebugContextValue = {
  state: DebugState;
  setMode: (mode: TransportMode) => void;
  setLatency: (latencyMs: number) => void;
  setFailRate: (failRate: number) => void;
  appendLog: (entry: CommandLogEntry) => void;
  clearLog: () => void;
};

const DebugContext = createContext<DebugContextValue | null>(null);

const persist = (settings: DebugSettings) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
};

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (!raw) {
          dispatch({ type: 'hydrate', settings: DEFAULT_SETTINGS });
          return;
        }
        try {
          const parsed = JSON.parse(raw) as Partial<DebugSettings>;
          dispatch({
            type: 'hydrate',
            settings: {
              mode: parsed.mode === 'live' ? 'live' : 'mock',
              latencyMs:
                typeof parsed.latencyMs === 'number'
                  ? Math.max(0, Math.round(parsed.latencyMs))
                  : DEFAULT_SETTINGS.latencyMs,
              failRate:
                typeof parsed.failRate === 'number'
                  ? Math.min(1, Math.max(0, parsed.failRate))
                  : DEFAULT_SETTINGS.failRate,
            },
          });
        } catch {
          dispatch({ type: 'hydrate', settings: DEFAULT_SETTINGS });
        }
      })
      .catch(() => dispatch({ type: 'hydrate', settings: DEFAULT_SETTINGS }));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    persist({ mode: state.mode, latencyMs: state.latencyMs, failRate: state.failRate });
  }, [state.hydrated, state.mode, state.latencyMs, state.failRate]);

  const value = useMemo<DebugContextValue>(
    () => ({
      state,
      setMode: (mode) => dispatch({ type: 'set-mode', mode }),
      setLatency: (latencyMs) => dispatch({ type: 'set-latency', latencyMs }),
      setFailRate: (failRate) => dispatch({ type: 'set-fail-rate', failRate }),
      appendLog: (entry) => dispatch({ type: 'log-entry', entry }),
      clearLog: () => dispatch({ type: 'clear-log' }),
    }),
    [state]
  );

  return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
}

export function useDebugStore(): DebugContextValue {
  const ctx = useContext(DebugContext);
  if (!ctx) {
    throw new Error('useDebugStore must be used within DebugProvider');
  }
  return ctx;
}

export const __TEST_ONLY = { reducer, initialState, DEFAULT_SETTINGS, MAX_LOG_ENTRIES };
