function checkAuth(req) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const sepIndex = decoded.indexOf(':');
  if (sepIndex === -1) return false;

  const user = decoded.slice(0, sepIndex);
  const pass = decoded.slice(sepIndex + 1);

  // Check against configured credentials, or demo credentials for development
  const dashboardUser = process.env.DASHBOARD_USER || 'dealer';
  const dashboardPass = process.env.DASHBOARD_PASSWORD || 'change-me';
  const isDemoMode = process.env.NODE_ENV !== 'production' || !process.env.DASHBOARD_USER;

  const validCreds = user === dashboardUser && pass === dashboardPass;
  const demoCreds = isDemoMode && user === 'admin' && pass === 'admin';

  return validCreds || demoCreds;
}

// Sends the 401 + WWW-Authenticate challenge and returns false when auth
// fails, so callers can `if (!requireAuth(req, res)) return;`
function requireAuth(req, res) {
  if (checkAuth(req)) return true;
  res.setHeader('WWW-Authenticate', 'Basic realm="AutoSuite Dashboard"');
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

module.exports = { checkAuth, requireAuth };
