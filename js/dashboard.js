(function () {
  const STAGES = [
    { id: 'NEW', label: 'New', color: 'oklch(48% 0.16 260)' },
    { id: 'CONTACTED', label: 'Contacted', color: 'oklch(50% 0.12 235)' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'oklch(55% 0.1 190)' },
    { id: 'APPT_SCHEDULED', label: 'Appt. Scheduled', color: 'oklch(60% 0.12 155)' },
    { id: 'NEGOTIATING', label: 'Negotiating', color: 'oklch(58% 0.15 55)' },
    { id: 'SOLD', label: 'Sold', color: 'oklch(58% 0.14 145)' },
    { id: 'LOST', label: 'Lost', color: 'oklch(60% 0.01 260)' },
  ];
  const OPEN_STAGES = ['NEW', 'CONTACTED', 'QUALIFIED', 'APPT_SCHEDULED', 'NEGOTIATING'];

  let leads = [];
  let cars = [];

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }
  function naira(n) { return '₦' + Number(n).toLocaleString('en-NG'); }
  function relTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.round(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    const h = Math.round(m / 60);
    if (h < 24) return h + ' hr ago';
    return Math.round(h / 24) + ' d ago';
  }

  /* ---------- Sidebar view switching ---------- */
  const navItems = document.querySelectorAll('.dos-navitem[data-view]');
  const views = document.querySelectorAll('.dos-view[data-view]');
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      navItems.forEach((n) => n.classList.toggle('active', n === btn));
      views.forEach((v) => { v.hidden = v.dataset.view !== view; });
    });
  });

  /* ---------- CRM board/table tabs ---------- */
  const crmTabs = document.querySelectorAll('.crm-tab');
  const crmBoard = document.getElementById('crmBoard');
  const crmTable = document.getElementById('crmTable');
  crmTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const v = tab.dataset.crm;
      crmTabs.forEach((t) => { const on = t === tab; t.classList.toggle('active', on); t.setAttribute('aria-selected', String(on)); });
      crmBoard.hidden = v !== 'board';
      crmTable.hidden = v !== 'table';
    });
  });

  function statusSelect(lead) {
    const opts = STAGES.map((s) => `<option value="${s.id}"${s.id === lead.status ? ' selected' : ''}>${s.label}</option>`).join('');
    return `<select class="crm-select" data-id="${lead.id}" aria-label="Status for ${esc(lead.name)}">${opts}</select>`;
  }

  async function onStatusChange(e) {
    const sel = e.target;
    if (!sel.classList.contains('crm-select')) return;
    const id = sel.dataset.id;
    const status = sel.value;
    sel.disabled = true;
    try {
      const res = await fetch('/api/leads/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error('fail');
      const lead = leads.find((l) => l.id === id);
      if (lead) lead.status = status;
      document.getElementById('crmLive').textContent = 'Status updated.';
      renderCrm();
      renderOverview();
      renderAnalytics();
    } catch (err) {
      document.getElementById('crmLive').textContent = 'Could not update. Try again.';
      sel.disabled = false;
    }
  }

  /* ---------- CRM ---------- */
  function renderCrm() {
    if (leads.length === 0) {
      crmBoard.innerHTML = '<p class="crm-empty">No leads yet. Book a test drive on the storefront to see one land here.</p>';
      document.getElementById('crmTableBody').innerHTML = '';
      return;
    }
    crmBoard.innerHTML = STAGES.map((stage) => {
      const inStage = leads.filter((l) => l.status === stage.id);
      const cards = inStage.map((l) => `
        <div class="crm-card">
          <div class="crm-card-top"><span class="crm-card-name">${esc(l.name)}</span></div>
          <div class="crm-card-vehicle">${esc(l.carName)}</div>
          <div class="crm-card-foot"><span class="crm-source">${esc((l.source || 'website').replace('test-drive-modal', 'Website').replace('trade-in-estimator', 'Trade-in'))}</span></div>
          ${statusSelect(l)}
        </div>`).join('');
      return `<div class="crm-col">
        <div class="crm-col-head"><span class="crm-col-dot" style="background:${stage.color}"></span><span class="crm-col-name">${stage.label}</span><span class="crm-col-count">${inStage.length}</span></div>
        <div class="crm-cards">${cards}</div>
      </div>`;
    }).join('');

    document.getElementById('crmTableBody').innerHTML = leads.map((l) => {
      const stage = STAGES.find((s) => s.id === l.status) || STAGES[0];
      return `<tr>
        <td><strong>${esc(l.name)}</strong><br><span class="dos-subtitle">${esc(l.email)}</span></td>
        <td>${esc(l.carName)}</td>
        <td>${esc((l.source || 'website').replace('test-drive-modal', 'Website').replace('trade-in-estimator', 'Trade-in'))}</td>
        <td>${statusSelect(l)}</td>
      </tr>`;
    }).join('');
  }

  /* ---------- Overview ---------- */
  function renderOverview() {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const newToday = leads.filter((l) => new Date(l.createdAt) >= todayStart).length;
    const open = leads.filter((l) => OPEN_STAGES.includes(l.status)).length;
    document.getElementById('kpiNewToday').textContent = newToday;
    document.getElementById('kpiOpen').textContent = open;

    const counts = STAGES.map((s) => ({ ...s, n: leads.filter((l) => l.status === s.id).length }));
    const max = Math.max(1, ...counts.map((c) => c.n));
    document.getElementById('pipelineBars').innerHTML = counts.map((c) => `
      <div class="pipe-row"><span class="pipe-name">${c.label}</span>
        <span class="pipe-track"><span class="pipe-fill" style="width:${Math.round((c.n / max) * 100)}%;background:${c.color}"></span></span>
        <span class="pipe-count">${c.n}</span></div>`).join('');

    const recent = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
    document.getElementById('recentActivity').innerHTML = recent.length ? recent.map((l) => {
      const verb = l.source === 'trade-in-estimator' ? 'requested a trade-in estimate' : 'booked a test drive';
      const car = l.source === 'trade-in-estimator' ? '' : ' for the ' + esc(l.carName);
      return `<li><strong>${esc(l.name)}</strong> ${verb}${car}<span class="activity-when">${relTime(l.createdAt)}</span></li>`;
    }).join('') : '<li class="dos-subtitle">No activity yet.</li>';
  }

  /* ---------- Inventory + recently added ---------- */
  function statusPill(car, i) {
    if (car.featured) return '<span class="status-pill" style="background:oklch(94% 0.05 55);color:oklch(45% 0.13 55)">Featured</span>';
    if (i % 7 === 6) return '<span class="status-pill" style="background:var(--surface-sunken);color:var(--ink-faint)">Draft</span>';
    return '<span class="status-pill" style="background:oklch(94% 0.05 145);color:oklch(40% 0.13 145)">Active</span>';
  }

  function renderInventory() {
    if (!cars.length) return;
    document.getElementById('invCount').textContent = cars.length + ' active listings';
    document.getElementById('invBody').innerHTML = cars.map((c, i) => `
      <tr>
        <td><img class="inv-thumb" src="/assets/web/${esc(c.image)}" alt="" loading="lazy"><strong style="margin-left:8px">${esc(c.name)}</strong></td>
        <td>${naira(c.price)}</td>
        <td>${esc(c.mileage)}</td>
        <td>${esc(c.drivetrain)}</td>
        <td>${statusPill(c, i)}</td>
      </tr>`).join('');

    const rv = document.getElementById('recentVehicles');
    if (rv) rv.innerHTML = cars.slice(0, 3).map((c) => `
      <li><img class="mini-thumb" src="/assets/web/${esc(c.image)}" alt="" loading="lazy">
        <span class="mini-body"><strong>${esc(c.name)}</strong><span>${naira(c.price)}</span></span>
        <span class="mini-dot"></span></li>`).join('');
    const ih = document.getElementById('ihActive');
    if (ih) ih.textContent = cars.length;
  }

  /* ---------- Analytics ---------- */
  function renderAnalytics() {
    const counts = STAGES.map((s) => ({ ...s, n: leads.filter((l) => l.status === s.id).length }));
    const max = Math.max(1, ...counts.map((c) => c.n));
    document.getElementById('analyticsFunnel').innerHTML = counts.map((c) => `
      <div class="pipe-row"><span class="pipe-name">${c.label}</span>
        <span class="pipe-track"><span class="pipe-fill" style="width:${Math.round((c.n / max) * 100)}%;background:${c.color}"></span></span>
        <span class="pipe-count">${c.n}</span></div>`).join('');

    const sources = {};
    leads.forEach((l) => { const s = (l.source || 'website'); sources[s] = (sources[s] || 0) + 1; });
    const smax = Math.max(1, ...Object.values(sources));
    const labelMap = { 'test-drive-modal': 'Test drive', 'trade-in-estimator': 'Trade-in', website: 'Website' };
    document.getElementById('analyticsSource').innerHTML = Object.entries(sources).map(([k, v]) => `
      <div class="pipe-row"><span class="pipe-name">${labelMap[k] || k}</span>
        <span class="pipe-track"><span class="pipe-fill" style="width:${Math.round((v / smax) * 100)}%;background:oklch(48% 0.16 260)"></span></span>
        <span class="pipe-count">${v}</span></div>`).join('');
  }

  document.addEventListener('change', onStatusChange);

  async function load() {
    try {
      const [lRes, cRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/data/cars.json').catch(() => null),
      ]);
      if (lRes && lRes.ok) leads = (await lRes.json()).leads || [];
      if (cRes && cRes.ok) cars = await cRes.json();
      document.getElementById('crmLive').textContent = leads.length + ' lead' + (leads.length === 1 ? '' : 's');
      renderOverview();
      renderCrm();
      renderInventory();
      renderAnalytics();
    } catch (err) {
      document.getElementById('crmLive').textContent = 'Could not load data.';
    }
  }

  load();
})();
