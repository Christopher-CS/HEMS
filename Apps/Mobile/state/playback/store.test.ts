import { __TEST_ONLY } from './store';
import type { QueuedMedia } from './store';

const { reducer, INITIAL_PLAYBACK } = __TEST_ONLY;

const FIRST: QueuedMedia = {
  mediaId: 'track-001',
  category: 'music',
  title: 'First',
  subtitle: 'Artist One',
  durationSeconds: 180,
  audioUrl: '/audio/first.mp3',
};

const SECOND: QueuedMedia = {
  mediaId: 'track-002',
  category: 'music',
  title: 'Second',
  subtitle: 'Artist Two',
  durationSeconds: 240,
  audioUrl: '/audio/second.mp3',
};

describe('playback reducer queue', () => {
  it('appends queued items in selection order', () => {
    const once = reducer(INITIAL_PLAYBACK, { type: 'enqueue', media: FIRST });
    const twice = reducer(once, { type: 'enqueue', media: SECOND });

    expect(twice.queue).toEqual([FIRST, SECOND]);
  });

  it('removes only the targeted queue item', () => {
    const seeded = reducer(
      reducer(INITIAL_PLAYBACK, { type: 'enqueue', media: FIRST }),
      { type: 'enqueue', media: SECOND }
    );

    const updated = reducer(seeded, { type: 'remove-from-queue', index: 0 });

    expect(updated.queue).toEqual([SECOND]);
  });

  it('clears the queue without affecting current playback', () => {
    const withCurrent = reducer(INITIAL_PLAYBACK, {
      type: 'set-now-playing',
      media: {
        ...FIRST,
        positionSeconds: 32,
        isPlaying: true,
      },
    });
    const seeded = reducer(withCurrent, { type: 'enqueue', media: SECOND });

    const cleared = reducer(seeded, { type: 'clear-queue' });

    expect(cleared.queue).toEqual([]);
    expect(cleared.current?.mediaId).toBe(FIRST.mediaId);
  });

  it('can clear the current now playing item without touching the queue', () => {
    const withCurrent = reducer(INITIAL_PLAYBACK, {
      type: 'set-now-playing',
      media: {
        ...FIRST,
        positionSeconds: 32,
        isPlaying: true,
      },
    });
    const seeded = reducer(withCurrent, { type: 'enqueue', media: SECOND });

    const cleared = reducer(seeded, { type: 'clear-now-playing' });

    expect(cleared.current).toBeNull();
    expect(cleared.queue).toEqual([SECOND]);
  });
});
