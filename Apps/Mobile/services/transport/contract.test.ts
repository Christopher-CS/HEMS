import type { Socket } from 'socket.io-client';
import { createMockTransport } from './mock-transport';
import { createSocketTransport, type SocketAck } from './socket-transport';
import { mapEnvelopeToBackend } from './command-mapping';
import type { ConsoleCommandEnvelope, ConsoleTransport } from './types';

const ENVELOPE: ConsoleCommandEnvelope = {
  type: 'ConsoleCommand',
  deviceId: 'living-room-tv',
  command: 'VOLUME_UP',
};

const SEEK_ENVELOPE: ConsoleCommandEnvelope = {
  type: 'ConsoleCommand',
  deviceId: 'sound-system',
  command: 'SEEK_TO',
  value: 75,
};

type Listener = (ack?: SocketAck) => void;

type FakeSocket = {
  emit: jest.Mock;
  disconnect: jest.Mock;
};

const createFakeSocket = (handler: (payload: unknown) => SocketAck | null): Socket => {
  const fake: FakeSocket = {
    emit: jest.fn(),
    disconnect: jest.fn(),
  };
  fake.emit.mockImplementation((event: string, payload: unknown, ack: Listener) => {
    if (event !== 'command:issue') return fake;
    const result = handler(payload);
    if (result !== null) ack(result);
    return fake;
  });
  return fake as unknown as Socket;
};

describe('ConsoleTransport contract', () => {
  it.each<[string, () => Promise<ConsoleTransport>]>([
    [
      'mock',
      async () =>
        createMockTransport({
          getSettings: () => ({ latencyMs: 0, failRate: 0 }),
          delay: () => Promise.resolve(),
          generateId: () => 'cmd-mock',
        }),
    ],
    [
      'socket',
      async () => {
        const fake = createFakeSocket(() => ({ ok: true, id: 'cmd-socket' }));
        return createSocketTransport({
          url: 'http://test',
          socket: fake,
          generateId: () => 'cmd-socket',
        });
      },
    ],
  ])('%s transport returns a CommandResult with id and latencyMs', async (_, factory) => {
    const transport = await factory();
    const result = await transport.send(ENVELOPE);
    expect(result.ok).toBe(true);
    expect(typeof result.id).toBe('string');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('socket transport surfaces backend errors via the ack', async () => {
    const fake = createFakeSocket(() => ({ ok: false, error: 'unknown command' }));
    const transport = createSocketTransport({ url: 'http://test', socket: fake });
    const result = await transport.send(ENVELOPE);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('unknown command');
    }
  });

  it('socket transport times out when the backend never acknowledges', async () => {
    jest.useFakeTimers();
    const fake = createFakeSocket(() => null);
    const transport = createSocketTransport({
      url: 'http://test',
      socket: fake,
      ackTimeoutMs: 100,
    });
    const pending = transport.send(ENVELOPE);
    jest.advanceTimersByTime(101);
    const result = await pending;
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/timed out/i);
    }
    jest.useRealTimers();
  });
});

describe('mapEnvelopeToBackend', () => {
  it('uses togglePower when POWER_TOGGLE is issued without an explicit value', () => {
    expect(
      mapEnvelopeToBackend({
        type: 'ConsoleCommand',
        deviceId: 'living-room-tv',
        command: 'POWER_TOGGLE',
      })
    ).toEqual({
      deviceId: 'living-room-tv',
      type: 'togglePower',
      payload: undefined,
    });
  });

  it('preserves explicit power set commands when POWER_TOGGLE includes a value', () => {
    expect(
      mapEnvelopeToBackend({
        type: 'ConsoleCommand',
        deviceId: 'living-room-tv',
        command: 'POWER_TOGGLE',
        value: 1,
      })
    ).toEqual({
      deviceId: 'living-room-tv',
      type: 'power',
      payload: { powerState: 'on' },
    });
  });

  it('maps remote level commands to incrementLevel/decrementLevel', () => {
    expect(mapEnvelopeToBackend(ENVELOPE).type).toBe('incrementLevel');
    expect(
      mapEnvelopeToBackend({ ...ENVELOPE, command: 'VOLUME_DOWN' }).type
    ).toBe('decrementLevel');
  });

  it('maps channel commands separately from volume commands', () => {
    expect(
      mapEnvelopeToBackend({ ...ENVELOPE, command: 'CHANNEL_UP' })
    ).toEqual({
      deviceId: ENVELOPE.deviceId,
      type: 'incrementChannel',
      payload: undefined,
    });
    expect(
      mapEnvelopeToBackend({ ...ENVELOPE, command: 'CHANNEL_DOWN' })
    ).toEqual({
      deviceId: ENVELOPE.deviceId,
      type: 'decrementChannel',
      payload: undefined,
    });
  });

  it('maps SET_CHANNEL to a backend setChannel payload', () => {
    expect(
      mapEnvelopeToBackend({
        type: 'ConsoleCommand',
        deviceId: 'living-room-tv',
        command: 'SET_CHANNEL',
        value: 12,
      })
    ).toEqual({
      deviceId: 'living-room-tv',
      type: 'setChannel',
      payload: { channel: 12 },
    });
  });

  it('threads SEEK_TO value into payload.positionSeconds', () => {
    expect(mapEnvelopeToBackend(SEEK_ENVELOPE).payload).toEqual({ action: 'seek', positionSeconds: 75 });
  });

  it('flattens DPAD_* into a payload direction', () => {
    expect(mapEnvelopeToBackend({ ...ENVELOPE, command: 'DPAD_LEFT' }).payload).toEqual({
      direction: 'left',
    });
  });

  it('emits playback action for PLAY/PAUSE', () => {
    expect(mapEnvelopeToBackend({ ...ENVELOPE, command: 'PLAY' })).toEqual({
      deviceId: ENVELOPE.deviceId,
      type: 'playback',
      payload: { action: 'play' },
    });
    expect(mapEnvelopeToBackend({ ...ENVELOPE, command: 'PAUSE' }).payload).toEqual({
      action: 'pause',
    });
  });

  it('forwards library metadata for LIBRARY_PLAY commands', () => {
    const wire = mapEnvelopeToBackend({
      type: 'ConsoleCommand',
      deviceId: 'living-room-tv',
      command: 'LIBRARY_PLAY',
      mediaId: 'track-001',
      category: 'music',
      metadata: { title: 'Midnight Drive', subtitle: 'Nova Sound', durationSeconds: 214 },
    });
    expect(wire.type).toBe('playMedia');
    expect(wire.payload).toMatchObject({
      mediaId: 'track-001',
      category: 'music',
      metadata: expect.objectContaining({ title: 'Midnight Drive' }),
    });
  });

  it('maps LAUNCH_APP to the backend launchApp command with the selected app name', () => {
    expect(
      mapEnvelopeToBackend({
        type: 'ConsoleCommand',
        deviceId: 'living-room-tv',
        command: 'LAUNCH_APP',
        metadata: {
          title: 'Netflix',
        },
      })
    ).toEqual({
      deviceId: 'living-room-tv',
      type: 'launchApp',
      payload: { app: 'Netflix' },
    });
  });
});
