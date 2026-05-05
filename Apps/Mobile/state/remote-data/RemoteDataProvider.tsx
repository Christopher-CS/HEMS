import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useRepositories } from '../repositories/RepositoriesProvider';
import { useDevicesStore } from '../devices/store';
import { useLibraryStore } from '../library/store';

type Status = 'idle' | 'loading' | 'ready' | 'error';

type DataState = {
  library: { status: Status; error: string | null };
  devices: { status: Status; error: string | null };
};

type DataAction =
  | { type: 'library:start' }
  | { type: 'library:success' }
  | { type: 'library:error'; error: string }
  | { type: 'devices:start' }
  | { type: 'devices:success' }
  | { type: 'devices:error'; error: string };

const INITIAL_STATE: DataState = {
  library: { status: 'idle', error: null },
  devices: { status: 'idle', error: null },
};

const reducer = (state: DataState, action: DataAction): DataState => {
  switch (action.type) {
    case 'library:start':
      return { ...state, library: { status: 'loading', error: null } };
    case 'library:success':
      return { ...state, library: { status: 'ready', error: null } };
    case 'library:error':
      return { ...state, library: { status: 'error', error: action.error } };
    case 'devices:start':
      return { ...state, devices: { status: 'loading', error: null } };
    case 'devices:success':
      return { ...state, devices: { status: 'ready', error: null } };
    case 'devices:error':
      return { ...state, devices: { status: 'error', error: action.error } };
    default:
      return state;
  }
};

type RemoteDataContextValue = {
  state: DataState;
  refreshLibrary: () => Promise<void>;
  refreshDevices: () => Promise<void>;
};

const RemoteDataContext = createContext<RemoteDataContextValue | null>(null);

export function RemoteDataProvider({ children }: { children: React.ReactNode }) {
  const { repositories, config } = useRepositories();
  const library = useLibraryStore();
  const devices = useDevicesStore();
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const refsRef = useRef({
    libraryHydrate: library.hydrate,
    devicesHydrate: devices.hydrate,
  });
  refsRef.current = {
    libraryHydrate: library.hydrate,
    devicesHydrate: devices.hydrate,
  };

  const refreshLibrary = useCallback(async () => {
    dispatch({ type: 'library:start' });
    try {
      const payload = await repositories.library.fetchLibrary();
      refsRef.current.libraryHydrate(payload);
      dispatch({ type: 'library:success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load library';
      dispatch({ type: 'library:error', error: message });
    }
  }, [repositories.library]);

  const refreshDevices = useCallback(async () => {
    dispatch({ type: 'devices:start' });
    try {
      const projections = await repositories.devices.fetchDevices();
      refsRef.current.devicesHydrate(projections);
      dispatch({ type: 'devices:success' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load devices';
      dispatch({ type: 'devices:error', error: message });
    }
  }, [repositories.devices]);

  useEffect(() => {
    if (config.librarySource === 'http') {
      refreshLibrary();
    } else {
      dispatch({ type: 'library:success' });
    }
  }, [config.librarySource, refreshLibrary]);

  useEffect(() => {
    if (config.devicesSource === 'http') {
      refreshDevices();
    } else {
      dispatch({ type: 'devices:success' });
    }
  }, [config.devicesSource, refreshDevices]);

  const value = useMemo<RemoteDataContextValue>(
    () => ({ state, refreshLibrary, refreshDevices }),
    [state, refreshLibrary, refreshDevices]
  );

  return <RemoteDataContext.Provider value={value}>{children}</RemoteDataContext.Provider>;
}

export function useRemoteData(): RemoteDataContextValue {
  const ctx = useContext(RemoteDataContext);
  if (!ctx) throw new Error('useRemoteData must be used within RemoteDataProvider');
  return ctx;
}
