import type { LibraryState } from '../state/library/store';
import type { NowPlaying } from '../state/playback/store';
import type { MediaItem, RecentMediaRef } from '../types/media';
import type { PlaybackProjection } from '../services/repositories/devices-repository';

function findLibraryMatch(
  projection: PlaybackProjection,
  library: LibraryState
): MediaItem | RecentMediaRef | null {
  const collections = [library.music, library.movies, library.podcasts, library.recents];

  for (const collection of collections) {
    const byId = collection.find((item) => item.id === projection.mediaId);
    if (byId) return byId;
  }

  if (projection.audioUrl) {
    const byAudio = [...library.music, ...library.podcasts, ...library.recents].find(
      (item) => 'audioUrl' in item && item.audioUrl === projection.audioUrl
    );
    if (byAudio) return byAudio;
  }

  if (projection.title) {
    for (const collection of collections) {
      const byTitle = collection.find((item) => item.title === projection.title);
      if (byTitle) return byTitle;
    }
  }

  return null;
}

export function resolveRemoteNowPlaying(
  projection: PlaybackProjection | null,
  library: LibraryState,
  current: NowPlaying | null
): NowPlaying | null {
  if (!projection) {
    return current;
  }

  if (
    projection.status === 'stopped' ||
    (!projection.mediaId && !projection.title && !projection.audioUrl)
  ) {
    return null;
  }

  const matched = findLibraryMatch(projection, library);
  const mediaId = projection.mediaId ?? matched?.id ?? current?.mediaId ?? '';
  const sameMedia = current?.mediaId === mediaId && mediaId.length > 0;
  const category = matched?.category ?? current?.category ?? 'music';
  const durationSeconds = matched?.durationSeconds ?? current?.durationSeconds ?? 0;
  const subtitle = matched?.subtitle ?? current?.subtitle ?? '';
  const artworkUrl = projection.artworkUrl ?? matched?.artworkUrl ?? current?.artworkUrl;
  const audioUrl =
    projection.audioUrl ??
    ('audioUrl' in (matched ?? {}) ? matched.audioUrl : undefined) ??
    current?.audioUrl;

  const positionSeconds =
    sameMedia && projection.status === 'playing'
      ? Math.max(current?.positionSeconds ?? 0, projection.positionSeconds)
      : projection.positionSeconds;

  return {
    mediaId,
    category,
    title: projection.title ?? matched?.title ?? current?.title ?? 'Unknown media',
    subtitle,
    durationSeconds,
    positionSeconds,
    isPlaying: projection.status === 'playing',
    artworkUrl,
    audioUrl,
  };
}
