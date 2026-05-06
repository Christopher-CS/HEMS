import express from 'express';
import {
  createProfile,
  getProfiles,
  getProfile,
  updateProfile,
  deleteProfile,
} from '../controllers/profileController.js';

const profileRouter = express.Router();

profileRouter.post('/',     createProfile);
profileRouter.get('/',      getProfiles);
profileRouter.get('/:id',   getProfile);
profileRouter.put('/:id',   updateProfile);
profileRouter.delete('/:id',deleteProfile);

export default profileRouter;