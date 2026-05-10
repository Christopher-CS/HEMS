import { buildLibraryCommand } from './library-command-adapter';
import type { MusicTrack, PodcastEpisode, RecentMediaRef } from '../types/media';

const TRACK: MusicTrack = {
  id: 'track-001',
  category: 'music',
  title: 'Midnight Drive',
  subtitle: 'Nova Sound',
  artist: 'Nova Sound',
  album: 'Neon Horizon',
  durationSeconds: 214,
};

const PODCAST: PodcastEpisode = {
  id: 'pod-003',
  category: 'podcasts',
  title: "Alzheimer's and the Brain",
  subtitle: 'VSauce',
  showName: 'VSauce',
  durationSeconds: 901,
  audioUrl: "/podcast/VSauce - Alzheimer's and the Brain.mp3",
};

const RECENT: RecentMediaRef = {
  id: 'pod-003',
  category: 'podcasts',
  title: "Alzheimer's and the Brain",
  subtitle: 'VSauce',
  durationSeconds: 901,
  audioUrl: "/podcast/VSauce - Alzheimer's and the Brain.mp3",
  progress: 0.22,
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

  it('includes audioUrl for podcast playback too', () => {
    const envelope = buildLibraryCommand('PLAY', PODCAST, 'living-room-tv', PODCAST.durationSeconds);
    expect(envelope.metadata?.audioUrl).toBe("/podcast/VSauce - Alzheimer's and the Brain.mp3");
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
    expect(envelope.category).toBe('podcasts');
    expect(envelope.mediaId).toBe('pod-003');
    expect(envelope.metadata?.subtitle).toBe('VSauce');
    expect(envelope.metadata?.audioUrl).toBe("/podcast/VSauce - Alzheimer's and the Brain.mp3");
  });
});
