import mongoose from 'mongoose';
import Companies from '../models/company.js';
import Users from '../models/user.js';
import Leads from '../models/lead.js';
import Todos from '../models/todo.js';
import { format, parseISO } from 'date-fns';
import { Types } from 'mongoose';

export const isValidDate = (str) => !isNaN(Date.parse(str));

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// companies helper
export const getAllCompaniesHelper = async () => {
  try {
    const companies = await Companies.find({ status: 'Active' }).populate({
      path: 'roles',
      select: 'name',
    });
    return companies;
  } catch (err) {
    console.error('Error fetching companies:', err);
    throw new Error('Failed to fetch companies');
  }
};

export const getCompanyHelper = async (id) => {
  try {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid Company ID');
    }

    const company = await Companies.findOne({ _id: id, status: 'Active' });
    return company;
  } catch (err) {
    console.error('Error fetching company:', err);
    throw new Error('Failed to fetch company');
  }
};

// users helper
export const getAllUsersHelper = async (id, company, roleFilter, project) => {
  try {
    const query = { status: 'Active' };

    if (id) query._id = { $ne: id };

    if (company) query.company = company;

    if (roleFilter) {
      query.roles = { [roleFilter.type]: roleFilter.roles };
    }

    const projection = project || {};

    const users = await Users.find(query, projection)
      .select('-password')
      .populate('role', 'name');
    return users;
  } catch (err) {
    console.error('Error fetching users:', err);
    throw new Error('Failed to fetch users');
  }
};

export const getUserHelper = async (id, company, project) => {
  try {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid User ID');
    }

    const query = { _id: id, status: 'Active' };

    if (company) {
      query.company = company;
    }

    const projection = project || {};

    const user = await Users.findOne(query, projection).select('-password');

    return user;
  } catch (err) {
    console.error('Error fetching user:', err);
    throw new Error('Failed to fetch user');
  }
};

// Leads helper
export const getAllLeadsHelper = async (createdBy, project, company) => {
  try {
    const query = { deleted: false };

    if (createdBy) {
      if (!isValidObjectId(createdBy)) {
        throw new Error('Invalid Company ID');
      }

      query.createdBy = createdBy;
    }

    if (company) {
      if (!isValidObjectId(company)) {
        throw new Error('Invalid Company ID');
      }

      query.company = company;
    }

    // if (staff) {
    //   if (!isValidObjectId(staff)) {
    //     throw new Error('Invalid Sales Representative ID');
    //   }
    //   query['assigned.staff'] = staff;
    // }

    const projection = project || {};

    const leads = await Leads.find(query, projection).populate(
      'assigned.staff',
      'name'
    );
    return leads;
  } catch (err) {
    console.error('Error fetching leads:', err);
    throw new Error('Failed to fetch leads');
  }
};

export const getLeadHelper = async (id, project, company, staff) => {
  try {
    if (!isValidObjectId(id)) {
      throw new Error('Invalid Lead ID');
    }

    const query = { _id: id, deleted: false };
    if (company) query.company = company;
    if (staff) query['assigned.staff'] = staff;

    const projection = project || {};

    const lead = await Leads.findOne(query, projection);
    return lead;
  } catch (err) {
    console.error('Error fetching lead:', err);
    throw new Error('Failed to fetch lead');
  }
};

// todos helper
export const getAllTodos = async (company, user) => {
  try {
    const query = { company };

    const todos = await Todos.find({});
  } catch (err) {
    console.error('Error fetching todos:', err);
    throw new Error('Failed to fetch todos');
  }
};

export const formateDashboardData = (doc, dates) => {
  let index = 0;
  return dates.map((date) => {
    const docDate = doc[index]?.date
      ? format(parseISO(doc[index].date), 'MMM d')
      : '';
    const isSame = docDate === date;

    const data = { date, count: isSame ? doc[index]?.count || 0 : 0 };
    isSame && index++;

    return data;
  });
};

