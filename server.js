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

// Simulated API handlers (normally Vercel functions)
const handlers = {
  leads: require('./api/leads.js'),
  'leads/[id]': require('./api/leads/[id].js'),
  dashboard: require('./api/dashboard.js')
};

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

  // Route API requests
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice(5); // Remove '/api/'
    const handler = handlers[apiPath] || handlers['leads/[id]'];

    if (handler) {
      parseBody(req, (body) => {
        const mockReq = {
          method: req.method,
          headers: req.headers,
          body,
          query: parsedUrl.query || {},
          url: pathname
        };

        // Extract [id] from URL if present
        if (pathname.startsWith('/api/leads/')) {
          mockReq.query.id = pathname.split('/')[3];
        }

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
            return this;
          },
          send(data) {
            this.body = data;
            return this;
          },
          setHeader(key, val) {
            this.headers[key] = val;
            return this;
          },
          end(data) {
            if (data) this.body = data;
            res.writeHead(this.statusCode, this.headers);
            res.end(this.body);
          }
        };

        // Call handler
        handler(mockReq, mockRes).catch((err) => {
          console.error('API Error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
        });
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
