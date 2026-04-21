import type { LibraryActionType, MediaItem, RecentMediaRef } from '../types/media';

export type LibraryCommandPayload = {
  type: 'ConsoleCommand';
  deviceId: 'living-room-tv';
  command: string;
  mediaId: string;
  category: MediaItem['category'];
  metadata?: {
    title: string;
    subtitle?: string;
    durationSeconds?: number;
  };
};

// Keeps selection semantics aligned with the Command Pattern enforced by the
// backend and Unity simulation. The UI never mutates device state; it only
// produces a payload that the backend can map to a concrete ICommand.
export function buildLibraryCommand(
  action: LibraryActionType,
  item: MediaItem | RecentMediaRef,
  durationSeconds?: number
): LibraryCommandPayload {
  return {
    type: 'ConsoleCommand',
    deviceId: 'living-room-tv',
    command: `LIBRARY_${action}`,
    mediaId: item.id,
    category: item.category,
    metadata: {
      title: item.title,
      subtitle: item.subtitle,
      durationSeconds,
    },
  };
}

export function emitLibraryCommand(
  action: LibraryActionType,
  item: MediaItem | RecentMediaRef,
  durationSeconds?: number
): LibraryCommandPayload {
  const payload = buildLibraryCommand(action, item, durationSeconds);

  // Socket transport is intentionally not wired here yet. When the socket
  // client is introduced, swap this log for a single emit call.
  console.log('library-command', JSON.stringify(payload));

  return payload;
}
