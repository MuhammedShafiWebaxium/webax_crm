import express from 'express';

import {
  activateIntegration,
  activateRole,
  createAdAccount,
  createRole,
  deleteIntegration,
  deleteRole,
  getAllIntegrations,
  getAllRoles,
  getIntegration,
  updateAdAccount,
  updateRole,
} from '../controllers/settingsController.js';

import { isAuthorized, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// List all roles
router.get('/roles', isAuthorized('settings', 'read'), getAllRoles);

// Create a new role
router.post('/roles', isAuthorized('settings', 'create'), createRole);

// Update a specific role
router.patch('/roles/:id', isAuthorized('settings', 'update'), updateRole);

// Delete a specific role
router.delete('/roles/:id', isAuthorized('settings', 'delete'), deleteRole);

// Activate a deleted role
router.patch(
  '/roles/:id/activate',
  isAuthorized('settings', 'update'),
  activateRole
);

// List all integrations
router.get(
  '/integrations',
  isAuthorized('settings', 'read'),
  getAllIntegrations
);

// Create a new ad account
router.post(
  '/integrations/ad-account',
  isAuthorized('settings', 'create'),
  createAdAccount
);

router.get(
  '/integrations/:id',
  isAuthorized('settings', 'read'),
  getIntegration
);

router.patch(
  '/integrations/ad-account/:id',
  isAuthorized('settings', 'update'),
  updateAdAccount
);

// Delete a specific integration
router.delete(
  '/integrations/:id',
  isAuthorized('settings', 'delete'),
  deleteIntegration
);

// Activate a deleted integration
router.patch(
  '/integrations/:id/activate',
  isAuthorized('settings', 'update'),
  activateIntegration
);

export default router;
