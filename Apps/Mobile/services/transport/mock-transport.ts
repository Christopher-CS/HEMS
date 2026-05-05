import type {
  CommandLogEntry,
  CommandResult,
  ConsoleCommandEnvelope,
  ConsoleTransport,
} from './types';

export type MockTransportSettings = {
  latencyMs: number;
  failRate: number;
};

export type MockTransportListener = (entry: CommandLogEntry) => void;

export type MockTransportOptions = {
  getSettings?: () => MockTransportSettings;
  onCommand?: MockTransportListener;
  rng?: () => number;
  generateId?: () => string;
  delay?: (ms: number) => Promise<void>;
};

const defaultDelay = (ms: number) =>
  new Promise<void>((resolve) => {
    if (ms <= 0) {
      resolve();
      return;
    }
    setTimeout(resolve, ms);
  });

const defaultId = () => `cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function createMockTransport(options: MockTransportOptions = {}): ConsoleTransport {
  const {
    getSettings = () => ({ latencyMs: 0, failRate: 0 }),
    onCommand,
    rng = Math.random,
    generateId = defaultId,
    delay = defaultDelay,
  } = options;

  return {
    async send(envelope: ConsoleCommandEnvelope): Promise<CommandResult> {
      const settings = getSettings();
      const latencyMs = Math.max(0, settings.latencyMs);
      const failRate = Math.min(1, Math.max(0, settings.failRate));
      const id = generateId();

      await delay(latencyMs);

      const failed = failRate > 0 && rng() < failRate;
      const result: CommandResult = failed
        ? { ok: false, id, error: 'Mock transport injected failure', latencyMs }
        : { ok: true, id, latencyMs };

      onCommand?.({
        id,
        timestamp: Date.now(),
        envelope,
        result,
      });

      return result;
    },
  };
}
