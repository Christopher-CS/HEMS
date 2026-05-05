import { createMockTransport } from './mock-transport';
import type { ConsoleTransport } from './types';

let activeTransport: ConsoleTransport = createMockTransport();

export function getTransport(): ConsoleTransport {
  return activeTransport;
}

export function setTransport(next: ConsoleTransport): void {
  activeTransport = next;
}

export * from './types';
export { createMockTransport };
