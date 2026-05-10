import {
  buildQueuedPlayEnvelope,
  resolveLibraryItem,
  toQueuedMedia,
  toQueuedMediaFromNowPlaying,
} from './library-queue';
import type { MusicTrack, RecentMediaRef } from '../types/media';
import type { NowPlaying } from '../state/playback/store';

const TRACK: MusicTrack = {
  id: 'track-101',
  category: 'music',
  title: 'Queue Me',
  subtitle: 'Test Artist',
  artist: 'Test Artist',
  album: 'Test Album',
  durationSeconds: 215,
  artworkUrl: 'https://example.com/art.jpg',
  audioUrl: '/audio/queue-me.mp3',
};

const RECENT_WITHOUT_AUDIO: RecentMediaRef = {
  id: TRACK.id,
  category: 'music',
  title: TRACK.title,
  subtitle: TRACK.subtitle,
  durationSeconds: TRACK.durationSeconds,
  artworkUrl: TRACK.artworkUrl,
};

const NOW_PLAYING: NowPlaying = {
  mediaId: TRACK.id,
  category: TRACK.category,
  title: TRACK.title,
  subtitle: TRACK.subtitle,
  durationSeconds: TRACK.durationSeconds,
  positionSeconds: 42,
  isPlaying: true,
  artworkUrl: TRACK.artworkUrl,
  audioUrl: TRACK.audioUrl,
};

describe('library queue helpers', () => {
  it('resolves music recents against the full music catalog to restore audioUrl', () => {
    const resolved = resolveLibraryItem(RECENT_WITHOUT_AUDIO, [TRACK]);

    expect(resolved).toEqual(TRACK);
  });

  it('converts media into queued playback state', () => {
    expect(toQueuedMedia(TRACK, TRACK.durationSeconds)).toEqual({
      mediaId: TRACK.id,
      category: TRACK.category,
      title: TRACK.title,
      subtitle: TRACK.subtitle,
      durationSeconds: TRACK.durationSeconds,
      artworkUrl: TRACK.artworkUrl,
      audioUrl: TRACK.audioUrl,
    });
  });

  it('converts now playing state into a queued media entry', () => {
    expect(toQueuedMediaFromNowPlaying(NOW_PLAYING)).toEqual({
      mediaId: TRACK.id,
      category: TRACK.category,
      title: TRACK.title,
      subtitle: TRACK.subtitle,
      durationSeconds: TRACK.durationSeconds,
      artworkUrl: TRACK.artworkUrl,
      audioUrl: TRACK.audioUrl,
    });
  });

  it('builds a play envelope that preserves queued audio metadata', () => {
    expect(
      buildQueuedPlayEnvelope(toQueuedMedia(TRACK, TRACK.durationSeconds), 'living-room-tv')
    ).toEqual({
      type: 'ConsoleCommand',
      deviceId: 'living-room-tv',
      command: 'LIBRARY_PLAY',
      mediaId: TRACK.id,
      category: 'music',
      metadata: {
        title: TRACK.title,
        subtitle: TRACK.subtitle,
        durationSeconds: TRACK.durationSeconds,
        artworkUrl: TRACK.artworkUrl,
        audioUrl: TRACK.audioUrl,
      },
    });
  });
});
