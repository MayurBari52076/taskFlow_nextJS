const User = require('../models/User.model');

exports.list = async (req, res, next) => {
  try {
    res.json({ success: true, message: 'user module placeholder - implement in its phase', data: [] });
  } catch (err) {
    next(err);
  }
};

// GET /users/me
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me — { name?, theme?, notificationPreferences? }
exports.updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, theme, notificationPreferences } = req.body;
    if (name !== undefined) user.name = name;
    if (theme !== undefined) user.theme = theme;
    if (notificationPreferences !== undefined) {
      user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences };
    }

    await user.save();
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// PATCH /users/me/password — { currentPassword, newPassword }
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword; // pre-save hook re-hashes
    await user.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};
