import mongoose from 'mongoose';
import {
  formateDashboardData,
  isValidObjectId,
} from '../helper/indexHelper.js';
import Settings from '../models/settings.js';
import Roles from '../models/roles.js';
import Users from '../models/user.js';
import Leads from '../models/lead.js';
import Companies from '../models/company.js';
import { endOfDay, format, startOfDay, subDays } from 'date-fns';

export const getAllRoles = async (req, res, next) => {
  try {
    const {
      user: { company },
    } = req;

    const roles = await Roles.find({ company }).populate('createdBy', 'name');

    res.status(200).json({ status: 'success', roles });
  } catch (err) {
    next(err);
  }
};

export const createRole = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      user: { userId, company },
      body: {
        name,
        users,
        leads,
        todos,
        settings,
        filters,
        exports,
        about,
        feedback,
      },
    } = req;

    if (!name.trim()) throw Error('Missing required fields');

    const newRole = new Roles({
      name,
      company,
      createdBy: userId,
    });

    const assignPermissions = (category, entries) => {
      if (Array.isArray(entries)) {
        entries.forEach((entry) => {
          newRole.permissions[category][entry] = true;
        });
      }
    };

    assignPermissions('users', users);
    assignPermissions('leads', leads);
    assignPermissions('todos', todos);
    assignPermissions('settings', settings);
    assignPermissions('filters', filters);
    assignPermissions('exports', exports);
    assignPermissions('about', about);
    assignPermissions('feedback', feedback);

    const role = await newRole.save({ session });

    await Companies.updateOne(
      { _id: company },
      { $push: { roles: role._id } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const roles = await Roles.find({ company }).populate('createdBy', 'name');
    res.status(200).json({ status: 'success', roles });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { company },
      body: {
        name,
        users = [],
        leads = [],
        todos = [],
        settings = [],
        filters = [],
        exports = [],
        about = [],
        feedback = [],
      },
    } = req;

    if (!name?.trim()) throw new Error('Missing required fields');
    if (!isValidObjectId(id)) throw new Error('Invalid role ID');

    const role = await Roles.findOne({ _id: id, company });
    if (!role) throw new Error('Role not found');

    role.name = name;

    // Helper to set permissions
    const updatePermissions = (target, source = [], fields = []) => {
      if (!target) return;
      fields.forEach((field) => {
        if (field in target) {
          target[field] = source.includes(field);
        }
      });
    };

    // Assignable permissions
    updatePermissions(role.permissions.leads, leads, [
      'create',
      'read',
      'update',
      'delete',
      'assign',
      'assignedOnly',
      'followup',
    ]);

    updatePermissions(role.permissions.todos, todos, [
      'create',
      'read',
      'update',
      'delete',
      'assign',
      'assignedOnly',
      'followup',
    ]);

    // Basic CRUD
    updatePermissions(role.permissions.users, users, [
      'create',
      'read',
      'update',
      'delete',
    ]);

    updatePermissions(role.permissions.settings, settings, [
      'create',
      'read',
      'update',
      'delete',
    ]);

    role.permissions.about.read = about.includes('read');

    role.permissions.feedback.read = feedback.includes('read');

    role.permissions.exports.allowed = exports.includes('allowed');

    role.permissions.filters.allowed = filters.includes('allowed');

    await role.save();

    const roleUsers = await Users.find({ company, role: id })
      .populate('role')
      .populate({
        path: 'company',
        populate: [{ path: 'settings' }, { path: 'roles' }],
      });

    if (roleUsers.length) {
      roleUsers.forEach((entry) => {
        const notifyUserUpdate = req.app.get('notifyUserUpdate');
        notifyUserUpdate(entry._id, entry);
      });
    }

    const roles = await Roles.find({ company }).populate('createdBy', 'name');
    res.status(200).json({ status: 'success', roles });
  } catch (err) {
    next(err);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { company },
    } = req;

    const role = await Roles.findOne({ _id: id, company, active: true });
    if (!role) {
      const err = new Error('Role not found');
      err.statusCode = 404;
      throw err;
    }

    const activeUserWithRole = await Users.findOne({
      company,
      role: id,
      status: 'Active',
    });

    if (activeUserWithRole) {
      const err = new Error(
        'Cannot delete role: there are active users assigned to this role'
      );
      err.statusCode = 400;
      throw err;
    }

    role.active = false;
    await role.save();

    res.status(200).json({
      status: 'success',
      message: 'Role deactivated successfully',
      role,
    });
  } catch (err) {
    next(err);
  }
};

export const activateRole = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { company },
    } = req;

    const role = await Roles.findOne({ _id: id, company, active: false });
    if (!role) {
      const err = new Error('Role not found');
      err.statusCode = 404;
      throw err;
    }

    role.active = true;
    await role.save();

    res.status(200).json({
      status: 'success',
      message: 'Role activated successfully',
      role,
    });
  } catch (err) {
    next(err);
  }
};

