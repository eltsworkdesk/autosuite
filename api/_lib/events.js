const { EventEmitter } = require('events');

// Shared in-process pub/sub. In the dev server this lives as long as the
// Node process; API handlers call broadcast() after a mutation and the SSE
// endpoint in server.js relays it to every connected browser tab.
const emitter = new EventEmitter();
emitter.setMaxListeners(50);

function broadcast(type, payload) {
  emitter.emit('event', { type, payload, at: new Date().toISOString() });
}

module.exports = { emitter, broadcast };
