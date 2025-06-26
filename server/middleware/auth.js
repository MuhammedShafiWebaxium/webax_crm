import User from '../models/user.js';
import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.access__; // Get the token from cookies

    if (!token) {
      req.user = { isAuthenticated: false };
      return next(); // Proceed without authentication
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id;

    const user = await User.findById(userId)
      .populate({ path: 'company', select: 'status name' })
      .populate({ path: 'role' });

    if (!user) {
      req.user = { isAuthenticated: false };
      return next();
    }

    if (user.company.status !== 'Active')
      throw new Error('The company has been suspended');

    if (user.status !== 'Active')
      throw new Error('The user has been suspended');

    if (!user.role.active) throw new Error('The role has been suspended');

    req.user = {
      userId: user._id,
      role: user.role,
      name: user.name,
      company: user.company._id,
      companyName: user.company.name,
      email: user.email,
      isAuthenticated: true,
    };

    next();
  } catch (error) {
    req.user = { isAuthenticated: false };
    // return res.status(401).json({ error: 'Unauthorized. Invalid token.' });

    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    if (req.user && req.user.isAuthenticated) {
      return next();
    }

    console.log(`Unauthorized access attempt: ${req.originalUrl}`);
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  } catch (err) {
    next(err); // Pass the error to the global error handler
  }
};

export const isAuthorized = (module, action) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.isAuthenticated) {
        const error = new Error('Authentication required.');
        error.statusCode = 401;
        throw error;
      }

      const role = req.user.role;

      if (!role?.active || role?.permissions?.[module]?.[action] !== true) {
        const error = new Error('Forbidden: Insufficient permissions.');
        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (err) {
      next(err); // Pass the error to the global error handler
    }
  };
};