export const getLeadsDashboardData = async (
  startToday,
  endToday,
  yesterday,
  startYesterday,
  endYesterday,
  lastMonthStart,
  previousMonthStart,
  dates,
  pipeline,
  isAdAccountSetup
) => {
  try {
    let adAccountFacets = {};

    if (isAdAccountSetup) {
      adAccountFacets = {
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
      };
    }

    const data = await Leads.aggregate([
      ...pipeline,
      {
        $facet: {
          lastMonthLeads: [
            {
              $match: {
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
            { $sort: { _id: 1 } },
            {
              $project: {
                date: '$_id',
                count: 1,
              },
            },
          ],
          previousMonthLeads: [
            {
              $match: {
                createdAt: {
                  $gte: previousMonthStart,
                  $lte: lastMonthStart,
                },
              },
            },
            { $count: 'count' },
          ],
          todaysLeads: [
            {
              $match: {
                createdAt: {
                  $gte: startToday,
                  $lt: endToday,
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'assigned.staff',
                foreignField: '_id',
                as: 'assigned.staff',
              },
            },
            {
              $unwind: {
                path: '$assigned.staff',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'assigned.assignedBy',
                foreignField: '_id',
                as: 'assigned.assignedBy',
              },
            },
            {
              $unwind: {
                path: '$assigned.assignedBy',
                preserveNullAndEmptyArrays: true,
              },
            },
            { $sort: { createdAt: -1 } },
          ],
          yesterdaysLeads: [
            {
              $match: {
                $expr: {
                  $eq: [
                    {
                      $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt',
                        timezone: 'Asia/Kolkata',
                      },
                    },
                    yesterday,
                  ],
                },
              },
            },
            { $count: 'count' },
          ],
          recentAdmissions: [
            { $match: { eligibility: 'Eligible' } },
            { $sort: { convertedDate: -1 } },
            { $limit: 20 },
            {
              $lookup: {
                from: 'users',
                localField: 'assigned.staff',
                foreignField: '_id',
                as: 'assigned.staff',
              },
            },
            {
              $unwind: {
                path: '$assigned.staff',
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          lastMonthSources: [
            {
              $match: {
                createdAt: {
                  $gte: lastMonthStart,
                  $lte: endToday,
                },
              },
            },
            {
              $match: {
                $or: [
                  { 'leadSource.source': 'Facebook' },
                  { 'leadSource.source': 'Google' },
                  { 'leadSource.source': 'Youtube' },
                ],
              },
            },
            {
              $group: {
                _id: {
                  date: {
                    $dateToString: {
                      format: '%Y-%m-%d',
                      date: '$createdAt',
                      timezone: 'Asia/Kolkata',
                    },
                  },
                  source: '$leadSource.source',
                },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: '$_id.date',
                sources: {
                  $push: { source: '$_id.source', count: '$count' },
                },
              },
            },
            {
              $project: {
                date: '$_id',
                sources: {
                  $arrayToObject: {
                    $map: {
                      input: '$sources',
                      as: 's',
                      in: { k: '$$s.source', v: '$$s.count' },
                    },
                  },
                },
              },
            },
            { $sort: { date: 1 } },
          ],
          previousMonthSources: [
            {
              $match: {
                createdAt: {
                  $gte: previousMonthStart,
                  $lte: lastMonthStart,
                },
              },
            },
            {
              $match: {
                $or: [
                  { 'leadSource.source': 'Facebook' },
                  { 'leadSource.source': 'Google' },
                  { 'leadSource.source': 'Youtube' },
                ],
              },
            },
            { $count: 'count' },
          ],
          lastMonthConversions: [
            {
              $match: {
                convertedDate: {
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
                    date: '$convertedDate',
                    timezone: 'Asia/Kolkata',
                  },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
            {
              $project: {
                date: '$_id',
                count: 1,
              },
            },
          ],
          previousMonthConversions: [
            {
              $match: {
                convertedDate: {
                  $gte: previousMonthStart,
                  $lte: lastMonthStart,
                },
              },
            },
            { $count: 'count' },
          ],
          ...adAccountFacets,
        },
      },
    ]);

    let formattedFBLeadsData = null;

    const formattedLeadsData = formateDashboardData(
      data[0]?.lastMonthLeads || [],
      dates
    );
    const formattedConversionData = formateDashboardData(
      data[0]?.lastMonthConversions || [],
      dates
    );
    const formattedSource = (data[0]?.lastMonthSources || []).map((entry) => ({
      date: entry.date ? format(parseISO(entry.date), 'MMM d') : '',
      Facebook: 0,
      Google: 0,
      Youtube: 0,
      ...entry.sources,
    }));

    if (isAdAccountSetup) {
      formattedFBLeadsData = formateDashboardData(
        data[0]?.lastMonthFBLeads || [],
        dates
      );
    }

    return {
      ...data[0],
      formattedLeadsData,
      formattedSource,
      formattedConversionData,
      formattedFBLeadsData,
    };
  } catch (err) {
    console.log(err);
  }
};

export const getTodoDashboardData = async (
  lastMonthStart,
  previousMonthStart,
  startToday,
  endToday,
  dates,
  userId,
  pipeline
) => {
  try {
    const todosData = await Todos.aggregate([
      ...pipeline,
      {
        $facet: {
          lastMonthTodos: [
            {
              $match: {
                createdAt: {
                  $gte: lastMonthStart,
                  $lte: endToday,
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
          previousMonthTodos: [
            {
              $match: {
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
          activeTodos: [
            {
              $match: {
                status: { $eq: 'Active' },
                // endDate: { $gte: startToday, $lt: endToday },
                $or: [
                  {
                    $and: [
                      { type: 'Assigned' },
                      { assignedTo: new Types.ObjectId(userId) },
                    ],
                  },
                  { createdBy: new Types.ObjectId(userId) },
                ],
              },
            },
          ],
        },
      },
    ]);

    const formattedTodosData = formateDashboardData(
      todosData[0]?.lastMonthTodos || [],
      dates
    );

    return {
      ...todosData[0],
      formattedTodosData,
    };
  } catch (err) {
    console.log(err);
  }
};
