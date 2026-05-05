import { __TEST_ONLY } from './store';
import type { MusicTrack } from '../../types/media';

const { reducer, INITIAL_LIBRARY, MAX_RECENTS } = __TEST_ONLY;

const SAMPLE: MusicTrack = {
  id: 'track-test',
  category: 'music',
  title: 'New Track',
  subtitle: 'Test Artist',
  artist: 'Test Artist',
  album: 'Test Album',
  durationSeconds: 180,
};

describe('library reducer', () => {
  it('promotes a new play to the front of recents and avoids duplicates', () => {
    const first = reducer(INITIAL_LIBRARY, { type: 'note-played', item: SAMPLE });
    expect(first.recents[0].id).toBe(SAMPLE.id);

    const second = reducer(first, { type: 'note-played', item: SAMPLE });
    const occurrences = second.recents.filter((r) => r.id === SAMPLE.id).length;
    expect(occurrences).toBe(1);
    expect(second.recents[0].id).toBe(SAMPLE.id);
  });

  it('clamps the recents list to MAX_RECENTS entries', () => {
    let state = INITIAL_LIBRARY;
    for (let index = 0; index < MAX_RECENTS + 5; index += 1) {
      state = reducer(state, {
        type: 'note-played',
        item: { ...SAMPLE, id: `track-fill-${index}` },
      });
    }
    expect(state.recents.length).toBeLessThanOrEqual(MAX_RECENTS);
  });

  it('updates progress for an existing recent without reordering', () => {
    const seeded = reducer(INITIAL_LIBRARY, { type: 'note-played', item: SAMPLE, progress: 0 });
    const updated = reducer(seeded, {
      type: 'set-progress',
      mediaId: SAMPLE.id,
      progress: 0.4,
    });
    const target = updated.recents.find((r) => r.id === SAMPLE.id);
    expect(target?.progress).toBeCloseTo(0.4);
    expect(updated.recents[0].id).toBe(SAMPLE.id);
  });
});
