import Profile from '../models/Profile.js';

// POST /profiles
export const createProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    if (!name)
      return res.status(400).json({ success: false, message: "Missing profile name" });

    const profile = await Profile.create({
      user: req.user._id,
      name,
      avatar,
    });

    return res.status(201).json({ success: true, profile });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// GET /profiles
export const getProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find({ user: req.user._id }).sort({ createdAt: 1 });
    return res.json({ success: true, profiles });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET /profiles/:id
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile)
      return res.status(404).json({ success: false, message: "Profile not found" });
    if (profile.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /profiles/:id
export const updateProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile)
      return res.status(404).json({ success: false, message: "Profile not found" });
    if (profile.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    const { name, avatar } = req.body;
    if (name)   profile.name   = name;
    if (avatar) profile.avatar = avatar;

    await profile.save();
    return res.json({ success: true, profile });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /profiles/:id
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile)
      return res.status(404).json({ success: false, message: "Profile not found" });
    if (profile.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    await profile.deleteOne();
    return res.json({ success: true, message: "Profile deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};