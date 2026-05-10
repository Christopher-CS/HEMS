import { INITIAL_DEVICES } from '../../state/devices/store';
import type { DevicesRepository, DevicesResult } from './devices-repository';

export function createMockDevicesRepository(): DevicesRepository {
  return {
    async fetchDevices(): Promise<DevicesResult> {
      return {
        projections: Object.values(INITIAL_DEVICES.devices),
        playback: null,
      };
    },
  };
}
