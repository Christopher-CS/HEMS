import type { MediaCategory } from '../../types/media';

export const REMOTE_COMMAND_TOKENS = [
  'POWER_TOGGLE',
  'NAVIGATE_BACK',
  'OPEN_NUMBER_PAD',
  'PAUSE',
  'PLAY',
  'DPAD_UP',
  'DPAD_DOWN',
  'DPAD_LEFT',
  'DPAD_RIGHT',
  'DPAD_SELECT',
  'CHANNEL_UP',
  'CHANNEL_DOWN',
  'VOLUME_UP',
  'VOLUME_DOWN',
  'GO_HOME',
  'OPEN_LIVE_GUIDE',
  'SEEK_TO',
  'SET_COLOR_MODE',
  'SET_COLOR_TEMPERATURE',
  'SET_HUE',
  'SET_SATURATION',
  'SET_INPUT_SOURCE',
  'CONNECT_DEVICE',
  'DISCONNECT_DEVICE',
] as const;

export type RemoteCommandToken = (typeof REMOTE_COMMAND_TOKENS)[number];

export const LIBRARY_COMMAND_TOKENS = [
  'LIBRARY_PLAY',
  'LIBRARY_QUEUE',
  'LIBRARY_PREVIEW',
] as const;

export type LibraryCommandToken = (typeof LIBRARY_COMMAND_TOKENS)[number];

export type ConsoleCommandToken = RemoteCommandToken | LibraryCommandToken;

export type ConsoleCommandEnvelope = {
  type: 'ConsoleCommand';
  deviceId: string;
  command: ConsoleCommandToken;
  value?: number;
  mediaId?: string;
  category?: MediaCategory;
  metadata?: {
    title: string;
    subtitle?: string;
    durationSeconds?: number;
  };
};

export type CommandResult =
  | { ok: true; id: string; latencyMs: number }
  | { ok: false; id: string; error: string; latencyMs: number };

export type CommandLogEntry = {
  id: string;
  timestamp: number;
  envelope: ConsoleCommandEnvelope;
  result: CommandResult;
};

export interface ConsoleTransport {
  send(envelope: ConsoleCommandEnvelope): Promise<CommandResult>;
}

export const isLibraryCommand = (token: ConsoleCommandToken): token is LibraryCommandToken =>
  (LIBRARY_COMMAND_TOKENS as readonly string[]).includes(token);

export const isRemoteCommand = (token: ConsoleCommandToken): token is RemoteCommandToken =>
  (REMOTE_COMMAND_TOKENS as readonly string[]).includes(token);
