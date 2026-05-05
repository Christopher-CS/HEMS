import Constants from 'expo-constants';

export type TransportMode = 'mock' | 'socket';
export type DataSource = 'mock' | 'http';

export type RuntimeConfig = {
  backendUrl: string;
  transportMode: TransportMode;
  librarySource: DataSource;
  devicesSource: DataSource;
};

const FALLBACK: RuntimeConfig = {
  backendUrl: 'http://10.0.0.1:4000',
  transportMode: 'mock',
  librarySource: 'mock',
  devicesSource: 'mock',
};

const asTransportMode = (value: unknown): TransportMode | null => {
  if (value === 'socket' || value === 'mock') return value;
  return null;
};

const asDataSource = (value: unknown): DataSource | null => {
  if (value === 'http' || value === 'mock') return value;
  return null;
};

const readEnv = (key: string): string | undefined => {
  const env = process.env as Record<string, string | undefined>;
  return env[key];
};

export function loadRuntimeConfig(): RuntimeConfig {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;

  const backendUrl =
    readEnv('EXPO_PUBLIC_BACKEND_URL') ??
    (typeof extra.backendUrl === 'string' ? (extra.backendUrl as string) : undefined) ??
    FALLBACK.backendUrl;

  const transportMode =
    asTransportMode(readEnv('EXPO_PUBLIC_TRANSPORT_MODE')) ??
    asTransportMode(extra.transportMode) ??
    FALLBACK.transportMode;

  const librarySource =
    asDataSource(readEnv('EXPO_PUBLIC_LIBRARY_SOURCE')) ??
    asDataSource(extra.librarySource) ??
    FALLBACK.librarySource;

  const devicesSource =
    asDataSource(readEnv('EXPO_PUBLIC_DEVICES_SOURCE')) ??
    asDataSource(extra.devicesSource) ??
    FALLBACK.devicesSource;

  return { backendUrl, transportMode, librarySource, devicesSource };
}
