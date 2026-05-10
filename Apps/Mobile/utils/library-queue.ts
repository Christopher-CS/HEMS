import type { ConsoleCommandEnvelope } from '../services/transport/types';
import type { NowPlaying, QueuedMedia } from '../state/playback/store';
import type { MediaItem, RecentMediaRef, MusicTrack } from '../types/media';

export function resolveLibraryItem(
  item: MediaItem | RecentMediaRef,
  music: MusicTrack[]
): MediaItem | RecentMediaRef {
  return item.category === 'music' && (!('audioUrl' in item) || !item.audioUrl)
    ? music.find((track) => track.id === item.id) ?? item
    : item;
}

export function toQueuedMedia(
  item: MediaItem | RecentMediaRef,
  durationSeconds?: number
): QueuedMedia {
  return {
    mediaId: item.id,
    category: item.category,
    title: item.title,
    subtitle: item.subtitle,
    durationSeconds: durationSeconds ?? item.durationSeconds,
    ...('artworkUrl' in item && item.artworkUrl ? { artworkUrl: item.artworkUrl } : {}),
    ...('audioUrl' in item && item.audioUrl ? { audioUrl: item.audioUrl } : {}),
  };
}

export function toQueuedMediaFromNowPlaying(item: NowPlaying): QueuedMedia {
  return {
    mediaId: item.mediaId,
    category: item.category,
    title: item.title,
    subtitle: item.subtitle,
    durationSeconds: item.durationSeconds,
    ...(item.artworkUrl ? { artworkUrl: item.artworkUrl } : {}),
    ...(item.audioUrl ? { audioUrl: item.audioUrl } : {}),
  };
}

export function buildQueuedPlayEnvelope(
  item: QueuedMedia,
  deviceId: string
): ConsoleCommandEnvelope {
  return {
    type: 'ConsoleCommand',
    deviceId,
    command: 'LIBRARY_PLAY',
    mediaId: item.mediaId,
    category: item.category,
    metadata: {
      title: item.title,
      subtitle: item.subtitle,
      durationSeconds: item.durationSeconds,
      ...(item.artworkUrl ? { artworkUrl: item.artworkUrl } : {}),
      ...(
        (item.category === 'music' || item.category === 'podcasts') && item.audioUrl
          ? { audioUrl: item.audioUrl }
          : {}
      ),
    },
  };
}
