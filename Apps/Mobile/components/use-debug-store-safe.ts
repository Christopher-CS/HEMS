import { useDebugStore } from '../state/debug/store';

// TopBar can render in screens that aren't wrapped by AppProviders during
// snapshot or screenshot tests. This guard returns null instead of throwing so
// the visual component stays usable in isolation.
export function useDebugStoreSafe(): ReturnType<typeof useDebugStore> | null {
  try {
    return useDebugStore();
  } catch {
    return null;
  }
}
