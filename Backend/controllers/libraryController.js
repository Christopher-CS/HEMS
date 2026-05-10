import { libraryPayload } from '../data/mediaLibrary.js';

/** GET /api/library — body matches mobile RawLibraryPayload / mapLibraryPayload */
export const getLibrary = async (_req, res) => {
  try {
    res.json(libraryPayload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
