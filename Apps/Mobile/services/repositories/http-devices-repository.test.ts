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
        { _id: 'living-room-tv', enabled: true, level: 250 },
        { id: 'ambiance', enabled: false, level: -5 },
      ])
    ) as unknown as typeof fetch;

    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchDevices();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('living-room-tv');
    expect(result[0].level).toBe(100);
    expect(result[1].level).toBe(0);
  });

  it('accepts envelope-shaped responses with a devices array', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse({ devices: [{ id: 'sound-system', enabled: true }] })
    ) as unknown as typeof fetch;
    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchDevices();
    expect(result).toEqual([{ id: 'sound-system', enabled: true, level: undefined, name: undefined, subtitle: undefined }]);
  });

  it('drops devices that have no usable id', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse([{ enabled: true }, { id: 'living-room-tv' }])
    ) as unknown as typeof fetch;
    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchDevices();
    expect(result.map((d) => d.id)).toEqual(['living-room-tv']);
  });

  it('throws on a non-200 response', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse(null, { ok: false, status: 500 })
    ) as unknown as typeof fetch;
    const repo = createHttpDevicesRepository({ baseUrl: 'http://api.test', fetchImpl });
    await expect(repo.fetchDevices()).rejects.toThrow(/500/);
  });
});
