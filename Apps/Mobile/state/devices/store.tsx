import React, { createContext, useContext, useMemo, useReducer } from 'react';

export type DeviceId = string;
export type ProfileId = 'dad' | 'guest-alex' | 'guest-mom';

export type DeviceKind = 'tv' | 'light' | 'speaker' | 'generic';

export type ColorMode = 'white' | 'color';

export type DeviceSnapshot = {
  id: DeviceId;
  name: string;
  subtitle: string;
  kind: DeviceKind;
  enabled: boolean;
  level: number;
  // Lights
  colorMode?: ColorMode;
  colorTemperatureK?: number; // 2700-6500
  hue?: number; // 0-359
  saturation?: number; // 0-100
  // Source-driven devices (TV, speaker)
  inputSource?: string;
  availableSources?: string[];
  // Whether the user added this device after seeding (controls "remove" affordance)
  userAdded?: boolean;
};

export type SceneId = string | null;

export type Profile = {
  id: ProfileId;
  name: string;
  role: 'main' | 'guest';
  parentId?: ProfileId;
};

export type HouseholdAccount = {
  mainProfileId: ProfileId;
  profiles: Record<ProfileId, Profile>;
  guestProfileIds: ProfileId[];
};

export type ScenePreset = Partial<Record<DeviceId, Partial<DeviceSnapshot>>>;

export type SceneDefinition = {
  id: string;
  label: string;
  description: string;
  backgroundUrl: string;
  overlayDark?: boolean;
  presets: ScenePreset;
};

export const PROFILE_SCENES: Record<ProfileId, SceneDefinition[]> = {
  dad: [
    {
      id: 'theater',
      label: 'Theater',
      description: 'Movie-ready lighting and volume',
      backgroundUrl:
        'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?q=80&w=400&auto=format&fit=crop',
      presets: {
        'living-room-tv': { enabled: true, level: 65 },
        ambiance: { enabled: true, level: 12 },
        'sound-system': { enabled: true, level: 55 },
      },
    },
    {
      id: 'party',
      label: 'Party',
      description: 'High-energy lights and sound',
      backgroundUrl:
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop',
      overlayDark: true,
      presets: {
        'living-room-tv': { enabled: false, level: 0 },
        ambiance: { enabled: true, level: 80 },
        'sound-system': { enabled: true, level: 85 },
      },
    },
  ],
  'guest-alex': [
    {
      id: 'game-night',
      label: 'Game Night',
      description: 'Brighter room with punchier sound',
      backgroundUrl:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop',
      presets: {
        'living-room-tv': { enabled: true, level: 70 },
        ambiance: { enabled: true, level: 65 },
        'sound-system': { enabled: true, level: 72 },
      },
    },
    {
      id: 'study',
      label: 'Study',
      description: 'Low-noise focus setup',
      backgroundUrl:
        'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=400&auto=format&fit=crop',
      presets: {
        'living-room-tv': { enabled: false, level: 0 },
        ambiance: { enabled: true, level: 35 },
        'sound-system': { enabled: true, level: 18 },
      },
    },
  ],
  'guest-mom': [
    {
      id: 'cozy-evening',
      label: 'Cozy Evening',
      description: 'Soft lights, quiet TV, gentle background audio',
      backgroundUrl:
        'https://images.unsplash.com/photo-1513694203232-719a981e7f78?q=80&w=400&auto=format&fit=crop',
      overlayDark: true,
      presets: {
        'living-room-tv': { enabled: true, level: 38 },
        ambiance: { enabled: true, level: 28 },
        'sound-system': { enabled: true, level: 32 },
      },
    },
    {
      id: 'hosting',
      label: 'Hosting',
      description: 'Bright room and clear sound for company',
      backgroundUrl:
        'https://images.unsplash.com/photo-1556912173-46c336c7fd55?q=80&w=400&auto=format&fit=crop',
      presets: {
        'living-room-tv': { enabled: true, level: 58 },
        ambiance: { enabled: true, level: 72 },
        'sound-system': { enabled: true, level: 62 },
      },
    },
  ],
};

const HOUSEHOLD_ACCOUNT: HouseholdAccount = {
  mainProfileId: 'dad',
  profiles: {
    dad: {
      id: 'dad',
      name: 'Dad',
      role: 'main',
    },
    'guest-alex': {
      id: 'guest-alex',
      name: 'Alex',
      role: 'guest',
      parentId: 'dad',
    },
    'guest-mom': {
      id: 'guest-mom',
      name: 'Mom',
      role: 'guest',
      parentId: 'dad',
    },
  },
  guestProfileIds: ['guest-alex', 'guest-mom'],
};

export type DevicesState = {
  primaryDeviceId: DeviceId;
  devices: Record<DeviceId, DeviceSnapshot>;
  deviceOrder: DeviceId[];
  account: HouseholdAccount;
  activeProfileId: ProfileId;
  activeSceneByProfile: Record<ProfileId, SceneId>;
};

