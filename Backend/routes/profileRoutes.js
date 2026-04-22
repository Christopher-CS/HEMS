import express from 'express';
import {
    addProfile
} from '../controllers/profileController.js'

const profileRouter = express.Router();

profileRouter.post('/add', addProfile)

export default profileRouter