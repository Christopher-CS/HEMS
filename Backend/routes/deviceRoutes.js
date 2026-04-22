import express from 'express';
import {
    addDevice,
    getDevices,
    getDevice,
    getDeviceState,
    updateDevice,
    updateDeviceStatus,
    deleteDevice,
} from '../controllers/deviceController.js';

const deviceRouter = express.Router();

deviceRouter.post('/',          addDevice);
deviceRouter.get('/',           getDevices);
deviceRouter.get('/:id',        getDevice);
deviceRouter.get('/:id/state',  getDeviceState);
deviceRouter.put('/:id',        updateDevice);
deviceRouter.patch('/:id/status', updateDeviceStatus);
deviceRouter.delete('/:id',     deleteDevice);

export default deviceRouter;