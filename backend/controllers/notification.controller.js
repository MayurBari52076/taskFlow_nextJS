const Notification = require('../models/Notification.model');

// GET /notifications — latest 50 for the logged-in user
exports.list = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, read: false });

    res.json({ success: true, data: notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/:id/read
exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, recipient: req.user.id });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.read = true;
    await notification.save();
    res.json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/read-all
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
