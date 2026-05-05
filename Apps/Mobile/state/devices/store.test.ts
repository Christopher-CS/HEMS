import { __TEST_ONLY } from './store';

const { reducer, INITIAL_DEVICES } = __TEST_ONLY;

describe('devices reducer', () => {
  it('toggles enabled state on a device without affecting siblings', () => {
    const next = reducer(INITIAL_DEVICES, {
      type: 'set-enabled',
      deviceId: 'living-room-tv',
      enabled: false,
    });
    expect(next.devices['living-room-tv'].enabled).toBe(false);
    expect(next.devices['ambiance'].enabled).toBe(true);
  });

  it('clamps levels into the 0-100 range', () => {
    const high = reducer(INITIAL_DEVICES, {
      type: 'set-level',
      deviceId: 'sound-system',
      level: 250,
    });
    const low = reducer(INITIAL_DEVICES, {
      type: 'set-level',
      deviceId: 'sound-system',
      level: -42,
    });
    expect(high.devices['sound-system'].level).toBe(100);
    expect(low.devices['sound-system'].level).toBe(0);
  });

  it('returns the same reference when an action would not change state', () => {
    const sameToggle = reducer(INITIAL_DEVICES, {
      type: 'set-enabled',
      deviceId: 'living-room-tv',
      enabled: INITIAL_DEVICES.devices['living-room-tv'].enabled,
    });
    expect(sameToggle).toBe(INITIAL_DEVICES);
  });

  it('applies a profile scene and updates activeScene for that profile', () => {
    const next = reducer(INITIAL_DEVICES, {
      type: 'apply-scene',
      profileId: 'dad',
      sceneId: 'party',
    });
    expect(next.activeSceneByProfile.dad).toBe('party');
    expect(next.devices['living-room-tv'].enabled).toBe(false);
    expect(next.devices['sound-system'].level).toBe(85);
    expect(next.devices['ambiance'].level).toBe(80);
  });

  it('switches active profile to a guest under the main account', () => {
    const next = reducer(INITIAL_DEVICES, {
      type: 'set-active-profile',
      profileId: 'guest-alex',
    });
    expect(next.activeProfileId).toBe('guest-alex');
    expect(next.account.profiles['guest-alex'].parentId).toBe(next.account.mainProfileId);
  });

  it('applies Mom guest scenes with distinct presets', () => {
    const cozy = reducer(INITIAL_DEVICES, {
      type: 'apply-scene',
      profileId: 'guest-mom',
      sceneId: 'cozy-evening',
    });
    expect(cozy.activeSceneByProfile['guest-mom']).toBe('cozy-evening');
    expect(cozy.devices['living-room-tv'].level).toBe(38);
    expect(cozy.devices.ambiance.level).toBe(28);

    const hosting = reducer(cozy, {
      type: 'apply-scene',
      profileId: 'guest-mom',
      sceneId: 'hosting',
    });
    expect(hosting.activeSceneByProfile['guest-mom']).toBe('hosting');
    expect(hosting.devices['living-room-tv'].level).toBe(58);
    expect(hosting.devices['sound-system'].level).toBe(62);
  });

  it('switches a light between white and color modes', () => {
    const next = reducer(INITIAL_DEVICES, {
      type: 'set-color-mode',
      deviceId: 'ambiance',
      mode: 'color',
    });
    expect(next.devices.ambiance.colorMode).toBe('color');
    const ignored = reducer(INITIAL_DEVICES, {
      type: 'set-color-mode',
      deviceId: 'living-room-tv',
      mode: 'color',
    });
    expect(ignored).toBe(INITIAL_DEVICES);
  });

  it('clamps color temperature into the supported Kelvin range', () => {
    const cold = reducer(INITIAL_DEVICES, {
      type: 'set-color-temperature',
      deviceId: 'ambiance',
      kelvin: 9000,
    });
    expect(cold.devices.ambiance.colorTemperatureK).toBe(6500);
    const warm = reducer(INITIAL_DEVICES, {
      type: 'set-color-temperature',
      deviceId: 'ambiance',
      kelvin: 1000,
    });
    expect(warm.devices.ambiance.colorTemperatureK).toBe(2700);
  });

  it('stores hue/saturation when set-color is dispatched', () => {
    const next = reducer(INITIAL_DEVICES, {
      type: 'set-color',
      deviceId: 'ambiance',
      hue: 540, // wraps to 180
      saturation: 130, // clamps to 100
    });
    expect(next.devices.ambiance.hue).toBe(180);
    expect(next.devices.ambiance.saturation).toBe(100);
  });

  it('changes the input source only to a known available source', () => {
    const ok = reducer(INITIAL_DEVICES, {
      type: 'set-input-source',
      deviceId: 'living-room-tv',
      source: 'HDMI 2',
    });
    expect(ok.devices['living-room-tv'].inputSource).toBe('HDMI 2');
    const rejected = reducer(INITIAL_DEVICES, {
      type: 'set-input-source',
      deviceId: 'living-room-tv',
      source: 'VGA 1',
    });
    expect(rejected).toBe(INITIAL_DEVICES);
  });

  it('adds and removes user-connected devices and updates ordering', () => {
    const added = reducer(INITIAL_DEVICES, {
      type: 'add-device',
      device: {
        id: 'light-office',
        name: 'Office Light',
        subtitle: 'LIFX Mini',
        kind: 'light',
        enabled: false,
        level: 50,
        colorMode: 'white',
        colorTemperatureK: 4000,
        hue: 30,
        saturation: 80,
        userAdded: true,
      },
    });
    expect(added.devices['light-office']?.name).toBe('Office Light');
    expect(added.deviceOrder).toContain('light-office');

    const noDup = reducer(added, {
      type: 'add-device',
      device: { ...added.devices['light-office']!, name: 'Dup' },
    });
    expect(noDup).toBe(added);

    const removed = reducer(added, { type: 'remove-device', deviceId: 'light-office' });
    expect(removed.devices['light-office']).toBeUndefined();
    expect(removed.deviceOrder).not.toContain('light-office');
  });
});
