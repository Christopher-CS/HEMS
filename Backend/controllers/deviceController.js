import Device from '../models/Device.js'

const validateData = (data) => {
    if (!data.name) throw new Error("Missing device name");
    if (!data.owner) throw new Error("Missing owner");
    if (!data.capabilities) throw new Error("Missing capabilities");

    if (data.capabilities.powerable && data.powerState === undefined)
        throw new Error("Missing powerState");
    if (data.capabilities.levelAdjustable && !data.level)
        throw new Error("Missing level");
    if (data.capabilities.modeSelectable && !data.mode)
        throw new Error("Missing modes");
    if (data.capabilities.moveable && !data.position)
        throw new Error("Missing position");
    if (data.capabilities.consoleControllable && !data.consoleState)
        throw new Error("Missing consoleState");
};

const cleanData = (data) => {
    const cleaned = { ...data };
    if (!data.capabilities.powerable)        delete cleaned.powerState;
    if (!data.capabilities.levelAdjustable)  delete cleaned.level;
    if (!data.capabilities.modeSelectable)   delete cleaned.mode;
    if (!data.capabilities.moveable)         delete cleaned.position;
    if (!data.capabilities.consoleControllable) delete cleaned.consoleState;
    return cleaned;
};



// POST /devices
export const addDevice = async (req, res) => {
    try {
        const data = req.body;
        validateData(data);
        const device = await Device.create(cleanData(data));
        return res.status(201).json({ success: true, device });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// GET /devices
export const getDevices = async (req, res) => {
    try {
        const devices = await Device.find({ owner: req.user._id }).sort({ createdAt: -1 });
        return res.json({ success: true, devices });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /devices/:id
export const getDevice = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);

        if (!device)
            return res.status(404).json({ success: false, message: "Device not found" });
        
        if (device.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: "Not authorized" });
        
        return res.json({ success: true, device });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// GET /devices/:id/state
export const getDeviceState = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id).select(
            "isOnline lastSeen powerState level mode position consoleState"
        );

        if (!device)
            return res.status(404).json({ success: false, message: "Device not found" });

        if (device.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: "Not authorized" });

        return res.json({ success: true, state: device });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /devices/:id
export const updateDevice = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device)
            return res.status(404).json({ success: false, message: "Device not found" });
        if (device.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: "Not authorized" });

        const allowed = ["name", "capabilities", "level", "mode", "position", "consoleState"];
        allowed.forEach((key) => {
            if (req.body[key] !== undefined) device[key] = req.body[key];
        });

        await device.save();
        return res.json({ success: true, device });
    } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
};

// PATCH /devices/:id/status
export const updateDeviceStatus = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device)
            return res.status(404).json({ success: false, message: "Device not found" });

        device.isOnline = req.body.isOnline ?? device.isOnline;
        device.lastSeen = new Date();
        await device.save();

        return res.json({ success: true, device });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /devices/:id
export const deleteDevice = async (req, res) => {
    try {
        const device = await Device.findById(req.params.id);
        if (!device)
            return res.status(404).json({ success: false, message: "Device not found" });
        if (device.owner.toString() !== req.user._id.toString())
            return res.status(403).json({ success: false, message: "Not authorized" });

        await device.deleteOne();
        return res.json({ success: true, message: "Device deleted" });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};