import type { CommandLogEntry, CommandResult, ConsoleCommandEnvelope, ConsoleTransport } from './types';
import { mapEnvelopeToBackend } from './command-mapping';

const SUPPORTED_TYPES = new Set([
  'togglePower', 'power',
  'setLevel', 'incrementLevel', 'decrementLevel',
  'setMode', 'cycleMode',
  'move', 'launchApp',
  'playback', 'toggleMute',
  'navigate',
  'setColorMode', 'setColorTemperature', 'setHue', 'setSaturation',
]);

const generateId = () =>
  `cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export type HttpTransportOptions = {
  baseUrl: string;
  onCommand?: (entry: CommandLogEntry) => void;
};

export function createHttpTransport({ baseUrl, onCommand }: HttpTransportOptions): ConsoleTransport {
  return {
    async send(envelope: ConsoleCommandEnvelope): Promise<CommandResult> {
      const id = generateId();
      const startedAt = Date.now();
      const backend = mapEnvelopeToBackend(envelope);

      if (!SUPPORTED_TYPES.has(backend.type)) {
        const result: CommandResult = { ok: true, id, latencyMs: 0 };
        onCommand?.({ id, timestamp: Date.now(), envelope, result });
        return result;
      }

      try {
        const response = await fetch(`${baseUrl}/api/commands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            device: backend.deviceId,
            issuedBy: 'app',
            type: backend.type,
            payload: backend.payload ?? {},
          }),
        });

        const latencyMs = Date.now() - startedAt;
        const data = (await response.json()) as { success?: boolean; message?: string };

        const result: CommandResult =
          response.ok && data.success
            ? { ok: true, id, latencyMs }
            : { ok: false, id, error: data.message ?? 'Command failed', latencyMs };

        onCommand?.({ id, timestamp: Date.now(), envelope, result });
        return result;
      } catch (err) {
        const latencyMs = Date.now() - startedAt;
        const result: CommandResult = { ok: false, id, error: String(err), latencyMs };
        onCommand?.({ id, timestamp: Date.now(), envelope, result });
        return result;
      }
    },
  };
}
