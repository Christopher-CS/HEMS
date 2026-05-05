import { loadRuntimeConfig } from '../config/runtime';
import { createHttpDevicesRepository } from './http-devices-repository';
import { createHttpLibraryRepository } from './http-library-repository';
import { createMockDevicesRepository } from './mock-devices-repository';
import { createMockLibraryRepository } from './mock-library-repository';
import type { DevicesRepository } from './devices-repository';
import type { LibraryRepository } from './library-repository';

export type Repositories = {
  library: LibraryRepository;
  devices: DevicesRepository;
};

export function createRepositories(config = loadRuntimeConfig()): Repositories {
  const library =
    config.librarySource === 'http'
      ? createHttpLibraryRepository({ baseUrl: config.backendUrl })
      : createMockLibraryRepository();

  const devices =
    config.devicesSource === 'http'
      ? createHttpDevicesRepository({ baseUrl: config.backendUrl })
      : createMockDevicesRepository();

  return { library, devices };
}

export * from './library-repository';
export * from './devices-repository';
