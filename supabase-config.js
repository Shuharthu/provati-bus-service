/**
 * Provati Bus Service (প্রভাতী বাস সার্ভিস)
 * Supabase Client Configuration & Hybrid Local Mock Engine
 * "Shorok pothe Biman" (সড়ক পথে বিমান)
 */

// Global Configuration Defaults
// You can directly configure your remote Supabase Project credentials here or via the UI Settings Modal:
const PROVATI_CONFIG = {
  SUPABASE_URL: 'https://vclequhmjpzxhopxuebs.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjbGVxdWhtanB6eGhvcHh1ZWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwODU5NTcsImV4cCI6MjEwODY2MTk1N30.qYlOu00qBQ707M5QowMUylA006W95RJuvdRcEZZt7DY',
};

// Keys for localStorage persistence
const STORAGE_KEYS = {
  SUPABASE_URL: 'provati_supabase_url',
  SUPABASE_KEY: 'provati_supabase_key',
  BUSES: 'provati_db_buses',
  SCHEDULES: 'provati_db_schedules',
  BOOKINGS: 'provati_db_bookings',
  PAYMENTS: 'provati_db_payments',
  PROFILES: 'provati_db_profiles',
  AUDIT_LOGS: 'provati_db_audit_logs',
  CURRENT_USER: 'provati_auth_user'
};

// Seed Buses matching the four real fleet vehicles
const SEED_BUSES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    coach_number: 'PVT-DD-701',
    bus_name: 'Double-Decker AC Sleeper',
    service_class: 'AC',
    coach_category: 'Sleeper',
    deck_type: 'double',
    total_seats: 34,
    image_url: 'assets/fleet-sleeper.jpg',
    amenities: ['2x1 Sleeper Beds', 'Personal LED Screen', 'USB Port & WiFi', 'Blanket & Water', 'Washroom Onboard'],
    rating: 4.9,
    starting_fare: 1850,
    tagline: 'Highway Royalty with First-Class Sleeper Cabins'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    coach_number: 'PVT-EX-402',
    bus_name: 'Executive AC Business Coach',
    service_class: 'AC',
    coach_category: 'Business',
    deck_type: 'single',
    total_seats: 40,
    image_url: 'assets/fleet-business.jpg',
    amenities: ['2x2 Luxury Recliners', 'Reading Lights', 'USB Fast Charging', 'Onboard Refreshments', 'Air Suspension'],
    rating: 4.8,
    starting_fare: 1200,
    tagline: 'Ultra-Comfort Reclining Business Class'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    coach_number: 'PVT-HC-603',
    bus_name: 'Non-AC Fresh Inter-City Coach',
    service_class: 'Non-AC',
    coach_category: 'Highway',
    deck_type: 'single',
    total_seats: 40,
    image_url: 'assets/fleet-non-ac.jpg',
    amenities: ['Economical Fare', 'Large Cargo Space', 'Natural Sliding Ventilation', 'Spacious Legroom'],
    rating: 4.5,
    starting_fare: 420,
    tagline: 'Fresh Air & Maximum Speed on Long Corridors'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    coach_number: 'PVT-LC-504',
    bus_name: 'Standard Non-AC Local Commuter',
    service_class: 'Non-AC',
    coach_category: 'Commuter',
    deck_type: 'single',
    total_seats: 40,
    image_url: 'assets/fleet-commuter.jpg',
    amenities: ['Budget-Friendly', 'Frequent Boarding', 'Inside District Express', 'Convenient Town Stops'],
    rating: 4.3,
    starting_fare: 120,
    tagline: 'Reliable Daily Connecting Commuter'
  }
];

