import express from 'express';

const router = express.Router();

import {
  getAllCompanies,
  createCompany,
  deleteCompany,
  getCompany,
  updateCompany,
} from '../controllers/companiesController.js';

import { isAuthorized, requireAuth } from '../middleware/auth.js';

router.use(requireAuth);

router.get('/', isAuthorized('companies', 'read'), getAllCompanies);

router.post('/', isAuthorized('companies', 'create'), createCompany);

router.patch('/:id', isAuthorized('companies', 'update'), updateCompany);

router.delete('/:id', isAuthorized('companies', 'delete'), deleteCompany);

router.get('/:id', isAuthorized('companies', 'read'), getCompany);

export default router;
