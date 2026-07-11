const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Dealer Dashboard &mdash; AutoSuite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&display=swap">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/dashboard.css">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to content</a>

  <header class="navbar">
    <div class="logo">
      <a href="/index.html">
        <img src="/assets/web/autosuite-mark.png" alt="">
        <span class="logo-wordmark">Auto<span>Suite</span></span>
      </a>
    </div>
    <nav class="nav-links" aria-label="Primary">
      <a href="/index.html">Storefront</a>
      <a href="/pages/cars.html">Inventory</a>
    </nav>
  </header>

  <main id="main-content" class="dashboard-wrap">
    <span class="eyebrow">Dealer Dashboard</span>
    <h1>Leads &amp; Test Drive Requests</h1>
    <p class="dashboard-sub">Every test-drive request submitted on the public site lands here in real time.</p>

    <section class="stat-row" aria-label="Summary stats">
      <div class="stat-tile">
        <span class="stat-label">Total Leads</span>
        <span class="stat-value" id="statTotal">&ndash;</span>
      </div>
      <div class="stat-tile">
        <span class="stat-label">New This Week</span>
        <span class="stat-value" id="statNewWeek">&ndash;</span>
      </div>
      <div class="stat-tile">
        <span class="stat-label">Most Requested</span>
        <span class="stat-value" id="statTopCar">&ndash;</span>
      </div>
    </section>

    <section class="leads-section" aria-labelledby="leadsHeading">
      <h2 id="leadsHeading" class="visually-hidden">Leads table</h2>
      <div id="leadsStatus" role="status" aria-live="polite" class="leads-status"></div>
      <div class="table-wrap" tabindex="0" aria-label="Leads table, scroll horizontally if needed">
        <table class="leads-table" id="leadsTable">
          <thead>
            <tr>
              <th scope="col">Submitted</th>
              <th scope="col">Name</th>
              <th scope="col">Contact</th>
              <th scope="col">Vehicle</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody id="leadsBody"></tbody>
        </table>
      </div>
    </section>
  </main>

  <script src="/js/dashboard.js"></script>
</body>
</html>`;

module.exports = { dashboardHtml };
