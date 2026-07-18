const { v4: uuidv4 } = require('uuid');
const Task = require('../models/Task.model');
const Invitation = require('../models/Invitation.model');
const Notification = require('../models/Notification.model');
const ActivityLog = require('../models/ActivityLog.model');
const transporter = require('../config/mailer');

const INVITE_EXPIRY_DAYS = 7;

async function assertOwner(taskId, userId) {
  const task = await Task.findById(taskId);
  if (!task) return { task: null, isOwner: false };
  return { task, isOwner: task.owner.equals(userId) };
}

// GET /invitations?task=<taskId> — owner-only: list all invitations for a task
exports.list = async (req, res, next) => {
  try {
    const { task: taskId } = req.query;
    if (!taskId) return res.status(400).json({ success: false, message: 'task query param is required' });

    const { task, isOwner } = await assertOwner(taskId, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (!isOwner) return res.status(403).json({ success: false, message: 'Only the owner can view invitations' });

    const invitations = await Invitation.find({ task: taskId }).sort({ createdAt: -1 });
    res.json({ success: true, data: invitations });
  } catch (err) {
    next(err);
  }
};

// POST /invitations — { task, email, role } — owner-only
exports.create = async (req, res, next) => {
  try {
    const { task: taskId, email, role } = req.body;
    if (!taskId || !email) {
      return res.status(400).json({ success: false, message: 'task and email are required' });
    }
    const finalRole = ['collaborator', 'viewer'].includes(role) ? role : 'collaborator';

    const { task, isOwner } = await assertOwner(taskId, req.user.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (!isOwner) return res.status(403).json({ success: false, message: 'Only the owner can invite collaborators' });

    const invitedEmail = email.toLowerCase().trim();
    if (invitedEmail === req.user.email?.toLowerCase()) {
      return res.status(400).json({ success: false, message: "You can't invite yourself" });
    }

    const User = require('../models/User.model');
    const existingUser = await User.findOne({ email: invitedEmail });
    if (existingUser) {
      const alreadyCollaborator = task.collaborators.some((c) => c.user.equals(existingUser._id));
      if (alreadyCollaborator) {
        return res.status(409).json({ success: false, message: 'This person already has access' });
      }
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invitation = await Invitation.create({
      task: taskId,
      invitedBy: req.user.id,
      invitedEmail,
      role: finalRole,
      token,
      expiresAt,
    });

    const inviteLink = `${process.env.CLIENT_URL}/invite/${token}`;

    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: invitedEmail,
        subject: `You've been invited to collaborate on "${task.title}" — TaskFlow`,
        html: `<p>You've been invited as a <strong>${finalRole}</strong> on "${task.title}".</p>
               <p><a href="${inviteLink}">Accept invitation</a> (expires in ${INVITE_EXPIRY_DAYS} days)</p>`,
      });
    } catch (mailErr) {
      // Email delivery failing shouldn't block invite creation — SMTP creds may not be configured yet.
      console.warn('Invitation email not sent:', mailErr.message);
    }

    res.status(201).json({ success: true, data: invitation, inviteLink });
  } catch (err) {
    next(err);
  }
};

// GET /invitations/accept/:token — protected: logged-in user accepts an invitation.
// Their session email must match the invited email exactly.
exports.accept = async (req, res, next) => {
  try {
    const invitation = await Invitation.findOne({ token: req.params.token });
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });

    if (invitation.status === 'accepted') {
      return res.status(409).json({ success: false, message: 'This invitation has already been used' });
    }
    if (invitation.status === 'expired' || invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(410).json({ success: false, message: 'This invitation has expired' });
    }

    if (invitation.invitedEmail !== req.user.email?.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email address. Log in with that account to accept it.',
      });
    }

    const task = await Task.findById(invitation.task);
    if (!task) return res.status(404).json({ success: false, message: 'Task no longer exists' });

    const alreadyIn = task.collaborators.some((c) => c.user.equals(req.user.id));
    if (!alreadyIn) {
      task.collaborators.push({ user: req.user.id, role: invitation.role });
      task.isCollaborative = true;
      await task.save();
    }

    invitation.status = 'accepted';
    await invitation.save();

    await ActivityLog.create({ task: task._id, actor: req.user.id, action: 'collaborator_joined' });

    const notification = await Notification.create({
      recipient: invitation.invitedBy,
      type: 'invitation',
      task: task._id,
      message: `${req.user.email} joined "${task.title}" as a ${invitation.role}`,
    });

    const io = req.app.get('io');
    if (io) io.to(`user:${invitation.invitedBy}`).emit('notification:new', notification);

    res.json({ success: true, data: { task, role: invitation.role } });
  } catch (err) {
    next(err);
  }
};

// DELETE /invitations/:id — owner-only: revoke a pending invitation
exports.revoke = async (req, res, next) => {
  try {
    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) return res.status(404).json({ success: false, message: 'Invitation not found' });

    const { isOwner } = await assertOwner(invitation.task, req.user.id);
    if (!isOwner) return res.status(403).json({ success: false, message: 'Only the owner can revoke invitations' });

    if (invitation.status === 'accepted') {
      return res.status(409).json({ success: false, message: 'Cannot revoke an already-accepted invitation' });
    }

    await invitation.deleteOne();
    res.json({ success: true, message: 'Invitation revoked' });
  } catch (err) {
    next(err);
  }
};