// Seed Schedules
const generateInitialSchedules = () => {
  const now = new Date();
  
  const addHours = (h) => {
    const d = new Date(now.getTime() + h * 3600 * 1000);
    return d.toISOString();
  };

  const addDays = (days, hour = 8) => {
    const d = new Date(now.getTime() + days * 24 * 3600 * 1000);
    d.setHours(hour, 30, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'sched-101',
      bus_id: '11111111-1111-1111-1111-111111111111',
      coach_number: 'PVT-DD-701',
      bus_name: 'Double-Decker AC Sleeper',
      service_class: 'AC',
      coach_category: 'Sleeper',
      deck_type: 'double',
      route_type: 'Inter-City',
      origin: 'Dhaka',
      destination: 'Chattogram',
      boarding_point: 'Sayedabad Central VIP Gate 3, Dhaka',
      dropping_point: 'Dampara Provati Lounge, Chattogram',
      departure_time: addHours(3.5),
      arrival_time: addHours(9),
      duration: '5h 30m',
      ticket_price: 1850,
      allow_prebooking: true,
      available_seats: 26,
      status: 'on-schedule',
      vip_blocked_seats: ['U1', 'U2'],
      booked_seats: ['U7', 'U8', 'L3', 'L4', 'U12', 'L11'],
      image_url: 'assets/fleet-sleeper.jpg'
    },
    {
      id: 'sched-102',
      bus_id: '11111111-1111-1111-1111-111111111111',
      coach_number: 'PVT-DD-702',
      bus_name: 'Double-Decker AC Sleeper',
      service_class: 'AC',
      coach_category: 'Sleeper',
      deck_type: 'double',
      route_type: 'Inter-City',
      origin: 'Dhaka',
      destination: "Cox's Bazar",
      boarding_point: 'Arambagh Royal Lounge, Dhaka',
      dropping_point: "Kolatoli Beach Circle, Cox's Bazar",
      departure_time: addHours(7.5),
      arrival_time: addHours(16.5),
      duration: '9h 00m',
      ticket_price: 2400,
      allow_prebooking: true,
      available_seats: 20,
      status: 'on-schedule',
      vip_blocked_seats: ['L1', 'L2'],
      booked_seats: ['U3', 'U4', 'U5', 'U6', 'L5', 'L6', 'L7'],
      image_url: 'assets/fleet-sleeper.jpg'
    },
    {
      id: 'sched-103',
      bus_id: '22222222-2222-2222-2222-222222222222',
      coach_number: 'PVT-EX-402',
      bus_name: 'Executive AC Business Coach',
      service_class: 'AC',
      coach_category: 'Business',
      deck_type: 'single',
      route_type: 'Inter-City',
      origin: 'Dhaka',
      destination: 'Chattogram',
      boarding_point: 'Kallayanpur Business Counter, Dhaka',
      dropping_point: 'GEC Circle Executive Stop, Chattogram',
      departure_time: addHours(2),
      arrival_time: addHours(7),
      duration: '5h 00m',
      ticket_price: 1200,
      allow_prebooking: true,
      available_seats: 29,
      status: 'on-schedule',
      vip_blocked_seats: ['A1', 'A2'],
      booked_seats: ['A3', 'A4', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1'],
      image_url: 'assets/fleet-business.jpg'
    },
    {
      id: 'sched-104',
      bus_id: '22222222-2222-2222-2222-222222222222',
      coach_number: 'PVT-EX-405',
      bus_name: 'Executive AC Business Coach',
      service_class: 'AC',
      coach_category: 'Business',
      deck_type: 'single',
      route_type: 'Inter-City',
      origin: 'Chattogram',
      destination: 'Dhaka',
      boarding_point: 'Dampara Provati Lounge, Chattogram',
      dropping_point: 'Sayedabad & Arambagh, Dhaka',
      departure_time: addHours(4.5),
      arrival_time: addHours(9.75),
      duration: '5h 15m',
      ticket_price: 1200,
      allow_prebooking: true,
      available_seats: 32,
      status: 'delayed',
      vip_blocked_seats: ['A1'],
      booked_seats: ['A3', 'B3', 'C3', 'D3'],
      image_url: 'assets/fleet-business.jpg'
    },
    {
      id: 'sched-105',
      bus_id: '33333333-3333-3333-3333-333333333333',
      coach_number: 'PVT-HC-603',
      bus_name: 'Non-AC Fresh Inter-City Coach',
      service_class: 'Non-AC',
      coach_category: 'Highway',
      deck_type: 'single',
      route_type: 'Inter-City',
      origin: 'Dhaka',
      destination: 'Sylhet',
      boarding_point: 'Mohakhali Inter-District Bus Stand, Dhaka',
      dropping_point: 'Kadamtoli Main Terminal, Sylhet',
      departure_time: addHours(5),
      arrival_time: addHours(10.5),
      duration: '5h 30m',
      ticket_price: 680,
      allow_prebooking: true,
      available_seats: 34,
      status: 'on-schedule',
      vip_blocked_seats: [],
      booked_seats: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
      image_url: 'assets/fleet-non-ac.jpg'
    },
    {
      id: 'sched-106',
      bus_id: '33333333-3333-3333-3333-333333333333',
      coach_number: 'PVT-HC-607',
      bus_name: 'Non-AC Fresh Inter-City Coach',
      service_class: 'Non-AC',
      coach_category: 'Highway',
      deck_type: 'single',
      route_type: 'Inter-City',
      origin: 'Dhaka',
      destination: 'Cumilla',
      boarding_point: 'Sayedabad Terminal Platform 4',
      dropping_point: 'Paduar Bazar Bishwa Road, Cumilla',
      departure_time: addHours(1.5),
      arrival_time: addHours(4),
      duration: '2h 30m',
      ticket_price: 420,
      allow_prebooking: true,
      available_seats: 25,
      status: 'boarded',
      vip_blocked_seats: [],
      booked_seats: ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3'],
      image_url: 'assets/fleet-non-ac.jpg'
    },
    {
      id: 'sched-107',
      bus_id: '44444444-4444-4444-4444-444444444444',
      coach_number: 'PVT-LC-504',
      bus_name: 'Standard Non-AC Local Commuter',
      service_class: 'Non-AC',
      coach_category: 'Commuter',
      deck_type: 'single',
      route_type: 'Inside-District',
      origin: 'Chattogram',
      destination: 'Hathazari',
      boarding_point: 'Muradpur Bus Stand, Chattogram',
      dropping_point: 'Hathazari Bus Terminal & University Gate',
      departure_time: addHours(0.75),
      arrival_time: addHours(1.75),
      duration: '1h 00m',
      ticket_price: 150,
      allow_prebooking: false,
      available_seats: 35,
      status: 'on-schedule',
      vip_blocked_seats: [],
      booked_seats: ['A1', 'A2', 'B1', 'B2', 'C1'],
      image_url: 'assets/fleet-commuter.jpg'
    },
    {
      id: 'sched-108',
      bus_id: '44444444-4444-4444-4444-444444444444',
      coach_number: 'PVT-LC-508',
      bus_name: 'Standard Non-AC Local Commuter',
      service_class: 'Non-AC',
      coach_category: 'Commuter',
      deck_type: 'single',
      route_type: 'Inside-District',
      origin: 'Dhaka',
      destination: 'Narayanganj',
      boarding_point: 'Gulistan Underpass Bus Bay, Dhaka',
      dropping_point: 'Chashara Central Railway & Bus Terminal',
      departure_time: addHours(0.5),
      arrival_time: addHours(1.5),
      duration: '1h 00m',
      ticket_price: 120,
      allow_prebooking: false,
      available_seats: 37,
      status: 'on-schedule',
      vip_blocked_seats: [],
      booked_seats: ['A1', 'A2', 'A3'],
      image_url: 'assets/fleet-commuter.jpg'
    },
    {
      id: 'sched-109',
      bus_id: '11111111-1111-1111-1111-111111111111',
      coach_number: 'PVT-DD-799-EID',
      bus_name: 'Double-Decker AC Sleeper',
      service_class: 'AC',
      coach_category: 'Sleeper',
      deck_type: 'double',
      route_type: 'Inter-City',
      origin: 'Dhaka',
      destination: "Cox's Bazar",
      boarding_point: 'Sayedabad Central VIP Gate 3, Dhaka',
      dropping_point: "Laboni Beach Circle, Cox's Bazar",
      departure_time: addDays(40, 21),
      arrival_time: addDays(41, 6),
      duration: '9h 00m',
      ticket_price: 2600,
      allow_prebooking: true,
      available_seats: 28,
      status: 'on-schedule',
      vip_blocked_seats: ['U1', 'U2'],
      booked_seats: ['U5', 'U6', 'L1', 'L2'],
      is_prebooking_holiday: true,
      image_url: 'assets/fleet-sleeper.jpg'
    }
  ];
};

// Seed Bookings
const SEED_BOOKINGS = [
  {
    id: 'book-901',
    pnr_code: 'PNR PVT-4091A',
    user_id: 'usr-3',
    passenger_name: 'Shuharthu Barua',
    passenger_phone: '+880 1933 778899',
    passenger_email: 'shuharthu@example.com',
    schedule_id: 'sched-101',
    coach_number: 'PVT-DD-701',
    bus_name: 'Double-Decker AC Sleeper',
    route: 'Dhaka → Chattogram',
    boarding_station: 'Sayedabad Central VIP Gate 3, Dhaka',
    dropping_station: 'Dampara Provati Lounge, Chattogram',
    departure_time: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    seat_numbers: ['U7', 'U8'],
    is_prebooking: false,
    booking_status: 'confirmed',
    fare_per_seat: 1850,
    subtotal: 3700,
    tax_amount: 185,
    total_amount: 3885,
    payment_method: 'bKash',
    payment_status: 'PAID',
    transaction_id: 'TXN-BK-9842109',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    id: 'book-902',
    pnr_code: 'PNR PVT-8820B',
    user_id: 'usr-2',
    passenger_name: 'Farhana Yasmin',
    passenger_phone: '+880 1822 445566',
    passenger_email: 'farhana@example.com',
    schedule_id: 'sched-103',
    coach_number: 'PVT-EX-402',
    bus_name: 'Executive AC Business Coach',
    route: 'Dhaka → Chattogram',
    boarding_station: 'Kallayanpur Business Counter, Dhaka',
    dropping_station: 'GEC Circle Executive Stop, Chattogram',
    departure_time: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    seat_numbers: ['A3', 'A4'],
    is_prebooking: false,
    booking_status: 'confirmed',
    fare_per_seat: 1200,
    subtotal: 2400,
    tax_amount: 120,
    total_amount: 2520,
    payment_method: 'Nagad',
    payment_status: 'PAID',
    transaction_id: 'TXN-NG-4412091',
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    id: 'book-903',
    pnr_code: 'PNR PVT-3140C',
    user_id: 'usr-1',
    passenger_name: 'Tariqul Islam',
    passenger_phone: '+880 1711 009988',
    passenger_email: 'tariqul@example.com',
    schedule_id: 'sched-102',
    coach_number: 'PVT-DD-702',
    bus_name: 'Double-Decker AC Sleeper',
    route: "Dhaka → Cox's Bazar",
    boarding_station: 'Arambagh Royal Lounge, Dhaka',
    dropping_station: "Kolatoli Beach Circle, Cox's Bazar",
    departure_time: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
    seat_numbers: ['U3', 'U4'],
    is_prebooking: true,
    booking_status: 'confirmed',
    fare_per_seat: 2400,
    subtotal: 4800,
    tax_amount: 240,
    total_amount: 5040,
    payment_method: 'Card',
    payment_status: 'PAID',
    transaction_id: 'TXN-CD-7721903',
    created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
  },
  {
    id: 'book-904',
    pnr_code: 'PNR PVT-5510D',
    user_id: 'usr-3',
    passenger_name: 'Mahbubul Alam',
    passenger_phone: '+880 1611 223344',
    passenger_email: 'mahbub@example.com',
    schedule_id: 'sched-101',
    coach_number: 'PVT-DD-701',
    bus_name: 'Double-Decker AC Sleeper',
    route: 'Dhaka → Chattogram',
    boarding_station: 'Sayedabad Central VIP Gate 3, Dhaka',
    dropping_station: 'Dampara Provati Lounge, Chattogram',
    departure_time: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    seat_numbers: ['L4'],
    is_prebooking: false,
    booking_status: 'pending_hold',
    fare_per_seat: 1850,
    subtotal: 1850,
    tax_amount: 90,
    total_amount: 1940,
    payment_method: 'Counter Hold',
    payment_status: 'PENDING_COUNTER',
    transaction_id: 'HOLD-6H-88190',
    created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
  }
];

// Seed Profiles
const SEED_PROFILES = [
  {
    id: 'usr-1',
    full_name: 'Tariqul Islam (Super Admin)',
    phone: '+880 1711 009988',
    email: 'admin@provati.com.bd',
    role: 'super_admin',
    avatar: 'assets/logo-transparent.png',
    department: 'Executive Operations & Governance'
  },
  {
    id: 'usr-4',
    full_name: 'Kamrul Hasan (Fleet Admin)',
    phone: '+880 1733 556677',
    email: 'admin.ops@provati.com.bd',
    role: 'admin',
    avatar: 'assets/logo-transparent.png',
    department: 'Fleet Operations & Fares'
  },
  {
    id: 'usr-2',
    full_name: 'Farhana Yasmin (Chief Dispatcher)',
    phone: '+880 1822 445566',
    email: 'editor@provati.com.bd',
    role: 'editor',
    avatar: 'assets/logo-transparent.png',
    department: 'Fleet Dispatch & Counters'
  },
  {
    id: 'usr-3',
    full_name: 'Shuharthu Barua (Passenger)',
    phone: '+880 1933 778899',
    email: 'shuharthu@example.com',
    role: 'user',
    avatar: 'assets/logo-transparent.png',
    department: 'Frequent Traveler'
  }
];

// Seed Audit Logs
const SEED_AUDIT_LOGS = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    actor: 'Tariqul Islam',
    role: 'super_admin',
    action: 'INIT_SYSTEM',
    details: 'System bootstrapped with 4 premium bus coaches and 9 active scheduled routes.'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    actor: 'Shuharthu Barua',
    role: 'user',
    action: 'RESERVE_TICKET',
    details: 'Booked seats U7, U8 for Dhaka → Chattogram (PNR PVT-4091A). Paid via bKash.'
  }
];

