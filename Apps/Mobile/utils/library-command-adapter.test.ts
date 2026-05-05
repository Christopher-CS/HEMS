import { buildLibraryCommand } from './library-command-adapter';
import type { MusicTrack, RecentMediaRef } from '../types/media';

const TRACK: MusicTrack = {
  id: 'track-001',
  category: 'music',
  title: 'Midnight Drive',
  subtitle: 'Nova Sound',
  artist: 'Nova Sound',
  album: 'Neon Horizon',
  durationSeconds: 214,
};

const RECENT: RecentMediaRef = {
  id: 'movie-002',
  category: 'movies',
  title: 'Orbital',
  subtitle: 'Paused at 47m',
  durationSeconds: 8040,
  progress: 0.35,
};

describe('buildLibraryCommand', () => {
  it('builds a PLAY envelope with the canonical command shape', () => {
    const envelope = buildLibraryCommand('PLAY', TRACK, 'living-room-tv', TRACK.durationSeconds);
    expect(envelope).toEqual({
      type: 'ConsoleCommand',
      deviceId: 'living-room-tv',
      command: 'LIBRARY_PLAY',
      mediaId: TRACK.id,
      category: 'music',
      metadata: {
        title: TRACK.title,
        subtitle: TRACK.subtitle,
        durationSeconds: TRACK.durationSeconds,
      },
    });
  });

  it('maps QUEUE and PREVIEW to their LIBRARY_* tokens', () => {
    expect(buildLibraryCommand('QUEUE', TRACK, 'sound-system').command).toBe('LIBRARY_QUEUE');
    expect(buildLibraryCommand('PREVIEW', TRACK, 'sound-system').command).toBe('LIBRARY_PREVIEW');
  });

  it('threads the deviceId argument through unchanged', () => {
    expect(buildLibraryCommand('PLAY', TRACK, 'sound-system').deviceId).toBe('sound-system');
    expect(buildLibraryCommand('PLAY', TRACK, 'ambiance').deviceId).toBe('ambiance');
  });

  it('accepts RecentMediaRef inputs without losing category metadata', () => {
    const envelope = buildLibraryCommand('PLAY', RECENT, 'living-room-tv', RECENT.durationSeconds);
    expect(envelope.category).toBe('movies');
    expect(envelope.mediaId).toBe('movie-002');
    expect(envelope.metadata?.subtitle).toBe('Paused at 47m');
  });
});
