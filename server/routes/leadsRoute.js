import express from 'express';

const router = express.Router();

import { isAuthorized, requireAuth } from '../middleware/auth.js';

import {
  getAllLeads,
  getLeadFormData,
  createLead,
  getLead,
  updateLead,
  deleteLead,
  followupLead,
  setAssignee,
} from '../controllers/leadsController.js';

router.use(requireAuth);

// List all leads
router.get('/', isAuthorized('leads', 'read'), getAllLeads);

// Get crate lead formdata
router.get('/form', isAuthorized('leads', 'create'), getLeadFormData);

// Create a new lead
router.post('/', isAuthorized('leads', 'create'), createLead);

// Get details of a specific lead
router.get('/:id', isAuthorized('leads', 'read'), getLead);

// Update a specific lead
router.patch('/:id', isAuthorized('leads', 'update'), updateLead);

// Delete a specific lead
router.delete('/:id', isAuthorized('leads', 'delete'), deleteLead);

// Followup a specific lead
router.patch('/:id/followup', isAuthorized('leads', 'followup'), followupLead);

// Reassign a specific lead
router.patch('/:id/set-assignee', isAuthorized('leads', 'assign'), setAssignee);

export default router;
