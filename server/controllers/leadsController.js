// userController.js
import Companies from '../models/company.js';
import Leads from '../models/lead.js';
import {
  getAllUsersHelper,
  getLeadHelper,
  getUserHelper,
  isValidDate,
  isValidObjectId,
} from '../helper/indexHelper.js';
import Settings from '../models/settings.js';
import { toDate } from 'date-fns-tz';
import { format } from 'date-fns';
import { createNotification } from '../helper/notificationHelper.js';

// List all leads
export const getAllLeads = async (req, res, next) => {
  try {
    const {
      user: { userId, company, role },
    } = req;

    const query = { deleted: false, company };

    const canOnlySeeAssignedLeads = role.permissions.leads.assignedOnly;

    if (canOnlySeeAssignedLeads) {
      query['assigned.staff'] = userId;
    }

    // Logic to fetch all leads from the database
    const leads = await Leads.find(query).populate('createdBy', 'name email');

    res.status(200).json({ status: 'success', leads });
  } catch (err) {
    next(err);
  }
};

// Lead formdata
export const getLeadFormData = async (req, res, next) => {
  try {
    const {
      query: { id },
      user: { userId, company, role },
    } = req;

    let lead = null;
    let users = null;

    const canAssign = role.permissions.leads.assign;
    const canOnlySeeAssignedLeads = role.permissions.leads.assignedOnly;

    const settings = await Settings.findOne({ company }, { lead: 1 });

    if (id && id !== 'undefined') {
      if (!isValidObjectId(id)) throw new Error('Invalid lead ID');

      const query = { _id: id, company, deleted: false };

      if (canOnlySeeAssignedLeads) {
        query['assigned.staff'] = userId;
      }

      lead = await Leads.findOne(query, { deleted: 0, history: 0 }).populate(
        'assigned.staff',
        'name'
      );
      if (!lead) throw Error('Lead not found');
    }

    if (canAssign) {
      // excluding admins
      users = await getAllUsersHelper(userId, company, null, { name: 1 });
    }

    res.status(200).json({ status: 'success', lead, users, settings });
  } catch (err) {
    next(err);
  }
};

// Create a new lead
export const createLead = async (req, res, next) => {
  try {
    const {
      body,
      user: { userId, company, role, name, email },
      body: { salesRepresentative, leadSource, initialNote },
    } = req;

    const canAssign = role.permissions.leads.assign;

    if (salesRepresentative && !canAssign)
      throw new Error('You do not have permission to assign leads to others.');

    let staff = userId;
    let assignedNote = null;

    const companyRecord = await Companies.findOne(
      {
        _id: company,
        status: 'Active',
      },
      { code: 1, settings: 1 }
    ).populate('settings');
    if (!companyRecord) throw new Error('The company does not exist');

    const isLeadExist = await Leads.findOne({
      company,
      $or: [{ email: body.email }, { phone: body.phone }],
    });

    if (isLeadExist)
      throw new Error(
        `The lead already exists${isLeadExist.deleted ? ` (Deleted).` : '.'}`
      );

    if (salesRepresentative && canAssign) {
      const salesRepRecord = await getUserHelper(salesRepresentative, company, {
        name: 1,
        email: 1,
      });

      if (!salesRepRecord) throw new Error('The user does not exist');

      staff = salesRepresentative;
      assignedNote = `Lead created by ${name} (${email}) and assigned to ${salesRepRecord.name} (${salesRepRecord.email}). ${initialNote}`;
    } else {
      assignedNote = `Lead created by ${name} (${email}) and assigned to themselves. ${initialNote}`;
    }

    const isSelfAssign = String(staff) === String(userId);

    const today = new Date();
    const totalLeadsCount = await Leads.countDocuments({ company });

    // Generate leadId with dynamic padding
    const leadId = `${companyRecord.code}-${String(
      totalLeadsCount + 1
    ).padStart(5, '0')}`;

    const assigned = {
      staff,
      assignedDate: today,
      assignedBy: userId,
      history: [
        {
          type: 'Assign',
          staff,
          assignedDate: today,
          assignedBy: userId,
          assignedNote,
        },
      ],
    };

    const status = companyRecord.settings?.lead?.defaultStatus || 'New';
    const stage = companyRecord.settings?.lead?.defaultStage || 'Assigned';

    const newLead = await Leads.create({
      ...body,
      company,
      leadId,
      assigned,
      status,
      stage,
      'leadSource.source': leadSource,
      createdBy: userId,
    });

    if (!isSelfAssign) {
      const targetUser = staff || userId;

      const notificationData = {
        title: 'New Lead Assigned',
        message: `You have been assigned a new lead: ${
          newLead.name || 'Unnamed Lead'
        }.`,
        type: 'info',
        targetUser,
        link: `/leads/${newLead._id}/followup`,
        metadata: {
          leadId: newLead._id,
          assignedBy: userId,
        },
        isBroadcast: false,
        createdBy: userId,
      };

      await createNotification(notificationData);
    }

    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

// Get details of a specific user
export const getLead = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, company, role },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid lead ID');

    const canOnlySeeAssignedLeads = role.permissions.leads.assignedOnly;

    const query = { _id: id, company, deleted: false };

    if (canOnlySeeAssignedLeads) {
      query['assigned.staff'] = userId;
    }

    // Logic to fetch a specific lead from the database
    const lead = await Leads.findOne(query);
    if (!lead) throw new Error('Lead not found');

    const settings = await Settings.findOne({ company }, { lead: 1 });

    res.status(200).json({ status: 'success', lead, settings });
  } catch (err) {
    next(err);
  }
};

