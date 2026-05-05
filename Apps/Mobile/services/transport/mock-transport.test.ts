import { createMockTransport } from './mock-transport';
import type { CommandLogEntry, ConsoleCommandEnvelope } from './types';

const ENVELOPE: ConsoleCommandEnvelope = {
  type: 'ConsoleCommand',
  deviceId: 'living-room-tv',
  command: 'POWER_TOGGLE',
};

describe('createMockTransport', () => {
  it('returns a successful result and appends to the log when failRate is 0', async () => {
    const log: CommandLogEntry[] = [];
    const transport = createMockTransport({
      getSettings: () => ({ latencyMs: 0, failRate: 0 }),
      onCommand: (entry) => log.push(entry),
      generateId: () => 'cmd-test-1',
      delay: () => Promise.resolve(),
    });

    const result = await transport.send(ENVELOPE);

    expect(result.ok).toBe(true);
    expect(result.id).toBe('cmd-test-1');
    expect(log).toHaveLength(1);
    expect(log[0].envelope).toBe(ENVELOPE);
    expect(log[0].result.ok).toBe(true);
  });

  it('honors injected latency settings via the delay hook', async () => {
    const delays: number[] = [];
    const transport = createMockTransport({
      getSettings: () => ({ latencyMs: 750, failRate: 0 }),
      delay: (ms) => {
        delays.push(ms);
        return Promise.resolve();
      },
      generateId: () => 'cmd-test-2',
    });

    await transport.send(ENVELOPE);

    expect(delays).toEqual([750]);
  });

  it('returns a failure when failRate triggers and still logs the entry', async () => {
    const log: CommandLogEntry[] = [];
    const transport = createMockTransport({
      getSettings: () => ({ latencyMs: 0, failRate: 1 }),
      rng: () => 0,
      onCommand: (entry) => log.push(entry),
      generateId: () => 'cmd-test-3',
      delay: () => Promise.resolve(),
    });

    const result = await transport.send(ENVELOPE);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/injected/i);
    }
    expect(log).toHaveLength(1);
    expect(log[0].result.ok).toBe(false);
  });

  it('clamps fail rate to [0, 1] and treats negative latency as zero', async () => {
    const delays: number[] = [];
    const transport = createMockTransport({
      getSettings: () => ({ latencyMs: -100, failRate: 5 }),
      rng: () => 0.999,
      delay: (ms) => {
        delays.push(ms);
        return Promise.resolve();
      },
      generateId: () => 'cmd-test-4',
    });

    const result = await transport.send(ENVELOPE);
    expect(delays).toEqual([0]);
    expect(result.ok).toBe(false);
  });
});
