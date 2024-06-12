// This is the main routing file for the application. It will be used to define all the routes for the application. Main application will call this file.

import userRoutes from './user.routes.js'
import threadRoutes from './thread.routes.js'
import { Router } from 'express'

const router = Router();

router.use('/user', userRoutes); // This will handle all routes to /api/v1/user/*

router.use('/threads', threadRoutes);

export default router;