const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');
const File = require('../models/File.model');
const Task = require('../models/Task.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');

async function assertAccess(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return { task: null, allowed: false };
  const isOwner = task.owner.equals(userId);
  const isCollaborator = task.collaborators.some((c) => c.user.equals(userId));
  return { task, allowed: isOwner || isCollaborator };
}

function uploadBufferToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'taskflow', public_id: undefined, filename_override: filename, use_filename: true },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// GET /files?task=<taskId>
exports.list = async (req, res, next) => {
  try {
    const { task: taskId } = req.query;
    if (!taskId) return res.status(400).json({ success: false, message: 'task query param is required' });

    const { task, allowed } = await assertAccess(taskId, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });

    const files = await File.find({ task: taskId }).sort({ createdAt: -1 }).populate('uploadedBy', 'name email avatar');
    res.json({ success: true, data: files });
  } catch (err) {
    next(err);
  }
};

// POST /files — multipart/form-data, field name "file", plus "task" in body
exports.upload = async (req, res, next) => {
  try {
    const { task: taskId } = req.body;
    if (!taskId) return res.status(400).json({ success: false, message: 'task is required' });
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const { task, allowed } = await assertAccess(taskId, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (!allowed) return res.status(403).json({ success: false, message: 'Not authorized' });

    const result = await uploadBufferToCloudinary(req.file.buffer, req.file.originalname);

    const file = await File.create({
      task: taskId,
      uploadedBy: req.user.id,
      originalName: req.file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
    await file.populate('uploadedBy', 'name email avatar');

    await ActivityLog.create({ task: taskId, actor: req.user.id, action: 'file_uploaded' });

    // Notify everyone else with access
    const recipients = [task.owner, ...task.collaborators.map((c) => c.user)].filter(
      (id) => !id.equals(req.user.id)
    );
    const io = req.app.get('io');
    for (const recipientId of recipients) {
      const notification = await Notification.create({
        recipient: recipientId,
        type: 'file_upload',
        task: taskId,
        message: `${req.user.email} uploaded "${req.file.originalname}" to "${task.title}"`,
      });
      if (io) io.to(`user:${recipientId}`).emit('notification:new', notification);
    }

    res.status(201).json({ success: true, data: file });
  } catch (err) {
    next(err);
  }
};

// DELETE /files/:id — uploader or task owner only
exports.remove = async (req, res, next) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found' });

    const task = await Task.findById(file.task);
    const isUploader = file.uploadedBy.equals(req.user.id);
    const isTaskOwner = task && task.owner.equals(req.user.id);
    if (!isUploader && !isTaskOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this file' });
    }

    await cloudinary.uploader.destroy(file.publicId, { resource_type: 'auto' }).catch(() => {});
    await file.deleteOne();

    res.json({ success: true, message: 'File deleted' });
  } catch (err) {
    next(err);
  }
};
