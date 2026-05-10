import { useCallback } from 'react';
import { useDevices } from './useDevices';
import { usePlayback } from './usePlayback';
import { useTransport } from './useTransport';
import type { CommandResult } from '../services/transport/types';
import { buildQueuedPlayEnvelope } from '../utils/library-queue';

export function useQueueController() {
  const { primaryDeviceId } = useDevices();
  const { queue, removeFromQueue } = usePlayback();
  const { send } = useTransport();

  const stopPlayback = useCallback((): Promise<CommandResult> => {
    return send({
      type: 'ConsoleCommand',
      deviceId: primaryDeviceId,
      command: 'STOP',
    });
  }, [primaryDeviceId, send]);

  const playQueued = useCallback(
    (index: number): Promise<CommandResult | null> => {
      const item = queue[index];
      if (!item) return Promise.resolve(null);

      return send(buildQueuedPlayEnvelope(item, primaryDeviceId))
        .then((result) => {
          if (result.ok) removeFromQueue(index);
          return result;
        });
    },
    [primaryDeviceId, queue, removeFromQueue, send]
  );

  const playNextOrStop = useCallback((): Promise<CommandResult | null> => {
    return playQueued(0).then((result) => {
      if (result) return result;
      return stopPlayback();
    });
  }, [playQueued, stopPlayback]);

  return {
    playQueued,
    playNextOrStop,
    stopPlayback,
  };
}
