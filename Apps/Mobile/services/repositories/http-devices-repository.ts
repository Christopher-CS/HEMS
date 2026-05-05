import type { DeviceProjection, DevicesRepository } from './devices-repository';
import { mapDevice, type RawDevice } from './mappers';

export type HttpDevicesRepositoryOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export function createHttpDevicesRepository({
  baseUrl,
  fetchImpl = fetch,
}: HttpDevicesRepositoryOptions): DevicesRepository {
  return {
    async fetchDevices(): Promise<DeviceProjection[]> {
      const response = await fetchImpl(`${baseUrl}/api/devices`);
      if (!response.ok) {
        throw new Error(`Devices request failed: ${response.status}`);
      }
      const raw = (await response.json()) as { devices?: RawDevice[] } | RawDevice[];
      const list: RawDevice[] = Array.isArray(raw) ? raw : raw.devices ?? [];
      return list.map(mapDevice).filter((d) => d.id.length > 0);
    },
  };
}
