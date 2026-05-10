import React, { useEffect, useRef } from 'react';
import { DebugProvider, useDebugStore } from './debug/store';
import { DevicesProvider } from './devices/store';
import { useDevicesStore } from './devices/store';
import { LibraryProvider, useLibraryStore } from './library/store';
import { PlaybackProvider, usePlaybackStore } from './playback/store';
import { RepositoriesProvider, useRepositories } from './repositories/RepositoriesProvider';
import { RemoteDataProvider } from './remote-data/RemoteDataProvider';
import { createMockTransport, setTransport } from '../services/transport';
import { createSocketTransport } from '../services/transport/socket-transport';
import { createHttpTransport } from '../services/transport/http-transport';
import LibraryAudioPlayer from '../components/LibraryAudioPlayer';
import PlaybackQueueController from '../components/PlaybackQueueController';
import type {
  CommandLogEntry,
  ConsoleCommandEnvelope,
  ConsoleTransport,
} from '../services/transport/types';


type StateRefs = {
  appendLog: (entry: CommandLogEntry) => void;
  notePlayed: ReturnType<typeof useLibraryStore>['notePlayed'];
  setNowPlaying: ReturnType<typeof usePlaybackStore>['setNowPlaying'];
  clearNowPlaying: ReturnType<typeof usePlaybackStore>['clearNowPlaying'];
  enqueue: ReturnType<typeof usePlaybackStore>['enqueue'];
  setPlaying: ReturnType<typeof usePlaybackStore>['setPlaying'];
  setPosition: ReturnType<typeof usePlaybackStore>['setPosition'];
  setInputSource: ReturnType<typeof useDevicesStore>['setInputSource'];
  setCurrentApp: ReturnType<typeof useDevicesStore>['setCurrentApp'];
  getLatency: () => number;
  getFailRate: () => number;
};

const applyEnvelopeSideEffects = (envelope: ConsoleCommandEnvelope, refs: StateRefs) => {
  switch (envelope.command) {
    case 'PLAY':
      refs.setPlaying(true);
      break;
    case 'PAUSE':
      refs.setPlaying(false);
      break;
    case 'STOP':
      refs.clearNowPlaying();
      break;
    case 'SEEK_TO':
      if (typeof envelope.value === 'number') refs.setPosition(envelope.value);
      break;
    case 'SET_INPUT_SOURCE':
      if (envelope.metadata?.subtitle) refs.setInputSource(envelope.deviceId, envelope.metadata.subtitle);
      break;
    case 'LAUNCH_APP':
      if (envelope.metadata?.title) refs.setCurrentApp(envelope.deviceId, envelope.metadata.title);
      break;
    case 'GO_HOME':
      refs.setCurrentApp(envelope.deviceId, '');
      break;
    case 'LIBRARY_PLAY':
    case 'LIBRARY_QUEUE':
    case 'LIBRARY_PREVIEW': {
      if (!envelope.mediaId || !envelope.category || !envelope.metadata) return;
      const mediaSummary = {
        mediaId: envelope.mediaId,
        category: envelope.category,
        title: envelope.metadata.title,
        subtitle: envelope.metadata.subtitle,
        durationSeconds: envelope.metadata.durationSeconds ?? 0,
        artworkUrl: envelope.metadata?.artworkUrl,
        audioUrl: envelope.metadata?.audioUrl,
      };
      if (envelope.command === 'LIBRARY_QUEUE') {
        refs.enqueue(mediaSummary);
        refs.notePlayed({
          id: mediaSummary.mediaId,
          category: mediaSummary.category,
          title: mediaSummary.title,
          subtitle: mediaSummary.subtitle ?? '',
          durationSeconds: mediaSummary.durationSeconds,
          artworkUrl: mediaSummary.artworkUrl,
          audioUrl: mediaSummary.audioUrl,
        });
      } else if (envelope.command === 'LIBRARY_PLAY') {
        refs.setNowPlaying({
          ...mediaSummary,
          positionSeconds: 0,
          isPlaying: true,
        });
        refs.notePlayed({
          id: mediaSummary.mediaId,
          category: mediaSummary.category,
          title: mediaSummary.title,
          subtitle: mediaSummary.subtitle ?? '',
          durationSeconds: mediaSummary.durationSeconds,
          artworkUrl: mediaSummary.artworkUrl,
          audioUrl: mediaSummary.audioUrl,
        });
      } else if (envelope.command === 'LIBRARY_PREVIEW') {
        refs.notePlayed({
          id: mediaSummary.mediaId,
          category: mediaSummary.category,
          title: mediaSummary.title,
          subtitle: mediaSummary.subtitle ?? '',
          durationSeconds: mediaSummary.durationSeconds,
          artworkUrl: mediaSummary.artworkUrl,
          audioUrl: mediaSummary.audioUrl,
        });
      }
      break;
    }
    default:
      break;
  }
};

