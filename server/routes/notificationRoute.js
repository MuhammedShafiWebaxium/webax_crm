import express from 'express';

import { isAuthenticated, requireAuth } from '../middleware/auth.js';

import {
  getAllNotifications,
  markAllAsRead,
  markAsDelete,
  markAsRead,
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', requireAuth, isAuthenticated, getAllNotifications);

router.patch('/:id/mark-as-read', requireAuth, isAuthenticated, markAsRead);

router.patch('/mark-all-as-read', requireAuth, isAuthenticated, markAllAsRead);

router.delete('/:id/mark-as-delete', requireAuth, isAuthenticated, markAsDelete);

export default router;
