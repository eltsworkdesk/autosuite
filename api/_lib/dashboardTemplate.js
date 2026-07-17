const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Dealer OS &mdash; AutoSuite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/dashboard.css">
</head>
<body class="dos-body">
  <a class="skip-link" href="#dos-main">Skip to content</a>

  <div class="dos-shell">
    <aside class="dos-sidebar">
      <div class="dos-brand">
        <span class="dos-brand-mark" aria-hidden="true"></span>
        <span>AutoSuite</span>
      </div>
      <div class="dos-search">&#8984;K &nbsp;Search everything</div>
      <nav class="dos-nav" aria-label="Dealer OS">
        <button type="button" class="dos-navitem active" data-view="overview">Overview</button>
        <button type="button" class="dos-navitem" data-view="crm">CRM</button>
        <button type="button" class="dos-navitem" data-view="inventory">Inventory</button>
        <button type="button" class="dos-navitem" data-view="appointments">Appointments</button>
        <button type="button" class="dos-navitem" data-view="customers">Customers</button>
        <button type="button" class="dos-navitem" data-view="analytics">Analytics</button>
        <button type="button" class="dos-navitem" data-view="staff">Staff Activity</button>
      </nav>
      <div class="dos-sidebar-foot">
        <a href="/index.html" class="dos-navitem dos-back">&larr; Back to storefront</a>
        <div class="dos-user"><span class="dos-user-avatar" aria-hidden="true"></span>Derek Owusu</div>
      </div>
    </aside>

    <main id="dos-main" class="dos-main">

      <section class="dos-view" data-view="overview">
        <header class="dos-topbar">
          <h1>Overview</h1>
          <div class="dos-topbar-actions">
            <span class="dos-quick">+ Quick action</span>
            <span class="dos-bell" aria-hidden="true">&#9679;</span>
          </div>
        </header>
        <div class="dos-content">
          <div class="kpi-row">
            <div class="kpi-card"><span class="kpi-label">New leads today</span><span class="kpi-value" id="kpiNewToday">&ndash;</span><span class="kpi-trend">live from bookings</span></div>
            <div class="kpi-card"><span class="kpi-label">Open pipeline</span><span class="kpi-value" id="kpiOpen">&ndash;</span><span class="kpi-trend">active leads</span></div>
            <div class="kpi-card"><span class="kpi-label">Revenue MTD</span><span class="kpi-value">&#8358;412M</span><span class="kpi-trend pos">&uarr; 8%</span></div>
            <div class="kpi-card"><span class="kpi-label">Avg. response time</span><span class="kpi-value">6 min</span><span class="kpi-trend pos">&darr; 2 min improved</span></div>
          </div>

          <div class="dos-grid-2">
            <div class="panel">
              <div class="panel-head"><h2>Lead pipeline</h2><span class="panel-meta">This month</span></div>
              <div id="pipelineBars" class="pipeline"></div>
            </div>
            <div class="panel">
              <div class="panel-head"><h2>Upcoming appointments</h2></div>
              <ul class="appt-list">
                <li><span class="appt-time">9:00a</span><span class="appt-body"><strong>Maya Torres</strong><span>2024 BMW X6</span></span><span class="appt-tag">Test drive</span></li>
                <li><span class="appt-time">11:30a</span><span class="appt-body"><strong>James Lin</strong><span>2023 Camry</span></span><span class="appt-tag">Inspection</span></li>
                <li><span class="appt-time">1:00p</span><span class="appt-body"><strong>Priya Shah</strong><span>Mercedes E450</span></span><span class="appt-tag">Test drive</span></li>
                <li><span class="appt-time">3:30p</span><span class="appt-body"><strong>Cole Bennett</strong><span>Cayenne</span></span><span class="appt-tag">Follow-up</span></li>
              </ul>
            </div>
          </div>

          <div class="dos-grid-3">
            <div class="panel">
              <div class="panel-head"><h2>Recently added vehicles</h2></div>
              <ul class="mini-list" id="recentVehicles"></ul>
            </div>
            <div class="panel">
              <div class="panel-head"><h2>Recent customer activity</h2></div>
              <ul class="activity-list" id="recentActivity"></ul>
            </div>
            <div class="panel">
              <div class="panel-head"><h2>Inventory health</h2></div>
              <ul class="stat-list">
                <li><span>Active listings</span><strong id="ihActive">&ndash;</strong></li>
                <li><span>Avg. days on lot</span><strong>21</strong></li>
                <li><span>Draft listings</span><strong>4</strong></li>
                <li><span>Sold this month</span><strong class="pos">19</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="dos-view" data-view="crm" hidden>
        <header class="dos-topbar">
          <h1>Leads</h1>
          <div class="crm-tabs" role="tablist" aria-label="Leads view">
            <button type="button" class="crm-tab active" data-crm="board" role="tab" aria-selected="true">Board</button>
            <button type="button" class="crm-tab" data-crm="table" role="tab" aria-selected="false">Table</button>
          </div>
          <span class="dos-live" id="crmLive" role="status" aria-live="polite"></span>
        </header>
        <div class="dos-content">
          <div id="crmBoard" class="crm-board" role="group" aria-label="Leads board"></div>
          <div id="crmTable" class="crm-table-wrap" hidden>
            <table class="crm-table">
              <thead><tr><th scope="col">Customer</th><th scope="col">Vehicle</th><th scope="col">Source</th><th scope="col">Priority</th><th scope="col">Status</th></tr></thead>
              <tbody id="crmTableBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="dos-view" data-view="lead-detail" hidden>
        <header class="dos-topbar">
          <button type="button" class="dos-back-link" id="leadDetailBack">&larr; Back to Leads</button>
        </header>
        <div class="dos-content ld-layout">
          <div class="ld-main">
            <div class="ld-header">
              <span class="ld-avatar" aria-hidden="true"></span>
              <div class="ld-header-info">
                <h1 id="ldName">&ndash;</h1>
                <div class="ld-contact"><span id="ldEmail"></span> &middot; <span id="ldPhone"></span></div>
              </div>
              <span class="ld-status-pill" id="ldStatusPill"></span>
            </div>

            <div class="panel">
              <div class="panel-head"><h2>Interested In</h2></div>
              <div id="ldVehicle" class="ld-vehicle"></div>
            </div>

            <div class="panel">
              <div class="panel-head"><h2>Activity Timeline</h2></div>
              <ul id="ldTimeline" class="ld-timeline"></ul>
            </div>
          </div>

          <div class="ld-sidebar">
            <div class="panel">
              <div class="panel-head"><h2>Details</h2></div>
              <ul id="ldDetails" class="stat-list"></ul>
            </div>

            <div class="panel">
              <div class="panel-head"><h2>Tags</h2></div>
              <div id="ldTags" class="ld-tags"></div>
              <form id="ldTagForm" class="ld-inline-form">
                <label for="ldTagInput" class="visually-hidden">Add a tag</label>
                <input type="text" id="ldTagInput" placeholder="Add a tag&hellip;" maxlength="24">
                <button type="submit" class="btn small">Add</button>
              </form>
            </div>

            <div class="panel">
              <div class="panel-head"><h2>Tasks</h2></div>
              <ul id="ldTasks" class="ld-tasks"></ul>
              <form id="ldTaskForm" class="ld-inline-form">
                <label for="ldTaskInput" class="visually-hidden">Add a task</label>
                <input type="text" id="ldTaskInput" placeholder="Add a task&hellip;" maxlength="80">
                <button type="submit" class="btn small">Add</button>
              </form>
            </div>

            <div class="panel">
              <div class="panel-head"><h2>Documents</h2></div>
              <div class="module-soon module-soon-compact"><p>File uploads aren&rsquo;t wired to storage yet. Shipping next.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section class="dos-view" data-view="inventory" hidden>
        <header class="dos-topbar">
          <h1>Inventory</h1>
          <span class="dos-subtitle" id="invCount"></span>
        </header>
        <div class="dos-content">
          <div class="inv-table-wrap">
            <table class="inv-table">
              <thead><tr><th scope="col">Vehicle</th><th scope="col">Price</th><th scope="col">Mileage</th><th scope="col">Drivetrain</th><th scope="col">Status</th></tr></thead>
              <tbody id="invBody"></tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="dos-view" data-view="analytics" hidden>
        <header class="dos-topbar"><h1>Analytics</h1><span class="dos-subtitle">Computed live from lead data</span></header>
        <div class="dos-content">
          <div class="dos-grid-2">
            <div class="panel">
              <div class="panel-head"><h2>Conversion funnel</h2></div>
              <div id="analyticsFunnel" class="pipeline"></div>
            </div>
            <div class="panel">
              <div class="panel-head"><h2>Leads by source</h2></div>
              <div id="analyticsSource" class="pipeline"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="dos-view" data-view="appointments" hidden>
        <header class="dos-topbar"><h1>Appointments</h1></header>
        <div class="dos-content"><div class="module-soon"><h2>Calendar module</h2><p>Test drives and inspections booked online drop onto the right salesperson's calendar &mdash; wired to the same booking flow that already feeds the CRM. Shipping next.</p></div></div>
      </section>

      <section class="dos-view" data-view="customers" hidden>
        <header class="dos-topbar"><h1>Customers</h1></header>
        <div class="dos-content"><div class="module-soon"><h2>Customer profiles</h2><p>A unified record per buyer &mdash; every vehicle viewed, lead, appointment, and note in one timeline. Shipping next.</p></div></div>
      </section>

      <section class="dos-view" data-view="staff" hidden>
        <header class="dos-topbar"><h1>Staff Activity</h1></header>
        <div class="dos-content"><div class="module-soon"><h2>Team accountability</h2><p>Who's assigned what, who's closing, and response times per rep. Shipping next.</p></div></div>
      </section>

    </main>
  </div>

  <script src="/js/lib/lead-detail.js"></script>
  <script src="/js/dashboard.js"></script>
</body>
</html>`;

module.exports = { dashboardHtml };
