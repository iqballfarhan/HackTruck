const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const { verifyGoogleToken } = require('../helpers/googleAuth');

const register = async (req, res, next) => {
  try {
    const { email, password, role, name } = req.body;
    
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      name,
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({ user: { id: user.id, email, role, name }, token });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ user: { id: user.id, email, role: user.role, name: user.name }, token });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);

    let user = await User.findOne({ where: { googleId: payload.sub } });
    
    if (!user) {
      user = await User.create({
        email: payload.email,
        googleId: payload.sub,
        name: payload.name,
        role: 'user',
      });
    }

    const jwtToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({ 
      user: { id: user.id, email: user.email, role: user.role, name: user.name }, 
      token: jwtToken 
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, username, email } = req.body;
    const userId = req.user.id;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        where: { 
          email,
          id: { [Op.ne]: userId } // Not equal to current user
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another account' });
      }
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({
        where: { 
          username,
          id: { [Op.ne]: userId } // Not equal to current user
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username already in use by another account' });
      }
    }

    // Update user profile
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (username) user.username = username;
    if (email) user.email = email;
    
    await user.save();

    // Return updated user
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // For Google accounts without password
    if (!user.password) {
      return res.status(400).json({ message: 'Cannot change password for accounts created with Google' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, googleLogin, updateProfile, changePassword };