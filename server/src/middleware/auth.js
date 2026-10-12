const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const fallbackStore = require('../services/fallbackStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'codescope_default_secret_key');

      if (isDbConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const fallbackUser = await fallbackStore.findUserById(decoded.id);
        if (fallbackUser) {
          req.user = {
            _id: fallbackUser._id,
            name: fallbackUser.name,
            email: fallbackUser.email,
          };
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found or session expired' });
      }

      return next();
    } catch (error) {
      console.error('Auth protect middleware error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
