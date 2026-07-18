const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    dueDate: { type: Date },
    status: { type: String, enum: ['pending', 'active', 'completed'], default: 'pending' },
    tags: [{ type: String, trim: true }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isCollaborative: { type: Boolean, default: false },
    collaborators: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['owner', 'collaborator', 'viewer'], default: 'collaborator' },
      },
    ],
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

taskSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Task', taskSchema);
