(function () {
  const STATUSES = ['NEW', 'CONTACTED', 'SCHEDULED', 'COMPLETED', 'LOST'];

  const statTotal = document.getElementById('statTotal');
  const statNewWeek = document.getElementById('statNewWeek');
  const statTopCar = document.getElementById('statTopCar');
  const leadsBody = document.getElementById('leadsBody');
  const leadsStatus = document.getElementById('leadsStatus');

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-NG', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function computeStats(leads) {
    const total = leads.length;
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = leads.filter((l) => new Date(l.createdAt).getTime() >= oneWeekAgo).length;

    const carCounts = {};
    leads.forEach((l) => {
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
    return STATUSES.map(
      (s) => `<option value="${s}"${s === current ? ' selected' : ''}>${s}</option>`
    ).join('');
  }

  function renderLeads(leads) {
    if (leads.length === 0) {
      leadsBody.innerHTML = '<tr class="leads-empty"><td colspan="5">No test-drive requests yet. Submit the form on the storefront to see one appear here.</td></tr>';
      return;
    }

    leadsBody.innerHTML = leads
      .map(
        (lead) => `
      <tr data-id="${lead.id}">
        <td>${formatDate(lead.createdAt)}</td>
        <td>${lead.name}</td>
        <td>${lead.email}<br>${lead.phone}</td>
        <td>${lead.carName}</td>
        <td>
          <label class="visually-hidden" for="status-${lead.id}">Status for ${lead.name}</label>
          <select id="status-${lead.id}" data-id="${lead.id}">
            ${statusOptionsHtml(lead.status)}
          </select>
        </td>
      </tr>`
      )
      .join('');

    leadsBody.querySelectorAll('select[data-id]').forEach((select) => {
      select.addEventListener('change', onStatusChange);
    });
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
      leadsStatus.textContent = 'Status updated.';
    } catch (err) {
      leadsStatus.textContent = 'Could not update status. Please try again.';
    } finally {
      select.disabled = false;
    }
  }

  async function loadLeads() {
    leadsStatus.textContent = 'Loading leads…';
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) throw new Error('Failed to load leads');
      const { leads } = await res.json();

      const stats = computeStats(leads);
      statTotal.textContent = stats.total;
      statNewWeek.textContent = stats.newThisWeek;
      statTopCar.textContent = stats.topCar;

      renderLeads(leads);
      leadsStatus.textContent = `${leads.length} lead${leads.length === 1 ? '' : 's'} loaded.`;
    } catch (err) {
      leadsStatus.textContent = 'Could not load leads. Please refresh the page.';
    }
  }

  loadLeads();
})();
