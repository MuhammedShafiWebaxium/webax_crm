import express from 'express';

const router = express.Router();

import { isAuthorized, requireAuth } from '../middleware/auth.js';

import {
  getAllUsers,
  getUserFormData,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js';

router.use(requireAuth);

// List all users
router.get('/', isAuthorized('users', 'read'), getAllUsers);

// Get crate user formdata
router.get('/form', isAuthorized('users', 'create'), getUserFormData);

// Create a new user
router.post('/', isAuthorized('users', 'create'), createUser);

// Get details of a specific user
router.get('/:id', isAuthorized('users', 'read'), getUser);

// Update a specific user
router.patch('/:id', isAuthorized('users', 'update'), updateUser);

// Delete a specific user
router.delete('/:id', isAuthorized('users', 'delete'), deleteUser);

export default router;
