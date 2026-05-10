import type { LibraryState } from '../state/library/store';
import type { NowPlaying } from '../state/playback/store';
import { resolveRemoteNowPlaying } from './resolve-remote-playback';
import type { PlaybackProjection } from '../services/repositories/devices-repository';

const library: LibraryState = {
  music: [{
    id: 'track-006',
    category: 'music',
    title: 'Get Your Wish',
    subtitle: 'Porter Robinson',
    artist: 'Porter Robinson',
    album: 'Nurture',
    durationSeconds: 219,
    artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
    audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
  }],
  movies: [],
  podcasts: [],
  recents: [],
};

const projection = (overrides: Partial<PlaybackProjection> = {}): PlaybackProjection => ({
  deviceId: 'living-room-tv',
  status: 'playing',
  positionSeconds: 12,
  isMuted: false,
  mediaId: 'track-006',
  title: 'Get Your Wish',
  artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
  audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
  ...overrides,
});

describe('resolveRemoteNowPlaying', () => {
  it('resolves backend playback into a full now playing item', () => {
    const next = resolveRemoteNowPlaying(projection(), library, null);

    expect(next).toEqual({
      mediaId: 'track-006',
      category: 'music',
      title: 'Get Your Wish',
      subtitle: 'Porter Robinson',
      durationSeconds: 219,
      positionSeconds: 12,
      isPlaying: true,
      artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
      audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
    });
  });

  it('keeps the more advanced local position for the same actively playing media', () => {
    const current: NowPlaying = {
      mediaId: 'track-006',
      category: 'music',
      title: 'Get Your Wish',
      subtitle: 'Porter Robinson',
      durationSeconds: 219,
      positionSeconds: 48,
      isPlaying: true,
      artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
      audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
    };

    const next = resolveRemoteNowPlaying(
      projection({ positionSeconds: 15, status: 'playing' }),
      library,
      current
    );

    expect(next?.positionSeconds).toBe(48);
  });

  it('clears now playing for stopped backend playback', () => {
    const next = resolveRemoteNowPlaying(
      projection({ status: 'stopped', positionSeconds: 0 }),
      library,
      null
    );

    expect(next).toBeNull();
  });

  it('preserves current playback when no backend projection is available yet', () => {
    const current: NowPlaying = {
      mediaId: 'track-007',
      category: 'music',
      title: 'Get Your Wish',
      subtitle: 'Porter Robinson',
      durationSeconds: 218,
      positionSeconds: 3,
      isPlaying: true,
      artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
      audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
    };

    const next = resolveRemoteNowPlaying(null, library, current);
    expect(next).toEqual(current);
  });
});
