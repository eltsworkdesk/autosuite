const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Dealer Dashboard &mdash; AutoSuite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap">
  <link rel="stylesheet" href="/css/style.css">
  <link rel="stylesheet" href="/css/dashboard.css">
</head>
<body class="dash-body">
  <a class="skip-link" href="#main-content">Skip to content</a>

  <div class="dash-shell">
    <aside class="dash-sidebar">
      <div class="dash-brand">
        <span class="dash-brand-mark" aria-hidden="true"></span>
        <span>AutoSuite</span>
      </div>
      <nav class="dash-nav" aria-label="Dealer OS">
        <span class="dash-navitem active">Overview</span>
      </nav>
      <div class="dash-sidebar-footer">
        <a href="/index.html">&larr; Back to storefront</a>
      </div>
    </aside>

    <div class="dash-main">
      <header class="dash-topbar">
        <div>
          <span class="eyebrow">Dealer Dashboard</span>
          <h1>Leads &amp; Test Drive Requests</h1>
        </div>
        <div class="dash-tabs" role="tablist" aria-label="Leads view">
          <button type="button" class="dash-tab active" data-view="board" role="tab" aria-selected="true">Board</button>
          <button type="button" class="dash-tab" data-view="table" role="tab" aria-selected="false">Table</button>
        </div>
      </header>

      <main id="main-content" class="dash-content">
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

        <div id="leadsStatus" role="status" aria-live="polite" class="leads-status"></div>

        <section id="boardView" class="board-view" aria-label="Leads board"></section>

        <section id="tableView" class="table-view" hidden aria-label="Leads table">
          <div class="table-wrap" tabindex="0" aria-label="Leads table, scroll horizontally if needed">
            <table class="leads-table">
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
    </div>
  </div>

  <script src="/js/dashboard.js"></script>
</body>
</html>`;

module.exports = { dashboardHtml };
