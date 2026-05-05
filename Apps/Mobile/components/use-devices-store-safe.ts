import { useDevicesStore } from '../state/devices/store';

export function useDevicesStoreSafe(): ReturnType<typeof useDevicesStore> | null {
  try {
    return useDevicesStore();
  } catch {
    return null;
  }
}
