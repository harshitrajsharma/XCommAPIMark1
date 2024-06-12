// Extracted routere logic for creating routes
import { Router } from 'express'
import { createThread, getThread, latestThreads, pagedSearchThreads, pagedThreads, searchedThreads, trendingThreads } from '../controllers/thread.controller.js';
import verifyJWT from '../middlewares/authMiddleware.js';

const router = Router();

// api endpoint to create a new thread
router.post('/create-thread', verifyJWT, createThread );

// api endpoint to get latest threads on the platform
router.post('/latest-threads', latestThreads );

// api endpoint to get trending threads on the platform
router.get('/trending-threads', trendingThreads );

// api endpoint to search threads on the platform
router.post('/search-threads', searchedThreads );

// api endpoint to get the total number of threads on the platform
router.post('/all-latest-threads-count', pagedThreads );

// api endpoint to get the total number of matched searched threads on the platform
router.post('/search-threads-count', pagedSearchThreads );

// api endpoint to get the particualr thread content by id
router.post('/get-thread', getThread )





export default router;