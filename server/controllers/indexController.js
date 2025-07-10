import bcrypt from 'bcryptjs';
import Users from '../models/user.js';
import jwt from '../utils/jwt.js';
import Settings from '../models/settings.js';
import {
  getLeadsDashboardData,
  getTodoDashboardData,
} from '../helper/indexHelper.js';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email })
      .populate('role')
      .populate({
        path: 'company',
        populate: [{ path: 'settings' }, { path: 'roles' }],
      });

    if (!user) {
      throw Object.assign(new Error('Invalid credentials'), {
        statusCode: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw Object.assign(new Error('Invalid credentials'), {
        statusCode: 401,
      });
    }

    // Check if the user's status is not "Active"
    if (user.status !== 'Active') {
      throw Object.assign(
        new Error(`Login failed. Your account is currently ${user.status}.`),
        { statusCode: 403 } // Forbidden
      );
    }

    const token = jwt(user._id);

    const { password: _, ...userWithoutPassword } = user.toObject();

    const isProd = process.env.NODE_ENV === 'production';

    res
      .cookie('access__', token, {
        httpOnly: true,
        secure: isProd ? true : false,
        sameSite: isProd ? 'none' : 'lax',
      })
      .status(200)
      .json({ status: 'success', user: { ...userWithoutPassword } });
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const {
      user: { userId, company },
    } = req;

    // Set the date range for today
    const now = new Date();
    const startToday = startOfDay(now);
    const endToday = endOfDay(now);

    // Get yesterday's date in YYYY-MM-DD format
    const yesterdayDate = subDays(now, 1);
    const yesterday = format(yesterdayDate, 'yyyy-MM-dd');

    // Set the date range for yesterday
    const startYesterday = startOfDay(yesterdayDate);
    const endYesterday = endOfDay(yesterdayDate);

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

    const leadsPipeline = [
      {
        $match: {
          company,
          deleted: false,
        },
      },
    ];

    const todosPipeline = [
      {
        $match: {
          company,
          status: { $ne: 'Deleted' },
        },
      },
    ];

    let isAdAccountSetup = false;

    const setting = await Settings.findOne({ company }).lean();

    if (setting?.adAccounts?.length) {
      isAdAccountSetup = true;
    }

    const leadsData = await getLeadsDashboardData(
      startToday,
      endToday,
      yesterday,
      startYesterday,
      endYesterday,
      lastMonthStart,
      previousMonthStart,
      dates,
      leadsPipeline,
      isAdAccountSetup
    );

    const todosData = await getTodoDashboardData(
      lastMonthStart,
      previousMonthStart,
      startToday,
      endToday,
      dates,
      userId,
      todosPipeline
    );

    const users = await Users.aggregate([
      {
        $match: {
          company,
          status: 'Active',
        },
      },
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'role',
        },
      },
      {
        $unwind: '$role',
      },
      {
        $match: {
          'role.permissions.leads.read': true,
        },
      },
    ]);

    res.status(200).json({ status: 'success', leadsData, todosData, users });
  } catch (err) {
    next(err);
  }
};
