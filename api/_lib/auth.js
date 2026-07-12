function checkAuth(req) {
  const header = req.headers.authorization || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;

  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const sepIndex = decoded.indexOf(':');
  if (sepIndex === -1) return false;

  const user = decoded.slice(0, sepIndex);
  const pass = decoded.slice(sepIndex + 1);
  return user === process.env.DASHBOARD_USER && pass === process.env.DASHBOARD_PASSWORD;
}

// Sends the 401 + WWW-Authenticate challenge and returns false when auth
// fails, so callers can `if (!requireAuth(req, res)) return;`
function requireAuth(req, res) {
  if (checkAuth(req)) return true;
  res.setHeader('WWW-Authenticate', 'Basic realm="AutoSuite Dashboard"');
  // Temporary diagnostic: reveals only whether the env vars are present,
  // never their values. Remove once the auth env var issue is resolved.
  res.setHeader('X-Debug-User-Set', String(Boolean(process.env.DASHBOARD_USER)));
  res.setHeader('X-Debug-Pass-Set', String(Boolean(process.env.DASHBOARD_PASSWORD)));
  res.setHeader('X-Debug-Header-Received', String(Boolean(req.headers.authorization)));
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

module.exports = { checkAuth, requireAuth };
