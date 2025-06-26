import Todos from '../models/todo.js';
import mongoose from 'mongoose';
import { getAllUsersHelper, isValidObjectId } from '../helper/index.js';

export const getTodosDashboardData = async (req, res, next) => {
  try {
    const {
      user: { userId, company, role },
    } = req;

    let users = null;

    const canAssign = role.permissions.todos.assign;

    if (canAssign) {
      users = await getAllUsersHelper(userId, company, null, { name: 1 });
    }

    const todos = await Todos.aggregate([
      {
        $match: {
          status: { $ne: 'Deleted' },
          company,
          $or: [
            { createdBy: new mongoose.Types.ObjectId(userId) },
            { assignedTo: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'createdBy',
          pipeline: [
            {
              $project: { name: 1 },
            },
          ],
        },
      },
      {
        $unwind: '$createdBy',
      },
      {
        $lookup: {
          from: 'users',
          localField: 'assignedTo',
          foreignField: '_id',
          as: 'assignedTo',
          pipeline: [
            {
              $project: { name: 1 },
            },
          ],
        },
      },
    ]);

    res.status(200).json({ status: 'success', users, todos });
  } catch (err) {
    next(err);
  }
};

export const getTodo = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};

export const createTodo = async (req, res, next) => {
  try {
    const {
      user: { userId, role, company },
      body: {
        name,
        type,
        teamName,
        startDate,
        endDate,
        priority,
        description,
        assignTo = [],
        checklist = [],
      },
    } = req;

    if (
      !name ||
      !type ||
      !startDate ||
      !endDate ||
      !description ||
      !priority ||
      (type === 'Assigned' && assignTo?.length > 1 && !teamName)
    ) {
      throw new Error('Missing required fields');
    }

    const canAssign = role.permissions.todos.assign;
    // const canCreate = role.permissions.todos.assign;
    const assignedTo = [];

    if (type === 'Assigned') {
      if (!canAssign)
        throw new Error('Insufficient permissions to assign tasks');
      if (!Array.isArray(assignTo) || assignTo.length === 0)
        throw new Error('Assigned tasks must have assignees');

      assignTo.forEach((entry) => {
        if (!isValidObjectId(entry?.value))
          throw new Error(`Invalid user ID: ${entry?.value}`);

        assignedTo.push(entry.value);
      });
    }

    const todo = await Todos.create({
      name,
      type,
      company,
      createdBy: userId,
      teamName,
      startDate,
      endDate,
      priority,
      description,
      assignedTo,
      checklist: Array.isArray(checklist)
        ? checklist.map((entry) => ({ title: entry.value }))
        : [],
    });

    res.status(201).json({ status: 'success', todo });
  } catch (err) {
    next(err);
  }
};

export const updateTodo = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, role, company },
      body: {
        name,
        type,
        teamName,
        startDate,
        endDate,
        priority,
        description,
        assignTo = [],
        checklist = [],
      },
    } = req;

    if (
      !id ||
      !name ||
      !type ||
      !startDate ||
      !endDate ||
      !description ||
      !priority ||
      (type === 'Assigned' && assignTo?.length > 1 && !teamName)
    ) {
      throw new Error('Missing required fields');
    }

    if (!isValidObjectId(id)) throw new Error('Invalid Task ID');

    const canOnlySeeAssignedTodos = role.permissions.todos.assignedOnly;

    const query = { _id: id, company, status: 'Active' };

    if (canOnlySeeAssignedTodos) {
      query.createdBy = userId;
    }

    const isTodoExist = await Todos.findOne(query);

    if (!isTodoExist) throw new Error('Todo not found');

    const canAssign = role.permissions.todos.assign;

    const assignedTo = [];

    if (type === 'Assigned') {
      if (!canAssign)
        throw new Error('Insufficient permissions to assign tasks');
      if (!Array.isArray(assignTo) || assignTo.length === 0)
        throw new Error('Assigned tasks must have assignees');

      assignTo.forEach((entry) => {
        if (!isValidObjectId(entry?.value))
          throw new Error(`Invalid user ID: ${entry?.value}`);

        assignedTo.push(entry.value);
      });
    }

    isTodoExist.name = name;
    isTodoExist.type = type;
    isTodoExist.teamName = teamName;
    isTodoExist.startDate = startDate;
    isTodoExist.endDate = endDate;
    isTodoExist.priority = priority;
    isTodoExist.description = description;
    isTodoExist.assignedTo = assignedTo;
    isTodoExist.checklist = Array.isArray(checklist)
      ? checklist.map((entry) => ({ title: entry.value }))
      : [];

    await isTodoExist.save();

    const updatedTodo = await Todos.findById(isTodoExist._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(200).json({ status: 'success', todo: updatedTodo });
  } catch (err) {
    next(err);
  }
};

export const markTodoCompleted = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, company, role },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid Task ID');

    const canOnlySeeAssignedTodos = role.permissions.todos.assignedOnly;

    const query = { _id: id, company, status: 'Active' };

    if (canOnlySeeAssignedTodos) {
      query.createdBy = userId;
    }

    const isTodoExist = await Todos.findOne(query);

    if (!isTodoExist) throw new Error('Todo not found');

    isTodoExist.status = 'Completed';
    isTodoExist.completedBy = userId;

    await isTodoExist.save();

    res.status(200).json({ status: 'success', todo: isTodoExist });
  } catch (err) {
    next(err);
  }
};

export const deleteTodo = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, company, role },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid Task ID');

    const canOnlySeeAssignedTodos = role.permissions.todos.assignedOnly;

    const query = { _id: id, company, status: 'Active' };

    if (canOnlySeeAssignedTodos) {
      query.createdBy = userId;
    }

    const isTodoExist = await Todos.findOne(query);

    if (!isTodoExist) throw new Error('The task is not found');

    isTodoExist.deletedBy = userId;
    isTodoExist.status = 'Deleted';

    await isTodoExist.save();
    res
      .status(200)
      .json({ status: 'success', message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};
