/**
 * AutoSuite Dealer OS — shared shell behavior.
 * Included by every dos-shell page. Provides:
 *  - A single EventSource connection per page (window.DosShell.onEvent)
 *  - Command palette (Cmd/Ctrl+K, or click the sidebar search box)
 *  - A live notification bell fed by the same event stream
 */
(function () {
  const NAV_ITEMS = [
    { label: 'Overview', href: 'dashboard.html', icon: '▦' },
    { label: 'CRM', href: 'crm.html', icon: '☎' },
    { label: 'Inventory', href: 'inventory.html', icon: '▤' },
    { label: 'Appointments', href: 'appointments.html', icon: '◔' },
    { label: 'Customers', href: 'customers.html', icon: '✎' },
    { label: 'Analytics', href: 'analytics.html', icon: '▲' },
    { label: 'Staff Activity', href: 'staff-activity.html', icon: '◫' },
    { label: 'Settings', href: 'settings.html', icon: '⚙' }
  ];

  function authHeader() {
    return { Authorization: 'Basic ' + btoa('admin:admin') };
  }

  // ---------- Single shared SSE connection ----------
  const listeners = [];

  function dispatch(evt) {
    listeners.forEach(({ types, cb }) => {
      if (types.includes(evt.type)) cb(evt);
    });
  }

  function onEvent(types, cb) {
    listeners.push({ types, cb });
  }

  try {
    const source = new EventSource('/api/events');
    source.onmessage = (e) => {
      try {
        dispatch(JSON.parse(e.data));
      } catch (err) { /* ignore malformed frames */ }
    };
    source.onerror = () => console.warn('SSE connection lost, pages fall back to their own polling');
  } catch (err) {
    console.warn('EventSource unavailable:', err.message);
  }

  window.DosShell = { onEvent };

  // ---------- Command palette ----------
  let paletteEl, paletteInput, paletteResults;
  let searchCache = { leads: null, vehicles: null };

  function buildPalette() {
    paletteEl = document.createElement('div');
    paletteEl.id = 'dosPalette';
    paletteEl.style.cssText = 'position:fixed;inset:0;background:rgba(10,12,20,0.5);display:none;align-items:flex-start;justify-content:center;padding-top:14vh;z-index:1000;';
    paletteEl.innerHTML = `
      <div style="width:560px;max-width:92vw;background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
        <input id="dosPaletteInput" placeholder="Search leads, vehicles, or jump to a page..." style="width:100%;box-sizing:border-box;border:none;outline:none;padding:16px 18px;font:400 15px 'IBM Plex Sans',sans-serif;border-bottom:1px solid oklch(93% 0.005 260);">
        <div id="dosPaletteResults" style="max-height:360px;overflow-y:auto;"></div>
      </div>
    `;
    document.body.appendChild(paletteEl);
    paletteInput = document.getElementById('dosPaletteInput');
    paletteResults = document.getElementById('dosPaletteResults');
    paletteEl.addEventListener('click', (e) => { if (e.target === paletteEl) closePalette(); });
    paletteInput.addEventListener('input', () => renderPaletteResults(paletteInput.value));
  }

  function openPalette() {
    if (!paletteEl) buildPalette();
    paletteEl.style.display = 'flex';
    paletteInput.value = '';
    paletteInput.focus();
    renderPaletteResults('');
    prefetchSearchData();
  }

  function closePalette() {
    if (paletteEl) paletteEl.style.display = 'none';
  }

  async function prefetchSearchData() {
    if (searchCache.leads === null) {
      try {
        const res = await fetch('/api/leads', { headers: authHeader() });
        searchCache.leads = res.ok ? (await res.json()).leads : [];
      } catch (e) { searchCache.leads = []; }
    }
    if (searchCache.vehicles === null) {
      try {
        const res = await fetch('/api/vehicles');
        searchCache.vehicles = res.ok ? (await res.json()).vehicles : [];
      } catch (e) { searchCache.vehicles = []; }
    }
    renderPaletteResults(paletteInput.value);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderPaletteResults(query) {
    const q = query.trim().toLowerCase();
    const rows = [];

    NAV_ITEMS.forEach((item) => {
      if (!q || item.label.toLowerCase().includes(q)) {
        rows.push({ type: 'Page', icon: item.icon, label: item.label, sub: 'Go to page', href: item.href });
      }
    });

    if (q) {
      (searchCache.leads || []).forEach((lead) => {
        const hay = (lead.name + ' ' + lead.carName).toLowerCase();
        if (hay.includes(q)) {
          rows.push({ type: 'Lead', icon: '☎', label: lead.name, sub: lead.carName + ' · ' + (lead.status || 'NEW'), href: 'crm.html' });
        }
      });

      (searchCache.vehicles || []).forEach((v) => {
        const hay = (v.make + ' ' + v.model).toLowerCase();
        if (hay.includes(q)) {
          rows.push({ type: 'Vehicle', icon: '▤', label: `${v.make} ${v.model}`, sub: '₦' + v.price.toLocaleString(), href: 'inventory.html' });
        }
      });
    }

    if (rows.length === 0) {
      paletteResults.innerHTML = '<div style="padding:24px;text-align:center;color:oklch(50% 0.01 260);font:400 13px sans-serif;">No results</div>';
      return;
    }

    paletteResults.innerHTML = rows.slice(0, 20).map((r) => `
      <a href="${esc(r.href)}" style="display:flex;align-items:center;gap:12px;padding:12px 18px;text-decoration:none;color:inherit;border-bottom:1px solid oklch(96% 0.003 260);">
        <div style="width:28px;text-align:center;">${r.icon}</div>
        <div style="flex:1;">
          <div style="font:500 13px 'IBM Plex Sans',sans-serif;color:oklch(20% 0.01 260);">${esc(r.label)}</div>
          <div style="font:400 12px 'IBM Plex Sans',sans-serif;color:oklch(50% 0.01 260);">${esc(r.sub)}</div>
        </div>
        <div style="font:500 10px 'IBM Plex Mono',monospace;color:oklch(60% 0.01 260);text-transform:uppercase;">${r.type}</div>
      </a>
    `).join('');
  }

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openPalette();
    }
    if (e.key === 'Escape') closePalette();
  });

  // ---------- Notification bell ----------
  const NOTIF_MAX = 20;
  let notifications = [];
  let notifPanel, notifBadge;

  function iconFor(type) {
    if (type.startsWith('lead')) return '☎';
    if (type.startsWith('appointment')) return '◔';
    if (type.startsWith('vehicle')) return '▤';
    return '•';
  }

  function textFor(evt) {
    const p = evt.payload || {};
    switch (evt.type) {
      case 'lead.created': return `New lead: ${p.name} — ${p.carName}`;
      case 'lead.updated': return `${p.name} moved to ${p.status}`;
      case 'appointment.created': return 'New appointment scheduled';
      case 'appointment.updated': return `Appointment marked ${p.status}`;
      case 'vehicle.created': return `Vehicle added: ${p.make} ${p.model}`;
      case 'vehicle.updated': return `Vehicle updated: ${(p.make || '') + ' ' + (p.model || '')}`.trim();
      case 'vehicle.deleted': return 'Vehicle removed from inventory';
      default: return evt.type;
    }
  }

  function renderNotifPanel() {
    if (!notifPanel) return;
    if (notifications.length === 0) {
      notifPanel.innerHTML = '<div style="padding:20px;text-align:center;color:oklch(50% 0.01 260);font:400 13px sans-serif;">No notifications yet</div>';
      return;
    }
    notifPanel.innerHTML = notifications.map((n) => `
      <div style="display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid oklch(96% 0.003 260);">
        <div style="width:24px;">${iconFor(n.type)}</div>
        <div style="flex:1;">
          <div style="font:400 13px 'IBM Plex Sans',sans-serif;color:oklch(25% 0.01 260);">${esc(textFor(n))}</div>
          <div style="font:400 11px 'IBM Plex Mono',monospace;color:oklch(55% 0.01 260);margin-top:2px;">${new Date(n.at).toLocaleTimeString()}</div>
        </div>
      </div>
    `).join('');
  }

  function initBell() {
    const bellWrap = document.querySelector('[data-dos-bell]');
    if (!bellWrap) return;
    bellWrap.style.position = 'relative';
    bellWrap.style.cursor = 'pointer';
    notifBadge = bellWrap.querySelector('[data-dos-bell-dot]');
    if (notifBadge) notifBadge.style.display = 'none';

    notifPanel = document.createElement('div');
    notifPanel.style.cssText = 'position:absolute;top:24px;right:0;width:320px;max-height:400px;overflow-y:auto;background:#fff;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,0.18);display:none;z-index:1001;';
    bellWrap.appendChild(notifPanel);
    renderNotifPanel();

    bellWrap.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = notifPanel.style.display === 'block';
      notifPanel.style.display = isOpen ? 'none' : 'block';
      if (!isOpen && notifBadge) notifBadge.style.display = 'none';
    });
    document.addEventListener('click', () => { notifPanel.style.display = 'none'; });
  }

  function pushNotification(evt) {
    notifications.unshift(evt);
    if (notifications.length > NOTIF_MAX) notifications.pop();
    renderNotifPanel();
    if (notifBadge) notifBadge.style.display = 'block';
  }

  function initSearchBox() {
    const box = document.querySelector('[data-dos-search]');
    if (box) {
      box.style.cursor = 'pointer';
      box.addEventListener('click', openPalette);
    }
  }

  function init() {
    initSearchBox();
    initBell();
    onEvent(
      ['lead.created', 'lead.updated', 'appointment.created', 'appointment.updated', 'vehicle.created', 'vehicle.updated', 'vehicle.deleted'],
      pushNotification
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
