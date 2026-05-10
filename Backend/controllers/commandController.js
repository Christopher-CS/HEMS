import mongoose from 'mongoose';
import Command from '../models/Command.js'
import Device from '../models/Device.js'
import { broadcast } from '../ws.js'

export const capabilityMap = {
    // existing
    power:        "powerable",
    togglePower:  "powerable",
    setLevel:     "levelAdjustable",
    incrementLevel: "levelAdjustable",
    decrementLevel: "levelAdjustable",
    incrementChannel: "navigatable",
    decrementChannel: "navigatable",
    setChannel: "navigatable",
    setMode:      "modeSelectable",
    cycleMode:    "modeSelectable",
    move:         "moveable",
    launchApp:    "consoleControllable",
    // new
    playback:           "playbackControllable",
    playMedia:          "playbackControllable",
    toggleMute:         "playbackControllable",
    navigate:           "navigatable",
    setColorMode:       "colorControllable",
    setColorTemperature:"colorControllable",
    setHue:             "colorControllable",
    setSaturation:      "colorControllable",
};

export const payloadValidators = {
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
    incrementChannel: () => {},
    decrementChannel: () => {},
    setChannel: (payload) => {
        const value = payload?.channel;
        if (value == null) throw new Error("Missing channel");
        if (!Number.isInteger(value) || value < 1 || value > 999)
            throw new Error("Channel must be an integer between 1 and 999");
    },
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
        const valid = ["play", "pause", "stop", "fastforward", "rewind", "seek"];
        if (!valid.includes(payload?.action))
        throw new Error(`Invalid playback action. Valid: ${valid.join(", ")}`);
    },
    toggleMute: () => {},
    navigate: (payload) => {
        const valid = ["up", "down", "left", "right", "select", "back", "home", "menu"];
        if (!valid.includes(payload?.direction))
            throw new Error(`Invalid direction. Valid: ${valid.join(", ")}`);
    },
    setColorMode: (payload) => {
        if (!['white', 'color'].includes(payload?.mode))
            throw new Error("Invalid color mode. Must be 'white' or 'color'");
    },
    setColorTemperature: (payload) => {
        const k = payload?.kelvin;
        if (k == null) throw new Error("Missing kelvin value");
        if (k < 2700 || k > 6500) throw new Error("Kelvin must be between 2700 and 6500");
    },
    setHue: (payload) => {
        const h = payload?.hue;
        if (h == null) throw new Error("Missing hue value");
        if (h < 0 || h > 359) throw new Error("Hue must be between 0 and 359");
    },
    setSaturation: (payload) => {
        const s = payload?.saturation;
        if (s == null) throw new Error("Missing saturation value");
        if (s < 0 || s > 100) throw new Error("Saturation must be between 0 and 100");
    },
    playMedia: (payload) => {
        if (!payload?.mediaId) throw new Error("Missing mediaId");
    },
};

