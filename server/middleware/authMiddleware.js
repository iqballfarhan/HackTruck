const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('User role:', req.user.role); // Tambahkan log untuk debugging
    next();
  } catch (error) {
    console.error('Auth error:', error.message); // Tambahkan log error
    res.status(401).json({ message: 'Not authorized' });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Not authorized for this action' });
    }
    next();
  };
};

module.exports = { protect, restrictTo };