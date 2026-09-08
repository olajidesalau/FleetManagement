// Minimal client-side helpers (moved out oflined scripts)
(function () {
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
      renderLoggedOutUser(userSection);
      // small UX: reload to let server-side pages reflect auth if needed
      window.location.href = '/';
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
        { href: '/admin/dashboard', label: 'Admin' }
      ]
    }

    const role = user.role || 'customer';
    const adminLink = document.querySelector('[data-admin-link]');
    if (adminLink) adminLink.hidden = role !== 'admin';
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
        } else if (user && user.role === 'admin') {
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
          const formattedTime = new Date(scan.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          scanCount.textContent = `${scan.routes_found} route${scan.routes_found === 1 ? '' : 's'} found`;
          scanTime.textContent = `Scanned ${scan.sources_checked} sources at ${formattedTime}`;
          scanLive.textContent = `Live · scanned ${formattedTime}`;
          scanLabel.textContent = `${scan.routes_found} candidates loaded`;
          if (scanPriority) scanPriority.textContent = scan.priority_matches;
          scanResults.className = routes.length ? 'scan-results' : 'scan-results-empty';
          scanResults.innerHTML = routes.length ? routes.map(route => `
            <article class="scan-result-row">
              <div><a class="table-id" href="/routes/new?source=${encodeURIComponent(route.reference)}">${escapeHtml(route.reference)}</a><strong>${escapeHtml(route.origin)} <b>→</b> ${escapeHtml(route.destination)}</strong><span>${escapeHtml(route.company)} · ${escapeHtml(route.customer)} · ${escapeHtml(route.region)}</span></div>
              <div><strong>${escapeHtml(route.date)}</strong><span>${escapeHtml(route.distance)} · ${escapeHtml(route.source)} source</span></div>
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
          const time = new Date(result.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      const formatDate = value => value ? new Date(value).toLocaleDateString() : '--';

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