const SEED_DEVICES: DeviceSnapshot[] = [
  {
    id: 'living-room-tv',
    name: 'Living Room TV',
    subtitle: 'Samsung QLED',
    kind: 'tv',
    enabled: true,
    level: 42,
    inputSource: 'HDMI 1',
    availableSources: ['HDMI 1', 'HDMI 2', 'HDMI 3', 'Streaming'],
  },
  {
    id: 'ambiance',
    name: 'Ambiance',
    subtitle: 'Philips Hue',
    kind: 'light',
    enabled: true,
    level: 10,
    colorMode: 'white',
    colorTemperatureK: 3500,
    hue: 30,
    saturation: 80,
  },
  {
    id: 'sound-system',
    name: 'Sound System',
    subtitle: 'Sonos Arc + Sub',
    kind: 'speaker',
    enabled: true,
    level: 30,
    inputSource: 'HDMI ARC',
    availableSources: ['HDMI ARC', 'Bluetooth', 'Optical', 'AUX'],
  },
];

export const INITIAL_DEVICES: DevicesState = {
  primaryDeviceId: 'living-room-tv',
  account: HOUSEHOLD_ACCOUNT,
  activeProfileId: HOUSEHOLD_ACCOUNT.mainProfileId,
  activeSceneByProfile: {
    dad: 'theater',
    'guest-alex': 'game-night',
    'guest-mom': 'cozy-evening',
  },
  deviceOrder: SEED_DEVICES.map((d) => d.id),
  devices: SEED_DEVICES.reduce<Record<DeviceId, DeviceSnapshot>>((acc, snapshot) => {
    acc[snapshot.id] = snapshot;
    return acc;
  }, {}),
};

type DevicesAction =
  | { type: 'set-enabled'; deviceId: DeviceId; enabled: boolean }
  | { type: 'set-level'; deviceId: DeviceId; level: number }
  | { type: 'set-color-mode'; deviceId: DeviceId; mode: ColorMode }
  | { type: 'set-color-temperature'; deviceId: DeviceId; kelvin: number }
  | { type: 'set-color'; deviceId: DeviceId; hue: number; saturation: number }
  | { type: 'set-input-source'; deviceId: DeviceId; source: string }
  | { type: 'add-device'; device: DeviceSnapshot }
  | { type: 'remove-device'; deviceId: DeviceId }
  | { type: 'set-active-profile'; profileId: ProfileId }
  | { type: 'set-active-scene'; scene: SceneId }
  | { type: 'apply-scene'; profileId: ProfileId; sceneId: string }
  | { type: 'hydrate'; projections: Array<Omit<Partial<DeviceSnapshot>, 'id'> & { id: string }> }
  | { type: 'reset' };

const clampLevel = (level: number) => Math.min(100, Math.max(0, Math.round(level)));
const clampHue = (hue: number) => ((Math.round(hue) % 360) + 360) % 360;
const clampSaturation = (s: number) => Math.min(100, Math.max(0, Math.round(s)));
const clampKelvin = (k: number) => Math.min(6500, Math.max(2700, Math.round(k)));

