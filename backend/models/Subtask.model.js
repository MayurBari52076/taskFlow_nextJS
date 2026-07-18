const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    parentSubtask: { type: mongoose.Schema.Types.ObjectId, ref: 'Subtask', default: null }, // supports unlimited nesting
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subtask', subtaskSchema);
