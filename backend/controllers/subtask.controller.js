const Subtask = require('../models/Subtask.model');
const Task = require('../models/Task.model');
const ActivityLog = require('../models/ActivityLog.model');
const Notification = require('../models/Notification.model');

// Recalculates and persists the parent task's progress based on ALL
// subtasks belonging to it (nesting doesn't change the denominator —
// every subtask, at any depth, counts equally toward completion).
// Returns true if this call is what pushed the task to 100% completion.
async function recalcTaskProgress(taskId) {
  const subtasks = await Subtask.find({ task: taskId });
  if (subtasks.length === 0) {
    await Task.findByIdAndUpdate(taskId, { progress: 0 });
    return false;
  }

  const completed = subtasks.filter((s) => s.completed).length;
  const progress = Math.round((completed / subtasks.length) * 100);

  const task = await Task.findById(taskId);
  const wasAlreadyCompleted = task.status === 'completed';

  const update = { progress };
  if (progress === 100) update.status = 'completed';
  await Task.findByIdAndUpdate(taskId, update);

  return progress === 100 && !wasAlreadyCompleted;
}

async function assertTaskAccess(taskId, userId, requireEditRole = false) {
  const task = await Task.findById(taskId);
  if (!task) return { task: null, allowed: false };

  const isOwner = task.owner.equals(userId);
  const collab = task.collaborators.find((c) => c.user.equals(userId));
  const isCollaborator = Boolean(collab);

  if (!isOwner && !isCollaborator) return { task, allowed: false };
  if (requireEditRole && !isOwner && collab.role === 'viewer') return { task, allowed: false };

  return { task, allowed: true };
}

// GET /subtasks?task=<taskId> — flat list; frontend builds the tree via parentSubtask
exports.list = async (req, res, next) => {
  try {
    const { task: taskId } = req.query;
    if (!taskId) return res.status(400).json({ success: false, message: 'task query param is required' });

    const { allowed } = await assertTaskAccess(taskId, req.user.id);
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });

    const subtasks = await Subtask.find({ task: taskId }).sort({ createdAt: 1 });
    res.json({ success: true, data: subtasks });
  } catch (err) {
    next(err);
  }
};

// POST /subtasks — { task, parentSubtask?, title }
exports.create = async (req, res, next) => {
  try {
    const { task: taskId, parentSubtask, title } = req.body;
    if (!taskId || !title) {
      return res.status(400).json({ success: false, message: 'task and title are required' });
    }

    const { allowed } = await assertTaskAccess(taskId, req.user.id, true);
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (parentSubtask) {
      const parent = await Subtask.findById(parentSubtask);
      if (!parent || !parent.task.equals(taskId)) {
        return res.status(400).json({ success: false, message: 'Invalid parent subtask' });
      }
    }

    const subtask = await Subtask.create({
      task: taskId,
      parentSubtask: parentSubtask || null,
      title,
      createdBy: req.user.id,
    });

    await recalcTaskProgress(taskId);

    res.status(201).json({ success: true, data: subtask });
  } catch (err) {
    next(err);
  }
};

// PATCH /subtasks/:id — { title?, completed? }
exports.update = async (req, res, next) => {
  try {
    const subtask = await Subtask.findById(req.params.id);
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found' });

    const { allowed } = await assertTaskAccess(subtask.task, req.user.id, true);
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });

    if (req.body.title !== undefined) subtask.title = req.body.title;
    const wasCompleted = subtask.completed;
    if (req.body.completed !== undefined) subtask.completed = req.body.completed;

    await subtask.save();
    const justCompletedTask = await recalcTaskProgress(subtask.task);

    if (!wasCompleted && subtask.completed) {
      await ActivityLog.create({ task: subtask.task, actor: req.user.id, action: 'subtask_completed' });
    }

    if (justCompletedTask) {
      const task = await Task.findById(subtask.task);
      if (!task.owner.equals(req.user.id)) {
        const notification = await Notification.create({
          recipient: task.owner,
          type: 'task_completed',
          task: task._id,
          message: `"${task.title}" is now complete`,
        });
        const io = req.app.get('io');
        if (io) io.to(`user:${task.owner}`).emit('notification:new', notification);
      }
    }

    res.json({ success: true, data: subtask });
  } catch (err) {
    next(err);
  }
};

// DELETE /subtasks/:id — also removes descendants to keep the tree consistent
exports.remove = async (req, res, next) => {
  try {
    const subtask = await Subtask.findById(req.params.id);
    if (!subtask) return res.status(404).json({ success: false, message: 'Subtask not found' });

    const { allowed } = await assertTaskAccess(subtask.task, req.user.id, true);
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });

    // Collect all descendant ids (any depth) via BFS, then delete the whole subtree.
    const toDelete = [subtask._id];
    let frontier = [subtask._id];
    while (frontier.length > 0) {
      const children = await Subtask.find({ parentSubtask: { $in: frontier } }).select('_id');
      const childIds = children.map((c) => c._id);
      toDelete.push(...childIds);
      frontier = childIds;
    }

    await Subtask.deleteMany({ _id: { $in: toDelete } });
    await recalcTaskProgress(subtask.task);

    res.json({ success: true, message: 'Subtask and its children deleted' });
  } catch (err) {
    next(err);
  }
};