export const applyPayload = {
    // existing
    power:     (payload, device) => {
        device.powerState = payload.powerState;
        if (device.type === 'tv' && payload.powerState === 'on') {
            device.consoleState.currentApp = '';
        }
    },
    togglePower: (_, device) => {
        device.powerState = device.powerState === "off" ? "on" : "off";
        if (device.type === 'tv' && device.powerState === 'on') {
            device.consoleState.currentApp = '';
        }
    },
    setLevel:  (payload, device) => { device.level.current = payload.value; },
    incrementLevel: (_, device) => {
        device.level.current = Math.min(device.level.current + device.level.step, device.level.max);
    },
    decrementLevel: (_, device) => {
        device.level.current = Math.max(device.level.current - device.level.step, device.level.min);
    },
    incrementChannel: (_, device) => {
        if (!device.navigationState) device.navigationState = {};
        const current = device.navigationState?.currentChannel ?? 4;
        device.navigationState.currentChannel = Math.min(current + 1, 999);
    },
    decrementChannel: (_, device) => {
        if (!device.navigationState) device.navigationState = {};
        const current = device.navigationState?.currentChannel ?? 4;
        device.navigationState.currentChannel = Math.max(current - 1, 1);
    },
    setChannel: (payload, device) => {
        if (!device.navigationState) device.navigationState = {};
        device.navigationState.currentChannel = payload.channel;
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
        if (statusMap[payload.action]) {
            device.playbackState.status = statusMap[payload.action];
        }
        if (payload.action === 'seek' && typeof payload.positionSeconds === 'number') {
            device.playbackState.position = payload.positionSeconds;
        }
    },
    toggleMute: (_, device) => {
        device.playbackState.isMuted = !device.playbackState.isMuted;
    },
    navigate: (payload, device) => {
        if (device.type !== 'tv') return;
        if (payload?.direction === 'home' && device.consoleState) {
            device.consoleState.currentApp = '';
        }
    },
    setColorMode:        (payload, device) => { device.colorState.mode = payload.mode; },
    setColorTemperature: (payload, device) => { device.colorState.kelvin = payload.kelvin; },
    setHue:              (payload, device) => { device.colorState.hue = payload.hue; },
    setSaturation:       (payload, device) => { device.colorState.saturation = payload.saturation; },
    playMedia: (payload, device) => {
        device.playbackState.status = "playing";
        device.playbackState.position = 0;
        device.playbackState.nowPlaying = {
            mediaId: payload.mediaId,
            title: payload.metadata?.title,
            artworkUrl: payload.metadata?.artworkUrl,
            audioUrl: payload.metadata?.audioUrl,
        };
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

        // Fetch device by _id or slug
        const deviceDoc = mongoose.isValidObjectId(device)
            ? (await Device.findById(device)) ?? (await Device.findOne({ slug: device }))
            : await Device.findOne({ slug: device });
        if (!deviceDoc) throw new Error("Device not found");

        // Validate payload
        payloadValidators[type](payload, deviceDoc);

        // Apply state change
        applyPayload[type](payload, deviceDoc);
        deviceDoc.isOnline = true;
        deviceDoc.lastSeen = new Date();
        await deviceDoc.save();

        if (
            deviceDoc.slug === 'living-room-tv' &&
            (type === 'power' || type === 'togglePower')
        ) {
            console.log(`[TV POWER] slug=${deviceDoc.slug} powerState=${deviceDoc.powerState}`);
        }

        if (deviceDoc.slug === 'living-room-tv' && type === 'playMedia') {
            console.log(
                `[TV PLAYBACK] slug=${deviceDoc.slug} mediaId=${deviceDoc.playbackState?.nowPlaying?.mediaId ?? ''} ` +
                `status=${deviceDoc.playbackState?.status ?? 'stopped'} ` +
                `audioUrl=${deviceDoc.playbackState?.nowPlaying?.audioUrl ?? ''} ` +
                `artworkUrl=${deviceDoc.playbackState?.nowPlaying?.artworkUrl ?? ''}`
            );
        }

        if (deviceDoc.slug === 'living-room-tv' && type === 'playback') {
            console.log(
                `[TV PLAYBACK] slug=${deviceDoc.slug} status=${deviceDoc.playbackState?.status ?? 'stopped'} ` +
                `position=${deviceDoc.playbackState?.position ?? 0} ` +
                `audioUrl=${deviceDoc.playbackState?.nowPlaying?.audioUrl ?? ''}`
            );
        }

        status = "executed";

        broadcast({
            event: 'device:state',
            slug: deviceDoc.slug,
            powerState: deviceDoc.powerState,
            levelCurrent: deviceDoc.level?.current ?? 0,
            colorMode: deviceDoc.colorState?.mode ?? 'white',
            colorHue: deviceDoc.colorState?.hue ?? 0,
            colorSaturation: deviceDoc.colorState?.saturation ?? 0,
            colorKelvin: deviceDoc.colorState?.kelvin ?? 4000,
            modeCurrent: deviceDoc.mode?.current ?? '',
            playbackStatus: deviceDoc.playbackState?.status ?? 'stopped',
            playbackMuted: deviceDoc.playbackState?.isMuted ?? false,
            playbackPosition: deviceDoc.playbackState?.position ?? 0,
            artworkUrl: deviceDoc.playbackState?.nowPlaying?.artworkUrl ?? '',
            audioUrl: deviceDoc.playbackState?.nowPlaying?.audioUrl ?? '',
            consoleApp: deviceDoc.consoleState?.currentApp ?? '',
            currentChannel: deviceDoc.navigationState?.currentChannel ?? 4,
        });

        const command = await Command.create({
            device: deviceDoc._id,
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
                device: typeof device === 'string' && mongoose.isValidObjectId(device)
                    ? device
                    : undefined,
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
