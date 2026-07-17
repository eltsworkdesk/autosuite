const { prisma } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');

const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPT_SCHEDULED', 'NEGOTIATING', 'SOLD', 'LOST'];
const VALID_PRIORITIES = ['Low', 'Normal', 'High'];

function isValidTags(tags) {
  return Array.isArray(tags) && tags.every((t) => typeof t === 'string');
}

function isValidTasks(tasks) {
  return (
    Array.isArray(tasks) &&
    tasks.every((t) => t && typeof t.id === 'string' && typeof t.text === 'string' && typeof t.done === 'boolean')
  );
}

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;

  try {
    const { id } = req.query;

    if (req.method === 'PATCH') {
      const { status, priority, tags, tasks } = req.body || {};
      const data = {};

      if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid status' });
        data.status = status;
      }
      if (priority !== undefined) {
        if (!VALID_PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });
        data.priority = priority;
      }
      if (tags !== undefined) {
        if (!isValidTags(tags)) return res.status(400).json({ error: 'Invalid tags' });
        data.tags = tags;
      }
      if (tasks !== undefined) {
        if (!isValidTasks(tasks)) return res.status(400).json({ error: 'Invalid tasks' });
        data.tasks = tasks;
      }
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      const lead = await prisma.lead.update({ where: { id }, data });
      return res.status(200).json({ lead });
    }

    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/leads/[id] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