const reducer = (state: DevicesState, action: DevicesAction): DevicesState => {
  switch (action.type) {
    case 'set-enabled': {
      const current = state.devices[action.deviceId];
      if (!current || current.enabled === action.enabled) return state;
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.deviceId]: { ...current, enabled: action.enabled },
        },
      };
    }
    case 'set-level': {
      const current = state.devices[action.deviceId];
      if (!current) return state;
      const next = clampLevel(action.level);
      if (current.level === next) return state;
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.deviceId]: { ...current, level: next },
        },
      };
    }
    case 'set-color-mode': {
      const current = state.devices[action.deviceId];
      if (!current || current.kind !== 'light' || current.colorMode === action.mode) return state;
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.deviceId]: { ...current, colorMode: action.mode },
        },
      };
    }
    case 'set-color-temperature': {
      const current = state.devices[action.deviceId];
      if (!current || current.kind !== 'light') return state;
      const k = clampKelvin(action.kelvin);
      if (current.colorTemperatureK === k) return state;
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.deviceId]: { ...current, colorTemperatureK: k },
        },
      };
    }
    case 'set-color': {
      const current = state.devices[action.deviceId];
      if (!current || current.kind !== 'light') return state;
      const hue = clampHue(action.hue);
      const saturation = clampSaturation(action.saturation);
      if (current.hue === hue && current.saturation === saturation) return state;
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.deviceId]: { ...current, hue, saturation },
        },
      };
    }
    case 'set-input-source': {
      const current = state.devices[action.deviceId];
      if (!current) return state;
      if (current.availableSources && !current.availableSources.includes(action.source)) return state;
      if (current.inputSource === action.source) return state;
      return {
        ...state,
        devices: {
          ...state.devices,
          [action.deviceId]: { ...current, inputSource: action.source },
        },
      };
    }
    case 'add-device': {
      if (state.devices[action.device.id]) return state;
      return {
        ...state,
        devices: { ...state.devices, [action.device.id]: action.device },
        deviceOrder: [...state.deviceOrder, action.device.id],
      };
    }
    case 'remove-device': {
      if (!state.devices[action.deviceId]) return state;
      const { [action.deviceId]: _removed, ...rest } = state.devices;
      void _removed;
      return {
        ...state,
        devices: rest,
        deviceOrder: state.deviceOrder.filter((id) => id !== action.deviceId),
        primaryDeviceId:
          state.primaryDeviceId === action.deviceId
            ? state.deviceOrder.find((id) => id !== action.deviceId) ?? state.primaryDeviceId
            : state.primaryDeviceId,
      };
    }
    case 'set-active-scene':
      if (state.activeSceneByProfile[state.activeProfileId] === action.scene) return state;
      return {
        ...state,
        activeSceneByProfile: {
          ...state.activeSceneByProfile,
          [state.activeProfileId]: action.scene,
        },
      };
    case 'set-active-profile':
      if (state.activeProfileId === action.profileId) return state;
      return { ...state, activeProfileId: action.profileId };
    case 'apply-scene': {
      const scene = PROFILE_SCENES[action.profileId].find((item) => item.id === action.sceneId);
      if (!scene) return state;
      const merged: DevicesState['devices'] = { ...state.devices };
      for (const [deviceId, partial] of Object.entries(scene.presets) as Array<[
        DeviceId,
        Partial<DeviceSnapshot> | undefined,
      ]>) {
        const existing = merged[deviceId];
        if (!existing || !partial) continue;
        const nextLevel = typeof partial.level === 'number' ? clampLevel(partial.level) : existing.level;
        merged[deviceId] = {
          ...existing,
          ...partial,
          level: nextLevel,
        };
      }
      return {
        ...state,
        devices: merged,
        activeSceneByProfile: {
          ...state.activeSceneByProfile,
          [action.profileId]: action.sceneId,
        },
      };
    }
    case 'hydrate': {
      const merged: DevicesState['devices'] = { ...state.devices };
      for (const { id: rawId, ...patch } of action.projections) {
        const id = rawId as DeviceId;
        const existing = merged[id];
        if (!existing) continue;
        merged[id] = {
          ...existing,
          ...patch,
          id,
          level: typeof patch.level === 'number' ? clampLevel(patch.level) : existing.level,
        };
      }
      return { ...state, devices: merged };
    }
    case 'reset':
      return INITIAL_DEVICES;
    default:
      return state;
  }
};

type DevicesContextValue = {
  state: DevicesState;
  setEnabled: (deviceId: DeviceId, enabled: boolean) => void;
  setLevel: (deviceId: DeviceId, level: number) => void;
  setColorMode: (deviceId: DeviceId, mode: ColorMode) => void;
  setColorTemperature: (deviceId: DeviceId, kelvin: number) => void;
  setColor: (deviceId: DeviceId, hue: number, saturation: number) => void;
  setInputSource: (deviceId: DeviceId, source: string) => void;
  addDevice: (device: DeviceSnapshot) => void;
  removeDevice: (deviceId: DeviceId) => void;
  setActiveProfile: (profileId: ProfileId) => void;
  activateScene: (scene: SceneId) => void;
  applyScene: (profileId: ProfileId, sceneId: string) => void;
  hydrate: (projections: Array<Omit<Partial<DeviceSnapshot>, 'id'> & { id: string }>) => void;
  reset: () => void;
};

const DevicesContext = createContext<DevicesContextValue | null>(null);

export function DevicesProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_DEVICES);

  const value = useMemo<DevicesContextValue>(
    () => ({
      state,
      setEnabled: (deviceId, enabled) => dispatch({ type: 'set-enabled', deviceId, enabled }),
      setLevel: (deviceId, level) => dispatch({ type: 'set-level', deviceId, level }),
      setColorMode: (deviceId, mode) => dispatch({ type: 'set-color-mode', deviceId, mode }),
      setColorTemperature: (deviceId, kelvin) =>
        dispatch({ type: 'set-color-temperature', deviceId, kelvin }),
      setColor: (deviceId, hue, saturation) =>
        dispatch({ type: 'set-color', deviceId, hue, saturation }),
      setInputSource: (deviceId, source) => dispatch({ type: 'set-input-source', deviceId, source }),
      addDevice: (device) => dispatch({ type: 'add-device', device }),
      removeDevice: (deviceId) => dispatch({ type: 'remove-device', deviceId }),
      setActiveProfile: (profileId) => dispatch({ type: 'set-active-profile', profileId }),
      activateScene: (scene) => dispatch({ type: 'set-active-scene', scene }),
      applyScene: (profileId, sceneId) => dispatch({ type: 'apply-scene', profileId, sceneId }),
      hydrate: (projections) => dispatch({ type: 'hydrate', projections }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [state]
  );

  return <DevicesContext.Provider value={value}>{children}</DevicesContext.Provider>;
}

export function useDevicesStore(): DevicesContextValue {
  const ctx = useContext(DevicesContext);
  if (!ctx) throw new Error('useDevicesStore must be used within DevicesProvider');
  return ctx;
}

export const __TEST_ONLY = { reducer, INITIAL_DEVICES };
