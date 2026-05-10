import type { DevicesRepository, DevicesResult } from './devices-repository';
import { mapDevice, mapPlayback, type RawDevice } from './mappers';

export type HttpDevicesRepositoryOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export function createHttpDevicesRepository({
  baseUrl,
  fetchImpl = fetch,
}: HttpDevicesRepositoryOptions): DevicesRepository {
  return {
    async fetchDevices(): Promise<DevicesResult> {
      const response = await fetchImpl(`${baseUrl}/api/devices`, {
        headers: { 'X-HEMS-Client': 'mobile-app' },
      });
      if (!response.ok) {
        throw new Error(`Devices request failed: ${response.status}`);
      }
      const raw = (await response.json()) as { devices?: RawDevice[] } | RawDevice[];
      const list: RawDevice[] = Array.isArray(raw) ? raw : raw.devices ?? [];
      const playbackDevice =
        list.find((device) => device.slug === 'living-room-tv') ??
        list.find((device) => device.type === 'tv');

      return {
        projections: list.map(mapDevice).filter((d) => d.id.length > 0),
        playback: playbackDevice ? mapPlayback(playbackDevice) : null,
      };
    },
  };
}
