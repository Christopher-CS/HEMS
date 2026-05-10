import 'dotenv/config';
import mongoose from 'mongoose';
import Device from './models/Device.js';

await mongoose.connect(`${process.env.MONGODB_URI}/hems`);
console.log('Connected to MongoDB');

await Device.deleteMany({});
console.log('Cleared existing devices');

const devices = [
  // ── Screen (SystemController + ScreenController) ────────────────────────
  {
    name: 'Screen',
    slug: 'living-room-tv',
    subtitle: 'Living Room TV',
    type: 'tv',
    isOnline: false,
    capabilities: {
      powerable: true,
      levelAdjustable: true,
      modeSelectable: true,
      moveable: false,
      consoleControllable: true,
      playbackControllable: true,
      navigatable: true,
      colorControllable: false,
    },
    powerState: 'off',
    level: { current: 42, min: 0, max: 100, step: 1, unit: '%' },
    // Modes: TV or Gaming (matches SetMode in ScreenTextInput.cs)
    mode: {
      current: 'TV',
      available: [
        { id: 'TV', label: 'TV' },
        { id: 'Gaming', label: 'Gaming' },
      ],
    },
    // Apps + consoles (matches SetTVApp / SetConsole in ScreenTextInput.cs)
    consoleState: {
      currentApp: '',
      availableApps: [
        { id: 'Netflix',     label: 'Netflix' },
        { id: 'Prime Video', label: 'Prime Video' },
        { id: 'Peacock',     label: 'Peacock' },
        { id: 'Disney',      label: 'Disney' },
        { id: 'Xbox',        label: 'Xbox' },
        { id: 'PlayStation', label: 'PlayStation' },
        { id: 'Switch',      label: 'Switch' },
      ],
    },
    navigationState: {
      cursorVisible: false,
      currentChannel: 4,
    },
    playbackState: { status: 'stopped', isMuted: false, position: 0 },
  },

  // ── Lights (LightController) ─────────────────────────────────────────────
  {
    name: 'Lights',
    slug: 'ambiance',
    subtitle: 'Room Lighting',
    type: 'light',
    isOnline: false,
    capabilities: {
      powerable: true,
      levelAdjustable: true,
      modeSelectable: false,
      moveable: false,
      consoleControllable: false,
      playbackControllable: false,
      navigatable: false,
      colorControllable: true,
    },
    powerState: 'on',
    // Brightness maps to level (0-100 = 0.0-1.0 in Unity)
    level: { current: 80, min: 0, max: 100, step: 10, unit: '%' },
    // Color cycles: white, red, green, blue, orange, purple
    colorState: { mode: 'white', kelvin: 4000, hue: 0, saturation: 0 },
  },

  // ── Speakers (SpeakerController) ─────────────────────────────────────────
  {
    name: 'Speakers',
    slug: 'sound-system',
    subtitle: 'Room Audio',
    type: 'speaker',
    isOnline: false,
    capabilities: {
      powerable: true,
      levelAdjustable: true,
      modeSelectable: false,
      moveable: false,
      consoleControllable: false,
      playbackControllable: true,
      navigatable: false,
      colorControllable: false,
    },
    powerState: 'off',
    // Volume maps to level (0-100 = 0.0-1.0 in Unity)
    level: { current: 50, min: 0, max: 100, step: 10, unit: '%' },
    playbackState: { status: 'stopped', isMuted: false, position: 0 },
  },
];

const created = await Device.insertMany(devices);
console.log(`Seeded ${created.length} devices:`);
created.forEach((d) => console.log(`  ${d.name} (slug: ${d.slug}, _id: ${d._id})`));

await mongoose.disconnect();
console.log('Done');
