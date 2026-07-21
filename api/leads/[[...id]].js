const { prisma } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { broadcast } = require('../_lib/events');

const VALID_SOURCES = ['test-drive-modal', 'trade-in-estimator'];
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

// Handles both /api/leads and /api/leads/:id (Vercel optional catch-all) —
// merged into one function to stay under the Hobby plan's serverless
// function count limit.
module.exports = async (req, res) => {
  const idParam = req.query.id;
  const id = Array.isArray(idParam) ? idParam[0] : idParam;

  try {
    if (!id) {
      if (req.method === 'POST') {
        const { carId, carName, name, email, phone, source } = req.body || {};
        if (!carName || !name || !email || !phone) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const lead = await prisma.lead.create({
          data: {
            carId: carId || null,
            carName,
            name,
            email,
            phone,
            source: VALID_SOURCES.includes(source) ? source : 'test-drive-modal',
          },
        });
        broadcast('lead.created', { id: lead.id, name: lead.name, carName: lead.carName, status: lead.status });
        return res.status(201).json({ id: lead.id });
      }

      if (req.method === 'GET') {
        if (!requireAuth(req, res)) return;
        const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
        return res.status(200).json({ leads });
      }

      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!requireAuth(req, res)) return;

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
      broadcast('lead.updated', { id: lead.id, name: lead.name, status: lead.status, priority: lead.priority });
      return res.status(200).json({ lead });
    }

    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('api/leads error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
