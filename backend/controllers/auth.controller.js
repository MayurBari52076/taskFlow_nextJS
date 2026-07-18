const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const signAccessToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.status(201).json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, cookieOptions);
    res.json({
      success: true,
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: 'No refresh token' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = signAccessToken(user);
    res.json({ success: true, accessToken });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid' });
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, { refreshToken: '' });
      }
    }
    res.clearCookie('refreshToken', cookieOptions);
    res.json({ success: true, message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};
