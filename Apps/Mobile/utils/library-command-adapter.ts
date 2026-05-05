import type {
  ConsoleCommandEnvelope,
  LibraryCommandToken,
} from '../services/transport/types';
import type { LibraryActionType, MediaItem, RecentMediaRef } from '../types/media';

const TOKEN_BY_ACTION: Record<LibraryActionType, LibraryCommandToken> = {
  PLAY: 'LIBRARY_PLAY',
  QUEUE: 'LIBRARY_QUEUE',
  PREVIEW: 'LIBRARY_PREVIEW',
};

// Pure builder: turns a UI library action into the canonical command envelope
// the backend (or mock transport) will execute. UI screens should import this
// instead of crafting envelopes themselves so the wire shape stays single-sourced.
export function buildLibraryCommand(
  action: LibraryActionType,
  item: MediaItem | RecentMediaRef,
  deviceId: string,
  durationSeconds?: number
): ConsoleCommandEnvelope {
  return {
    type: 'ConsoleCommand',
    deviceId,
    command: TOKEN_BY_ACTION[action],
    mediaId: item.id,
    category: item.category,
    metadata: {
      title: item.title,
      subtitle: item.subtitle,
      durationSeconds,
    },
  };
}
