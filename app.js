/**
 * Provati Bus Service (প্রভাতী বাস সার্ভিস) - Core Application Logic
 * Tagline: "Shorok pothe Biman" (সড়ক পথে বিমান)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  const state = {
    activeRole: 'user', // 'user', 'editor', 'super_admin'
    activeUser: window.provatiDB.getCurrentUser(),
    filters: {
      route_type: 'Inter-City',
      origin: 'Dhaka',
      destination: 'Chattogram',
      service: 'All',
      coach_category: 'All',
      is_prebooking: false
    },
    selectedSchedule: null,
    selectedSeats: [],
    currentDeck: 'upper',
    activePayTab: 'mfs',
    activeMfsBrand: 'bKash',
    charts: {
      occupancy: null,
      revenue: null
    }
  };

  // Expose state for debugging and modal handlers
  window.appState = state;

  // City Autocomplete Dictionary
  const POPULAR_CITIES = [
    'Dhaka', 'Chattogram', "Cox's Bazar", 'Sylhet', 'Cumilla', 'Feni',
    'Brahmanbaria', 'Rangamati', 'Bandarban', 'Bogura', 'Rajshahi',
    'Khulna', 'Barishal', 'Hathazari', 'Fatikchhari', 'Narayanganj', 'Sonargaon'
  ];

  // ============================================================================
  // AUDIO SYNTHESIZER (TACTILE SOUND EFFECTS)
  // ============================================================================
  function playSound(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'select') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(560, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.07);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.07);
        osc.start();
        osc.stop(ctx.currentTime + 0.07);
      } else if (type === 'deselect') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.06);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } else if (type === 'success') {
        const chords = [523.25, 659.25, 783.99, 1046.50];
        chords.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const startTime = ctx.currentTime + idx * 0.08;
          gain.gain.setValueAtTime(0.08, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
      }
    } catch (e) {
      // AudioContext unavailable or blocked
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  function init() {
    updateActiveUserUI();
    updateSupabaseStatusUI();
    initDatePicker();
    renderFleetCards();
    renderSchedules();
    renderAdminWorkspace();
    setupEventListeners();
    setupDBListeners();

    // Pre-load primary showcase trip matching the monitor reference mockup
    setTimeout(() => {
      openSeatSelectionDrawer('sched-101');
      state.selectedSeats = ['U7', 'U8'];
      renderSeatMap();
      updateJourneySummary();
    }, 150);
  }

  // Set today's date in date pickers
  function initDatePicker() {
    const picker = document.getElementById('travel-date-picker');
    const heroPicker = document.getElementById('hero-date-picker');
    const today = new Date().toISOString().split('T')[0];
    if (picker) {
      picker.value = today;
      picker.min = today;
    }
    if (heroPicker) {
      heroPicker.value = today;
      heroPicker.min = today;
    }
  }

  // ============================================================================
  // RBAC & WORKSPACE VIEW NAVIGATION (SCROLLING PAGE + PORTAL TABS)
  // ============================================================================
  window.switchView = function(viewRole) {
    state.activeRole = viewRole;
    updateActiveUserUI();

    if (viewRole === 'editor') {
      switchPortalTab('editor');
      const portalSec = document.getElementById('portal-section');
      if (portalSec) {
        portalSec.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Switched to Counter Dispatcher Hub');
    } else if (viewRole === 'admin' || viewRole === 'super_admin') {
      switchPortalTab('admin');
      const portalSec = document.getElementById('portal-section');
      if (portalSec) {
        portalSec.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Switched to Super Admin Command');
    } else {
      const bookingSec = document.getElementById('booking-section');
      if (bookingSec) {
        bookingSec.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Switched to Passenger Booking Mode');
    }
  };

  window.switchPortalTab = function(tabName) {
    const tabs = ['analytics', 'editor', 'admin'];
    tabs.forEach(t => {
      const tabBtn = document.getElementById(`tab-portal-${t}`);
      const panel = document.getElementById(`panel-portal-${t}`);
      if (t === tabName) {
        tabBtn?.classList.add('active');
        panel?.classList.add('active');
      } else {
        tabBtn?.classList.remove('active');
        panel?.classList.remove('active');
      }
    });

    if (tabName === 'analytics') {
      renderAdminWorkspace();
    } else if (tabName === 'editor') {
      renderEditorWorkspace();
    } else if (tabName === 'admin') {
      renderAdminWorkspace();
    }
  };

  function updateActiveUserUI() {
    const user = window.provatiDB.getCurrentUser();
    state.activeUser = user;

    const nameEl = document.getElementById('active-user-name');
    const badgeEl = document.getElementById('active-role-badge');
    const portalRoleEl = document.getElementById('portal-current-role-text');
    const passNameInput = document.getElementById('passenger-name-input');
    const passPhoneInput = document.getElementById('passenger-phone-input');

    if (nameEl) nameEl.textContent = user.full_name.split(' (')[0];
    if (badgeEl) {
      badgeEl.className = `role-badge ${user.role}`;
      badgeEl.textContent = user.role.replace('_', ' ');
    }
    if (portalRoleEl) {
      portalRoleEl.textContent = user.role === 'super_admin' ? 'Super Administrator' : user.role === 'editor' ? 'Counter Dispatcher (Editor)' : 'Passenger (User)';
    }

    if (passNameInput && user.role === 'user') passNameInput.value = user.full_name.split(' (')[0];
    if (passPhoneInput && user.role === 'user') passPhoneInput.value = user.phone;
  }

  window.openRoleSwitcherModal = function() {
    document.getElementById('role-switcher-modal').classList.add('open');
  };

  window.closeRoleSwitcherModal = function() {
    document.getElementById('role-switcher-modal').classList.remove('open');
  };

  window.selectRoleUser = function(userId) {
    const profiles = window.provatiDB.getAllProfiles();
    const target = profiles.find(p => p.id === userId);
    if (target) {
      window.provatiDB.setCurrentUser(target);
      updateActiveUserUI();
      closeRoleSwitcherModal();

      if (target.role === 'super_admin') {
        switchView('admin');
      } else if (target.role === 'editor') {
        switchView('editor');
      } else {
        switchView('user');
      }
    }
  };

  // ============================================================================
  // HERO FLEET CAROUSEL ("OUR PREMIUM FLEET")
  // ============================================================================
  function renderFleetCards() {
    // Already defined in HTML with matching images and attributes.
  }

  window.filterByFleet = function(category) {
    state.filters.coach_category = category;
    
    // Highlight selected card
    const cards = document.querySelectorAll('.fleet-card');
    cards.forEach(c => {
      if (c.getAttribute('data-category') === category) {
        c.classList.add('selected-fleet');
      } else {
        c.classList.remove('selected-fleet');
      }
    });

    renderSchedules();

    // Smooth scroll down to schedules
    const schedSection = document.querySelector('.booking-engine-section');
    if (schedSection) {
      schedSection.scrollIntoView({ behavior: 'smooth' });
    }

    showToast(`Filtering schedules by: ${category}`);
  };

  window.resetFleetFilter = function() {
    state.filters.coach_category = 'All';
    document.querySelectorAll('.fleet-card').forEach(c => c.classList.remove('selected-fleet'));
    renderSchedules();
    showToast('Showing all fleet departures');
  };

  window.toggleFleetFavorite = function(btn) {
    const icon = btn.querySelector('i');
    if (icon.classList.contains('fa-regular')) {
      icon.classList.remove('fa-regular');
      icon.classList.add('fa-solid');
      icon.style.color = '#ef4444';
      showToast('Added fleet coach to your favorites!');
    } else {
      icon.classList.remove('fa-solid');
      icon.classList.add('fa-regular');
      icon.style.color = '';
    }
  };

  // ============================================================================
  // ROUTE FILTERS & LIVE BOOKING ENGINE
  // ============================================================================
  window.setRouteTypeFilter = function(type) {
    state.filters.route_type = type;
    const interBtn = document.getElementById('toggle-intercity');
    const distBtn = document.getElementById('toggle-district');
    const heroInter = document.getElementById('hero-toggle-intercity');
    const heroDist = document.getElementById('hero-toggle-district');

    const originInput = document.getElementById('origin-input');
    const destInput = document.getElementById('dest-input');
    const heroOrigin = document.getElementById('hero-origin-input');
    const heroDest = document.getElementById('hero-dest-input');

    if (type === 'Inter-City') {
      interBtn?.classList.add('active');
      distBtn?.classList.remove('active');
      heroInter?.classList.add('active');
      heroDist?.classList.remove('active');

      if (originInput) originInput.value = 'Dhaka';
      if (destInput) destInput.value = 'Chattogram';
      if (heroOrigin) heroOrigin.value = 'Dhaka';
      if (heroDest) heroDest.value = 'Chattogram';

      state.filters.origin = 'Dhaka';
      state.filters.destination = 'Chattogram';
    } else {
      distBtn?.classList.add('active');
      interBtn?.classList.remove('active');
      heroDist?.classList.add('active');
      heroInter?.classList.remove('active');

      if (originInput) originInput.value = 'Chattogram';
      if (destInput) destInput.value = 'Hathazari';
      if (heroOrigin) heroOrigin.value = 'Chattogram';
      if (heroDest) heroDest.value = 'Hathazari';

      state.filters.origin = 'Chattogram';
      state.filters.destination = 'Hathazari';
    }

    renderSchedules();
  };

  window.swapOriginDestination = function() {
    const originInput = document.getElementById('origin-input');
    const destInput = document.getElementById('dest-input');
    const heroOrigin = document.getElementById('hero-origin-input');
    const heroDest = document.getElementById('hero-dest-input');

    const prevOrigin = originInput ? originInput.value : (heroOrigin ? heroOrigin.value : '');
    const prevDest = destInput ? destInput.value : (heroDest ? heroDest.value : '');

    if (originInput) originInput.value = prevDest;
    if (destInput) destInput.value = prevOrigin;
    if (heroOrigin) heroOrigin.value = prevDest;
    if (heroDest) heroDest.value = prevOrigin;

    state.filters.origin = prevDest;
    state.filters.destination = prevOrigin;
    renderSchedules();
  };

  window.syncHeroInputs = function(type, val) {
    if (type === 'origin') {
      state.filters.origin = val;
      const sideOrigin = document.getElementById('origin-input');
      if (sideOrigin) sideOrigin.value = val;
      renderAutosuggest('hero-origin', val);
    } else if (type === 'dest') {
      state.filters.destination = val;
      const sideDest = document.getElementById('dest-input');
      if (sideDest) sideDest.value = val;
      renderAutosuggest('hero-dest', val);
    }
    renderSchedules();
  };

  window.syncHeroDate = function(val) {
    const sidePicker = document.getElementById('travel-date-picker');
    if (sidePicker) sidePicker.value = val;
  };

  window.executeHeroSearch = function() {
    const heroOrigin = document.getElementById('hero-origin-input');
    const heroDest = document.getElementById('hero-dest-input');
    const origin = heroOrigin ? heroOrigin.value.trim() : '';
    const dest = heroDest ? heroDest.value.trim() : '';

    state.filters.origin = origin;
    state.filters.destination = dest;

    const sideOrigin = document.getElementById('origin-input');
    const sideDest = document.getElementById('dest-input');
    if (sideOrigin) sideOrigin.value = origin;
    if (sideDest) sideDest.value = dest;

    renderSchedules();

    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Searching departures: ${origin || 'All'} ➔ ${dest || 'All'}`);
  };

  window.quickSelectRoute = function(origin, dest, category) {
    state.filters.origin = origin;
    state.filters.destination = dest;
    if (category) state.filters.coach_category = category;

    const sideOrigin = document.getElementById('origin-input');
    const sideDest = document.getElementById('dest-input');
    const heroOrigin = document.getElementById('hero-origin-input');
    const heroDest = document.getElementById('hero-dest-input');

    if (sideOrigin) sideOrigin.value = origin;
    if (sideDest) sideDest.value = dest;
    if (heroOrigin) heroOrigin.value = origin;
    if (heroDest) heroDest.value = dest;

    if (dest === 'Hathazari' || origin === 'Hathazari') {
      setRouteTypeFilter('Inside-District');
    } else {
      setRouteTypeFilter('Inter-City');
    }

    renderSchedules();

    const bookingSection = document.getElementById('booking-section');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
    showToast(`Route selected: ${origin} ➔ ${dest} (${category || 'All Fleet'})`);
  };

  window.executeInlinePnrSearch = function() {
    const input = document.getElementById('inline-pnr-input');
    if (!input) return;
    const pnr = input.value.trim().toUpperCase();
    if (!pnr) {
      showToast('Please enter a PNR code (e.g. PVT-4091A)');
      return;
    }
    const cleanPnr = pnr.startsWith('PNR ') ? pnr.replace('PNR ', '').trim() : pnr;
    let booking = window.provatiDB.getBookingByPNR(pnr) || window.provatiDB.getBookingByPNR(cleanPnr);
    if (!booking) {
      const allBookings = window.provatiDB.getBookings();
      booking = allBookings.find(b => b.pnr_code.toUpperCase() === pnr || b.pnr_code.toUpperCase() === cleanPnr || b.pnr_code.toUpperCase().includes(cleanPnr));
    }

    if (booking) {
      openETicketModal(booking);
      showToast(`Boarding Pass retrieved for ${booking.passenger_name}`);
    } else {
      showToast(`No booking record found for PNR: ${pnr}`);
    }
  };

  window.setServiceFilter = function(serviceType, btn) {
    state.filters.service = serviceType;
    document.querySelectorAll('.service-pill-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSchedules();
  };

  window.togglePrebookingFilter = function(isChecked) {
    state.filters.is_prebooking = isChecked;
    const preBtn = document.getElementById('nav-prebook-btn');
    if (isChecked) {
      preBtn?.classList.add('active');
      showToast('Showing advance pre-booking festival schedules (15-90 days)');
    } else {
      preBtn?.classList.remove('active');
    }
    renderSchedules();
  };

  window.activatePrebookingFilter = function() {
    const checkbox = document.getElementById('prebooking-checkbox');
    if (checkbox) {
      checkbox.checked = true;
      togglePrebookingFilter(true);
      const schedSection = document.getElementById('booking-section');
      schedSection?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.resetAllFilters = function() {
    state.filters = {
      route_type: 'Inter-City',
      origin: '',
      destination: '',
      service: 'All',
      coach_category: 'All',
      is_prebooking: false
    };

    const originInput = document.getElementById('origin-input');
    const destInput = document.getElementById('dest-input');
    const heroOrigin = document.getElementById('hero-origin-input');
    const heroDest = document.getElementById('hero-dest-input');
    if (originInput) originInput.value = '';
    if (destInput) destInput.value = '';
    if (heroOrigin) heroOrigin.value = '';
    if (heroDest) heroDest.value = '';

    const prebox = document.getElementById('prebooking-checkbox');
    if (prebox) prebox.checked = false;

    document.getElementById('toggle-intercity')?.classList.add('active');
    document.getElementById('toggle-district')?.classList.remove('active');
    document.getElementById('hero-toggle-intercity')?.classList.add('active');
    document.getElementById('hero-toggle-district')?.classList.remove('active');

    document.querySelectorAll('.service-pill-btn').forEach((b, i) => {
      b.classList.toggle('active', i === 0);
    });
    document.querySelectorAll('.fleet-card').forEach(c => c.classList.remove('selected-fleet'));

    renderSchedules();
    showToast('Filters reset to default view.');
  };

  // Auto-suggest Handlers
  window.handleOriginSuggest = function(query) {
    state.filters.origin = query;
    renderAutosuggest('origin', query);
    renderSchedules();
  };

  window.handleDestSuggest = function(query) {
    state.filters.destination = query;
    renderAutosuggest('dest', query);
    renderSchedules();
  };

  function renderAutosuggest(type, query) {
    const listEl = document.getElementById(`${type}-suggest-list`);
    if (!listEl) return;
    if (!query || query.length < 1) {
      listEl.classList.remove('active');
      return;
    }

    const matches = POPULAR_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase()));
    if (matches.length === 0) {
      listEl.classList.remove('active');
      return;
    }

    listEl.innerHTML = matches.map(city => `
      <div class="autosuggest-item" onclick="selectSuggestedCity('${type}', '${city}')">
        <i class="fa-solid fa-location-dot" style="color: var(--accent-emerald);"></i> ${city}
      </div>
    `).join('');
    listEl.classList.add('active');
  }

  window.selectSuggestedCity = function(type, city) {
    const isOrigin = (type === 'origin' || type === 'hero-origin');
    const key = isOrigin ? 'origin' : 'destination';
    state.filters[key] = city;

    const sideEl = document.getElementById(isOrigin ? 'origin-input' : 'dest-input');
    const heroEl = document.getElementById(isOrigin ? 'hero-origin-input' : 'hero-dest-input');
    if (sideEl) sideEl.value = city;
    if (heroEl) heroEl.value = city;

    document.querySelectorAll('.autosuggest-list').forEach(l => l.classList.remove('active'));
    renderSchedules();
  };

  // Close suggests on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.route-input-wrap') && !e.target.closest('.hero-input-field-wrap')) {
      document.querySelectorAll('.autosuggest-list').forEach(l => l.classList.remove('active'));
    }
  });

  // ============================================================================
  // SCHEDULES LIST RENDERING
  // ============================================================================
  function renderSchedules() {
    const container = document.getElementById('schedules-cards-container');
    const counterEl = document.getElementById('schedules-count-text');
    if (!container) return;

    const schedules = window.provatiDB.getSchedules(state.filters);
    counterEl.textContent = `Showing ${schedules.length} scheduled ${schedules.length === 1 ? 'departure' : 'departures'}`;

    if (schedules.length === 0) {
      container.innerHTML = `
        <div class="glass-panel" style="padding: 3rem; text-align: center;">
          <i class="fa-solid fa-bus-simple" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">No Matching Schedules Found</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
            Try adjusting your origin/destination or resetting service amenity filters.
          </p>
          <button class="select-trip-btn" style="margin-top: 1.25rem;" onclick="resetAllFilters()">
            <i class="fa-solid fa-rotate-left"></i> View All Active Trips
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = schedules.map(s => {
      const depDate = new Date(s.departure_time);
      const arrDate = new Date(s.arrival_time);
      const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const formatDate = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const isSelected = state.selectedSchedule && state.selectedSchedule.id === s.id;
      const isLowSeats = s.available_seats <= 10;

      return `
        <div class="schedule-trip-card ${isSelected ? 'active-selected' : ''}" id="sched-card-${s.id}">
          
          <div class="trip-card-top">
            <div class="trip-bus-meta">
              <span class="coach-tag">${s.coach_number}</span>
              <span class="service-type-badge ${s.service_class.toLowerCase()}">${s.service_class}</span>
              <span class="service-type-badge ${s.coach_category.toLowerCase()}">${s.coach_category}</span>
              <span style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${s.bus_name}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 0.5rem;">
              ${s.allow_prebooking ? '<span class="prebooking-title" style="font-size: 0.72rem; padding: 2px 8px; border-radius: 12px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3);"><i class="fa-solid fa-lock"></i> Pre-Bookable</span>' : ''}
              <span class="trip-status-badge ${s.status}">
                <i class="fa-solid ${s.status === 'delayed' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
                ${s.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div class="trip-card-middle">
            <!-- Departure -->
            <div class="time-city-col">
              <span class="time-display">${formatTime(depDate)}</span>
              <span class="city-display">${s.origin}</span>
              <span class="station-display" title="${s.boarding_point}">${s.boarding_point}</span>
              <span style="font-size: 0.68rem; color: var(--dawn-amber); margin-top: 2px;">${formatDate(depDate)}</span>
            </div>

            <!-- Route Duration Line -->
            <div class="duration-trail-col">
              <span class="duration-text">${s.duration}</span>
              <div class="duration-line">
                <i class="fa-solid fa-paper-plane route-plane-icon"></i>
              </div>
              <span style="font-size: 0.65rem; color: var(--text-muted); margin-top: 4px;">Direct Highway Express</span>
            </div>

            <!-- Arrival -->
            <div class="time-city-col" style="text-align: right;">
              <span class="time-display">${formatTime(arrDate)}</span>
              <span class="city-display">${s.destination}</span>
              <span class="station-display" title="${s.dropping_point}">${s.dropping_point}</span>
              <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">${formatDate(arrDate)}</span>
            </div>

            <!-- Pricing & Booking -->
            <div class="trip-price-col">
              <span class="seats-counter-chip ${isLowSeats ? 'low-seats' : ''}">
                <i class="fa-solid fa-couch"></i> ${s.available_seats} Seats Left
              </span>
              <div class="price-text-lg">
                BDT ${s.ticket_price} <span>/seat</span>
              </div>
            </div>
          </div>

          <div class="trip-card-bottom">
            <div class="amenities-preview">
              <i class="fa-solid fa-wifi"></i> Free WiFi
              <span style="opacity: 0.3;">•</span>
              <i class="fa-solid fa-bolt"></i> USB Charging
              <span style="opacity: 0.3;">•</span>
              <i class="fa-solid fa-bottle-water"></i> Water
            </div>

            <button class="select-trip-btn" onclick="openSeatSelectionDrawer('${s.id}')">
              <span>${isSelected ? 'Viewing Seats' : 'View Seats & Book'}</span>
              <i class="fa-solid ${isSelected ? 'fa-chevron-up' : 'fa-arrow-right'}"></i>
            </button>
          </div>

        </div>
      `;
    }).join('');
  }

  // ============================================================================
  // ADVANCED BUS SEAT MAP & JOURNEY BUILDER
  // ============================================================================
  window.openSeatSelectionDrawer = function(scheduleId) {
    const schedule = window.provatiDB.getScheduleById(scheduleId);
    if (!schedule) return;

    state.selectedSchedule = schedule;
    state.selectedSeats = [];
    state.currentDeck = 'upper';

    // Update Drawer Title
    document.getElementById('seatmap-bus-title').innerHTML = `
      <i class="fa-solid fa-bus"></i> ${schedule.coach_number} — ${schedule.bus_name}
    `;
    document.getElementById('seatmap-route-text').textContent = `
      ${schedule.origin} → ${schedule.destination} • Departure: ${new Date(schedule.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Base Fare: BDT ${schedule.ticket_price}/seat
    `;

    // Handle Double-Decker vs Single-Tier tabs
    const deckTabs = document.getElementById('double-decker-tabs');
    if (schedule.deck_type === 'double') {
      deckTabs.style.display = 'flex';
      document.getElementById('tab-upper-deck').classList.add('active');
      document.getElementById('tab-lower-deck').classList.remove('active');
    } else {
      deckTabs.style.display = 'none';
    }

    renderSeatMap();
    updateJourneySummary();

    const drawer = document.getElementById('seat-map-drawer');
    drawer.classList.add('open');
    drawer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Refresh schedules cards highlighting
    renderSchedules();
  };

  window.closeSeatMapDrawer = function() {
    state.selectedSchedule = null;
    state.selectedSeats = [];
    document.getElementById('seat-map-drawer').classList.remove('open');
    renderSchedules();
  };

  window.switchDeckView = function(deck) {
    state.currentDeck = deck;
    document.getElementById('tab-upper-deck').classList.toggle('active', deck === 'upper');
    document.getElementById('tab-lower-deck').classList.toggle('active', deck === 'lower');
    renderSeatMap();
  };

  function renderSeatMap() {
    const layoutEl = document.getElementById('seating-grid-layout');
    const schedule = state.selectedSchedule;
    if (!layoutEl || !schedule) return;

    layoutEl.innerHTML = '';
    const booked = schedule.booked_seats || [];
    const vipBlocked = schedule.vip_blocked_seats || [];

    // Configuration 1: Double-Decker Sleeper Bus (34 Berths total)
    if (schedule.deck_type === 'double') {
      if (state.currentDeck === 'upper') {
        // Upper Deck: 20 Sleeper Berths (U1 to U20) arranged 2x1
        renderSleeperDeck(layoutEl, 'U', 1, 20, booked, vipBlocked);
      } else {
        // Lower Deck: 14 Sleeper Berths (L1 to L14) arranged 2x1
        renderSleeperDeck(layoutEl, 'L', 1, 14, booked, vipBlocked);
      }
    } else {
      // Configuration 2: Single-Tier Coach (40 Seats, 2x2 with center aisle)
      renderStandard2x2Coach(layoutEl, booked, vipBlocked);
    }
  }

  // 2x1 Sleeper Berths Grid
  function renderSleeperDeck(container, prefix, startIdx, count, booked, vipBlocked) {
    const rows = Math.ceil(count / 3);
    let seatNum = startIdx;

    for (let r = 0; r < rows; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';

      // Left Side: 2 Berths
      for (let c = 0; c < 2; c++) {
        if (seatNum <= (startIdx + count - 1)) {
          const seatId = `${prefix}${seatNum++}`;
          rowDiv.appendChild(createSeatElement(seatId, booked, vipBlocked, true));
        }
      }

      // Center Aisle Spacer
      const aisle = document.createElement('div');
      aisle.className = 'seat-aisle-spacer';
      aisle.textContent = `R${r + 1}`;
      rowDiv.appendChild(aisle);

      // Right Side: 1 Berth (Single sleeper privacy)
      if (seatNum <= (startIdx + count - 1)) {
        const seatId = `${prefix}${seatNum++}`;
        rowDiv.appendChild(createSeatElement(seatId, booked, vipBlocked, true));
      }

      container.appendChild(rowDiv);
    }
  }

  // Standard 2x2 Seater Coach (10 Rows: A to J, 40 seats)
  function renderStandard2x2Coach(container, booked, vipBlocked) {
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    rowLetters.forEach((letter) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'seat-row';

      // Left Side: 2 Seats (e.g. A1, A2)
      rowDiv.appendChild(createSeatElement(`${letter}1`, booked, vipBlocked, false));
      rowDiv.appendChild(createSeatElement(`${letter}2`, booked, vipBlocked, false));

      // Center Aisle
      const aisle = document.createElement('div');
      aisle.className = 'seat-aisle-spacer';
      aisle.textContent = letter;
      rowDiv.appendChild(aisle);

      // Right Side: 2 Seats (e.g. A3, A4)
      rowDiv.appendChild(createSeatElement(`${letter}3`, booked, vipBlocked, false));
      rowDiv.appendChild(createSeatElement(`${letter}4`, booked, vipBlocked, false));

      container.appendChild(rowDiv);
    });
  }

  function createSeatElement(seatId, bookedList, vipList, isSleeper) {
    const seat = document.createElement('div');
    seat.className = `bus-seat ${isSleeper ? 'sleeper-berth' : ''}`;
    seat.dataset.seatId = seatId;

    const isBooked = bookedList.includes(seatId);
    const isVipHold = vipList.includes(seatId);
    const isSelected = state.selectedSeats.includes(seatId);

    if (isBooked) {
      seat.classList.add('booked');
      seat.title = `Seat ${seatId} is already booked`;
    } else if (isVipHold) {
      seat.classList.add('hold');
      seat.title = `Seat ${seatId} is held for counter VIP / Emergency`;
    } else if (isSelected) {
      seat.classList.add('selected');
    }

    seat.innerHTML = `<span>${seatId}</span>`;

    if (!isBooked && !isVipHold) {
      seat.onclick = () => toggleSeatSelection(seatId);
    }

    return seat;
  }

  function toggleSeatSelection(seatId) {
    const index = state.selectedSeats.indexOf(seatId);

    if (index !== -1) {
      // Deselect
      state.selectedSeats.splice(index, 1);
      playSound('deselect');
    } else {
      // Enforce 4 seats maximum restriction
      if (state.selectedSeats.length >= 4) {
        showToast('Maximum 4 seats allowed per booking!');
        return;
      }
      state.selectedSeats.push(seatId);
      playSound('select');
    }

    renderSeatMap();
    updateJourneySummary();
  }

  function updateJourneySummary() {
    const container = document.getElementById('selected-seats-container');
    const baseFareEl = document.getElementById('summary-base-fare');
    const taxFareEl = document.getElementById('summary-tax-fare');
    const totalFareEl = document.getElementById('summary-total-fare');
    const proceedBtn = document.getElementById('proceed-pay-btn');

    if (!container || !state.selectedSchedule) return;

    if (state.selectedSeats.length === 0) {
      container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Please tap seats on the map</span>`;
      baseFareEl.textContent = 'BDT 0.00';
      taxFareEl.textContent = 'BDT 0.00';
      totalFareEl.textContent = 'BDT 0.00';
      proceedBtn.disabled = true;
      return;
    }

    // Render badges
    container.innerHTML = state.selectedSeats.map(seatId => `
      <span class="seat-pill-tag">
        ${seatId} <i class="fa-solid fa-xmark" onclick="event.stopPropagation(); removeSeat('${seatId}')"></i>
      </span>
    `).join('');

    const seatPrice = state.selectedSchedule.ticket_price;
    const subtotal = seatPrice * state.selectedSeats.length;
    const tax = Math.round(subtotal * 0.05); // 5% VAT
    const total = subtotal + tax;

    baseFareEl.textContent = `BDT ${subtotal.toLocaleString()}.00`;
    taxFareEl.textContent = `BDT ${tax.toLocaleString()}.00`;
    totalFareEl.textContent = `BDT ${total.toLocaleString()}.00`;

    proceedBtn.disabled = false;
  }

  window.removeSeat = function(seatId) {
    const idx = state.selectedSeats.indexOf(seatId);
    if (idx !== -1) {
      state.selectedSeats.splice(idx, 1);
      renderSeatMap();
      updateJourneySummary();
    }
  };

  // ============================================================================
  // MULTI-METHOD PAYMENT GATEWAY (MOCK & ACTUAL)
  // ============================================================================
  window.openPaymentGatewayModal = function() {
    if (!state.selectedSchedule || state.selectedSeats.length === 0) return;

    const subtotal = state.selectedSchedule.ticket_price * state.selectedSeats.length;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    document.getElementById('modal-pay-amount').textContent = `BDT ${total.toLocaleString()}.00`;
    document.getElementById('modal-seats-count').textContent = `${state.selectedSeats.length} Seats (${state.selectedSeats.join(', ')})`;

    document.getElementById('payment-gateway-modal').classList.add('open');
  };

  window.closePaymentModal = function() {
    document.getElementById('payment-gateway-modal').classList.remove('open');
  };

  window.switchPayTab = function(tabName) {
    state.activePayTab = tabName;
    ['mfs', 'card', 'hold'].forEach(t => {
      document.getElementById(`btn-tab-${t}`)?.classList.toggle('active', t === tabName);
      document.getElementById(`tab-content-${t}`)?.classList.toggle('active', t === tabName);
    });
  };

  window.selectMfsBrand = function(brand) {
    state.activeMfsBrand = brand;
    document.getElementById('brand-bkash-select').classList.toggle('active', brand === 'bKash');
    document.getElementById('brand-nagad-select').classList.toggle('active', brand === 'Nagad');
    document.getElementById('mfs-wallet-label').textContent = `${brand} Account Number`;
  };

  window.updateCardPreview = function() {
    const name = document.getElementById('card-name-input').value || 'YOUR NAME';
    const num = document.getElementById('card-num-input').value || '•••• •••• •••• ••••';
    const exp = document.getElementById('card-exp-input').value || 'MM/YY';

    document.getElementById('card-preview-name').textContent = name.toUpperCase();
    document.getElementById('card-preview-number').textContent = num;
    document.getElementById('card-preview-exp').textContent = exp;
  };

  window.executeFinalPayment = function() {
    const confirmBtn = document.getElementById('btn-master-confirm-pay');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Securing Transaction...`;

    const passengerName = document.getElementById('passenger-name-input').value.trim() || 'Valued Passenger';
    const passengerPhone = document.getElementById('passenger-phone-input').value.trim() || '+880 1700 000000';

    const subtotal = state.selectedSchedule.ticket_price * state.selectedSeats.length;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + tax;

    let paymentMethod = 'bKash';
    if (state.activePayTab === 'mfs') {
      paymentMethod = state.activeMfsBrand;
    } else if (state.activePayTab === 'card') {
      paymentMethod = 'card';
    } else if (state.activePayTab === 'hold') {
      paymentMethod = 'counter_hold';
    }

    setTimeout(() => {
      try {
        const booking = window.provatiDB.createBooking({
          schedule_id: state.selectedSchedule.id,
          user_id: state.activeUser.id,
          passenger_name: passengerName,
          passenger_phone: passengerPhone,
          seat_numbers: [...state.selectedSeats],
          subtotal,
          tax_amount: tax,
          total_amount: total,
          payment_method: paymentMethod,
          is_prebooking: !!state.filters.is_prebooking
        });

        // Trigger celebratory sound & confetti
        playSound('success');
        if (window.confetti) {
          window.confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
          });
        }

        // Close payment modal and seat drawer
        closePaymentModal();
        closeSeatMapDrawer();

        // Open Digital E-Ticket
        openETicketModal(booking);

        showToast(`Success! Reservation confirmed: ${booking.pnr_code}`);
      } catch (err) {
        showToast(err.message || 'Payment failed.');
      } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Confirm & Secure Transaction`;
      }
    }, 1200);
  };

  // ============================================================================
  // DIGITAL E-TICKET & PNR SYSTEM
  // ============================================================================
  function openETicketModal(booking) {
    document.getElementById('ticket-display-pnr').textContent = booking.pnr_code;
    document.getElementById('ticket-passenger-name').textContent = booking.passenger_name;
    document.getElementById('ticket-passenger-phone').textContent = booking.passenger_phone;
    document.getElementById('ticket-coach-desc').textContent = `${booking.coach_number} (${booking.bus_name})`;
    document.getElementById('ticket-seats-val').textContent = booking.seat_numbers.join(', ');
    document.getElementById('ticket-payment-method').textContent = booking.payment_method.toUpperCase();
    
    const statusEl = document.getElementById('ticket-payment-status');
    statusEl.textContent = booking.payment_status;
    statusEl.style.color = booking.payment_status === 'PAID' ? 'var(--accent-emerald)' : 'var(--dawn-amber)';

    document.getElementById('ticket-total-fare-text').textContent = `Total: BDT ${booking.total_amount.toLocaleString()}.00`;

    // Route info
    const sched = window.provatiDB.getScheduleById(booking.schedule_id) || {};
    document.getElementById('ticket-origin-name').textContent = sched.origin || 'Origin';
    document.getElementById('ticket-dest-name').textContent = sched.destination || 'Destination';
    document.getElementById('ticket-boarding-point').textContent = booking.boarding_station || sched.boarding_point || '';
    document.getElementById('ticket-dropping-point').textContent = booking.dropping_station || sched.dropping_point || '';
    document.getElementById('ticket-duration-val').textContent = sched.duration || '5h 30m';

    // Render Scannable QR Code
    const qrContainer = document.getElementById('ticket-qrcode-wrap');
    qrContainer.innerHTML = '';
    if (window.QRCode) {
      new QRCode(qrContainer, {
        text: `https://provati.com.bd/verify?pnr=${encodeURIComponent(booking.pnr_code)}`,
        width: 64,
        height: 64,
        colorDark: '#0b0f17',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    document.getElementById('eticket-view-modal').classList.add('open');
  }

  window.closeTicketModal = function() {
    document.getElementById('eticket-view-modal').classList.remove('open');
  };

  window.printTicket = function() {
    window.print();
  };

  // PNR Direct Lookup Modal Handlers
  window.openPnrLookupModal = function() {
    document.getElementById('pnr-lookup-modal').classList.add('open');
  };

  window.closePnrLookupModal = function() {
    document.getElementById('pnr-lookup-modal').classList.remove('open');
  };

  window.executePnrSearch = function() {
    const input = document.getElementById('lookup-pnr-input').value.trim();
    if (!input) {
      showToast('Please type a PNR code.');
      return;
    }

    const booking = window.provatiDB.getBookingByPNR(input);
    if (booking) {
      closePnrLookupModal();
      openETicketModal(booking);
    } else {
      showToast('No booking found matching this PNR code.');
    }
  };

  // ============================================================================
  // EDITOR DESK WORKSPACE PANEL
  // ============================================================================
  function renderEditorWorkspace() {
    renderEditorSchedulesTable();
    renderPassengerManifest();
  }

  function renderEditorSchedulesTable() {
    const tbody = document.getElementById('editor-schedules-tbody');
    if (!tbody) return;

    const schedules = window.provatiDB.getSchedules();

    tbody.innerHTML = schedules.map(s => `
      <tr>
        <td><strong>${s.coach_number}</strong></td>
        <td>${s.bus_name}</td>
        <td>${s.origin} → ${s.destination}</td>
        <td>${new Date(s.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        <td>
          <input type="number" value="${s.ticket_price}" style="width: 75px; background: #0f172a; border: 1px solid var(--glass-border); color: #fff; padding: 2px 6px; border-radius: 4px;" onchange="updateSchedulePrice('${s.id}', this.value)">
        </td>
        <td><span style="color: var(--accent-emerald); font-weight: 700;">${s.available_seats}</span> Seats</td>
        <td>
          <select style="background: #0f172a; border: 1px solid var(--glass-border); color: #fff; padding: 4px 8px; border-radius: 6px; cursor: pointer;" onchange="updateTripStatus('${s.id}', this.value)">
            <option value="on-schedule" ${s.status === 'on-schedule' ? 'selected' : ''}>On-Schedule</option>
            <option value="delayed" ${s.status === 'delayed' ? 'selected' : ''}>Delayed</option>
            <option value="boarded" ${s.status === 'boarded' ? 'selected' : ''}>Boarded</option>
            <option value="dispatched" ${s.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
          </select>
        </td>
        <td>
          <button class="fleet-filter-btn" style="padding: 2px 8px; font-size: 0.72rem;" onclick="promptBlockVIP('${s.id}')">
            <i class="fa-solid fa-lock"></i> ${(s.vip_blocked_seats || []).length} Blocked
          </button>
        </td>
        <td>
          <button onclick="deleteScheduleTrip('${s.id}')" style="background: transparent; border: none; color: var(--contrast-coral); cursor: pointer; font-size: 1rem;" title="Delete Trip">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.updateTripStatus = function(scheduleId, newStatus) {
    window.provatiDB.updateSchedule(scheduleId, { status: newStatus });
    showToast(`Trip status updated to: ${newStatus}`);
  };

  window.updateSchedulePrice = function(scheduleId, newPrice) {
    window.provatiDB.updateSchedule(scheduleId, { ticket_price: parseFloat(newPrice) });
    showToast(`Base ticket price updated to BDT ${newPrice}`);
  };

  window.promptBlockVIP = function(scheduleId) {
    const seatId = prompt('Enter seat identifier to toggle VIP lock (e.g. A1, U1, L2):');
    if (seatId && seatId.trim()) {
      window.provatiDB.toggleVIPSeatBlock(scheduleId, seatId.trim().toUpperCase());
      renderEditorSchedulesTable();
      showToast(`Toggled VIP status for seat ${seatId.toUpperCase()}`);
    }
  };

  window.deleteScheduleTrip = function(scheduleId) {
    if (confirm('Are you sure you want to delete this trip schedule?')) {
      window.provatiDB.deleteSchedule(scheduleId);
      renderEditorSchedulesTable();
      showToast('Trip schedule deleted.');
    }
  };

  // Passenger Manifest in Editor Desk
  function renderPassengerManifest(filterQuery = '') {
    const tbody = document.getElementById('passenger-manifest-tbody');
    if (!tbody) return;

    let bookings = window.provatiDB.getBookings();
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      bookings = bookings.filter(b => b.pnr_code.toLowerCase().includes(q) || b.passenger_name.toLowerCase().includes(q));
    }

    if (bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No passenger bookings found.</td></tr>`;
      return;
    }

    tbody.innerHTML = bookings.map(b => `
      <tr>
        <td><strong style="color: var(--accent-emerald); font-family: monospace;">${b.pnr_code}</strong></td>
        <td>${b.passenger_name}</td>
        <td>${b.passenger_phone}</td>
        <td>${b.route}</td>
        <td><span style="background: rgba(16, 185, 129, 0.15); color: var(--accent-emerald); padding: 2px 6px; border-radius: 4px; font-weight: 700;">${b.seat_numbers.join(', ')}</span></td>
        <td>BDT ${b.total_amount.toLocaleString()}</td>
        <td>${b.payment_method}</td>
        <td>
          <span class="role-badge ${b.booking_status === 'confirmed' ? 'user' : b.booking_status === 'pending_hold' ? 'editor' : 'super_admin'}">
            ${b.booking_status.toUpperCase()}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="fleet-filter-btn" style="padding: 2px 6px; font-size: 0.72rem;" onclick="viewBookingTicket('${b.pnr_code}')">
              <i class="fa-solid fa-eye"></i> Ticket
            </button>
            ${b.booking_status !== 'cancelled' ? `
              <button onclick="cancelManifestBooking('${b.pnr_code}')" style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--contrast-coral); color: var(--contrast-coral); border-radius: 4px; padding: 2px 6px; font-size: 0.72rem; cursor: pointer;">
                Cancel
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  }

  window.filterManifest = function(val) {
    renderPassengerManifest(val);
  };

  window.viewBookingTicket = function(pnr) {
    const b = window.provatiDB.getBookingByPNR(pnr);
    if (b) openETicketModal(b);
  };

  window.cancelManifestBooking = function(pnr) {
    if (confirm(`Cancel reservation for ${pnr} and release seats?`)) {
      window.provatiDB.cancelBooking(pnr);
      renderPassengerManifest();
      showToast(`Booking ${pnr} cancelled.`);
    }
  };

  // Create Trip Modal Handlers
  window.openCreateTripModal = function() {
    const select = document.getElementById('new-trip-bus-select');
    const buses = window.provatiDB.getBuses();
    select.innerHTML = buses.map(b => `
      <option value="${b.id}">${b.coach_number} — ${b.bus_name} (${b.coach_category})</option>
    `).join('');

    // Default departure time to tomorrow 09:00 AM
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
    tomorrow.setHours(9, 0, 0, 0);
    document.getElementById('new-trip-dep-time').value = tomorrow.toISOString().slice(0, 16);

    document.getElementById('create-trip-modal').classList.add('open');
  };

  window.closeCreateTripModal = function() {
    document.getElementById('create-trip-modal').classList.remove('open');
  };

  window.submitNewTripSchedule = function() {
    const busId = document.getElementById('new-trip-bus-select').value;
    const origin = document.getElementById('new-trip-origin').value.trim();
    const dest = document.getElementById('new-trip-dest').value.trim();
    const depTime = document.getElementById('new-trip-dep-time').value;
    const price = document.getElementById('new-trip-price').value;
    const routeType = document.getElementById('new-trip-route-type').value;

    if (!origin || !dest || !depTime || !price) {
      showToast('Please fill all trip details.');
      return;
    }

    const arrTime = new Date(new Date(depTime).getTime() + 5.5 * 3600 * 1000).toISOString();

    window.provatiDB.createSchedule({
      bus_id: busId,
      origin,
      destination: dest,
      departure_time: new Date(depTime).toISOString(),
      arrival_time: arrTime,
      ticket_price: price,
      route_type: routeType,
      allow_prebooking: true
    });

    closeCreateTripModal();
    renderEditorSchedulesTable();
    showToast('New trip scheduled successfully!');
  };

  // ============================================================================
  // SUPER ADMIN COMMAND PORTAL (ANALYTICS, RBAC, SUPABASE CONNECT)
  // ============================================================================
  function renderAdminWorkspace() {
    const analytics = window.provatiDB.getAnalytics();

    document.getElementById('admin-metric-revenue').textContent = `BDT ${analytics.totalRevenue.toLocaleString()}`;
    document.getElementById('admin-metric-holds').textContent = `BDT ${analytics.cashCounterHoldRevenue.toLocaleString()}`;
    document.getElementById('admin-metric-seats').textContent = `${analytics.totalSeatsBooked} Seats`;
    document.getElementById('admin-metric-occupancy').textContent = `${analytics.averageOccupancy}%`;

    renderAdminCharts(analytics);
    renderAdminUsersTable();
    renderAdminAuditTable();
  }

  function renderAdminCharts(analytics) {
    if (!window.Chart) return;

    // Occupancy Chart (AC vs Non-AC)
    const ctxOcc = document.getElementById('occupancyChart')?.getContext('2d');
    if (ctxOcc) {
      if (state.charts.occupancy) state.charts.occupancy.destroy();
      state.charts.occupancy = new Chart(ctxOcc, {
        type: 'doughnut',
        data: {
          labels: ['AC Fleet Seats', 'Non-AC Fleet Seats'],
          datasets: [{
            data: [analytics.acVsNonAc.AC || 12, analytics.acVsNonAc['Non-AC'] || 18],
            backgroundColor: ['#10b981', '#3b82f6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { labels: { color: '#e2e8f0' } }
          }
        }
      });
    }

    // Revenue Split Chart
    const ctxRev = document.getElementById('revenueChart')?.getContext('2d');
    if (ctxRev) {
      if (state.charts.revenue) state.charts.revenue.destroy();
      state.charts.revenue = new Chart(ctxRev, {
        type: 'bar',
        data: {
          labels: ['bKash', 'Nagad', 'Card', 'Counter Hold'],
          datasets: [{
            label: 'Revenue (BDT)',
            data: [
              analytics.methodStats.bKash || 7500,
              analytics.methodStats.Nagad || 3200,
              analytics.methodStats.Card || 4800,
              analytics.methodStats['Counter Hold'] || 1850
            ],
            backgroundColor: ['#e2136e', '#f7931e', '#2563eb', '#f59e0b'],
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { color: '#94a3b8' } },
            y: { ticks: { color: '#94a3b8' } }
          }
        }
      });
    }
  }

  function renderAdminUsersTable() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;

    const profiles = window.provatiDB.getAllProfiles();

    tbody.innerHTML = profiles.map(p => `
      <tr>
        <td><strong>${p.full_name}</strong></td>
        <td>${p.phone}</td>
        <td>${p.email}</td>
        <td><span class="role-badge ${p.role}">${p.role.replace('_', ' ').toUpperCase()}</span></td>
        <td>
          <select style="background: #0f172a; border: 1px solid var(--glass-border); color: #fff; padding: 4px 8px; border-radius: 6px; cursor: pointer;" onchange="changeUserRole('${p.id}', this.value)">
            <option value="user" ${p.role === 'user' ? 'selected' : ''}>Passenger (User)</option>
            <option value="editor" ${p.role === 'editor' ? 'selected' : ''}>Dispatcher (Editor)</option>
            <option value="super_admin" ${p.role === 'super_admin' ? 'selected' : ''}>Super Admin</option>
          </select>
        </td>
      </tr>
    `).join('');
  }

  window.changeUserRole = function(userId, newRole) {
    window.provatiDB.updateProfileRole(userId, newRole);
    updateActiveUserUI();
    renderAdminUsersTable();
    showToast(`Access level updated for user.`);
  };

  function renderAdminAuditTable() {
    const tbody = document.getElementById('admin-audit-tbody');
    if (!tbody) return;

    const logs = window.provatiDB.getAuditLogs();
    tbody.innerHTML = logs.map(l => `
      <tr>
        <td style="font-size: 0.75rem; color: var(--text-muted);">${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
        <td><strong>${l.actor}</strong></td>
        <td><span class="role-badge ${l.role}">${l.role}</span></td>
        <td><span style="font-family: monospace; color: var(--accent-emerald);">${l.action}</span></td>
        <td style="font-size: 0.8rem;">${l.details}</td>
      </tr>
    `).join('');
  }

  // Supabase Live Status UI Updater
  function updateSupabaseStatusUI() {
    const dot = document.getElementById('supabase-status-dot');
    const text = document.getElementById('supabase-status-text');
    if (!dot || !text) return;

    if (window.provatiDB.isSupabaseConnected) {
      dot.className = 'status-indicator-dot connected';
      text.textContent = 'Supabase Live';
    } else {
      dot.className = 'status-indicator-dot local';
      text.textContent = 'Local Engine';
    }
  }

  // Supabase Settings Modal
  window.openSupabaseSettingsModal = function() {
    const savedUrl = localStorage.getItem('provati_supabase_url') || (typeof PROVATI_CONFIG !== 'undefined' ? PROVATI_CONFIG.SUPABASE_URL : '') || '';
    const savedKey = localStorage.getItem('provati_supabase_key') || (typeof PROVATI_CONFIG !== 'undefined' ? PROVATI_CONFIG.SUPABASE_ANON_KEY : '') || '';
    document.getElementById('supabase-url-input').value = savedUrl;
    document.getElementById('supabase-key-input').value = savedKey;

    const feedback = document.getElementById('supabase-feedback-box');
    if (feedback) feedback.style.display = 'none';

    document.getElementById('supabase-config-modal').classList.add('open');
  };

  window.closeSupabaseSettingsModal = function() {
    document.getElementById('supabase-config-modal').classList.remove('open');
  };

  window.saveSupabaseSettings = async function() {
    const url = document.getElementById('supabase-url-input').value.trim();
    const key = document.getElementById('supabase-key-input').value.trim();
    const btn = document.getElementById('btn-supabase-connect');
    const feedback = document.getElementById('supabase-feedback-box');

    if (!url || !key) {
      showToast('Please provide both URL and Anon API key.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Verifying Connection...`;
    }

    try {
      const testRes = await window.provatiDB.testSupabaseConnection(url, key);
      if (feedback) {
        feedback.style.display = 'block';
        if (testRes.success) {
          feedback.style.background = 'rgba(16, 185, 129, 0.15)';
          feedback.style.color = '#34d399';
          feedback.style.border = '1px solid var(--accent-emerald)';
          feedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${testRes.message}`;
        } else {
          feedback.style.background = 'rgba(239, 68, 68, 0.15)';
          feedback.style.color = '#f87171';
          feedback.style.border = '1px solid var(--contrast-coral)';
          feedback.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${testRes.message}`;
        }
      }

      await window.provatiDB.setSupabaseCredentials(url, key);
      updateSupabaseStatusUI();

      setTimeout(() => {
        closeSupabaseSettingsModal();
        showToast(testRes.success ? 'Supabase connected and synchronized!' : 'Credentials saved in dual-mode fallback.');
      }, 900);
    } catch (e) {
      showToast('Error connecting: ' + e.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-plug"></i> Test & Connect Live`;
      }
    }
  };

  window.clearSupabaseSettings = function() {
    window.provatiDB.setSupabaseCredentials('', '');
    updateSupabaseStatusUI();
    closeSupabaseSettingsModal();
    showToast('Supabase disconnected; running in local mock engine mode.');
  };

  window.copySchemaSQL = async function() {
    try {
      const response = await fetch('schema.sql');
      const sqlText = await response.text();
      await navigator.clipboard.writeText(sqlText);
      showToast('schema.sql copied to clipboard! Paste into Supabase SQL Editor.');
    } catch (e) {
      showToast('Please open schema.sql file directly to copy.');
    }
  };

  window.resetDatabaseDemo = function() {
    if (confirm('Reset entire system database to default seed data?')) {
      window.provatiDB.resetToDefaultSeed();
      updateActiveUserUI();
      renderSchedules();
      renderAdminWorkspace();
      showToast('Database reset to initial fleet seed state.');
    }
  };

  // ============================================================================
  // DATABASE CHANGE SUBSCRIPTION
  // ============================================================================
  function setupDBListeners() {
    window.provatiDB.subscribe((event, data) => {
      if (event === 'SCHEDULES_CHANGED') {
        renderSchedules();
        if (state.activeRole === 'editor') renderEditorSchedulesTable();
      }
      if (event === 'BOOKING_CREATED' || event === 'BOOKINGS_UPDATED') {
        if (state.activeRole === 'editor') renderPassengerManifest();
        if (state.activeRole === 'admin') renderAdminWorkspace();
      }
      if (event === 'USER_CHANGED') {
        updateActiveUserUI();
      }
      if (event === 'SUPABASE_STATUS' || event === 'SUPABASE_SYNC_SUCCESS') {
        updateSupabaseStatusUI();
      }
    });
  }

  // ============================================================================
  // EVENT LISTENERS, SCROLLSPY & TOAST NOTIFICATION
  // ============================================================================
  function setupScrollInteractions() {
    const siteHeader = document.getElementById('site-header');
    const backTopBtn = document.getElementById('floating-back-top');
    const navLinks = document.querySelectorAll('.nav-scroll-link');
    const sections = document.querySelectorAll('section[id]');

    // Header sticky transition and back-to-top button visibility
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;

      if (scrollY > 60) {
        siteHeader?.classList.add('scrolled');
      } else {
        siteHeader?.classList.remove('scrolled');
      }

      if (scrollY > 380) {
        backTopBtn?.classList.add('show');
      } else {
        backTopBtn?.classList.remove('show');
      }
    }, { passive: true });

    // IntersectionObserver for scrollspy navigation highlights
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(link => {
              const target = link.getAttribute('data-target') || link.getAttribute('href')?.replace('#', '');
              if (target === id) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
        });
      }, {
        rootMargin: '-20% 0px -65% 0px',
        threshold: 0
      });

      sections.forEach(sec => observer.observe(sec));
    }
  }

  window.scrollToTop = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function setupEventListeners() {
    setupScrollInteractions();

    // Escape key closes open modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        closeSeatMapDrawer();
      }
    });
  }

  function showToast(msg) {
    const toast = document.getElementById('app-toast');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;

    msgEl.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  // Run init on startup
  init();
});
