const { requireAuth } = require('./_lib/auth');
const { dashboardHtml } = require('./_lib/dashboardTemplate');

module.exports = async (req, res) => {
  if (!requireAuth(req, res)) return;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(dashboardHtml);
};
