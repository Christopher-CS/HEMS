import type { ConsoleCommandEnvelope, ConsoleCommandToken } from './types';

// Maps the mobile command vocabulary to the controller-level "type" token the
// backend understands. Whichever backend branch lands first, this is the single
// place to update the wire mapping.
export type BackendCommandPayload = {
  deviceId: string;
  type: string;
  payload?: Record<string, unknown>;
};

const TOKEN_TO_TYPE: Record<ConsoleCommandToken, string> = {
  POWER_TOGGLE: 'togglePower',
  NAVIGATE_BACK: 'navigateBack',
  OPEN_NUMBER_PAD: 'openNumberPad',
  PAUSE: 'playback',
  PLAY: 'playback',
  DPAD_UP: 'dpad',
  DPAD_DOWN: 'dpad',
  DPAD_LEFT: 'dpad',
  DPAD_RIGHT: 'dpad',
  DPAD_SELECT: 'dpad',
  CHANNEL_UP: 'incrementLevel',
  CHANNEL_DOWN: 'decrementLevel',
  VOLUME_UP: 'incrementLevel',
  VOLUME_DOWN: 'decrementLevel',
  GO_HOME: 'goHome',
  OPEN_LIVE_GUIDE: 'openLiveGuide',
  SEEK_TO: 'seekTo',
  SET_COLOR_MODE: 'setColorMode',
  SET_COLOR_TEMPERATURE: 'setColorTemperature',
  SET_HUE: 'setHue',
  SET_SATURATION: 'setSaturation',
  SET_INPUT_SOURCE: 'setInputSource',
  CONNECT_DEVICE: 'connectDevice',
  DISCONNECT_DEVICE: 'disconnectDevice',
  LIBRARY_PLAY: 'playMedia',
  LIBRARY_QUEUE: 'queueMedia',
  LIBRARY_PREVIEW: 'previewMedia',
};

const CHANNEL_TARGET = 'channel';
const VOLUME_TARGET = 'volume';

const buildPayload = (envelope: ConsoleCommandEnvelope): Record<string, unknown> | undefined => {
  switch (envelope.command) {
    case 'PAUSE':
      return { action: 'pause' };
    case 'PLAY':
      return { action: 'play' };
    case 'CHANNEL_UP':
    case 'CHANNEL_DOWN':
      return { target: CHANNEL_TARGET };
    case 'VOLUME_UP':
    case 'VOLUME_DOWN':
      return { target: VOLUME_TARGET };
    case 'DPAD_UP':
    case 'DPAD_DOWN':
    case 'DPAD_LEFT':
    case 'DPAD_RIGHT':
    case 'DPAD_SELECT':
      return { direction: envelope.command.replace('DPAD_', '').toLowerCase() };
    case 'SEEK_TO':
      return typeof envelope.value === 'number' ? { positionSeconds: envelope.value } : undefined;
    case 'SET_COLOR_MODE':
      return { mode: envelope.value === 1 ? 'color' : 'white' };
    case 'SET_COLOR_TEMPERATURE':
      return typeof envelope.value === 'number' ? { kelvin: envelope.value } : undefined;
    case 'SET_HUE':
      return typeof envelope.value === 'number' ? { hue: envelope.value } : undefined;
    case 'SET_SATURATION':
      return typeof envelope.value === 'number' ? { saturation: envelope.value } : undefined;
    case 'SET_INPUT_SOURCE':
      return envelope.metadata?.subtitle ? { source: envelope.metadata.subtitle } : undefined;
    case 'CONNECT_DEVICE':
    case 'DISCONNECT_DEVICE':
      return envelope.metadata
        ? { name: envelope.metadata.title, kind: envelope.metadata.subtitle }
        : undefined;
    case 'LIBRARY_PLAY':
    case 'LIBRARY_QUEUE':
    case 'LIBRARY_PREVIEW':
      return {
        mediaId: envelope.mediaId,
        category: envelope.category,
        metadata: envelope.metadata,
      };
    default:
      return undefined;
  }
};

export function mapEnvelopeToBackend(envelope: ConsoleCommandEnvelope): BackendCommandPayload {
  return {
    deviceId: envelope.deviceId,
    type: TOKEN_TO_TYPE[envelope.command],
    payload: buildPayload(envelope),
  };
}
