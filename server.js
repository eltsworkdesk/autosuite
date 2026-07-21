/**
 * AutoSuite Development Server
 * Serves static files + API routes locally for testing
 *
 * Usage: node server.js
 * Then visit: http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { emitter } = require('./api/_lib/events');

// Simulated API handlers (normally Vercel functions). leads/appointments/
// vehicles each merge their bare-collection and by-id routes into a single
// flat handler file, matching vercel.json's explicit rewrites (both
// /api/<collection> and /api/<collection>/:id route to the same function,
// with :id passed through as a query param) — kept flat + explicit rather
// than relying on Vercel bracket-folder conventions, to stay under the
// Hobby plan's serverless function count limit.
const handlers = {
  leads: require('./api/leads-handler.js'),
  dashboard: require('./api/dashboard.js'),
  vehicles: require('./api/vehicles-handler.js'),
  appointments: require('./api/appointments-handler.js'),
  'trade-ins': require('./api/trade-ins.js'),
  finance: require('./api/finance.js'),
  analytics: require('./api/analytics.js'),
  customers: require('./api/customers.js'),
  team: require('./api/team.js'),
  dealership: require('./api/dealership.js')
};

// Collections whose /api/<name>/:id path routes to the bare handler above,
// with :id passed as a query param — mirrors the vercel.json rewrites.
const idRewriteCollections = new Set(['leads', 'vehicles', 'appointments']);

const PORT = process.env.PORT || 3000;
const HOST = 'localhost';

// MIME types
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

function getMimeType(filePath) {
  return mimeTypes[path.extname(filePath)] || 'application/octet-stream';
}

function serveStaticFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 Not Found</h1>');
      return;
    }
    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    res.end(data);
  });
}

function parseBody(req, callback) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    try {
      callback(body ? JSON.parse(body) : {});
    } catch (e) {
      callback({});
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  // Set CORS headers for API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Server-Sent Events stream: a long-lived connection, so it bypasses the
  // one-shot mock req/res dispatch used for the rest of /api/*.
  if (pathname === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(':ok\n\n');

    const onEvent = (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    };
    emitter.on('event', onEvent);

    const heartbeat = setInterval(() => res.write(':hb\n\n'), 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      emitter.off('event', onEvent);
    });
    return;
  }

  // Route API requests
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice(5); // Remove '/api/'
    const segments = apiPath.split('/').filter(Boolean);
    // /api/<collection>/<id> rewrites to the bare '<collection>' handler
    // with :id as a query param, mirroring the vercel.json rewrites.
    const isIdRewrite = segments.length === 2 && idRewriteCollections.has(segments[0]);
    const handler = handlers[apiPath] || (isIdRewrite ? handlers[segments[0]] : undefined);

    if (handler) {
      parseBody(req, (body) => {
        const mockReq = {
          method: req.method,
          headers: req.headers,
          body,
          query: parsedUrl.query || {},
          url: pathname
        };

        if (isIdRewrite) {
          mockReq.query.id = segments[1];
        }

        let responseSent = false;

        const mockRes = {
          statusCode: 200,
          headers: {},
          body: null,
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(data) {
            this.body = JSON.stringify(data);
            this.headers['Content-Type'] = 'application/json';
            this.end();
            return this;
          },
          send(data) {
            this.body = data;
            this.end();
            return this;
          },
          setHeader(key, val) {
            this.headers[key] = val;
            return this;
          },
          end(data) {
            if (responseSent) return;
            responseSent = true;
            if (data) this.body = data;
            res.writeHead(this.statusCode, this.headers);
            res.end(this.body || '');
          }
        };

        // Call handler
        try {
          const result = handler(mockReq, mockRes);
          if (result && typeof result.then === 'function') {
            result
              .then(() => {
                if (!responseSent) {
                  // Handler didn't send response, send empty 200
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end('{}');
                }
              })
              .catch((err) => {
                console.error(`API Error [${pathname}]:`, err);
                if (!responseSent) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ error: 'Internal server error' }));
                }
              });
          }
        } catch (err) {
          console.error(`API Sync Error [${pathname}]:`, err);
          if (!responseSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        }
      });
      return;
    }
  }

  // Serve static files
  let filePath = pathname === '/' ? 'index.html' : pathname;

  // Try file as-is first
  let fullPath = path.join(__dirname, filePath);

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If not found, try with .html extension
      if (!filePath.endsWith('.html')) {
        fullPath = path.join(__dirname, filePath + '.html');
      }
    }

    fs.stat(fullPath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Try as index.html if directory
        fullPath = path.join(__dirname, filePath, 'index.html');
        fs.stat(fullPath, (err, stats) => {
          if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 Not Found</h1><p>File: ' + pathname + '</p>');
            return;
          }
          serveStaticFile(fullPath, res);
        });
      } else {
        serveStaticFile(fullPath, res);
      }
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║    AutoSuite Dev Server Running        ║
╠════════════════════════════════════════╣
║                                        ║
║  🌐 http://${HOST}:${PORT}                  ║
║                                        ║
║  Consumer:  http://${HOST}:${PORT}            ║
║  Inventory: http://${HOST}:${PORT}/pages/cars.html ║
║  Vehicle:   http://${HOST}:${PORT}/pages/car-page.html ║
║  Dashboard: http://${HOST}:${PORT}/pages/dashboard.html ║
║  CRM:       http://${HOST}:${PORT}/pages/crm.html    ║
║                                        ║
║  Auth: admin / admin                  ║
║                                        ║
║  Press Ctrl+C to stop                 ║
║                                        ║
╚════════════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    process.exit(1);
  } else {
    throw err;
  }
});
