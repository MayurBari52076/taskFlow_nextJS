const ActivityLog = require('../models/ActivityLog.model');
const Task = require('../models/Task.model');

// GET /activity — recent activity across every task the user owns or collaborates on
// GET /activity?task=<taskId> — activity scoped to one task
exports.list = async (req, res, next) => {
  try {
    const { task: taskId } = req.query;

    let taskIds;
    if (taskId) {
      const task = await Task.findById(taskId);
      if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
      const isOwner = task.owner.equals(req.user.id);
      const isCollaborator = task.collaborators.some((c) => c.user.equals(req.user.id));
      if (!isOwner && !isCollaborator) return res.status(403).json({ success: false, message: 'Not authorized' });
      taskIds = [taskId];
    } else {
      const tasks = await Task.find({
        $or: [{ owner: req.user.id }, { 'collaborators.user': req.user.id }],
      }).select('_id');
      taskIds = tasks.map((t) => t._id);
    }

    const logs = await ActivityLog.find({ task: { $in: taskIds } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('actor', 'name email avatar')
      .populate('task', 'title');

    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};
