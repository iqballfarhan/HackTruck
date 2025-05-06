const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
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

module.exports = { register, login, googleLogin };