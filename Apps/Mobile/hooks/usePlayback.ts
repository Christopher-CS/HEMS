import { usePlaybackStore } from '../state/playback/store';

export function usePlayback() {
  const store = usePlaybackStore();
  return {
    nowPlaying: store.state.current,
    queue: store.state.queue,
    setNowPlaying: store.setNowPlaying,
    setPosition: store.setPosition,
    setPlaying: store.setPlaying,
    enqueue: store.enqueue,
    clearQueue: store.clearQueue,
    reset: store.reset,
  };
}