export const getAllIntegrations = async (req, res, next) => {
  try {
    const {
      user: { company },
    } = req;

    const settings = await Settings.findOne(
      { company },
      { adAccounts: 1 }
    ).populate('adAccounts.addedBy', 'name');

    let fbLeadsData = null;
    let formattedFBLeadsData = null;

    if (settings.adAccounts.length) {
      // Set the date range for today
      const now = new Date();
      const startToday = startOfDay(now);
      const endToday = endOfDay(now);

      // Set the date range for the last 29 days
      const lastMonthStart = startOfDay(subDays(now, 29));

      // Set the date range for the previous month
      const previousMonthStart = startOfDay(subDays(now, 56));

      const dates = [];
      let current = lastMonthStart;

      while (current <= startToday) {
        dates.push(format(current, 'MMM d'));
        current = new Date(current.getTime() + 24 * 60 * 60 * 1000); // add 1 day
      }

      fbLeadsData = await Leads.aggregate([
        {
          $match: {
            company,
            deleted: false,
          },
        },
        {
          $facet: {
            lastMonthFBLeads: [
              {
                $match: {
                  'leadSource.sourceLeadId': { $exists: true },
                  createdAt: {
                    $gte: lastMonthStart,
                    $lt: endToday,
                  },
                },
              },
              {
                $group: {
                  _id: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$createdAt',
                      timezone: 'Asia/Kolkata',
                    },
                  },
                  count: { $sum: 1 },
                },
              },
              {
                $sort: { _id: 1 },
              },
              {
                $project: {
                  date: '$_id',
                  count: 1,
                },
              },
            ],
            previousMonthFBLeads: [
              {
                $match: {
                  'leadSource.sourceLeadId': { $exists: true },
                  createdAt: {
                    $gte: previousMonthStart,
                    $lte: lastMonthStart,
                  },
                },
              },
              {
                $count: 'count',
              },
            ],
          },
        },
      ]);

      formattedFBLeadsData = formateDashboardData(
        fbLeadsData[0]?.lastMonthFBLeads || [],
        dates
      );
    }

    res
      .status(200)
      .json({ status: 'success', settings, fbLeadsData, formattedFBLeadsData });
  } catch (err) {
    next(err);
  }
};

export const getIntegration = async (req, res, next) => {
  try {
    const {
      user: { company },
      params: { id },
    } = req;

    const setting = await Settings.findOne({ company }, { adAccounts: 1 });

    if (!setting) {
      const err = new Error('Settings not found');
      err.statusCode = 404;
      throw err;
    }

    const adAccount = setting?.adAccounts?.find(
      ({ _id }) => String(_id) === String(id)
    );

    if (!adAccount) {
      const err = new Error('Ad account not found');
      err.statusCode = 404;
      throw err;
    }

    res.status(200).json({ status: 'success', adAccount });
  } catch (err) {
    next(err);
  }
};

export const updateAdAccount = async (req, res, next) => {
  try {
    const {
      user: { company },
      params: { id },
      body: { accountName, accessToken, adId1, adId2 },
    } = req;

    const setting = await Settings.findOne({ company });

    if (!setting) {
      const err = new Error('Settings not found');
      err.statusCode = 404;
      throw err;
    }

    const index = setting.adAccounts.findIndex(
      (acc) => String(acc._id) === String(id)
    );

    if (index === -1) {
      const err = new Error('Ad account not found');
      err.statusCode = 404;
      throw err;
    }

    const updatedAccount = {
      ...setting.adAccounts[index].toObject(),
    };

    if (accountName !== undefined) updatedAccount.accountName = accountName;
    if (accessToken !== undefined) updatedAccount.accessToken = accessToken;
    if (adId1 !== undefined || adId2 !== undefined) {
      updatedAccount.adId = [adId1, adId2].filter(Boolean);
    }

    setting.adAccounts[index] = updatedAccount;
    await setting.save();

    res
      .status(200)
      .json({ status: 'success', adAccount: setting.adAccounts[index] });
  } catch (err) {
    next(err);
  }
};

export const createAdAccount = async (req, res, next) => {
  try {
    const {
      user: { userId, company },
      body: { accountName, accessToken, adId1, adId2 },
    } = req;

    const settings = await Settings.findOne({ company });
    if (!settings) {
      const err = new Error('No settings not found');
      err.statusCode = 404;
      throw err;
    }

    if (settings.adAccounts?.length) {
      const err = new Error('You can only add one ad account');
      err.statusCode = 400;
      throw err;
    }

    const adId = [adId1];

    if (adId2) {
      adId.push(adId2);
    }

    settings.adAccounts.push({
      accountName,
      accessToken,
      adId,
      addedBy: userId,
    });

    await settings.save();

    const userList = await Users.find({ company })
      .populate('role')
      .populate({
        path: 'company',
        populate: [{ path: 'settings' }, { path: 'roles' }],
      });

    if (userList.length) {
      userList.forEach((entry) => {
        const notifyUserUpdate = req.app.get('notifyUserUpdate');
        notifyUserUpdate(entry._id, entry);
      });
    }

    res.status(200).json({ status: 'success', settings });
  } catch (err) {
    next(err);
  }
};

export const deleteIntegration = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { company },
    } = req;

    const settings = await Settings.findOne({ company });
    if (!settings) {
      const err = new Error('Role not found');
      err.statusCode = 404;
      throw err;
    }

    settings.adAccounts = settings.adAccounts?.map((account) => {
      if (String(account._id) === String(id)) {
        return {
          ...account,
          status: 'Inactive',
        };
      }

      return account;
    });

    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Ad account deactivated successfully',
      settings,
    });
  } catch (err) {
    next(err);
  }
};

export const activateIntegration = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { company },
    } = req;

    const settings = await Settings.findOne({ company });
    if (!settings) {
      const err = new Error('Role not found');
      err.statusCode = 404;
      throw err;
    }

    settings.adAccounts = settings.adAccounts?.map((account) => {
      if (String(account._id) === String(id)) {
        return {
          ...account,
          status: 'Active',
        };
      }

      return account;
    });

    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Ad account activated successfully',
      settings,
    });
  } catch (err) {
    next(err);
  }
};