// Update a specific lead
export const updateLead = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { role, userId, company, name: userName, email: userEmail },
      body: {
        name,
        phone,
        phoneCode,
        alternativeNumber,
        alternativePhoneCode,
        email,
        gender,
        leadSource,
        salesRepresentative,
        initialNote,
      },
    } = req;

    // Logic to fetch the lead
    if (!isValidObjectId(id)) throw new Error('Invalid lead ID');

    const canOnlySeeAssignedLeads = role.permissions.leads.assignedOnly;
    const canAssign = role.permissions.leads.assign;

    if (salesRepresentative && !canAssign)
      throw new Error('You do not have permission to assign leads to others.');

    const query = { _id: id, company, deleted: false };

    if (canOnlySeeAssignedLeads) {
      query['assigned.staff'] = userId;
    }

    // Logic to fetch a specific lead from the database
    const lead = await Leads.findOne(query);
    if (!lead) {
      throw new Error('Lead not found');
    }

    // Prevent duplicate email/phone
    if (email !== lead.email || phone !== lead.phone) {
      const isExist = await Leads.findOne({
        _id: { $ne: id },
        company,
        $or: [{ email }, { phone }],
      });

      if (isExist)
        throw new Error('The email or phone already exists with another lead.');
    }

    const today = new Date();
    let updatedFields = []; // Track changed fields

    if (String(lead.assigned.staff) !== String(salesRepresentative)) {
      const salesRepRecord = await getUserHelper(salesRepresentative, company, {
        name: 1,
        email: 1,
      });

      if (!salesRepRecord) throw new Error('The user does not exist');

      updatedFields.push('sales representative');

      const isSameUser = String(userId) === String(salesRepresentative);

      lead.assigned.history = lead.assigned.history || [];
      lead.assigned.history.push({
        type: 'Re-Assign',
        staff: salesRepresentative,
        assignedDate: today,
        assignedBy: userId,
        assignedNote: `Lead updated by ${userName} (${userEmail}) and assigned to ${
          isSameUser
            ? 'themselves'
            : `${salesRepRecord.name} (${salesRepRecord.email})`
        }. ${initialNote}`,
      });

      lead.assigned.staff = salesRepresentative;
      lead.assigned.assignedDate = today;
      lead.assigned.assignedBy = userId;
    }

    // Check for other field updates
    const fieldsToCheck = {
      name,
      phone,
      phoneCode,
      alternativeNumber,
      alternativePhoneCode,
      email,
      gender,
      'leadSource.source': leadSource,
      initialNote,
    };

    for (const key in fieldsToCheck) {
      const newValue = fieldsToCheck[key];
      const oldValue = key.includes('leadSource')
        ? lead.leadSource.source
        : lead[key];

      if (newValue !== undefined && newValue !== oldValue) {
        updatedFields.push(key);
        if (key.includes('leadSource')) {
          lead.leadSource.source = newValue;
        } else {
          lead[key] = newValue;
        }
      }
    }

    // If no fields are updated, return early
    if (updatedFields.length === 0) {
      const error = new Error('No updates were made.');
      error.statusCode = 400; // Specify the error code
      throw error;
    }

    // Ensure `lead.history` exists before pushing updates
    lead.history = lead.history || [];
    lead.history.push({
      type: 'Updated',
      date: today,
      notes: `Updated fields: ${updatedFields.join(', ')}.`,
      actionDoneBy: userId,
    });

    await lead.save();

    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

