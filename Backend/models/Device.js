import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    owner: { type: String, required: true, ref: 'User' },

    // IDevice
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date },
    
    // Device Interfaces
    capabilities: {
        powerable: { type: Boolean, default: false },
        levelAdjustable: { type: Boolean, default: false },
        modeSelectable: { type: Boolean, default: false },
        moveable: { type: Boolean, default: false },
        consoleControllable: { type: Boolean, default: false },
    },

    // IPowerable
    powerState: {
        type: String,
        enum: ["on", "off", "standby"],
        default: "off",
    },

    // ILevelAdjustable
    // (volume, brightness, temp, etc.)
    level: {
        current: { type: Number, default: 0 },
        min: { type: Number, default: 0 },
        max: { type: Number, default: 100 },
        unit: { type: String, default: "%" },
    },

    // IModeSelectable
    mode: {
        current: String,
        availableModes: [String],
    },

    // IMoveable
    position: {
        current: Number, // angle, height, etc.
        min: Number,
        max: Number,
    },

    // IConsoleControllable
    consoleState: {
        currentApp: String,
        availableApps: [String],
    },
}, {timestamps: true, minimize: false});

const Device = mongoose.model('Device', deviceSchema);

export default Device