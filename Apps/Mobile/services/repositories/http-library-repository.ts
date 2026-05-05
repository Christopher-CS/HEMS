import type { LibraryPayload, LibraryRepository } from './library-repository';
import { mapLibraryPayload, type RawLibraryPayload } from './mappers';

export type HttpLibraryRepositoryOptions = {
  baseUrl: string;
  fetchImpl?: typeof fetch;
};

export function createHttpLibraryRepository({
  baseUrl,
  fetchImpl = fetch,
}: HttpLibraryRepositoryOptions): LibraryRepository {
  return {
    async fetchLibrary(): Promise<LibraryPayload> {
      const response = await fetchImpl(`${baseUrl}/api/library`);
      if (!response.ok) {
        throw new Error(`Library request failed: ${response.status}`);
      }
      const raw = (await response.json()) as RawLibraryPayload;
      return mapLibraryPayload(raw);
    },
  };
}