// Delete a specific user
export const deleteLead = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, company, role },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid lead ID');

    const canOnlySeeAssignedLeads = role.permissions.leads.assignedOnly;

    const query = { _id: id, company, deleted: false };

    if (canOnlySeeAssignedLeads) {
      query['assigned.staff'] = userId;
    }

    // Logic to fetch a specific lead from the database
    const lead = await Leads.findOne(query);
    if (!lead) {
      throw new Error('Lead not found');
    }

    const today = new Date();

    // Add history log
    lead.history.push({
      type: 'Deleted',
      date: today,
      notes: 'Deleted reason',
      actionDoneBy: userId,
    });

    lead.deleted = true;
    await lead.save();

    res
      .status(200)
      .json({ status: 'success', message: 'Lead deleted successfully' });
  } catch (err) {
    next(err);
  }
};

export const followupLead = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, company, role },
      body: {
        name,
        phone,
        phoneCode,
        alternativeNumber,
        alternativePhoneCode,
        email,
        gender,
        leadSource,
        eligibility,
        status,
        nextFollowupDate,
        notes,
      },
    } = req;

    const followupDateNotMandatory = ['No Response', 'Lost'];

    const exCludeFollowupDate = [
      'Invalid Number',
      'Wrong Contact',
      'Not Interested',
      'Converted',
    ];

    if (
      !notes ||
      (!nextFollowupDate &&
        !exCludeFollowupDate.includes(status) &&
        !followupDateNotMandatory.includes(status))
    ) {
      throw new Error('Missing required filed');
    }

    const nextFollowup =
      !exCludeFollowupDate.includes(status) && nextFollowupDate
        ? nextFollowupDate
        : null;

    if (nextFollowup && !isValidDate(nextFollowup)) {
      throw new Error('Invalid date format');
    }

    if (!isValidObjectId(id)) throw new Error('Invalid lead ID');

    const canOnlySeeAssignedLeads = role.permissions.leads.assignedOnly;

    const query = { _id: id, company, deleted: false };

    if (canOnlySeeAssignedLeads) {
      query['assigned.staff'] = userId;
    }

    // Logic to fetch a specific lead from the database
    const lead = await Leads.findOne(query);
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (email !== lead.email || phone !== lead.phone) {
      const isExist = await Leads.findOne({
        $and: [
          { _id: { $ne: id } },
          { company },
          { $or: [{ email }, { phone }] },
        ],
      });

      if (isExist)
        throw Error('The email or phone already exist with another lead.');
    }

    const updatedFields = [];
    const today = new Date();

    if (lead.eligibility !== 'Eligible' && eligibility === 'Eligible') {
      lead.convertedDate = today;
    }

    // Check for changes in other fields
    const fieldsToCheck = {
      name,
      phone,
      phoneCode,
      alternativeNumber,
      alternativePhoneCode,
      email,
      gender,
      eligibility,
      status,
      'leadSource.source': leadSource,
    };

    for (const key in fieldsToCheck) {
      const newValue = fieldsToCheck[key];
      const oldValue = key.includes('leadSource')
        ? lead.leadSource.source
        : lead[key];

      if (newValue !== undefined && newValue !== oldValue) {
        updatedFields.push(key);
        if (key.includes('leadSource')) {
          lead.leadSource.source = newValue;
        } else {
          lead[key] = newValue;
        }
      }
    }

    lead.followup.push({
      nextFollowupDate: nextFollowup,
      date: today,
      notes,
      followedBy: userId,
      status,
    });

    lead.nextFollowup = nextFollowup;

    await lead.save();

    if (nextFollowup) {
      const IST_TIMEZONE = 'Asia/Kolkata';
      const targetUser = lead?.assigned?.staff || userId;

      // Convert nextFollowup and now to IST timezone
      const followupTimeIST = toDate(new Date(nextFollowup), {
        timeZone: IST_TIMEZONE,
      });
      const nowIST = toDate(new Date(), { timeZone: IST_TIMEZONE });

      // Subtract 5 minutes from followup time
      let scheduleTimeIST = new Date(followupTimeIST.getTime() - 5 * 60 * 1000);

      // Adjust if schedule is earlier than now
      if (scheduleTimeIST <= nowIST) {
        scheduleTimeIST = followupTimeIST;
      }

      const notificationData = {
        scheduleTime: toDate(scheduleTimeIST, { timeZone: 'UTC' }), // store in UTC format
        title: 'Upcoming Lead Follow-up',
        message: `You have an upcoming follow-up with ${
          lead.name || 'a lead'
        } scheduled at ${format(followupTimeIST, 'p')}.`,
        type: 'info',
        targetUser,
        link: `/leads/${lead._id}/followup`,
        metadata: {
          leadId: lead._id,
          followupDate: nextFollowup,
        },
        isBroadcast: false,
        createdBy: userId,
      };

      await createNotification(notificationData);
    }

    res.status(201).json({ status: 'success', lead });
  } catch (err) {
    next(err);
  }
};

