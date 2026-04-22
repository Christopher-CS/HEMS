import Command from '../models/Command.js'
import Device from '../models/Device.js'

const capabilityMap = {
    // existing
    power:        "powerable",
    togglePower:  "powerable",
    setLevel:     "levelAdjustable",
    incrementLevel: "levelAdjustable",
    decrementLevel: "levelAdjustable",
    setMode:      "modeSelectable",
    cycleMode:    "modeSelectable",
    move:         "moveable",
    launchApp:    "consoleControllable",
    // new
    playback:     "playbackControllable",
    toggleMute:   "playbackControllable",
    navigate:     "navigatable",
};

const payloadValidators = {
    // existing
    power: (payload) => {
        if (!["on", "off", "standby"].includes(payload?.powerState))
        throw new Error("Invalid powerState");
    },
    togglePower: () => {},  // no payload needed
    setLevel: (payload, device) => {
        const v = payload?.value;
        if (v == null) throw new Error("Missing level value");
        if (v < device.level.min || v > device.level.max)
        throw new Error(`Level must be between ${device.level.min} and ${device.level.max}`);
    },
    incrementLevel: () => {},
    decrementLevel: () => {},
    setMode: (payload, device) => {
        const valid = device.mode.available.map(m => m.id);
        if (!payload?.mode) throw new Error("Missing mode");
        if (!valid.includes(payload.mode))
        throw new Error(`Invalid mode. Available: ${valid.join(", ")}`);
    },
    cycleMode: () => {},
    move: (payload, device) => {
        const p = payload?.position;
        if (p == null) throw new Error("Missing position value");
        if (p < device.position.min || p > device.position.max)
        throw new Error(`Position must be between ${device.position.min} and ${device.position.max}`);
    },
    launchApp: (payload, device) => {
        const valid = device.consoleState.availableApps.map(a => a.id);
        if (!payload?.app) throw new Error("Missing app");
        if (!valid.includes(payload.app))
        throw new Error(`Invalid app. Available: ${valid.join(", ")}`);
    },
    // new
    playback: (payload) => {
        const valid = ["play", "pause", "stop", "fastforward", "rewind"];
        if (!valid.includes(payload?.action))
        throw new Error(`Invalid playback action. Valid: ${valid.join(", ")}`);
    },
    toggleMute: () => {},
    navigate: (payload) => {
        const valid = ["up", "down", "left", "right", "select", "back", "home", "menu"];
        if (!valid.includes(payload?.direction))
        throw new Error(`Invalid direction. Valid: ${valid.join(", ")}`);
  },
};

const applyPayload = {
    // existing
    power:     (payload, device) => { device.powerState = payload.powerState; },
    togglePower: (_, device) => {
        device.powerState = device.powerState === "off" ? "on" : "off";
    },
    setLevel:  (payload, device) => { device.level.current = payload.value; },
    incrementLevel: (_, device) => {
        device.level.current = Math.min(device.level.current + device.level.step, device.level.max);
    },
    decrementLevel: (_, device) => {
        device.level.current = Math.max(device.level.current - device.level.step, device.level.min);
    },
    setMode:   (payload, device) => { device.mode.current = payload.mode; },
    cycleMode: (_, device) => {
        const ids = device.mode.available.map(m => m.id);
        const currentIndex = ids.indexOf(device.mode.current);
        device.mode.current = ids[(currentIndex + 1) % ids.length];
    },
    move:      (payload, device) => { device.position.current = payload.position; },
    launchApp: (payload, device) => { device.consoleState.currentApp = payload.app; },
    // new
    playback: (payload, device) => {
        const statusMap = {
        play:        "playing",
        pause:       "paused",
        stop:        "stopped",
        fastforward: "fast-forwarding",
        rewind:      "rewinding",
        };
        device.playbackState.status = statusMap[payload.action];
    },
    toggleMute: (_, device) => {
        device.playbackState.isMuted = !device.playbackState.isMuted;
    },
    navigate: () => {
        // navigation is stateless — the command is the signal,
        // nothing to persist on the device doc
    },
};


export const executeCommand = async (req, res) => {
    const { device, issuedBy, type, payload } = req.body;
    let status = "failed";
    let errorMessage = null;

    try {
        // Validate type
        if (!capabilityMap[type])
            throw new Error("Unknown command type");

        // Fetch device
        const deviceDoc = await Device.findById(device);
        if (!deviceDoc) throw new Error("Device not found");

        // Validate payload
        payloadValidators[type](payload, deviceDoc);

        // Apply state change
        applyPayload[type](payload, deviceDoc);
        deviceDoc.isOnline = true;
        deviceDoc.lastSeen = new Date();
        await deviceDoc.save();

        status = "executed";

        const command = await Command.create({
            device,
            issuedBy,
            type,
            payload,
            status,
            executedAt: new Date(),
        });

        return res.json({
            success: true,
            message: "Command executed successfully",
            command,
            device: deviceDoc,
        });

    } catch (err) {
        errorMessage = err.message;

        try {
            await Command.create({
                device,
                issuedBy,
                type,
                payload,
                status: "failed",
                executedAt: new Date(),
            });
        } catch (logErr) {
            console.error("Failed to log failed command:", logErr.message);
        }

        return res.status(400).json({
            success: false,
            message: errorMessage,
        });
    }
}