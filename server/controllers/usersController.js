// userController.js
import bcrypt from 'bcryptjs';
import Users from '../models/user.js';
import {
  getAllCompaniesHelper,
  getAllUsersHelper,
  getCompanyHelper,
  getUserHelper,
  isValidObjectId,
} from '../helper/index.js';

// List all users
export const getAllUsers = async (req, res, next) => {
  try {
    const {
      user: { userId, company, role },
    } = req;

    const canReadCompanies = role.permissions.companies.read;

    // Logic to fetch all users from the database
    const users = await getAllUsersHelper(
      userId,
      canReadCompanies ? null : company
    );
    res.status(200).json({ status: 'success', users });
  } catch (err) {
    next(err);
  }
};

// User formdata
export const getUserFormData = async (req, res, next) => {
  try {
    const {
      query: { id },
      user: { company, role },
    } = req;

    let user = null;
    let companies = null;
    const canReadCompanies = role.permissions.companies.read;

    if (id && id !== 'undefined') {
      const query = {
        _id: id,
        status: 'Active',
      };

      if (!canReadCompanies) {
        query.company = company;
      }

      user = await Users.findOne(query)
        .populate('company', 'name')
        .populate('role', 'name')
        .select('-password');

      if (!user) throw new Error('User not found');
    }

    if (canReadCompanies) {
      companies = await getAllCompaniesHelper();
    }

    res.status(200).json({ status: 'success', user, companies });
  } catch (err) {
    next(err);
  }
};

// Create a new user
export const createUser = async (req, res, next) => {
  try {
    const {
      body,
      body: { password },
      user: { userId, role, company },
    } = req;

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    let selectedCompany = company;

    const canCreateCompanies = role.permissions.companies.create;

    if (canCreateCompanies) {
      selectedCompany = body.company;
    }

    const companyRecord = await getCompanyHelper(body.company);
    if (!companyRecord) throw new Error('The company does not exist');

    const existingUsers = await Users.find({ company: selectedCompany });

    if (existingUsers.length > companyRecord.staffLimit)
      throw new Error('The staff limit for this company has been reached');

    // Logic to create a new user in the database
    await Users.create({
      ...body,
      password: hash,
      createdBy: userId,
      company: selectedCompany,
    });

    res.status(201).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

// Get details of a specific user
export const getUser = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { company },
    } = req;

    // Logic to fetch a specific user from the database
    const user = await getUserHelper(id, company);

    if (!user) throw new Error('User not found');

    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

// Update a specific user
export const updateUser = async (req, res, next) => {
  try {
    const {
      user: { userId, company, role: userRole },
      params: { id },
      body: { name, designation, phone, phoneCode, email, gender, dob, role },
    } = req;

    if (!isValidObjectId(id)) throw Error('The provided user ID is not valid');

    if (String(userId) === id) throw new Error('Something went wrong');

    const canReadCompanies = userRole.permissions.companies.read;

    // Logic to update a specific user in the database
    const user = await getUserHelper(id, canReadCompanies ? null : company);

    if (!user) throw Error('User not found');

    // const isSuperAdmin = user.role.permission.companies.read;

    // if (isSuperAdmin)
    //   throw new Error('Can not update this user.');

    const today = new Date();

    user.name = name;
    user.designation = designation;
    user.phone = phone;
    user.phoneCode = phoneCode;
    user.email = email;
    user.gender = gender;
    user.dob = dob;
    user.role = role;

    // Add history log
    user.history.push({
      type: 'Updated',
      date: today,
      notes: 'Updated',
      actionDoneBy: userId,
    });

    await user.save();

    const updatedUser = await Users.findById(id)
      .populate('role')
      .populate({
        path: 'company',
        populate: [{ path: 'settings' }, { path: 'roles' }],
      });

    const notifyUserUpdate = req.app.get('notifyUserUpdate');
    notifyUserUpdate(updatedUser._id, updatedUser);

    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};

// Delete a specific user
export const deleteUser = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { company, userId },
    } = req;

    // Logic to delete a specific user from the database

    const user = await getUserHelper(id, company, { history: 1, status: 1 });

    if (!user) throw Error('User not found');

    const today = new Date();

    // Add history log
    user.history.push({
      type: 'Deleted',
      date: today,
      notes: 'Deleted reason',
      actionDoneBy: userId,
    });

    user.status = 'Inactive';
    await user.save();

    res
      .status(200)
      .json({ status: 'success', message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
