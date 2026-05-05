import { PROFILE_SCENES, useDevicesStore } from '../state/devices/store';
import { useRemoteData } from '../state/remote-data/RemoteDataProvider';

export function useDevices() {
  const {
    state,
    setEnabled,
    setLevel,
    setColorMode,
    setColorTemperature,
    setColor,
    setInputSource,
    addDevice,
    removeDevice,
    setActiveProfile,
    activateScene,
    applyScene,
    hydrate,
    reset,
  } = useDevicesStore();
  const { state: remote, refreshDevices } = useRemoteData();
  const activeProfile = state.account.profiles[state.activeProfileId];
  const profileScenes = PROFILE_SCENES[state.activeProfileId];
  const orderedDevices = state.deviceOrder
    .map((id) => state.devices[id])
    .filter((d): d is NonNullable<typeof d> => Boolean(d));
  return {
    devices: state.devices,
    deviceOrder: state.deviceOrder,
    orderedDevices,
    primaryDeviceId: state.primaryDeviceId,
    account: state.account,
    activeProfileId: state.activeProfileId,
    activeProfile,
    activeScene: state.activeSceneByProfile[state.activeProfileId],
    profileScenes,
    setEnabled,
    setLevel,
    setColorMode,
    setColorTemperature,
    setColor,
    setInputSource,
    addDevice,
    removeDevice,
    setActiveProfile,
    activateScene,
    applyScene,
    hydrate,
    reset,
    loading: remote.devices.status === 'loading',
    error: remote.devices.error,
    refresh: refreshDevices,
  };
}
