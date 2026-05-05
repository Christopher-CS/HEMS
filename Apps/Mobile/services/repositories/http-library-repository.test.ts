import { createHttpLibraryRepository } from './http-library-repository';

const buildResponse = (body: unknown, init: { ok?: boolean; status?: number } = {}) => {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response;
};

describe('createHttpLibraryRepository', () => {
  it('maps a populated payload into the LibraryPayload shape', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse({
        music: [
          {
            id: 'track-001',
            title: 'Test Track',
            artist: 'Test Artist',
            album: 'Test Album',
            durationSeconds: 200,
          },
        ],
        movies: [],
        podcasts: [],
        recents: [],
      })
    ) as unknown as typeof fetch;

    const repo = createHttpLibraryRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchLibrary();
    expect(result.music).toHaveLength(1);
    expect(result.music[0]).toMatchObject({ category: 'music', subtitle: 'Test Artist' });
    expect(result.movies).toEqual([]);
    expect(result.podcasts).toEqual([]);
  });

  it('returns empty arrays when the backend returns null fields', async () => {
    const fetchImpl = jest.fn(async () => buildResponse({})) as unknown as typeof fetch;
    const repo = createHttpLibraryRepository({ baseUrl: 'http://api.test', fetchImpl });
    const result = await repo.fetchLibrary();
    expect(result.music).toEqual([]);
    expect(result.recents).toEqual([]);
  });

  it('throws on a non-200 response so callers can surface a retryable error', async () => {
    const fetchImpl = jest.fn(async () =>
      buildResponse({}, { ok: false, status: 503 })
    ) as unknown as typeof fetch;
    const repo = createHttpLibraryRepository({ baseUrl: 'http://api.test', fetchImpl });
    await expect(repo.fetchLibrary()).rejects.toThrow(/503/);
  });
});
