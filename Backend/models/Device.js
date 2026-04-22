import mongoose from 'mongoose';

const modeItemSchema = {
    id:    { type: String, required: true },
    label: { type: String, required: true }
};

const appItemSchema = {
  id:    { type: String, required: true },
  label: { type: String, required: true }
};

const deviceSchema = new mongoose.Schema({
    name:  { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },

    type: {
        type: String,
        enum: ["light", "tv", "speaker", "fan", "thermostat", "blind", "projector", "camera", "aircon"],
        required: true,
    },

    // IDevice
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },

    // capabilities
    capabilities: {
        powerable:            { type: Boolean, default: false },
        levelAdjustable:      { type: Boolean, default: false },
        modeSelectable:       { type: Boolean, default: false },
        moveable:             { type: Boolean, default: false },
        consoleControllable:  { type: Boolean, default: false },
        playbackControllable: { type: Boolean, default: false },
        navigatable:          { type: Boolean, default: false },
    },

    // IPowerable
    powerState: {
        type: String,
        enum: ["on", "off", "standby"],
        default: "off",
    },

    // ILevelAdjustable
    level: {
        current: { type: Number, default: 0 },
        min:     { type: Number, default: 0 },
        max:     { type: Number, default: 100 },
        step:    { type: Number, default: 1 },
        unit:    { type: String, default: "%" },
    },

    // IModeSelectable
    mode: {
        current: String,
        available: [modeItemSchema],
    },

    // IMoveable
    position: {
        current: { type: Number, default: 0 },
        min:     { type: Number, default: 0 },
        max:     { type: Number, default: 100 },
        step:    { type: Number, default: 1 },
        unit:    { type: String, default: "%" },
    },

    // IConsoleControllable
    consoleState: {
        currentApp:    String,
        availableApps: [appItemSchema],
    },

    // IPlaybackControllable
    playbackState: {
        status: {
            type: String,
            enum: ["playing", "paused", "stopped", "fast-forwarding", "rewinding"],
            default: "stopped",
        },
        isMuted:  { type: Boolean, default: false },
        position: { type: Number, default: 0 },  // seconds into current media
    },

    // INavigatable
    navigationState: {
        cursorVisible: { type: Boolean, default: false },
    },

}, { timestamps: true, minimize: false });

const Device = mongoose.model('Device', deviceSchema);
export default Device;