function TransportBridge({ children }: { children: React.ReactNode }) {
  const debug = useDebugStore();
  const devices = useDevicesStore();
  const library = useLibraryStore();
  const playback = usePlaybackStore();
  const { config } = useRepositories();

  const refs = useRef<StateRefs>({
    appendLog: debug.appendLog,
    notePlayed: library.notePlayed,
    setNowPlaying: playback.setNowPlaying,
    clearNowPlaying: playback.clearNowPlaying,
    enqueue: playback.enqueue,
    setPlaying: playback.setPlaying,
    setPosition: playback.setPosition,
    setInputSource: devices.setInputSource,
    setCurrentApp: devices.setCurrentApp,
    getLatency: () => debug.state.latencyMs,
    getFailRate: () => debug.state.failRate,
  });

  refs.current = {
    appendLog: debug.appendLog,
    notePlayed: library.notePlayed,
    setNowPlaying: playback.setNowPlaying,
    clearNowPlaying: playback.clearNowPlaying,
    enqueue: playback.enqueue,
    setPlaying: playback.setPlaying,
    setPosition: playback.setPosition,
    setInputSource: devices.setInputSource,
    setCurrentApp: devices.setCurrentApp,
    getLatency: () => debug.state.latencyMs,
    getFailRate: () => debug.state.failRate,
  };

  // Live (Settings) + build-time transportMode choose the real backend path.
  // Mock keeps everything local (latency/fail sliders apply). Build-time `mock`
  // forces local-only regardless of the Live toggle.
  const buildAllowsBackend =
    config.transportMode === 'socket' || config.transportMode === 'http';
  const useLiveBackend = debug.state.mode === 'live' && buildAllowsBackend;
  const useSocket = useLiveBackend && config.transportMode === 'socket';
  const useHttp = useLiveBackend && config.transportMode === 'http';

  useEffect(() => {
    let socketCleanup: (() => void) | null = null;

    const onCommand = (entry: CommandLogEntry) => {
      if (entry.result.ok) applyEnvelopeSideEffects(entry.envelope, refs.current);
      refs.current.appendLog(entry);
    };

    if (useSocket) {
      const transport = createSocketTransport({
        url: config.backendUrl,
        onCommand,
      });
      setTransport(transport);
      socketCleanup = () => transport.disconnect();
    } else if (useHttp) {
      setTransport(createHttpTransport({ baseUrl: config.backendUrl, onCommand }));
    } else {
      const transport: ConsoleTransport = createMockTransport({
        getSettings: () => ({
          latencyMs: refs.current.getLatency(),
          failRate: refs.current.getFailRate(),
        }),
        onCommand,
      });
      setTransport(transport);
    }

    return () => {
      socketCleanup?.();
    };
  }, [useSocket, useHttp, config.backendUrl, debug.state.mode]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RepositoriesProvider>
      <DebugProvider>
        <DevicesProvider>
          <PlaybackProvider>
            <LibraryAudioPlayer />
            <LibraryProvider>
              <RemoteDataProvider>
                <TransportBridge>
                  <PlaybackQueueController />
                  {children}
                </TransportBridge>
              </RemoteDataProvider>
            </LibraryProvider>
          </PlaybackProvider>
        </DevicesProvider>
      </DebugProvider>
    </RepositoriesProvider>
  );
}
