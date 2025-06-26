import express from 'express';

import { isAuthenticated, requireAuth } from '../middleware/auth.js';

import { sentItTicket } from '../controllers/ticketsController.js';

const router = express.Router();

router.post('/sent-it-ticket', requireAuth, isAuthenticated, sentItTicket);

export default router;
