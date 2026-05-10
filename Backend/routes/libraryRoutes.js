import express from 'express';
import { getLibrary } from '../controllers/libraryController.js';

const libraryRouter = express.Router();

libraryRouter.get('/', getLibrary);

export default libraryRouter;