export const setAssignee = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, company, name, email },
      body: { assignTo },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid lead ID');
    if (!isValidObjectId(assignTo)) throw new Error('Invalid assignTo user ID');

    const query = { _id: id, company, deleted: false };

    const lead = await Leads.findOne(query);
    if (!lead) throw new Error('Lead not found');

    const salesRepRecord = await getUserHelper(assignTo, company, {
      name: 1,
      email: 1,
    });
    if (!salesRepRecord) throw new Error('The user does not exist');

    const today = new Date();
    const isSameUser = String(userId) === String(assignTo);
    const type = lead?.assigned?.staff ? 'Re-Assign' : 'Assign';

    if (
      type === 'Re-Assign' &&
      String(assignTo) === String(lead.assigned.staff)
    )
      throw new Error(
        `This lead is already assigned to ${salesRepRecord.name}, You cannot reassign it to the same person.`
      );

    const assignMessage = `Lead assigned to ${salesRepRecord.name} (${
      salesRepRecord.email
    }) by ${isSameUser ? 'themselves' : `${name} (${email})`}`;
    const reassignMessage = `Lead reassigned by ${name} (${email}) and assigned to ${
      isSameUser
        ? 'themselves'
        : `${salesRepRecord.name} (${salesRepRecord.email})`
    }`;

    const assignedHistory = {
      type,
      staff: assignTo,
      assignedDate: today,
      assignedBy: userId,
      assignedNote: type === 'Assign' ? assignMessage : reassignMessage,
    };

    const history = {
      type,
      date: today,
      notes: `${type} lead to ${salesRepRecord.name} (${salesRepRecord.email})`,
      actionDoneBy: userId,
    };

    const updatedLead = await Leads.findByIdAndUpdate(
      id,
      {
        $set: {
          'assigned.staff': assignTo,
          'assigned.assignedDate': today,
          'assigned.assignedBy': userId,
        },
        $push: {
          history,
          'assigned.history': assignedHistory,
        },
      },
      { new: true }
    )
      .populate('assigned.assignedBy')
      .populate('assigned.staff');

    res.status(200).json({ status: 'success', updatedLead });
  } catch (err) {
    next(err);
  }
};
