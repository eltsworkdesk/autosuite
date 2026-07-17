(function () {
  // Stage colors double as solid white-text status-pill backgrounds on Lead
  // Detail now (previously only ever used as small 8px dots, which aren't
  // subject to text-contrast rules) — lightness values below are the ones
  // that clear 4.5:1 with white text, verified with axe-core against every
  // stage, not just the ones that happened to fail first.
  const STAGES = [
    { id: 'NEW', label: 'New', color: 'oklch(48% 0.16 260)' },
    { id: 'CONTACTED', label: 'Contacted', color: 'oklch(50% 0.12 235)' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'oklch(55% 0.1 190)' },
    { id: 'APPT_SCHEDULED', label: 'Appt. Scheduled', color: 'oklch(48% 0.12 155)' },
    { id: 'NEGOTIATING', label: 'Negotiating', color: 'oklch(50% 0.15 55)' },
    { id: 'SOLD', label: 'Sold', color: 'oklch(46% 0.14 145)' },
    { id: 'LOST', label: 'Lost', color: 'oklch(45% 0.01 260)' },
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
  function sourceLabel(source) {
    const s = source || 'website';
    if (s === 'test-drive-modal') return 'Website';
    if (s === 'trade-in-estimator') return 'Trade-in';
    return s;
  }
  function stageFor(status) {
    return STAGES.find((s) => s.id === status) || STAGES[0];
  }
  function priorityDot(l) {
    const color = (window.AutoSuiteLeadDetail && window.AutoSuiteLeadDetail.priorityColor(l.priority)) || 'oklch(50% 0.12 235)';
    return `<span class="crm-priority-dot" style="background:${color}" title="${esc(l.priority || 'Normal')} priority" aria-hidden="true"></span>`;
  }

  /* ---------- View switching ---------- */
  const navItems = document.querySelectorAll('.dos-navitem[data-view]');
  const views = document.querySelectorAll('.dos-view[data-view]');

  // Shared by sidebar nav clicks and the CRM -> Lead Detail drill-down. Lead
  // Detail isn't a sidebar destination, so it only ever touches `views` —
  // the sidebar keeps highlighting whichever section (CRM) it was opened from.
  function showView(view) {
    views.forEach((v) => { v.hidden = v.dataset.view !== view; });
  }

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      navItems.forEach((n) => n.classList.toggle('active', n === btn));
      showView(btn.dataset.view);
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

  // Shared by every lead mutation (status dropdown, drag-and-drop, tags,
  // tasks) — PATCHes the API, keeps the in-memory `leads` array in sync with
  // the server's response, and surfaces failures via the CRM live region.
  async function updateLead(id, data) {
    try {
      const res = await fetch('/api/leads/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error('fail');
      const { lead: updated } = await res.json();
      const idx = leads.findIndex((l) => l.id === id);
      if (idx !== -1) leads[idx] = updated;
      return updated;
    } catch (err) {
      document.getElementById('crmLive').textContent = 'Could not update. Try again.';
      throw err;
    }
  }

  async function onStatusChange(e) {
    const sel = e.target;
    if (!sel.classList.contains('crm-select')) return;
    const id = sel.dataset.id;
    const status = sel.value;
    sel.disabled = true;
    try {
      await updateLead(id, { status });
      document.getElementById('crmLive').textContent = 'Status updated.';
      renderCrm();
      renderOverview();
      renderAnalytics();
    } catch (err) {
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
        <div class="crm-card" draggable="true" data-id="${l.id}">
          <div class="crm-card-top">${priorityDot(l)}<span class="crm-card-name">${esc(l.name)}</span></div>
          <div class="crm-card-vehicle">${esc(l.carName)}</div>
          <div class="crm-card-foot"><span class="crm-source">${esc(sourceLabel(l.source))}</span></div>
          ${statusSelect(l)}
        </div>`).join('');
      return `<div class="crm-col">
        <div class="crm-col-head"><span class="crm-col-dot" style="background:${stage.color}"></span><span class="crm-col-name">${stage.label}</span><span class="crm-col-count">${inStage.length}</span></div>
        <div class="crm-cards" data-stage="${stage.id}">${cards}</div>
      </div>`;
    }).join('');

    document.getElementById('crmTableBody').innerHTML = leads.map((l) => `
      <tr data-id="${l.id}" tabindex="0">
        <td><strong>${esc(l.name)}</strong><br><span class="dos-subtitle">${esc(l.email)}</span></td>
        <td>${esc(l.carName)}</td>
        <td>${esc(sourceLabel(l.source))}</td>
        <td>${priorityDot(l)}${esc(l.priority || 'Normal')}</td>
        <td>${statusSelect(l)}</td>
      </tr>`).join('');
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

  /* ---------- CRM: drag-and-drop stage changes ---------- */
  // The <select> in statusSelect() stays as the keyboard-operable equivalent
  // of this — dragging is an enhancement on top, not a replacement.
  let draggedLeadId = null;

  crmBoard.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.crm-card');
    if (!card) return;
    draggedLeadId = card.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedLeadId);
  });

  crmBoard.addEventListener('dragover', (e) => {
    const column = e.target.closest('.crm-cards');
    if (!column) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    column.classList.add('drag-over');
  });

  crmBoard.addEventListener('dragleave', (e) => {
    const column = e.target.closest('.crm-cards');
    if (column) column.classList.remove('drag-over');
  });

  crmBoard.addEventListener('drop', async (e) => {
    const column = e.target.closest('.crm-cards');
    if (!column) return;
    e.preventDefault();
    column.classList.remove('drag-over');
    const id = draggedLeadId || e.dataTransfer.getData('text/plain');
    draggedLeadId = null;
    const status = column.dataset.stage;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.status === status) return;
    try {
      await updateLead(id, { status });
      document.getElementById('crmLive').textContent = 'Status updated.';
      renderCrm();
      renderOverview();
      renderAnalytics();
    } catch (err) {
      /* updateLead already set the live-region error message */
    }
  });

  /* ---------- CRM: click-through to Lead Detail ---------- */
  function openLeadDetail(id) {
    renderLeadDetail(id);
    showView('lead-detail');
  }

  crmBoard.addEventListener('click', (e) => {
    if (e.target.closest('.crm-select')) return;
    const card = e.target.closest('.crm-card');
    if (card) openLeadDetail(card.dataset.id);
  });

  crmTable.addEventListener('click', (e) => {
    if (e.target.closest('.crm-select')) return;
    const row = e.target.closest('tr[data-id]');
    if (row) openLeadDetail(row.dataset.id);
  });

  crmTable.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.closest('.crm-select')) return;
    const row = e.target.closest('tr[data-id]');
    if (!row) return;
    e.preventDefault();
    openLeadDetail(row.dataset.id);
  });

  /* ---------- Lead Detail ---------- */
  function renderLeadDetail(id) {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    const stage = stageFor(lead.status);

    document.getElementById('ldName').textContent = lead.name;
    document.getElementById('ldEmail').textContent = lead.email;
    document.getElementById('ldPhone').textContent = lead.phone;
    document.querySelector('.ld-avatar').textContent = lead.name.charAt(0).toUpperCase();

    const pill = document.getElementById('ldStatusPill');
    pill.textContent = stage.label;
    pill.style.background = stage.color;

    // Real leads today only ever carry carName (a string), not carId — see
    // js/script.js and js/financing.js's POST bodies — so match on name.
    const car = cars.find((c) => c.id === lead.carId) || cars.find((c) => c.name === lead.carName);
    document.getElementById('ldVehicle').innerHTML = car
      ? `<img class="ld-vehicle-thumb" src="/assets/web/${esc(car.image)}" alt="" loading="lazy">
         <div class="ld-vehicle-info"><strong>${esc(car.name)}</strong><span>${naira(car.price)}</span></div>`
      : `<div class="ld-vehicle-info"><strong>${esc(lead.carName)}</strong></div>`;

    const timeline = window.AutoSuiteLeadDetail.synthesizeTimeline({
      createdAt: lead.createdAt,
      updatedAt: lead.updatedAt,
      source: lead.source,
      carName: lead.carName,
      statusLabel: stage.label,
    });
    document.getElementById('ldTimeline').innerHTML = timeline.length
      ? timeline
          .map(
            (ev) => `<li><span class="ld-timeline-dot" aria-hidden="true"></span><span>${esc(ev.text)}<span class="activity-when">${relTime(ev.when)}</span></span></li>`
          )
          .join('')
      : '<li class="dos-subtitle">No activity yet.</li>';

    document.getElementById('ldDetails').innerHTML = `
      <li><span>Source</span><strong>${esc(sourceLabel(lead.source))}</strong></li>
      <li><span>Assigned</span><strong>Derek Owusu</strong></li>
      <li><span>Priority</span><strong>${esc(lead.priority || 'Normal')}</strong></li>
      <li><span>Created</span><strong>${new Date(lead.createdAt).toLocaleDateString()}</strong></li>
    `;

    document.getElementById('ldTagForm').dataset.id = lead.id;
    document.getElementById('ldTaskForm').dataset.id = lead.id;
    renderTags(lead);
    renderTasks(lead);
  }

  function renderTags(lead) {
    const tags = lead.tags || [];
    document.getElementById('ldTags').innerHTML = tags.length
      ? tags.map((t) => `<span class="ld-tag">${esc(t)}<button type="button" class="ld-tag-remove" data-tag="${esc(t)}" aria-label="Remove tag ${esc(t)}">&times;</button></span>`).join('')
      : '<span class="dos-subtitle">No tags yet.</span>';
  }

  function renderTasks(lead) {
    const tasks = lead.tasks || [];
    document.getElementById('ldTasks').innerHTML = tasks.length
      ? tasks
          .map(
            (t) => `<li class="ld-task${t.done ? ' done' : ''}"><label><input type="checkbox" class="ld-task-check" data-task="${esc(t.id)}" ${t.done ? 'checked' : ''}><span>${esc(t.text)}</span></label></li>`
          )
          .join('')
      : '<li class="dos-subtitle">No tasks yet.</li>';
  }

  document.getElementById('leadDetailBack').addEventListener('click', () => showView('crm'));

  document.getElementById('ldTagForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.dataset.id;
    const input = document.getElementById('ldTagInput');
    const value = input.value.trim();
    const lead = leads.find((l) => l.id === id);
    if (!value || !lead || (lead.tags || []).includes(value)) {
      input.value = '';
      return;
    }
    input.disabled = true;
    try {
      await updateLead(id, { tags: [...(lead.tags || []), value] });
      input.value = '';
      renderTags(leads.find((l) => l.id === id));
    } catch (err) {
      /* updateLead already set the live-region error message */
    }
    input.disabled = false;
  });

  document.getElementById('ldTags').addEventListener('click', async (e) => {
    const btn = e.target.closest('.ld-tag-remove');
    if (!btn) return;
    const id = document.getElementById('ldTagForm').dataset.id;
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    try {
      await updateLead(id, { tags: (lead.tags || []).filter((t) => t !== btn.dataset.tag) });
      renderTags(leads.find((l) => l.id === id));
    } catch (err) {
      /* updateLead already set the live-region error message */
    }
  });

  document.getElementById('ldTaskForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.dataset.id;
    const input = document.getElementById('ldTaskInput');
    const value = input.value.trim();
    const lead = leads.find((l) => l.id === id);
    if (!value || !lead) {
      input.value = '';
      return;
    }
    input.disabled = true;
    try {
      const newTask = { id: 't' + Date.now(), text: value, done: false };
      await updateLead(id, { tasks: [...(lead.tasks || []), newTask] });
      input.value = '';
      renderTasks(leads.find((l) => l.id === id));
    } catch (err) {
      /* updateLead already set the live-region error message */
    }
    input.disabled = false;
  });

  document.getElementById('ldTasks').addEventListener('change', async (e) => {
    const check = e.target.closest('.ld-task-check');
    if (!check) return;
    const id = document.getElementById('ldTaskForm').dataset.id;
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    try {
      const tasks = (lead.tasks || []).map((t) => (t.id === check.dataset.task ? { ...t, done: check.checked } : t));
      await updateLead(id, { tasks });
      renderTasks(leads.find((l) => l.id === id));
    } catch (err) {
      /* updateLead already set the live-region error message */
    }
  });

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
