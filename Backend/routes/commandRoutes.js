import express from 'express';
import {
    executeCommand
} from '../controllers/commandController.js'

const commandRouter = express.Router();

commandRouter.post('/', executeCommand);

export default commandRouter