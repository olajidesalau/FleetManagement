// Minimal client-side helpers (moved out oflined scripts)
(function () {
  const operationalTimeZone = 'Europe/London';
  const formatOperationalTime = value => new Intl.DateTimeFormat('en-GB', {
    timeZone: operationalTimeZone,
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
  const formatOperationalDate = value => new Intl.DateTimeFormat('en-GB', {
    timeZone: operationalTimeZone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));

  function updateOperationalClock() {
    const now = new Date();
    document.querySelectorAll('.sync-status').forEach(element => {
      const legacyTimeNode = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.includes('Live data · 10:42'));
      if (legacyTimeNode) legacyTimeNode.textContent = `Live data · ${formatOperationalTime(now)}`;
    });
    document.querySelectorAll('[data-current-time]').forEach(element => {
      element.textContent = formatOperationalTime(now);
    });
    document.querySelectorAll('[data-current-date]').forEach(element => {
      element.textContent = formatOperationalDate(now);
    });
  }

  // Token helpers
  function setToken(token) {
    if (!token) return;
    localStorage.setItem('snow_token', token);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
  }

  function clearToken() {
    localStorage.removeItem('snow_token');
    delete axios.defaults.headers.common['Authorization'];
  }

  function getToken() {
    return localStorage.getItem('snow_token');
  }

  // Navigation updates
  function renderLoggedOutUser(userSection) {
    userSection.innerHTML = '';
    const loginLink = document.createElement('a');
    loginLink.href = '/auth/login';
    loginLink.style.color = 'white';
    loginLink.style.textDecoration = 'none';
    loginLink.textContent = 'Login';

    const registerLink = document.createElement('a');
    registerLink.href = '/auth/register';
    registerLink.style.background = '#4db8ff';
    registerLink.style.color = 'black';
    registerLink.style.padding = '0.5rem 1rem';
    registerLink.style.borderRadius = '4px';
    registerLink.style.textDecoration = 'none';
    registerLink.textContent = 'Register';

    userSection.appendChild(loginLink);
    userSection.appendChild(registerLink);
  }

  function renderLoggedInUser(user) {
    const mainLinksContainer = document.querySelector('.primary-nav');
    const userSection = document.querySelector('.user-menu');
    if (!mainLinksContainer || !userSection) return;

    // Replace user section
    userSection.innerHTML = '';
    const emailSpan = document.createElement('span');
    emailSpan.textContent = user.email;
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.style.color = '#ff6b6b';
    logoutLink.style.textDecoration = 'none';
    logoutLink.style.marginLeft = '0.75rem';
    logoutLink.textContent = 'Logout';
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      clearToken();
      axios.post('/api/auth/logout').finally(() => {
        renderLoggedOutUser(userSection);
        window.location.href = '/';
      });
    });

    userSection.appendChild(emailSpan);
    userSection.appendChild(logoutLink);

    // Add role-specific quick links (client-side enhancement)
    // Remove any existing dynamic role links to avoid duplicates
    const existingDynamic = mainLinksContainer.querySelectorAll('[data-dynamic-role]');
    existingDynamic.forEach(el => el.remove());

    const linksByRole = {
      customer: [
        { href: '/bookings/customer', label: 'My Bookings' },
        { href: '/messages', label: 'Messages' }
      ],
      provider: [
        { href: '/providers/profile', label: 'My Profile' },
        { href: '/services/manage', label: 'My Services' }
      ],
      admin: [
        { href: '/admin/dashboard', label: 'Admin' },
        { href: '/messages', label: 'Messages' }
      ],
      fleet_manager: [
        { href: '/admin/dashboard', label: 'Admin' },
        { href: '/messages', label: 'Messages' }
      ],
      'Fleet Manager': [
        { href: '/admin/dashboard', label: 'Admin' },
        { href: '/messages', label: 'Messages' }
      ]
    }

    const role = String(user.role || 'customer').trim();
    const isAdminRole = ['admin', 'fleet_manager', 'Fleet Manager'].includes(role);
    document.querySelectorAll('[data-admin-only]').forEach(element => {
      element.hidden = !isAdminRole;
    });
    const roleLinks = linksByRole[role] || [];
    roleLinks.forEach(l => {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.label;
      a.style.color = 'white';
      a.style.textDecoration = 'none';
      a.setAttribute('data-dynamic-role', '1');
      a.style.display = 'flex';
      a.style.alignItems = 'center';
      a.style.gap = '0.5rem';
      mainLinksContainer.appendChild(a);
    });
  }

  // Fetch user via API
  async function fetchCurrentUser(token) {
    if (!token) return null;
    try {
      const resp = await axios.get('/api/auth/me', { headers: { Authorization: 'Bearer ' + token } });
      return resp.data.user;
    } catch (err) {
      clearToken();
      return null;
    }
  }

  // Form handlers
  async function handleLoginForm(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    try {
      const resp = await axios.post('/api/auth/login', body);
      if (resp.data && resp.data.token) {
        setToken(resp.data.token);
        // Update nav and redirect
        const user = resp.data.user;
        if (document.querySelector('.user-menu')) renderLoggedInUser(user);
        const greeting = document.querySelector('.dashboard-header h1');
        if (greeting && user.full_name) greeting.textContent = `Good morning, ${user.full_name}`;
        window.location.href = '/';
      }
    } catch (err) {
      alert('Login failed: ' + (err.response?.data?.error || err.message));
    }
  }

  async function handleRegisterForm(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    // Client-side full_name validation (letters, spaces, apostrophes, hyphens; max 50 chars)
    const nameRegex = /^[A-Za-z\s'\-]{1,50}$/;
    if (!body.full_name || !nameRegex.test(body.full_name)) {
      alert('Full name must contain only letters, spaces, apostrophes or hyphens and be at most 50 characters.');
      return;
    }

    try {
      const resp = await axios.post('/api/auth/register', body);
      if (resp.data && resp.data.token) {
        setToken(resp.data.token);
        const user = resp.data.user;
        if (document.querySelector('.user-menu')) renderLoggedInUser(user);
        // Send each registered profile to its operational starting page.
        if (user && (user.role === 'provider' || user.role === 'driver')) {
          window.location.href = '/providers/profile';
        } else if (user && ['admin', 'fleet_manager', 'Fleet Manager'].includes(user.role)) {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/';
        }
      }
    } catch (err) {
      alert('Registration failed: ' + (err.response?.data?.error || err.message));
    }
  }

  // Existing helpers
  function viewProvider(userId) {
    window.location.href = '/providers/' + userId;
  }

  async function searchProviders(event) {
    if (event) event.preventDefault();
    const form = document.querySelector('form[action="/providers/search"]');
    if (!form) return;
    // Let native form submit handle the navigation for now
    form.submit();
  }

  // Attach handlers on DOM ready
  document.addEventListener('DOMContentLoaded', async function () {
    updateOperationalClock();
    window.setInterval(updateOperationalClock, 30000);

    const monitoringGrid = document.querySelector('.monitor-grid');
    if (monitoringGrid && !document.querySelector('[data-monitoring-metrics]')) {
      const monitoringMetrics = document.createElement('section');
      monitoringMetrics.className = 'panel monitoring-metrics-panel';
      monitoringMetrics.dataset.monitoringMetrics = 'true';
      monitoringMetrics.innerHTML = `
        <div class="panel-heading"><div><p class="eyebrow">Operational health</p><h2>Route disruption and delivery metrics</h2><p class="table-caption">Current network performance across scheduled deliveries</p></div><a class="text-link" href="/alerts">Review alerts <span>→</span></a></div>
        <div class="monitoring-metrics-grid">
          <article><span class="metric-label">Route disruptions</span><strong class="metric-alert">03</strong><span class="metric-note metric-negative">2 traffic · 1 closure</span></article>
          <article><span class="metric-label">Disruption rate</span><strong>12.5%</strong><span class="metric-note">3 of 24 active routes</span></article>
          <article><span class="metric-label">Delivery completion</span><strong>85.7%</strong><span class="metric-note metric-positive">18 of 21 due today</span></article>
          <article><span class="metric-label">Late deliveries</span><strong class="metric-alert">02</strong><span class="metric-note metric-negative">Average delay 14 min</span></article>
        </div>`;
      monitoringGrid.after(monitoringMetrics);
    }

    if (document.querySelector('.monitor-grid') && !document.querySelector('[data-monitoring-reports]')) {
      const reports = document.createElement('section');
      reports.className = 'panel monitoring-reports-panel';
      reports.dataset.monitoringReports = 'true';
      reports.innerHTML = '<div class="panel-heading"><div><p class="eyebrow">Report centre</p><h2>Generated operational reports</h2><p class="table-caption">Each report reflects the latest monitoring data and can be downloaded separately.</p></div></div><div class="monitoring-report-cards"><article class="monitoring-report-card" data-report-card="daily"><div><span class="eyebrow">Daily operations</span><h3>Daily report</h3><p data-report-status>Loading latest snapshot...</p></div><div class="report-preview" data-report-preview></div><div class="monitoring-report-actions"><a class="button button-secondary" href="/api/fleet/monitoring/export?report=daily&format=csv&range=1">CSV</a><a class="button button-secondary" href="/api/fleet/monitoring/export?report=daily&format=pdf&range=1">PDF</a><a class="button button-secondary" href="/api/fleet/monitoring/export?report=daily&format=json&range=1">JSON</a></div></article><article class="monitoring-report-card" data-report-card="drivers"><div><span class="eyebrow">People and assignments</span><h3>Drivers report</h3><p data-report-status>Loading latest snapshot...</p></div><div class="report-preview" data-report-preview></div><div class="monitoring-report-actions"><a class="button button-secondary" href="/api/fleet/monitoring/export?report=drivers&format=csv&range=7">CSV</a><a class="button button-secondary" href="/api/fleet/monitoring/export?report=drivers&format=pdf&range=7">PDF</a><a class="button button-secondary" href="/api/fleet/monitoring/export?report=drivers&format=json&range=7">JSON</a></div></article><article class="monitoring-report-card" data-report-card="routes"><div><span class="eyebrow">Network performance</span><h3>Routes report</h3><p data-report-status>Loading latest snapshot...</p></div><div class="report-preview" data-report-preview></div><div class="monitoring-report-actions"><a class="button button-secondary" href="/api/fleet/monitoring/export?report=routes&format=csv&range=7">CSV</a><a class="button button-secondary" href="/api/fleet/monitoring/export?report=routes&format=pdf&range=7">PDF</a><a class="button button-secondary" href="/api/fleet/monitoring/export?report=routes&format=json&range=7">JSON</a></div></article></div>';
      monitoringGrid.parentNode.insertBefore(reports, monitoringGrid.nextSibling);
      const reportLabels = { daily: ['On-time delivery', 'Temperature compliance', 'Active routes'], drivers: ['Active drivers', 'Available drivers', 'Driver acceptance'], routes: ['Active routes', 'Disrupted routes', 'Late deliveries'] };
      const escapeReportValue = value => String(value ?? '--').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
      reports.querySelectorAll('[data-report-card]').forEach(async card => {
        const reportType = card.dataset.reportCard;
        try {
          const response = await fetch(`/api/fleet/monitoring/export?report=${reportType}&format=json&range=${reportType === 'daily' ? 1 : 7}`);
          if (!response.ok) throw new Error('Report unavailable');
          const report = await response.json();
          card.querySelector('[data-report-status]').textContent = `Generated ${formatOperationalDate(report.generated_at)} at ${formatOperationalTime(report.generated_at)}`;
          card.querySelector('[data-report-preview]').innerHTML = reportLabels[reportType].map(label => { const key = label.toLowerCase().replace(/[- ]/g, '_'); return `<div><span>${escapeReportValue(label)}</span><strong>${escapeReportValue(report[key])}</strong></div>`; }).join('');
        } catch {
          card.querySelector('[data-report-status]').textContent = 'Unable to load latest snapshot';
          card.querySelector('[data-report-preview]').innerHTML = '<span>Use a download link to retry this report.</span>';
        }
      });
    }

    if (monitoringGrid) {
      window.setInterval(() => window.location.reload(), 600000);
    }

    // Set axios auth header if token exists
    const token = getToken();
    if (token) axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

    // Attach login/register form enhancements
    const loginForm = document.querySelector('form[action="/api/auth/login"]');
    if (loginForm) loginForm.addEventListener('submit', handleLoginForm);

    const registerForm = document.querySelector('form[action="/api/auth/register"]');
    if (registerForm) registerForm.addEventListener('submit', handleRegisterForm);

    // Attach logout if present
    const userSection = document.querySelector('.user-menu');
    if (userSection) {
      // If token present, fetch user and update nav accordingly
      if (token) {
        const user = await fetchCurrentUser(token);
        if (user) {
          renderLoggedInUser(user);
        } else {
          renderLoggedOutUser(userSection);
        }
      } else {
        renderLoggedOutUser(userSection);
      }
    }

    // Search form hookup
    const form = document.querySelector('form[action="/providers/search"]');
    if (form) {
      form.addEventListener('submit', searchProviders);
    }

    // Route scanning: run an immediate scan, then keep the candidate list fresh.
    const routeScanForm = document.querySelector('[data-route-scan-form]');
    if (routeScanForm) {
      const scanButton = routeScanForm.querySelector('[data-route-scan-button]');
      const scanResults = document.querySelector('[data-route-scan-results]');
      const scanCount = document.querySelector('[data-route-scan-count]');
      const scanTime = document.querySelector('[data-route-scan-time]');
      const scanLive = document.querySelector('[data-route-scan-live]');
      const scanLabel = document.querySelector('[data-route-scan-result-label]');
      const scanPriority = document.querySelector('[data-route-scan-priority]');
      let scanInFlight = false;

      const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[character]));

      const runRouteScan = async (showLoading = true) => {
        if (scanInFlight) return;
        scanInFlight = true;
        if (showLoading) {
          scanButton.disabled = true;
          scanButton.textContent = 'Scanning...';
          scanLive.textContent = 'Scanning sources';
        }

        try {
          const request = Object.fromEntries(new FormData(routeScanForm).entries());
          const response = await fetch('/api/fleet/routes/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
          });
          if (!response.ok) throw new Error('Route scan failed');
          const payload = await response.json();
          const scan = payload.scan;
          const routes = payload.routes || [];
          const formattedTime = formatOperationalTime(scan.scanned_at);

          scanCount.textContent = `${scan.routes_found} route${scan.routes_found === 1 ? '' : 's'} found`;
          scanTime.textContent = `Scanned ${scan.sources_checked} sources at ${formattedTime}`;
          scanLive.textContent = `Live · scanned ${formattedTime}`;
          scanLabel.textContent = `${scan.routes_found} candidates loaded`;
          if (scanPriority) scanPriority.textContent = scan.priority_matches;
          scanResults.className = routes.length ? 'scan-results' : 'scan-results-empty';
          scanResults.innerHTML = routes.length ? routes.map(route => `
            <article class="scan-result-row">
              <div><a class="table-id" href="/routes/new?source=${encodeURIComponent(route.reference)}">${escapeHtml(route.reference)}</a><strong>${escapeHtml(route.origin)} <b>→</b> ${escapeHtml(route.destination)}</strong><span>${escapeHtml(route.company)} · ${escapeHtml(route.customer)} · ${escapeHtml(route.region)}</span></div>
              <div><strong>${escapeHtml(route.date)}</strong><span>${escapeHtml(route.distance)} · ${escapeHtml(route.source)} source</span><small>${escapeHtml(route.evidence || route.service || '')}</small>${route.sourceUrl ? `<a class="text-link" href="${escapeHtml(route.sourceUrl)}" target="_blank" rel="noreferrer">View source ↗</a>` : ''}</div>
              <div><span class="pill pill-green">${escapeHtml(route.fit)}</span><a class="table-action" href="/routes/new?source=${encodeURIComponent(route.reference)}">Review and allocate →</a></div>
            </article>`).join('') : '<strong>No new routes matched those scan settings.</strong><span>Try a wider look-ahead window or scan all sources.</span>';

        } catch (error) {
          scanLive.textContent = 'Scan unavailable';
          scanResults.className = 'scan-results-empty scan-error';
          scanResults.innerHTML = '<strong>We could not complete the scan.</strong><span>Check the connection and try again.</span>';
        } finally {
          scanInFlight = false;
          scanButton.disabled = false;
          scanButton.textContent = 'Scan now';
        }
      };

      routeScanForm.addEventListener('submit', event => {
        event.preventDefault();
        runRouteScan();
      });
      window.setInterval(() => runRouteScan(false), 600000);
      runRouteScan();
    }

    // Traffic manager: compare both providers and show the fastest alternative.
    const trafficForm = document.querySelector('[data-traffic-form]');
    if (trafficForm) {
      const trafficButton = trafficForm.querySelector('[data-traffic-button]');
      const trafficResults = document.querySelector('[data-traffic-results]');
      const trafficRoute = document.querySelector('[data-traffic-route]');
      const trafficLabel = document.querySelector('[data-traffic-label]');
      const trafficLive = document.querySelector('[data-traffic-live]');
      const wazeStatus = document.querySelector('[data-traffic-waze]');
      const googleStatus = document.querySelector('[data-traffic-google]');
      let trafficInFlight = false;
      const escapeTrafficHtml = value => String(value).replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[character]));

      const runTrafficScan = async (showLoading = true) => {
        if (trafficInFlight) return;
        trafficInFlight = true;
        if (showLoading) {
        trafficButton.disabled = true;
        trafficButton.textContent = 'Comparing...';
        trafficLive.textContent = 'Comparing Waze and Google Maps';
        trafficResults.className = 'traffic-results-empty';
        trafficResults.innerHTML = '<strong>Evaluating live traffic conditions...</strong><span>Checking incidents, delays, and alternatives.</span>';
        }

        try {
          const request = Object.fromEntries(new FormData(trafficForm).entries());
          const response = await fetch('/api/fleet/traffic/scan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
          });
          if (!response.ok) throw new Error('Traffic scan failed');
          const result = await response.json();
          const time = formatOperationalTime(result.scanned_at);
          trafficRoute.textContent = `${result.route.reference} · ${result.route.origin} to ${result.route.destination}`;
          trafficLabel.textContent = `Checked at ${time}`;
          trafficLive.textContent = result.disruption ? 'Disruption detected' : 'Route clear';
          trafficLive.closest('.sync-status').querySelector('.status-dot').className = `status-dot ${result.disruption ? '' : 'status-dot-live'}`;
          wazeStatus.textContent = result.sources[0].mode === 'live' ? 'Live' : 'Demo data';
          googleStatus.textContent = result.sources[1].mode === 'live' ? 'Live' : 'Demo data';
          trafficResults.className = 'traffic-results';
          trafficResults.innerHTML = result.sources.map(source => `
            <article class="traffic-source-row">
              <div><strong>${escapeTrafficHtml(source.provider)}</strong><span>${source.connected ? 'Connected provider' : 'Configured demo evaluation'}</span></div>
              <div><span class="traffic-severity ${source.status === 'Heavy traffic' ? 'traffic-severity-alert' : source.status === 'Unavailable' ? 'traffic-severity-muted' : ''}">${escapeTrafficHtml(source.status)}</span><small>${source.delay_minutes === null ? 'No delay data' : `${source.delay_minutes} min delay`}</small></div>
              <div><strong>${source.incidents.length ? escapeTrafficHtml(source.incidents[0]) : 'No incidents reported'}</strong><span>Alternative ETA: ${source.alternative_minutes === null ? 'Unavailable' : `${source.alternative_minutes} min`}</span></div>
            </article>`).join('') + (result.recommendation ? `<div class="traffic-recommendation"><span class="recommendation-badge">Recommended</span><div><strong>${escapeTrafficHtml(result.recommendation.provider)} · ${escapeTrafficHtml(result.recommendation.label)}</strong><span>${escapeTrafficHtml(result.recommendation.reason)}</span></div><b>${result.recommendation.eta_minutes} min</b></div>` : '');
        } catch (error) {
          trafficLive.textContent = 'Scan unavailable';
          trafficResults.className = 'traffic-results-empty scan-error';
          trafficResults.innerHTML = '<strong>Traffic providers could not be reached.</strong><span>Check the connection and try again.</span>';
        } finally {
          trafficInFlight = false;
          trafficButton.disabled = false;
          trafficButton.textContent = 'Scan traffic';
        }
      };

      trafficForm.addEventListener('submit', event => {
        event.preventDefault();
        runTrafficScan();
      });
      window.setInterval(() => runTrafficScan(false), 600000);
      runTrafficScan();
    }

    const profilePage = document.querySelector('[data-profile-page]');
    if (profilePage) {
      const token = localStorage.getItem('snow_token');
      const profileStatus = profilePage.querySelector('[data-profile-status]');
      const roleData = profilePage.querySelector('[data-profile-role-data]');
      const formStatus = profilePage.querySelector('[data-profile-form-status]');
      const escapeProfile = value => String(value ?? '--').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
      const formatDate = value => value ? formatOperationalDate(value) : '--';

      const renderRoleData = data => {
        const type = data.profile_type;
        const cards = type === 'admin'
          ? [['Total users', data.total_users], ['Active routes', data.active_routes], ['Vehicles online', data.vehicles_online], ['Open alerts', data.open_alerts]]
          : type === 'driver'
            ? [['Driver reference', data.driver_reference], ['Licence expiry', formatDate(data.licence_expiry)], ['Driver status', data.status], ['Active routes', data.active_routes]]
            : type === 'customer'
              ? [['Customer routes', data.route_count], ['Account type', 'Customer'], ['Delivery role', 'Affiliated customer']]
              : [['Business', data.business_name], ['Approval', data.approval_status], ['Rating', data.average_rating], ['Bookings', data.total_bookings]];
        roleData.innerHTML = cards.map(card => `<div><span>${escapeProfile(card[0])}</span><strong>${escapeProfile(card[1])}</strong></div>`).join('');
        profilePage.querySelector('[data-profile-role-title]').textContent = type === 'admin' ? 'Admin profile' : type === 'driver' ? 'Driver profile' : type === 'customer' ? 'Customer profile' : 'Provider profile';
      };

      const loadProfile = async () => {
        if (!token) { profileStatus.textContent = 'Sign in required'; roleData.innerHTML = '<span><a href="/auth/login">Sign in</a> to view your profile.</span>'; return; }
        try {
          const response = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } });
          if (!response.ok) throw new Error('Profile unavailable');
          const payload = await response.json();
          const user = payload.user;
          profilePage.querySelector('[data-profile-initials]').textContent = user.full_name.split(/\s+/).map(name => name[0]).join('').slice(0, 2).toUpperCase();
          profilePage.querySelector('[data-profile-name]').textContent = user.full_name;
          profilePage.querySelector('[data-profile-role]').textContent = `${user.role} account`;
          profilePage.querySelector('[data-profile-email]').textContent = user.email;
          profilePage.querySelector('[data-profile-phone]').textContent = user.phone || 'Not provided';
          profilePage.querySelector('[data-profile-created]').textContent = formatDate(user.created_at);
          profilePage.querySelector('[data-profile-account-status]').textContent = user.status;
          profilePage.querySelector('[data-profile-full-name]').value = user.full_name;
          profilePage.querySelector('[data-profile-phone-input]').value = user.phone || '';
          renderRoleData(payload.roleData);
          profileStatus.textContent = 'Profile loaded';
        } catch (error) { profileStatus.textContent = 'Unable to load profile'; roleData.innerHTML = '<span>Sign in again to refresh your profile data.</span>'; }
      };

      profilePage.querySelector('[data-profile-form]').addEventListener('submit', async event => {
        event.preventDefault();
        formStatus.textContent = 'Saving...';
        const body = Object.fromEntries(new FormData(event.currentTarget).entries());
        const response = await fetch('/api/profile', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        formStatus.textContent = response.ok ? 'Profile saved.' : 'Profile could not be saved.';
        if (response.ok) loadProfile();
      });
      loadProfile();
    }

    const temperaturePage = document.querySelector('[data-temperature-page]');
    if (temperaturePage) {
      const rows = temperaturePage.querySelector('[data-temperature-rows]');
      const updated = temperaturePage.querySelector('[data-temperature-updated]');
      const refreshButton = temperaturePage.querySelector('[data-temperature-refresh]');
      const renderTemperatures = async () => {
        refreshButton.disabled = true;
        try {
          const response = await fetch('/api/fleet/temperature');
          if (!response.ok) throw new Error('Temperature readings unavailable');
          const payload = await response.json();
          const readings = payload.readings || [];
          const within = readings.filter(reading => Number(reading.current_temperature) >= Number(reading.target_temperature_min ?? 2) && Number(reading.current_temperature) <= Number(reading.target_temperature_max ?? 8));
          const alerts = readings.length - within.length;
          const average = readings.length ? (readings.reduce((total, reading) => total + Number(reading.current_temperature || 0), 0) / readings.length).toFixed(1) : '--';
          temperaturePage.querySelector('[data-temperature-within]').textContent = `${within.length} / ${readings.length}`;
          temperaturePage.querySelector('[data-temperature-alerts]').textContent = alerts;
          temperaturePage.querySelector('[data-temperature-average]').textContent = average === '--' ? '--' : `${average} C`;
          temperaturePage.querySelector('[data-temperature-online]').textContent = readings.length;
          rows.innerHTML = readings.map(reading => { const temp = Number(reading.current_temperature); const min = Number(reading.target_temperature_min ?? 2); const max = Number(reading.target_temperature_max ?? 8); const ok = temp >= min && temp <= max; return `<tr><td><strong class="table-id">${reading.vehicle_reference}</strong><span>Temperature-controlled vehicle</span></td><td>${reading.driver_name || 'Unassigned'}</td><td><strong class="${ok ? 'text-good' : 'text-alert'}">${temp.toFixed(1)} C</strong><span>${ok ? 'Within range' : 'Outside target range'}</span></td><td>${min} C to ${max} C</td><td><span class="pill pill-green">${reading.sensor_status || 'online'}</span></td><td><span class="pill ${ok ? 'pill-green' : 'pill-red'}">${ok ? 'Normal' : 'Alert'}</span></td></tr>` }).join('');
          updated.textContent = `Updated ${formatOperationalTime(new Date())}`;
        } catch { rows.innerHTML = '<tr><td colspan="6" class="table-loading">Temperature readings are temporarily unavailable.</td></tr>'; updated.textContent = 'Monitor unavailable'; }
        finally { refreshButton.disabled = false; }
      };
      refreshButton.addEventListener('click', renderTemperatures);
      renderTemperatures();
      window.setInterval(renderTemperatures, 600000);
    }

    // Conversation message form handlers (AJAX)
    const convForms = document.querySelectorAll('form[data-conversation-form]');
    convForms.forEach(f => {
      f.addEventListener('submit', async (e) => {
        e.preventDefault();
        const receiverId = f.getAttribute('data-receiver-id');
        const input = f.querySelector('input[name="message_text"]');
        const text = input ? input.value.trim() : '';
        if (!text) return;
        try {
          await axios.post('/api/messages', { receiver_id: receiverId, message_text: text });
          // reload to show message
          window.location.reload();
        } catch (err) {
          alert('Failed to send message: ' + (err.response?.data?.error || err.message));
        }
      });
    });

    // Review create form handler (AJAX)
    const reviewForm = document.querySelector('form[data-review-form]');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(reviewForm);
        const body = Object.fromEntries(fd.entries());
        try {
          const resp = await axios.post('/api/reviews', body);
          if (resp.data && resp.data.success) {
            window.location.href = '/reviews/my-reviews';
          }
        } catch (err) {
          alert('Failed to submit review: ' + (err.response?.data?.error || err.message));
        }
      });
    }
  });

  // Expose to global for legacy inline handlers if any remain
  window.viewProvider = viewProvider;
  window.searchProviders = searchProviders;
})();