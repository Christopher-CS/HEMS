import { INITIAL_DEVICES } from '../../state/devices/store';
import type { DeviceProjection, DevicesRepository } from './devices-repository';

export function createMockDevicesRepository(): DevicesRepository {
  return {
    async fetchDevices(): Promise<DeviceProjection[]> {
      return Object.values(INITIAL_DEVICES.devices);
    },
  };
}
