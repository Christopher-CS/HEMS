import React, { useEffect, useRef } from 'react';
import { DebugProvider, useDebugStore } from './debug/store';
import { DevicesProvider } from './devices/store';
import { LibraryProvider, useLibraryStore } from './library/store';
import { PlaybackProvider, usePlaybackStore } from './playback/store';
import { RepositoriesProvider, useRepositories } from './repositories/RepositoriesProvider';
import { RemoteDataProvider } from './remote-data/RemoteDataProvider';
import { createMockTransport, setTransport } from '../services/transport';
import { createSocketTransport } from '../services/transport/socket-transport';
import type {
  CommandLogEntry,
  ConsoleCommandEnvelope,
  ConsoleTransport,
} from '../services/transport/types';

type StateRefs = {
  appendLog: (entry: CommandLogEntry) => void;
  notePlayed: ReturnType<typeof useLibraryStore>['notePlayed'];
  setNowPlaying: ReturnType<typeof usePlaybackStore>['setNowPlaying'];
  enqueue: ReturnType<typeof usePlaybackStore>['enqueue'];
  setPlaying: ReturnType<typeof usePlaybackStore>['setPlaying'];
  setPosition: ReturnType<typeof usePlaybackStore>['setPosition'];
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
    case 'SEEK_TO':
      if (typeof envelope.value === 'number') refs.setPosition(envelope.value);
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
      };
      if (envelope.command === 'LIBRARY_QUEUE') {
        refs.enqueue(mediaSummary);
        refs.notePlayed({
          id: mediaSummary.mediaId,
          category: mediaSummary.category,
          title: mediaSummary.title,
          subtitle: mediaSummary.subtitle ?? '',
          durationSeconds: mediaSummary.durationSeconds,
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
        });
      } else if (envelope.command === 'LIBRARY_PREVIEW') {
        refs.notePlayed({
          id: mediaSummary.mediaId,
          category: mediaSummary.category,
          title: mediaSummary.title,
          subtitle: mediaSummary.subtitle ?? '',
          durationSeconds: mediaSummary.durationSeconds,
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
  const library = useLibraryStore();
  const playback = usePlaybackStore();
  const { config } = useRepositories();

  const refs = useRef<StateRefs>({
    appendLog: debug.appendLog,
    notePlayed: library.notePlayed,
    setNowPlaying: playback.setNowPlaying,
    enqueue: playback.enqueue,
    setPlaying: playback.setPlaying,
    setPosition: playback.setPosition,
    getLatency: () => debug.state.latencyMs,
    getFailRate: () => debug.state.failRate,
  });

  refs.current = {
    appendLog: debug.appendLog,
    notePlayed: library.notePlayed,
    setNowPlaying: playback.setNowPlaying,
    enqueue: playback.enqueue,
    setPlaying: playback.setPlaying,
    setPosition: playback.setPosition,
    getLatency: () => debug.state.latencyMs,
    getFailRate: () => debug.state.failRate,
  };

  // Only switch to socket when both build-time config picks `socket` *and* the
  // user hasn't forced mock mode in Settings. This makes Live mode safe to ship
  // dark and lets the debug screen flip back to Mock without restarting.
  const useSocket = debug.state.mode === 'live' && config.transportMode === 'socket';

  useEffect(() => {
    let socketCleanup: (() => void) | null = null;

    if (useSocket) {
      const transport = createSocketTransport({
        url: config.backendUrl,
        onCommand: (entry) => {
          if (entry.result.ok) applyEnvelopeSideEffects(entry.envelope, refs.current);
          refs.current.appendLog(entry);
        },
      });
      setTransport(transport);
      socketCleanup = () => transport.disconnect();
    } else {
      const transport: ConsoleTransport = createMockTransport({
        getSettings: () => ({
          latencyMs: refs.current.getLatency(),
          failRate: refs.current.getFailRate(),
        }),
        onCommand: (entry) => {
          if (entry.result.ok) applyEnvelopeSideEffects(entry.envelope, refs.current);
          refs.current.appendLog(entry);
        },
      });
      setTransport(transport);
    }

    return () => {
      socketCleanup?.();
    };
  }, [useSocket, config.backendUrl]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RepositoriesProvider>
      <DebugProvider>
        <DevicesProvider>
          <PlaybackProvider>
            <LibraryProvider>
              <RemoteDataProvider>
                <TransportBridge>{children}</TransportBridge>
              </RemoteDataProvider>
            </LibraryProvider>
          </PlaybackProvider>
        </DevicesProvider>
      </DebugProvider>
    </RepositoriesProvider>
  );
}
