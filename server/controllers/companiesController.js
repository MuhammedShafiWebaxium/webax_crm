import Company from '../models/company.js';
import Settings from '../models/settings.js';
import Roles from '../models/roles.js';
import mongoose from 'mongoose';
import { isValidObjectId } from '../helper/index.js';

const getAllCompanies = async (req, res, next) => {
  try {
    const query = { deleted: false };

    // Logic to fetch all companies from the database
    const companies = await Company.find(query)
      .populate('createdBy', 'name email')
      .populate('users', 'name email');

    res.status(200).json({ status: 'success', companies });
  } catch (err) {
    next(err);
  }
};

const createCompany = async (req, res, next) => {
  try {
    const session = await mongoose.startSession();

    // withTransaction automatically handles commit/abort and retries
    await session.withTransaction(async () => {
      const {
        user: { userId },
        body: {
          name,
          phone,
          phoneCode,
          email,
          website,
          source,
          industry,
          street,
          city,
          district,
          state,
          country,
          postalCode,
        },
      } = req;

      const newCompany = new Company({
        createdBy: userId,
        name,
        code: `CMP-${Date.now()}`,
        source,
        website,
        industry,
        address: {
          street,
          city,
          district,
          state,
          country,
          postalCode,
        },
        email,
        phone,
        phoneCode,
        staffLimit: 5,
        status: 'Active',
      });

      await newCompany.save({ session });

      const settings = new Settings({
        company: newCompany._id,
      });
      await settings.save({ session });

      const roles = new Roles({
        company: newCompany._id,
        createdBy: userId,
        name: 'Admin',
        permissions: {
          leads: {
            create: true,
            read: true,
            update: true,
            delete: true,
            assign: true,
          },
          todos: {
            create: true,
            read: true,
            update: true,
            delete: true,
            assign: true,
          },
          users: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          exports: { allowed: true },
          filters: { allowed: true },
        },
      });
      await roles.save({ session });

      newCompany.settings = settings._id;
      newCompany.roles = [roles._id];
      await newCompany.save({ session });

      res.status(200).json({
        message: 'Company added successfully',
        company: newCompany,
        status: 'success',
      });
    });

    session.endSession();
  } catch (error) {
    next(error);
  }
};

const updateCompany = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId },
      body: {
        name,
        phone,
        phoneCode,
        email,
        website,
        source,
        industry,
        street,
        city,
        district,
        state,
        country,
        postalCode,
      },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid Company ID');

    const query = { _id: id, deleted: false };

    // Logic to fetch a specific company from the database
    const company = await Company.findOne(query);
    if (!company) throw new Error('Company not found');

    company.name = name;
    company.phone = phone;
    company.phoneCode = phoneCode;
    company.email = email;
    company.website = website;
    company.source = source;
    company.industry = industry;
    company.address.street = street;
    company.address.city = city;
    company.address.district = district;
    company.address.state = state;
    company.address.country = country;
    company.address.postalCode = postalCode;

    const today = new Date();

    // Add history log
    company.history.push({
      type: 'Updated',
      date: today,
      notes: 'Updated reason',
      actionDoneBy: userId,
    });

    await company.save();

    res
      .status(200)
      .json({ status: 'success', message: 'Company updated successfully' });
  } catch (err) {
    next(err);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const {
      params: { id },
      user: { userId, company: myCompany },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid Company ID');

    const query = {
      $and: [{ _id: { $ne: myCompany } }, { _id: id }],
      deleted: false,
    };

    // Logic to fetch a specific company from the database
    const company = await Company.findOne(query);
    if (!company) {
      const err = new Error('Company not found');
      err.statusCode = 404;
      return next(err);
    }

    const today = new Date();

    // Add history log
    company.history.push({
      type: 'Deleted',
      date: today,
      notes: 'Deleted reason',
      actionDoneBy: userId,
    });

    company.deleted = true;
    company.status = 'Inactive';

    await company.save();

    res
      .status(200)
      .json({ status: 'success', message: 'Company deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getCompany = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;

    if (!isValidObjectId(id)) throw new Error('Invalid Company ID');

    const query = { _id: id, deleted: false };

    // Logic to fetch a specific company from the database
    const company = await Company.findOne(query);
    if (!company) throw new Error('Company not found');

    res.status(200).json({ status: 'success', company });
  } catch (err) {
    next(err);
  }
};

export {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompany,
};
