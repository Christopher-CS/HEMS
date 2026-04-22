import Scene from '../models/Scene.js';
import Device from '../models/Device.js';
import Command from '../models/Command.js';
import { capabilityMap, payloadValidators, applyPayload } from './commandController.js';

// POST /scenes
export const createScene = async (req, res) => {
  try {
    const { name, actions } = req.body;

    if (!name) return res.status(400).json({ success: false, message: "Missing scene name" });
    if (!actions?.length) return res.status(400).json({ success: false, message: "Scene must have at least one action" });

    // validate all devices and action types before creating
    for (const action of actions) {
      if (!capabilityMap[action.type])
        return res.status(400).json({ success: false, message: `Unknown command type: ${action.type}` });

      const deviceDoc = await Device.findById(action.device);
      if (!deviceDoc)
        return res.status(404).json({ success: false, message: `Device ${action.device} not found` });
      if (deviceDoc.owner.toString() !== req.user._id.toString())
        return res.status(403).json({ success: false, message: `Not authorized to use device ${deviceDoc.name}` });
      if (!deviceDoc.capabilities[capabilityMap[action.type]])
        return res.status(400).json({ success: false, message: `Device ${deviceDoc.name} does not support ${action.type}` });

      payloadValidators[action.type](action.payload, deviceDoc);
    }

    const scene = await Scene.create({
      name,
      owner: req.user._id,
      actions,
    });

    return res.status(201).json({ success: true, scene });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /scenes
export const getScenes = async (req, res) => {
  try {
    const scenes = await Scene.find({ owner: req.user._id })
      .populate('actions.device', 'name type')
      .sort({ createdAt: -1 });

    return res.json({ success: true, scenes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /scenes/:id
export const getScene = async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id)
      .populate('actions.device', 'name type capabilities');

    if (!scene)
      return res.status(404).json({ success: false, message: "Scene not found" });
    if (scene.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    return res.json({ success: true, scene });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /scenes/:id
export const updateScene = async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene)
      return res.status(404).json({ success: false, message: "Scene not found" });
    if (scene.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { name, actions } = req.body;

    if (actions?.length) {
      for (const action of actions) {
        if (!capabilityMap[action.type])
          return res.status(400).json({ success: false, message: `Unknown command type: ${action.type}` });

        const deviceDoc = await Device.findById(action.device);
        if (!deviceDoc)
          return res.status(404).json({ success: false, message: `Device ${action.device} not found` });
        if (deviceDoc.owner.toString() !== req.user._id.toString())
          return res.status(403).json({ success: false, message: `Not authorized to use device ${deviceDoc.name}` });
        if (!deviceDoc.capabilities[capabilityMap[action.type]])
          return res.status(400).json({ success: false, message: `Device ${deviceDoc.name} does not support ${action.type}` });

        payloadValidators[action.type](action.payload, deviceDoc);
      }
      scene.actions = actions;
    }

    if (name) scene.name = name;
    await scene.save();

    return res.json({ success: true, scene });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /scenes/:id
export const deleteScene = async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene)
      return res.status(404).json({ success: false, message: "Scene not found" });
    if (scene.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    await scene.deleteOne();
    return res.json({ success: true, message: "Scene deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// POST /scenes/:id/execute
export const executeScene = async (req, res) => {
  const { issuedBy } = req.body;

  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene)
      return res.status(404).json({ success: false, message: "Scene not found" });
    if (scene.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    const sorted = [...scene.actions].sort((a, b) => a.order - b.order);
    const results = [];

    for (const action of sorted) {
      try {
        const deviceDoc = await Device.findById(action.device);
        if (!deviceDoc) throw new Error(`Device ${action.device} not found`);
        if (!deviceDoc.capabilities[capabilityMap[action.type]])
          throw new Error(`Device ${deviceDoc.name} does not support ${action.type}`);

        payloadValidators[action.type](action.payload, deviceDoc);
        applyPayload[action.type](action.payload, deviceDoc);
        deviceDoc.isOnline = true;
        deviceDoc.lastSeen = new Date();
        await deviceDoc.save();

        const command = await Command.create({
          device: action.device,
          issuedBy,
          type: action.type,
          payload: action.payload,
          status: "executed",
          executedAt: new Date(),
        });

        results.push({ success: true, device: deviceDoc.name, command });

      } catch (err) {
        await Command.create({
          device: action.device,
          issuedBy,
          type: action.type,
          payload: action.payload,
          status: "failed",
          executedAt: new Date(),
        }).catch(console.error);

        results.push({ success: false, device: action.device, message: err.message });
      }
    }

    scene.isActive = true;
    await scene.save();

    return res.json({ success: true, scene: scene.name, results });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /scenes/:id/deactivate
export const deactivateScene = async (req, res) => {
  try {
    const scene = await Scene.findById(req.params.id);
    if (!scene)
      return res.status(404).json({ success: false, message: "Scene not found" });
    if (scene.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    scene.isActive = false;
    await scene.save();

    return res.json({ success: true, scene });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};