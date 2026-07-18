const jwt = require('jsonwebtoken');
const Task = require('../models/Task.model');
const Message = require('../models/Message.model');
const ActivityLog = require('../models/ActivityLog.model');

// Tracks which users are online per task room: { taskId: Set(userId) }
const onlineUsers = new Map();

async function hasTaskAccess(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return false;
  const isOwner = task.owner.equals(userId);
  const isCollaborator = task.collaborators.some((c) => c.user.equals(userId));
  return isOwner || isCollaborator;
}

module.exports = function initSockets(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    // --- Task room (chat) ---
    socket.on('task:join', async (taskId) => {
      const allowed = await hasTaskAccess(taskId, socket.user.id);
      if (!allowed) return;

      socket.join(`task:${taskId}`);
      if (!onlineUsers.has(taskId)) onlineUsers.set(taskId, new Set());
      onlineUsers.get(taskId).add(socket.user.id);
      io.to(`task:${taskId}`).emit('task:online-users', Array.from(onlineUsers.get(taskId)));
    });

    socket.on('task:leave', (taskId) => {
      socket.leave(`task:${taskId}`);
      onlineUsers.get(taskId)?.delete(socket.user.id);
      io.to(`task:${taskId}`).emit('task:online-users', Array.from(onlineUsers.get(taskId) || []));
    });

    // --- Chat: persist then broadcast ---
    socket.on('chat:message', async ({ taskId, content }) => {
      try {
        if (!content?.trim()) return;
        const allowed = await hasTaskAccess(taskId, socket.user.id);
        if (!allowed) return;

        const message = await Message.create({
          task: taskId,
          sender: socket.user.id,
          content: content.trim(),
          readBy: [socket.user.id],
        });
        await message.populate('sender', 'name email avatar');

        io.to(`task:${taskId}`).emit('chat:message', message);
        await ActivityLog.create({ task: taskId, actor: socket.user.id, action: 'message_sent' });
      } catch (err) {
        console.error('chat:message error', err.message);
      }
    });

    socket.on('chat:typing', ({ taskId, isTyping }) => {
      socket.to(`task:${taskId}`).emit('chat:typing', { userId: socket.user.id, isTyping });
    });

    socket.on('chat:read', async ({ taskId, messageId }) => {
      try {
        await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: socket.user.id } });
        io.to(`task:${taskId}`).emit('chat:read', { messageId, userId: socket.user.id });
      } catch (err) {
        console.error('chat:read error', err.message);
      }
    });

    // --- Notifications (per-user room) ---
    socket.join(`user:${socket.user.id}`);

    socket.on('disconnect', () => {
      onlineUsers.forEach((users, taskId) => {
        users.delete(socket.user.id);
        io.to(`task:${taskId}`).emit('task:online-users', Array.from(users));
      });
    });
  });
};

module.exports.emitNotification = function emitNotification(io, userId, notification) {
  io.to(`user:${userId}`).emit('notification:new', notification);
};
