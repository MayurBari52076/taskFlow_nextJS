const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invitedEmail: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ['collaborator', 'viewer'], default: 'collaborator' },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Invitation', invitationSchema);
