import type { DeviceSnapshot } from '../../state/devices/store';

export type DeviceProjection = Omit<Partial<DeviceSnapshot>, 'id'> & { id: string };

export interface DevicesRepository {
  fetchDevices(): Promise<DeviceProjection[]>;
}
