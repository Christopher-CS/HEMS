import { useLibraryStore } from '../state/library/store';
import { useRemoteData } from '../state/remote-data/RemoteDataProvider';

export function useLibrary() {
  const { state, notePlayed, setProgress, hydrate, reset } = useLibraryStore();
  const { state: remote, refreshLibrary } = useRemoteData();
  return {
    music: state.music,
    movies: state.movies,
    podcasts: state.podcasts,
    recents: state.recents,
    notePlayed,
    setProgress,
    hydrate,
    reset,
    loading: remote.library.status === 'loading',
    error: remote.library.error,
    refresh: refreshLibrary,
  };
}
