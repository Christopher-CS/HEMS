import express from 'express';
import { protect } from '../middleware/auth.js'
import {
    addDevice
} from '../conrollers/deviceController.js'

const deviceRouter = express.Router();

deviceRouter.post('/add', protect, addDevice);

export default deviceRouter