import { createHttpTransport } from './http-transport';
import type { ConsoleCommandEnvelope } from './types';

const LIBRARY_PLAY_ENVELOPE: ConsoleCommandEnvelope = {
  type: 'ConsoleCommand',
  deviceId: 'living-room-tv',
  command: 'LIBRARY_PLAY',
  mediaId: 'track-006',
  category: 'music',
  metadata: {
    title: 'Get Your Wish',
    subtitle: 'Porter Robinson',
    durationSeconds: 219,
    artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
    audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
  },
};

const SET_CHANNEL_ENVELOPE: ConsoleCommandEnvelope = {
  type: 'ConsoleCommand',
  deviceId: 'living-room-tv',
  command: 'SET_CHANNEL',
  value: 12,
};

describe('createHttpTransport', () => {
  it('posts playMedia commands to the backend in live HTTP mode', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const originalFetch = global.fetch;
    global.fetch = fetchMock as typeof fetch;

    try {
      const transport = createHttpTransport({ baseUrl: 'http://backend.test' });
      const result = await transport.send(LIBRARY_PLAY_ENVELOPE);

      expect(result.ok).toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock).toHaveBeenCalledWith(
        'http://backend.test/api/commands',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-HEMS-Client': 'mobile-app',
          }),
        })
      );

      const [, request] = fetchMock.mock.calls[0];
      expect(JSON.parse((request as RequestInit).body as string)).toEqual({
        device: 'living-room-tv',
        issuedBy: 'app',
        type: 'playMedia',
        payload: {
          mediaId: 'track-006',
          category: 'music',
          metadata: {
            title: 'Get Your Wish',
            subtitle: 'Porter Robinson',
            durationSeconds: 219,
            artworkUrl: 'https://i.imgur.com/RUk05MW.jpeg',
            audioUrl: '/audio/Porter Robinson - Get Your Wish.mp3',
          },
        },
      });
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('posts setChannel commands to the backend in live HTTP mode', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const originalFetch = global.fetch;
    global.fetch = fetchMock as typeof fetch;

    try {
      const transport = createHttpTransport({ baseUrl: 'http://backend.test' });
      const result = await transport.send(SET_CHANNEL_ENVELOPE);

      expect(result.ok).toBe(true);
      const [, request] = fetchMock.mock.calls[0];
      expect(JSON.parse((request as RequestInit).body as string)).toEqual({
        device: 'living-room-tv',
        issuedBy: 'app',
        type: 'setChannel',
        payload: {
          channel: 12,
        },
      });
    } finally {
      global.fetch = originalFetch;
    }
  });
});
