import type { DeviceSnapshot } from '../../state/devices/store';

export type DeviceProjection = Omit<Partial<DeviceSnapshot>, 'id'> & { id: string };
export type PlaybackProjection = {
  deviceId: string;
  status: 'playing' | 'paused' | 'stopped' | 'fast-forwarding' | 'rewinding';
  positionSeconds: number;
  isMuted: boolean;
  mediaId?: string;
  title?: string;
  artworkUrl?: string;
  audioUrl?: string;
};

export type DevicesResult = {
  projections: DeviceProjection[];
  playback: PlaybackProjection | null;
};

export interface DevicesRepository {
  fetchDevices(): Promise<DevicesResult>;
}
