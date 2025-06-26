import express from 'express';

const router = express.Router();

import { isAuthorized, requireAuth } from '../middleware/auth.js';

import {
  getTodosDashboardData,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
  markTodoCompleted,
} from '../controllers/todosController.js';

router.use(requireAuth);

// Get dashboard data for todos (default route)
router.get('/', isAuthorized('todos', 'read'), getTodosDashboardData);

// Get details of a specific todo
router.get('/:id', isAuthorized('todos', 'read'), getTodo);

// Create a new todo
router.post('/', isAuthorized('todos', 'create'), createTodo);

// Update a specific todo
router.patch('/:id', isAuthorized('todos', 'update'), updateTodo);

// Mark a todo as completed
router.patch('/:id/complete', isAuthorized('todos', 'read'), markTodoCompleted);

// Delete a specific todo
router.delete('/:id', isAuthorized('todos', 'delete'), deleteTodo);

export default router;
