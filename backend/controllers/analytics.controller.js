const Task = require('../models/Task.model');

// GET /analytics — summary stats + chart data for tasks the user owns or collaborates on
exports.list = async (req, res, next) => {
  try {
    const ownershipFilter = {
      $or: [{ owner: req.user.id }, { 'collaborators.user': req.user.id }],
    };

    const tasks = await Task.find(ownershipFilter);

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const active = tasks.filter((t) => t.status === 'active').length;
    const overdue = tasks.filter((t) => t.dueDate && t.dueDate < new Date() && t.status !== 'completed').length;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityBreakdown = {
      low: tasks.filter((t) => t.priority === 'low').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      high: tasks.filter((t) => t.priority === 'high').length,
    };

    // Tasks created per day over the last 14 days, for a trend line
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    const trend = days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = tasks.filter((t) => t.createdAt >= day && t.createdAt < next).length;
      return { date: day.toISOString().slice(0, 10), count };
    });

    res.json({
      success: true,
      data: {
        stats: { total, completed, pending, active, overdue, productivity },
        priorityBreakdown,
        trend,
      },
    });
  } catch (err) {
    next(err);
  }
};
