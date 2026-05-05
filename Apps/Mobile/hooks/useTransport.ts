import { useCallback } from 'react';
import { getTransport } from '../services/transport';
import type { CommandResult, ConsoleCommandEnvelope } from '../services/transport/types';

export function useTransport() {
  const send = useCallback(
    (envelope: ConsoleCommandEnvelope): Promise<CommandResult> => {
      return getTransport().send(envelope);
    },
    []
  );
  return { send };
}
