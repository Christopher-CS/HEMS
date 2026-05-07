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
  POWER_TOGGLE:       'power',
  NAVIGATE_BACK:      'navigate',
  OPEN_NUMBER_PAD:    'navigate',
  PAUSE:              'playback',
  PLAY:               'playback',
  DPAD_UP:            'navigate',
  DPAD_DOWN:          'navigate',
  DPAD_LEFT:          'navigate',
  DPAD_RIGHT:         'navigate',
  DPAD_SELECT:        'navigate',
  CHANNEL_UP:         'incrementLevel',
  CHANNEL_DOWN:       'decrementLevel',
  VOLUME_UP:          'incrementLevel',
  VOLUME_DOWN:        'decrementLevel',
  GO_HOME:            'navigate',
  OPEN_LIVE_GUIDE:    'navigate',
  SEEK_TO:            'playback',
  SET_LEVEL:          'setLevel',
  SET_COLOR_MODE:     'setColorMode',
  SET_COLOR_TEMPERATURE: 'setColorTemperature',
  SET_HUE:            'setHue',
  SET_SATURATION:     'setSaturation',
  SET_INPUT_SOURCE:   'setMode',
  STOP:               'playback',
  TOGGLE_MUTE:        'toggleMute',
  CONNECT_DEVICE:     'connectDevice',
  DISCONNECT_DEVICE:  'disconnectDevice',
  LIBRARY_PLAY:       'playback',
  LIBRARY_QUEUE:      'playback',
  LIBRARY_PREVIEW:    'playback',
};

const CHANNEL_TARGET = 'channel';
const VOLUME_TARGET = 'volume';

const buildPayload = (envelope: ConsoleCommandEnvelope): Record<string, unknown> | undefined => {
  switch (envelope.command) {
    case 'POWER_TOGGLE':
      return { powerState: envelope.value === 1 ? 'on' : 'off' };
    case 'STOP':
      return { action: 'stop' };
    case 'PAUSE':
      return { action: 'pause' };
    case 'PLAY':
    case 'LIBRARY_PLAY':
    case 'LIBRARY_QUEUE':
    case 'LIBRARY_PREVIEW':
      return { action: 'play' };
    case 'SEEK_TO':
      return { action: 'play' };
    case 'CHANNEL_UP':
    case 'VOLUME_UP':
      return { target: VOLUME_TARGET };
    case 'CHANNEL_DOWN':
    case 'VOLUME_DOWN':
      return { target: VOLUME_TARGET };
    case 'NAVIGATE_BACK':
      return { direction: 'back' };
    case 'GO_HOME':
      return { direction: 'home' };
    case 'OPEN_LIVE_GUIDE':
      return { direction: 'menu' };
    case 'OPEN_NUMBER_PAD':
      return { direction: 'menu' };
    case 'DPAD_UP':
    case 'DPAD_DOWN':
    case 'DPAD_LEFT':
    case 'DPAD_RIGHT':
    case 'DPAD_SELECT':
      return { direction: envelope.command.replace('DPAD_', '').toLowerCase() };
    case 'SET_LEVEL':
      return typeof envelope.value === 'number' ? { value: envelope.value } : undefined;
    case 'SET_COLOR_MODE':
      return { mode: envelope.value === 1 ? 'color' : 'white' };
    case 'SET_COLOR_TEMPERATURE':
      return typeof envelope.value === 'number' ? { kelvin: envelope.value } : undefined;
    case 'SET_HUE':
      return typeof envelope.value === 'number' ? { hue: envelope.value } : undefined;
    case 'SET_SATURATION':
      return typeof envelope.value === 'number' ? { saturation: envelope.value } : undefined;
    case 'SET_INPUT_SOURCE':
      return envelope.metadata?.subtitle ? { mode: envelope.metadata.subtitle } : undefined;
    case 'CONNECT_DEVICE':
    case 'DISCONNECT_DEVICE':
      return envelope.metadata
        ? { name: envelope.metadata.title, kind: envelope.metadata.subtitle }
        : undefined;
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
