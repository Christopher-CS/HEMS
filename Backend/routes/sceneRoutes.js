import express from 'express';
import {
    createScene,
    getScenes,
    getScene,
    updateScene,
    deleteScene,
    executeScene,
    deactivateScene
} from '../controllers/sceneController.js'

const sceneRouter = express.Router();

// scene router
sceneRouter.post('/',              createScene);
sceneRouter.get('/',               getScenes);
sceneRouter.get('/:id',            getScene);
sceneRouter.put('/:id',            updateScene);
sceneRouter.delete('/:id',         deleteScene);
sceneRouter.post('/:id/execute',   executeScene);
sceneRouter.patch('/:id/deactivate', deactivateScene);  // sets isActive: false

export default sceneRouter