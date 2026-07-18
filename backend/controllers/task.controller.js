const Task = require('../models/Task.model');
const Subtask = require('../models/Subtask.model');
const ActivityLog = require('../models/ActivityLog.model');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /tasks — supports search, filter, and sort per the spec:
//   ?search=text          matches title, description, tags, or any subtask title
//   ?status=pending|active|completed
//   ?priority=low|medium|high
//   ?overdue=true         dueDate is in the past and status isn't completed
//   ?sort=latest|oldest|alphabetical|dueDate  (default: latest)
exports.list = async (req, res, next) => {
  try {
    const { search, status, priority, overdue, sort } = req.query;

    const ownershipFilter = {
      $or: [{ owner: req.user.id }, { 'collaborators.user': req.user.id }],
    };

    const andClauses = [ownershipFilter];

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      const subtaskTaskIds = await Subtask.find({ title: regex }).distinct('task');
      andClauses.push({
        $or: [{ title: regex }, { description: regex }, { tags: regex }, { _id: { $in: subtaskTaskIds } }],
      });
    }

    if (status) andClauses.push({ status });
    if (priority) andClauses.push({ priority });
    if (overdue === 'true') {
      andClauses.push({ dueDate: { $lt: new Date() }, status: { $ne: 'completed' } });
    }

    const filter = { $and: andClauses };

    const sortMap = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      alphabetical: { title: 1 },
      dueDate: { dueDate: 1 },
    };
    const sortOption = sortMap[sort] || sortMap.latest;

    const tasks = await Task.find(filter).sort(sortOption);
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
};

// GET /tasks/:id
exports.getOne = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const isOwner = task.owner._id.equals(req.user.id);
    const isCollaborator = task.collaborators.some((c) => c.user._id.equals(req.user.id));
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// POST /tasks
exports.create = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      tags,
      owner: req.user.id,
    });

    await ActivityLog.create({ task: task._id, actor: req.user.id, action: 'task_created' });

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// PATCH /tasks/:id
exports.update = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    const isOwner = task.owner.equals(req.user.id);
    const collab = task.collaborators.find((c) => c.user.equals(req.user.id));
    if (!isOwner && (!collab || collab.role === 'viewer')) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this task' });
    }

    const allowedFields = ['title', 'description', 'priority', 'dueDate', 'status', 'tags'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await ActivityLog.create({ task: task._id, actor: req.user.id, action: 'task_edited' });

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// DELETE /tasks/:id
exports.remove = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    if (!task.owner.equals(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this task' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};
