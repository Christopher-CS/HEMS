import { useDebugStore } from '../state/debug/store';

export function useLatestCommand() {
  const { state } = useDebugStore();
  return state.log[0] ?? null;
}
