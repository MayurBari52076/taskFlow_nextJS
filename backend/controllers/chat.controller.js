const Message = require('../models/Message.model');
const Task = require('../models/Task.model');

async function assertAccess(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return false;
  const isOwner = task.owner.equals(userId);
  const isCollaborator = task.collaborators.some((c) => c.user.equals(userId));
  return isOwner || isCollaborator;
}

// GET /chat?task=<taskId> — message history for a task's chat (oldest first)
exports.list = async (req, res, next) => {
  try {
    const { task: taskId } = req.query;
    if (!taskId) return res.status(400).json({ success: false, message: 'task query param is required' });

    const allowed = await assertAccess(taskId, req.user.id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });

    const messages = await Message.find({ task: taskId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name email avatar')
      .limit(200);

    res.json({ success: true, data: messages });
  } catch (err) {
    next(err);
  }
};