// Database Management Class (Hybrid Supabase & Local Fallback)
class ProvatiDB {
  constructor() {
    this.supabase = null;
    this.isSupabaseConnected = false;
    this.listeners = [];
    this.initDatabase();
  }

  initDatabase() {
    // 1. Check if Supabase keys exist in PROVATI_CONFIG or localStorage
    let savedUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL) || PROVATI_CONFIG.SUPABASE_URL;
    let savedKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY) || PROVATI_CONFIG.SUPABASE_ANON_KEY;

    if (savedUrl && savedKey && window.supabase) {
      try {
        this.supabase = window.supabase.createClient(savedUrl.trim(), savedKey.trim());
        this.isSupabaseConnected = true;
        this.supabaseUrl = savedUrl.trim();
        console.log('Provati DB: Connected to live Supabase client instance:', savedUrl);
        // Attempt background synchronization
        this.syncWithLiveSupabase();
      } catch (err) {
        console.warn('Provati DB: Supabase initialization error, falling back to local database.', err);
        this.isSupabaseConnected = false;
      }
    } else {
      this.isSupabaseConnected = false;
    }

    // Initialize LocalStorage Data if missing
    if (!localStorage.getItem(STORAGE_KEYS.BUSES)) {
      localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(SEED_BUSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(generateInitialSchedules()));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROFILES)) {
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_PROFILES));
    } else {
      // Ensure seed staff profiles exist in storage
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES)) || [];
        let updated = false;
        SEED_PROFILES.forEach(seedP => {
          if (!stored.some(p => (p.email || '').toLowerCase() === seedP.email.toLowerCase())) {
            stored.push(seedP);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(stored));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
    }

    // Default current user to Passenger (User)
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_PROFILES[3])); // Default passenger Shuharthu
    }
  }

  // Subscribe to changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(event, data) {
    this.listeners.forEach(cb => {
      try { cb(event, data); } catch (e) { console.error('Listener err', e); }
    });
  }

  // --- Auth / User Profiles ---
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || SEED_PROFILES[3];
    } catch (e) {
      return SEED_PROFILES[3];
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.logAudit(user.full_name, user.role, 'SWITCH_ROLE', `Active role switched to: ${user.role}`);
    this.notify('USER_CHANGED', user);
    return user;
  }

  getAllProfiles() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROFILES)) || SEED_PROFILES;
    } catch (e) {
      return SEED_PROFILES;
    }
  }

  findProfileByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const profiles = this.getAllProfiles();
    return profiles.find(p => (p.email || '').toLowerCase() === cleanEmail) || null;
  }

  /**
   * Only Super Admin is authorized to change or assign roles (Admin, Editor, User).
   */
  updateProfileRole(userId, newRole) {
    const activeUser = this.getCurrentUser();
    
    // Strict RBAC check: only super_admin can set admin/editor/super_admin roles!
    if (activeUser.role !== 'super_admin') {
      console.warn('Blocked unauthorized role update attempt: Only Super Admin can assign roles.');
      return { success: false, message: 'Permission Denied: Only Super Admin can assign Admin or Editor roles.' };
    }

    const profiles = this.getAllProfiles();
    const target = profiles.find(p => p.id === userId);
    if (target) {
      const oldRole = target.role;
      target.role = newRole;
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));

      // If active user is this user, update active user as well
      if (activeUser.id === userId) {
        activeUser.role = newRole;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(activeUser));
      }

      this.logAudit('Super Admin', 'super_admin', 'UPDATE_ROLE', `Super Admin promoted/changed ${target.full_name}'s role from ${oldRole} to ${newRole}`);
      this.notify('PROFILES_UPDATED', profiles);
      return { success: true, message: `Access level for ${target.full_name} updated to ${newRole.toUpperCase()}.` };
    }
    return { success: false, message: 'Target user profile not found.' };
  }

  /**
   * Universal Login / Switcher on a single site:
   * Handles email lookup and enforces role authorization.
   * If normal user types email, admin/editor roles are restricted.
   */
  loginWithEmail(email, requestedRole) {
    if (!email || !email.trim()) {
      throw new Error('Please enter a valid email address.');
    }
    const cleanEmail = email.trim().toLowerCase();
    let profiles = this.getAllProfiles();
    let profile = profiles.find(p => (p.email || '').toLowerCase() === cleanEmail);

    if (!profile) {
      // Automatic customer registration: default role strictly 'user'
      const namePart = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      profile = {
        id: 'usr-' + Date.now(),
        full_name: `${formattedName} (Passenger)`,
        phone: '+880 1700 000000',
        email: cleanEmail,
        role: 'user', // strictly passenger by default
        avatar: 'assets/logo-transparent.png',
        department: 'Customer / Passenger'
      };
      profiles.push(profile);
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
      this.notify('PROFILES_UPDATED', profiles);
    }

    // Role enforcement based on DB profile:
    let effectiveRole = profile.role;
    if (profile.role === 'super_admin') {
      effectiveRole = requestedRole || 'super_admin';
    } else if (profile.role === 'admin') {
      effectiveRole = (requestedRole === 'super_admin') ? 'admin' : (requestedRole || 'admin');
    } else if (profile.role === 'editor') {
      effectiveRole = (requestedRole === 'editor' || requestedRole === 'user') ? requestedRole : 'editor';
    } else {
      // Normal user (Customer) - can NEVER have staff role unless Super Admin sets it
      effectiveRole = 'user';
    }

    const sessionUser = {
      ...profile,
      role: effectiveRole
    };

    this.setCurrentUser(sessionUser);
    return sessionUser;
  }

  // --- Buses Fleet ---
  getBuses() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSES)) || SEED_BUSES;
    } catch (e) {
      return SEED_BUSES;
    }
  }

  // --- Schedules ---
  getSchedules(filter = {}) {
    let schedules = [];
    try {
      schedules = JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHEDULES)) || [];
    } catch (e) {
      schedules = generateInitialSchedules();
    }
    if (!schedules || schedules.length === 0) {
      schedules = generateInitialSchedules();
    }

    const buses = this.getBuses();
    // Hydrate schedule with bus fields in case it came from remote Supabase (which only stores bus_id)
    schedules = schedules.map(s => {
      const bus = buses.find(b => b.id === s.bus_id) || SEED_BUSES.find(b => b.coach_category === s.coach_category) || SEED_BUSES[0];
      return {
        ...s,
        coach_number: s.coach_number || bus.coach_number || 'PVT-DD-701',
        bus_name: s.bus_name || bus.bus_name || 'Double-Decker AC Sleeper',
        service_class: s.service_class || bus.service_class || 'AC',
        coach_category: s.coach_category || bus.coach_category || 'Sleeper',
        deck_type: s.deck_type || bus.deck_type || 'double',
        duration: s.duration || '5h 30m',
        status: s.status || 'on-schedule',
        available_seats: s.available_seats !== undefined ? s.available_seats : (bus.total_seats - 8),
        ticket_price: s.ticket_price || bus.starting_fare || 1850,
        image_url: s.image_url || bus.image_url || 'assets/fleet-sleeper.jpg'
      };
    });

    // Filter by route_type
    if (filter.route_type && filter.route_type !== 'All') {
      schedules = schedules.filter(s => (s.route_type || '').toLowerCase() === filter.route_type.toLowerCase());
    }

    // Filter by origin
    if (filter.origin && filter.origin.trim() !== '') {
      schedules = schedules.filter(s => (s.origin || '').toLowerCase().includes(filter.origin.toLowerCase().trim()));
    }

    // Filter by destination
    if (filter.destination && filter.destination.trim() !== '') {
      schedules = schedules.filter(s => (s.destination || '').toLowerCase().includes(filter.destination.toLowerCase().trim()));
    }

    // Filter by service_class (AC / Non-AC / Sleeper / Seater)
    if (filter.service && filter.service !== 'All') {
      if (filter.service === 'AC') {
        schedules = schedules.filter(s => s.service_class === 'AC');
      } else if (filter.service === 'Non-AC') {
        schedules = schedules.filter(s => s.service_class === 'Non-AC');
      } else if (filter.service === 'Sleeper') {
        schedules = schedules.filter(s => s.coach_category === 'Sleeper');
      } else if (filter.service === 'Seater') {
        schedules = schedules.filter(s => s.coach_category !== 'Sleeper');
      }
    }

    // Filter by bus category / fleet filter
    if (filter.coach_category && filter.coach_category !== 'All') {
      schedules = schedules.filter(s => (s.coach_category || '').toLowerCase() === filter.coach_category.toLowerCase());
    }

    // Filter by prebooking
    if (filter.is_prebooking === true) {
      schedules = schedules.filter(s => s.allow_prebooking === true);
    }

    return schedules;
  }

  getScheduleById(id) {
    const list = this.getSchedules();
    return list.find(s => s.id === id) || null;
  }

  createSchedule(newSchedule) {
    const list = this.getSchedules();
    const id = 'sched-' + Date.now();
    const bus = this.getBuses().find(b => b.id === newSchedule.bus_id) || SEED_BUSES[0];

    const schedule = {
      id,
      bus_id: bus.id,
      coach_number: newSchedule.coach_number || bus.coach_number,
      bus_name: bus.bus_name,
      service_class: bus.service_class,
      coach_category: bus.coach_category,
      deck_type: bus.deck_type,
      route_type: newSchedule.route_type || 'Inter-City',
      origin: newSchedule.origin,
      destination: newSchedule.destination,
      boarding_point: newSchedule.boarding_point || `${newSchedule.origin} Terminal`,
      dropping_point: newSchedule.dropping_point || `${newSchedule.destination} Station`,
      departure_time: newSchedule.departure_time,
      arrival_time: newSchedule.arrival_time,
      duration: newSchedule.duration || '5h 00m',
      ticket_price: parseFloat(newSchedule.ticket_price) || bus.starting_fare,
      allow_prebooking: !!newSchedule.allow_prebooking,
      available_seats: bus.total_seats,
      status: 'on-schedule',
      vip_blocked_seats: [],
      booked_seats: [],
      image_url: bus.image_url
    };

    list.unshift(schedule);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
    this.logAudit('Editor Desk', 'editor', 'CREATE_SCHEDULE', `Added new trip ${schedule.coach_number}: ${schedule.origin} → ${schedule.destination}`);
    this.notify('SCHEDULES_CHANGED', list);
    return schedule;
  }

  updateSchedule(id, updates) {
    const list = this.getSchedules();
    const index = list.findIndex(s => s.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
      this.logAudit('Editor Desk', 'editor', 'UPDATE_SCHEDULE', `Updated schedule ${list[index].coach_number} status: ${updates.status || 'modified'}`);
      this.notify('SCHEDULES_CHANGED', list);
      return list[index];
    }
    return null;
  }

  deleteSchedule(id) {
    let list = this.getSchedules();
    const target = list.find(s => s.id === id);
    list = list.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
    if (target) {
      this.logAudit('Super Admin', 'super_admin', 'DELETE_SCHEDULE', `Deleted schedule ${target.coach_number}`);
    }
    this.notify('SCHEDULES_CHANGED', list);
    return true;
  }

  // --- VIP Seat Blocking (Editor Desk) ---
  toggleVIPSeatBlock(scheduleId, seatNumber) {
    const list = this.getSchedules();
    const sched = list.find(s => s.id === scheduleId);
    if (!sched) return false;

    sched.vip_blocked_seats = sched.vip_blocked_seats || [];
    if (sched.vip_blocked_seats.includes(seatNumber)) {
      sched.vip_blocked_seats = sched.vip_blocked_seats.filter(s => s !== seatNumber);
      sched.available_seats += 1;
    } else {
      sched.vip_blocked_seats.push(seatNumber);
      sched.available_seats = Math.max(0, sched.available_seats - 1);
    }

    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(list));
    this.logAudit('Editor Desk', 'editor', 'VIP_SEAT_TOGGLE', `Toggled VIP seat hold on ${seatNumber} for ${sched.coach_number}`);
    this.notify('SCHEDULES_CHANGED', list);
    return sched;
  }

  // --- Bookings & PNR Tracking ---
  getBookings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || SEED_BOOKINGS;
    } catch (e) {
      return SEED_BOOKINGS;
    }
  }

  getBookingByPNR(pnr) {
    const bookings = this.getBookings();
    if (!pnr) return null;
    const cleanPnr = pnr.trim().toUpperCase();
    return bookings.find(b => {
      const code = (b.pnr_code || '').toUpperCase();
      return code === cleanPnr || code.replace('PNR ', '') === cleanPnr.replace('PNR ', '');
    }) || null;
  }

  createBooking(bookingPayload) {
    const bookings = this.getBookings();
    const schedules = this.getSchedules();
    const schedule = schedules.find(s => s.id === bookingPayload.schedule_id);

    if (!schedule) {
      throw new Error('Scheduled trip could not be found.');
    }

    // Verify seat availability
    const alreadyBooked = (schedule.booked_seats || []).concat(schedule.vip_blocked_seats || []);
    for (const seat of bookingPayload.seat_numbers) {
      if (alreadyBooked.includes(seat)) {
        throw new Error(`Seat ${seat} is no longer available.`);
      }
    }

    // Generate unique PNR: PNR PVT-XXXX
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString() + String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const pnr_code = `PNR PVT-${randomHex}`;

    const newBooking = {
      id: 'book-' + Date.now(),
      pnr_code,
      user_id: bookingPayload.user_id || 'guest',
      passenger_name: bookingPayload.passenger_name,
      passenger_phone: bookingPayload.passenger_phone,
      passenger_email: bookingPayload.passenger_email || '',
      schedule_id: schedule.id,
      coach_number: schedule.coach_number,
      bus_name: schedule.bus_name,
      route: `${schedule.origin} → ${schedule.destination}`,
      boarding_station: bookingPayload.boarding_point || schedule.boarding_point,
      dropping_station: bookingPayload.dropping_point || schedule.dropping_point,
      departure_time: schedule.departure_time,
      seat_numbers: bookingPayload.seat_numbers,
      is_prebooking: !!bookingPayload.is_prebooking,
      booking_status: bookingPayload.payment_method === 'counter_hold' ? 'pending_hold' : 'confirmed',
      fare_per_seat: schedule.ticket_price,
      subtotal: bookingPayload.subtotal,
      tax_amount: bookingPayload.tax_amount,
      total_amount: bookingPayload.total_amount,
      payment_method: bookingPayload.payment_method, // bKash, Nagad, card, counter_hold
      payment_status: bookingPayload.payment_method === 'counter_hold' ? 'COUNTER-HOLD' : 'PAID',
      transaction_id: bookingPayload.transaction_id || `TXN-${Date.now()}`,
      created_at: new Date().toISOString(),
      expires_at: bookingPayload.payment_method === 'counter_hold' ? new Date(Date.now() + 6 * 3600 * 1000).toISOString() : null
    };

    // Update schedule booked seats and seat counter
    schedule.booked_seats = (schedule.booked_seats || []).concat(bookingPayload.seat_numbers);
    schedule.available_seats = Math.max(0, schedule.available_seats - bookingPayload.seat_numbers.length);
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));

    bookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Sync to live Supabase database if connected
    if (this.isSupabaseConnected && this.supabase) {
      try {
        this.supabase.from('bookings').insert([{
          pnr_code: newBooking.pnr_code,
          passenger_name: newBooking.passenger_name,
          passenger_phone: newBooking.passenger_phone,
          seat_numbers: newBooking.seat_numbers,
          is_prebooking: newBooking.is_prebooking,
          booking_status: newBooking.booking_status,
          total_amount: newBooking.total_amount,
          boarding_station: newBooking.boarding_station,
          dropping_station: newBooking.dropping_station
        }]).then(({ error }) => {
          if (error) console.warn('Supabase booking sync notice:', error.message);
          else console.log('✅ Booking synced to remote Supabase database:', newBooking.pnr_code);
        }).catch(err => console.warn('Supabase insert notice:', err));
      } catch (e) {
        console.warn('Supabase sync skipped:', e);
      }
    }

    this.logAudit(
      bookingPayload.passenger_name || 'Passenger',
      'user',
      'NEW_BOOKING',
      `Issued ${pnr_code} for seats ${bookingPayload.seat_numbers.join(', ')} (${(bookingPayload.payment_method || 'CASH').toUpperCase()})`
    );

    this.notify('BOOKING_CREATED', newBooking);
    this.notify('SCHEDULES_CHANGED', schedules);

    return newBooking;
  }

  cancelBooking(pnrCode) {
    const bookings = this.getBookings();
    const schedules = this.getSchedules();
    const booking = bookings.find(b => b.pnr_code === pnrCode);

    if (!booking) return false;
    booking.booking_status = 'cancelled';
    booking.payment_status = 'REFUNDED';

    const schedule = schedules.find(s => s.id === booking.schedule_id);
    if (schedule) {
      schedule.booked_seats = (schedule.booked_seats || []).filter(seat => !booking.seat_numbers.includes(seat));
      schedule.available_seats += booking.seat_numbers.length;
      localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    }

    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    this.logAudit('Editor Desk', 'editor', 'CANCEL_BOOKING', `Cancelled booking ${pnrCode}. Seats released: ${booking.seat_numbers.join(', ')}`);
    this.notify('BOOKINGS_UPDATED', bookings);
    this.notify('SCHEDULES_CHANGED', schedules);
    return true;
  }

  // --- Audit Logs ---
  getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) || SEED_AUDIT_LOGS;
    } catch (e) {
      return SEED_AUDIT_LOGS;
    }
  }

  logAudit(actor, role, action, details) {
    const logs = this.getAuditLogs();
    const entry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor,
      role,
      action,
      details
    };
    logs.unshift(entry);
    if (logs.length > 100) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    this.notify('AUDIT_LOGGED', entry);
  }

  // --- Financial & Occupancy Analytics (Admin Command) ---
  getAnalytics() {
    const bookings = this.getBookings();
    const schedules = this.getSchedules();

    let totalRevenue = 0;
    let cashCounterHoldRevenue = 0;
    let paidBookingsCount = 0;
    let totalSeatsBooked = 0;

    const routeStats = {};
    const methodStats = { bKash: 0, Nagad: 0, Card: 0, 'Counter Hold': 0 };

    bookings.forEach(b => {
      const amt = Number(b.total_amount) || 0;
      const seatsCount = (b.seat_numbers && b.seat_numbers.length) || 1;

      if (b.booking_status === 'confirmed') {
        totalRevenue += amt;
        paidBookingsCount += 1;
        totalSeatsBooked += seatsCount;
      } else if (b.booking_status === 'pending_hold') {
        cashCounterHoldRevenue += amt;
      }

      // Method distribution (case-insensitive)
      const methodStr = (b.payment_method || '').toLowerCase();
      if (methodStr.includes('bkash')) {
        methodStats.bKash += amt;
      } else if (methodStr.includes('nagad')) {
        methodStats.Nagad += amt;
      } else if (methodStr.includes('card')) {
        methodStats.Card += amt;
      } else if (methodStr.includes('hold') || methodStr.includes('counter')) {
        methodStats['Counter Hold'] += amt;
      }

      // Route Distribution
      if (b.route) {
        routeStats[b.route] = (routeStats[b.route] || 0) + seatsCount;
      }
    });

    // Occupancy
    let totalCapacity = 0;
    let occupiedSeats = 0;
    let acOccupied = 0;
    let nonAcOccupied = 0;
    let interCityOccupied = 0;
    let localOccupied = 0;

    schedules.forEach(s => {
      const bus = this.getBuses().find(b => b.id === s.bus_id);
      const cap = bus ? bus.total_seats : 34;
      const booked = (s.booked_seats || []).length;
      totalCapacity += cap;
      occupiedSeats += booked;

      if (s.service_class === 'AC') acOccupied += booked;
      else nonAcOccupied += booked;

      if (s.route_type === 'Inter-City') interCityOccupied += booked;
      else localOccupied += booked;
    });

    // Provide vibrant baseline metrics if no real bookings have been saved yet
    const displayRevenue = totalRevenue > 0 ? totalRevenue : 18750;
    const displayHolds = cashCounterHoldRevenue > 0 ? cashCounterHoldRevenue : 3700;
    const displaySeats = totalSeatsBooked > 0 ? totalSeatsBooked : 14;
    const calculatedOccupancy = totalCapacity > 0 ? Math.round((occupiedSeats / totalCapacity) * 100) : 0;
    const displayOccupancy = calculatedOccupancy > 0 ? calculatedOccupancy : 74;

    return {
      totalRevenue: displayRevenue,
      cashCounterHoldRevenue: displayHolds,
      paidBookingsCount: paidBookingsCount || 6,
      totalSeatsBooked: displaySeats,
      averageOccupancy: displayOccupancy,
      totalCapacity: totalCapacity || 340,
      methodStats: {
        bKash: methodStats.bKash || 7500,
        Nagad: methodStats.Nagad || 4800,
        Card: methodStats.Card || 4600,
        'Counter Hold': displayHolds
      },
      routeStats,
      acVsNonAc: { AC: acOccupied || 28, 'Non-AC': nonAcOccupied || 14 },
      interCityVsDistrict: { 'Inter-City': interCityOccupied || 32, 'Inside-District': localOccupied || 10 }
    };
  }

  // --- Supabase Config Helper & Live Sync ---
  async syncWithLiveSupabase() {
    if (!this.supabase || !this.isSupabaseConnected) return false;
    try {
      // 1. Fetch Buses
      const { data: remoteBuses, error: busErr } = await this.supabase.from('buses').select('*');
      if (!busErr && remoteBuses && remoteBuses.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(remoteBuses));
      }

      // 2. Fetch Schedules
      const { data: remoteSchedules, error: schedErr } = await this.supabase.from('schedules').select('*');
      if (!schedErr && remoteSchedules && remoteSchedules.length > 0) {
        localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(remoteSchedules));
        this.notify('SCHEDULES_CHANGED', remoteSchedules);
      }

      // 3. Fetch Bookings
      const { data: remoteBookings, error: bookErr } = await this.supabase.from('bookings').select('*');
      if (!bookErr && remoteBookings && remoteBookings.length > 0) {
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(remoteBookings));
        this.notify('BOOKINGS_UPDATED', remoteBookings);
      }

      // Setup Realtime Subscription Channel
      this.setupRealtimeSubscription();

      this.notify('SUPABASE_SYNC_SUCCESS', { isConnected: true });
      return true;
    } catch (e) {
      console.warn('Provati DB: Error syncing live Supabase tables, keeping local fallback:', e);
      return false;
    }
  }

  setupRealtimeSubscription() {
    if (!this.supabase || !this.isSupabaseConnected) return;
    try {
      const channel = this.supabase.channel('provati-realtime-channel');
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'schedules' }, (payload) => {
          console.log('Realtime schedule change received:', payload);
          this.syncWithLiveSupabase();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
          console.log('Realtime booking change received:', payload);
          this.syncWithLiveSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime channel error:', e);
    }
  }

  async testSupabaseConnection(url, key) {
    if (!url || !key) return { success: false, message: 'URL and Anon API Key are required.' };
    const cleanUrl = url.trim().replace(/\/$/, '');
    const cleanKey = key.trim();

    try {
      const pingUrl = `${cleanUrl}/rest/v1/buses?select=id&limit=1`;
      const res = await fetch(pingUrl, {
        headers: {
          'apikey': cleanKey,
          'Authorization': `Bearer ${cleanKey}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok || res.status === 200) {
        return { success: true, message: 'Successfully reached live Supabase database!' };
      } else if (res.status === 401) {
        return { success: false, message: 'Authentication failed. Please verify your Supabase Anon Public Key.' };
      } else {
        return { success: true, message: `Connected (HTTP ${res.status}).` };
      }
    } catch (err) {
      return { success: false, message: `Connection error: ${err.message}` };
    }
  }

  async setSupabaseCredentials(url, key) {
    if (!url || !key) {
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
      this.supabase = null;
      this.isSupabaseConnected = false;
      this.notify('SUPABASE_STATUS', { isConnected: false });
      return false;
    }

    const cleanUrl = url.trim().replace(/\/$/, '');
    const cleanKey = key.trim();

    localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, cleanUrl);
    localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, cleanKey);

    if (window.supabase) {
      try {
        this.supabase = window.supabase.createClient(cleanUrl, cleanKey);
        this.isSupabaseConnected = true;
        this.supabaseUrl = cleanUrl;
        this.logAudit('Super Admin', 'super_admin', 'SUPABASE_CONNECT', `Connected live Supabase client: ${cleanUrl}`);
        await this.syncWithLiveSupabase();
        this.notify('SUPABASE_STATUS', { isConnected: true, url: cleanUrl });
        return true;
      } catch (e) {
        console.error('Supabase connection error:', e);
        this.isSupabaseConnected = false;
        this.notify('SUPABASE_STATUS', { isConnected: false });
        return false;
      }
    }
    return false;
  }

  resetToDefaultSeed() {
    localStorage.setItem(STORAGE_KEYS.BUSES, JSON.stringify(SEED_BUSES));
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(generateInitialSchedules()));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(SEED_PROFILES));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(SEED_AUDIT_LOGS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(SEED_PROFILES[2]));
    this.notify('DATA_RESET', null);
  }
}

// Global DB Singleton
window.provatiDB = new ProvatiDB();
