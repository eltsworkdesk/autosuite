(function () {
  const STAGES = [
    { id: 'NEW', label: 'New', color: 'var(--brand-blue)' },
    { id: 'CONTACTED', label: 'Contacted', color: 'oklch(50% 0.12 235)' },
    { id: 'QUALIFIED', label: 'Qualified', color: 'oklch(55% 0.1 190)' },
    { id: 'APPT_SCHEDULED', label: 'Appt. Scheduled', color: 'oklch(60% 0.12 155)' },
    { id: 'NEGOTIATING', label: 'Negotiating', color: 'var(--brand-accent)' },
    { id: 'SOLD', label: 'Sold', color: 'var(--success)' },
    { id: 'LOST', label: 'Lost', color: 'var(--ink-faint)' },
  ];
  const statTotal = document.getElementById('statTotal');
  const statNewWeek = document.getElementById('statNewWeek');
  const statTopCar = document.getElementById('statTopCar');
  const boardView = document.getElementById('boardView');
  const tableBody = document.getElementById('leadsBody');
  const leadsStatus = document.getElementById('leadsStatus');
  const tabs = document.querySelectorAll('.dash-tab');
  const tableSection = document.getElementById('tableView');

  let leads = [];

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function computeStats(list) {
    const total = list.length;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = list.filter((l) => new Date(l.createdAt).getTime() >= oneWeekAgo).length;

    const carCounts = {};
    list.forEach((l) => {
      carCounts[l.carName] = (carCounts[l.carName] || 0) + 1;
    });
    let topCar = '–';
    let topCount = 0;
    Object.entries(carCounts).forEach(([car, count]) => {
      if (count > topCount) {
        topCar = car;
        topCount = count;
      }
    });

    return { total, newThisWeek, topCar };
  }

  function statusOptionsHtml(current) {
    return STAGES.map(
      (s) => `<option value="${s.id}"${s.id === current ? ' selected' : ''}>${s.label}</option>`
    ).join('');
  }

  function statusSelectHtml(lead) {
    return `
      <label class="visually-hidden" for="status-${lead.id}">Status for ${lead.name}</label>
      <select id="status-${lead.id}" class="status-select" data-id="${lead.id}">
        ${statusOptionsHtml(lead.status)}
      </select>`;
  }

  function renderBoard() {
    if (leads.length === 0) {
      boardView.innerHTML = '<p class="board-empty">No test-drive requests yet. Submit the form on the storefront to see one appear here.</p>';
      return;
    }

    boardView.innerHTML = STAGES.map((stage) => {
      const stageLeads = leads.filter((l) => l.status === stage.id);
      const cards = stageLeads
        .map(
          (lead) => `
        <div class="board-card">
          <div class="board-card-name">${lead.name}</div>
          <div class="board-card-vehicle">${lead.carName}</div>
          <div class="board-card-foot">
            <span class="board-card-source">${lead.source || 'website'}</span>
          </div>
          ${statusSelectHtml(lead)}
        </div>`
        )
        .join('');

      return `
        <div class="board-column">
          <div class="board-column-head">
            <span class="board-column-dot" style="background:${stage.color}"></span>
            <span class="board-column-name">${stage.label}</span>
            <span class="board-column-count">${stageLeads.length}</span>
          </div>
          <div class="board-cards">${cards}</div>
        </div>`;
    }).join('');

    boardView.querySelectorAll('select[data-id]').forEach((select) => {
      select.addEventListener('change', onStatusChange);
    });
  }

  function renderTable() {
    if (leads.length === 0) {
      tableBody.innerHTML = '<tr class="leads-empty"><td colspan="5">No test-drive requests yet. Submit the form on the storefront to see one appear here.</td></tr>';
      return;
    }

    tableBody.innerHTML = leads
      .map(
        (lead) => `
      <tr data-id="${lead.id}">
        <td>${formatDate(lead.createdAt)}</td>
        <td>${lead.name}</td>
        <td>${lead.email}<br>${lead.phone}</td>
        <td>${lead.carName}</td>
        <td>${statusSelectHtml(lead)}</td>
      </tr>`
      )
      .join('');

    tableBody.querySelectorAll('select[data-id]').forEach((select) => {
      select.addEventListener('change', onStatusChange);
    });
  }

  function renderAll() {
    const stats = computeStats(leads);
    statTotal.textContent = stats.total;
    statNewWeek.textContent = stats.newThisWeek;
    statTopCar.textContent = stats.topCar;
    renderBoard();
    renderTable();
  }

  async function onStatusChange(event) {
    const select = event.target;
    const id = select.dataset.id;
    const status = select.value;
    select.disabled = true;

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');

      const lead = leads.find((l) => l.id === id);
      if (lead) lead.status = status;
      leadsStatus.textContent = 'Status updated.';
      renderAll();
    } catch (err) {
      leadsStatus.textContent = 'Could not update status. Please try again.';
      select.disabled = false;
    }
  }

  function onTabClick(event) {
    const view = event.currentTarget.dataset.view;
    tabs.forEach((tab) => {
      const active = tab.dataset.view === view;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
    });
    boardView.hidden = view !== 'board';
    tableSection.hidden = view !== 'table';
  }

  tabs.forEach((tab) => tab.addEventListener('click', onTabClick));

  async function loadLeads() {
    leadsStatus.textContent = 'Loading leads…';
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) throw new Error('Failed to load leads');
      const data = await res.json();
      leads = data.leads;

      renderAll();
      leadsStatus.textContent = `${leads.length} lead${leads.length === 1 ? '' : 's'} loaded.`;
    } catch (err) {
      leadsStatus.textContent = 'Could not load leads. Please refresh the page.';
    }
  }

  loadLeads();
})();
