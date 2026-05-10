import { createHttpDevicesRepository } from './http-devices-repository';

const buildResponse = (body: unknown, init: { ok?: boolean; status?: number } = {}) => {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response;
};

describe('createHttpDevicesRepository', () => {
  it('accepts plain arrays and clamps levels to 0-100', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse([
        { _id: 'living-room-tv', powerState: 'on', level: { current: 250 } },
        { id: 'ambiance', powerState: 'off', level: { current: -5 } },
      ])
    ) as unknown as typeof fetch;

    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchDevices();
    expect(result.projections).toHaveLength(2);
    expect(result.projections[0].id).toBe('living-room-tv');
    expect(result.projections[0].level).toBe(100);
    expect(result.projections[1].level).toBe(0);
    expect(result.playback).toBeNull();
  });

  it('accepts envelope-shaped responses with a devices array', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse({
        devices: [{
          id: 'sound-system',
          powerState: 'on',
          consoleState: {
            currentApp: 'Netflix',
            availableApps: [{ id: 'Netflix', label: 'Netflix' }],
          },
        }],
      })
    ) as unknown as typeof fetch;
    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchDevices();
    expect(result).toEqual({
      projections: [{
        id: 'sound-system',
        enabled: true,
        kind: 'generic',
        currentApp: 'Netflix',
        availableApps: ['Netflix'],
      }],
      playback: null,
    });
  });

  it('drops devices that have no usable id', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse([{ powerState: 'on' }, { id: 'living-room-tv' }])
    ) as unknown as typeof fetch;
    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchDevices();
    expect(result.projections.map((d) => d.id)).toEqual(['living-room-tv']);
  });

  it('extracts playback metadata from the living-room TV device', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse({
        devices: [{
          slug: 'living-room-tv',
          type: 'tv',
          powerState: 'on',
          playbackState: {
            status: 'playing',
            isMuted: true,
            position: 27,
            nowPlaying: {
              mediaId: 'track-006',
              title: 'Get Your Wish',
              artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
              audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
            },
          },
        }],
      })
    ) as unknown as typeof fetch;

    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchDevices();

    expect(result.playback).toEqual({
      deviceId: 'living-room-tv',
      status: 'playing',
      positionSeconds: 27,
      isMuted: true,
      mediaId: 'track-006',
      title: 'Get Your Wish',
      artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
      audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
    });
  });

  it('throws on a non-200 response', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse(null, { ok: false, status: 500 })
    ) as unknown as typeof fetch;
    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    await expect(repo.fetchDevices()).rejects.toThrow(/500/);
  });
});
