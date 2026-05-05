import { io, type Socket } from 'socket.io-client';
import type {
  CommandLogEntry,
  CommandResult,
  ConsoleCommandEnvelope,
  ConsoleTransport,
} from './types';
import { mapEnvelopeToBackend } from './command-mapping';

export type SocketAck = {
  ok: boolean;
  id?: string;
  error?: string;
};

export type SocketTransportOptions = {
  url: string;
  socket?: Socket;
  generateId?: () => string;
  ackTimeoutMs?: number;
  onCommand?: (entry: CommandLogEntry) => void;
};

const defaultId = () => `cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export function createSocketTransport(options: SocketTransportOptions): ConsoleTransport & {
  disconnect: () => void;
  socket: Socket;
} {
  const { url, generateId = defaultId, ackTimeoutMs = 5000, onCommand } = options;

  const socket =
    options.socket ??
    io(url, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

  return {
    socket,

    async send(envelope: ConsoleCommandEnvelope): Promise<CommandResult> {
      const id = generateId();
      const startedAt = Date.now();
      const wirePayload = {
        id,
        envelope,
        backend: mapEnvelopeToBackend(envelope),
      };

      const result = await new Promise<CommandResult>((resolve) => {
        const timer = setTimeout(() => {
          resolve({
            ok: false,
            id,
            error: 'Socket ack timed out',
            latencyMs: Date.now() - startedAt,
          });
        }, ackTimeoutMs);

        socket.emit('command:issue', wirePayload, (ack: SocketAck | undefined) => {
          clearTimeout(timer);
          const latencyMs = Date.now() - startedAt;
          if (ack && ack.ok) {
            resolve({ ok: true, id: ack.id ?? id, latencyMs });
          } else {
            resolve({
              ok: false,
              id,
              error: ack?.error ?? 'Backend rejected command',
              latencyMs,
            });
          }
        });
      });

      onCommand?.({
        id,
        timestamp: Date.now(),
        envelope,
        result,
      });

      return result;
    },

    disconnect() {
      socket.disconnect();
    },
  };
}
