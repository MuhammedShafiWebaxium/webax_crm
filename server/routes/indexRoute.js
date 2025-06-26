import express from 'express';

const router = express.Router();

import { getDashboard, loginUser } from '../controllers/indexController.js';

import { requireAuth, isAuthenticated } from '../middleware/auth.js';

router.post('/login', loginUser);

// Get dashboard
router.get('/', requireAuth, isAuthenticated, getDashboard);

export default router;
