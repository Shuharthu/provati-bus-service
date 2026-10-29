-- ============================================================================
-- PROVATI BUS SERVICE (প্রভাতী বাস সার্ভিস) - DATABASE SCHEMA & SEED DATA
-- Tagline: "Shorok pothe Biman" (সড়ক পথে বিমান)
-- ============================================================================

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'editor', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. PROFILES TABLE (RBAC)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone VARCHAR(20),
  role user_role DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BUS FLEET TABLE
CREATE TABLE IF NOT EXISTS buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_number VARCHAR(50) UNIQUE NOT NULL,
  bus_name VARCHAR(100) NOT NULL,
  service_class VARCHAR(20) NOT NULL, -- AC, Non-AC
  coach_category VARCHAR(50) NOT NULL, -- Sleeper, Business, Highway, Commuter
  deck_type VARCHAR(20) DEFAULT 'single', -- single, double
  total_seats INT NOT NULL,
  image_url TEXT,
  amenities TEXT[],
  rating NUMERIC(2,1) DEFAULT 4.8,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SCHEDULED TRIPS TABLE
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  bus_id UUID REFERENCES buses(id) ON DELETE CASCADE,
  route_type VARCHAR(50) NOT NULL, -- Inter-City, Inside-District
  origin VARCHAR(100) NOT NULL,
  destination VARCHAR(100) NOT NULL,
  boarding_point VARCHAR(150) NOT NULL,
  dropping_point VARCHAR(150) NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  duration VARCHAR(50) NOT NULL,
  ticket_price NUMERIC(10, 2) NOT NULL,
  allow_prebooking BOOLEAN DEFAULT TRUE,
  available_seats INT NOT NULL,
  status VARCHAR(20) DEFAULT 'on-schedule', -- on-schedule, delayed, boarded, dispatched
  vip_blocked_seats TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BOOKINGS & PNR TRACKING
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr_code VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  passenger_name VARCHAR(100) NOT NULL,
  passenger_phone VARCHAR(20) NOT NULL,
  passenger_email VARCHAR(100),
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  seat_numbers TEXT[] NOT NULL,
  is_prebooking BOOLEAN DEFAULT FALSE,
  booking_status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, pending_hold, cancelled
  total_amount NUMERIC(10, 2) NOT NULL,
  boarding_station VARCHAR(150),
  dropping_station VARCHAR(150),
  expires_at TIMESTAMPTZ, -- For 6-hour counter holds
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. GATEWAY TRANSACTIONS
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- bKash, Nagad, card, counter_hold
  payment_status VARCHAR(20) DEFAULT 'paid', -- paid, pending, refunded
  account_number VARCHAR(50),
  card_last4 VARCHAR(4),
  paid_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. AUDIT LOGS (ADMIN COMMAND)
CREATE TABLE IF NOT EXISTS system_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_name VARCHAR(100) NOT NULL,
  actor_role VARCHAR(20) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Schedules Policies
CREATE POLICY "Public read schedules" ON schedules FOR SELECT USING (true);
CREATE POLICY "Editors write schedules" ON schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('editor', 'super_admin'))
);

-- Buses Policies
CREATE POLICY "Public read buses" ON buses FOR SELECT USING (true);
CREATE POLICY "Admin write buses" ON buses FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role = 'super_admin')
);

-- Bookings Policies
CREATE POLICY "Public read own booking via PNR" ON bookings FOR SELECT USING (true);
CREATE POLICY "Users and Guests create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Editors manage bookings" ON bookings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('editor', 'super_admin'))
);

-- Payments Policies
CREATE POLICY "Read payments for authorized roles" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND role IN ('editor', 'super_admin'))
);
CREATE POLICY "Insert payments allowed" ON payments FOR INSERT WITH CHECK (true);

-- ============================================================================
-- AUTOMATED TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function: Adjust Available Seats on Booking
CREATE OR REPLACE FUNCTION update_schedule_seat_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE schedules 
    SET available_seats = GREATEST(0, available_seats - array_length(NEW.seat_numbers, 1))
    WHERE id = NEW.schedule_id;
  ELSIF (TG_OP = 'UPDATE' AND NEW.booking_status = 'cancelled' AND OLD.booking_status != 'cancelled') THEN
    UPDATE schedules 
    SET available_seats = available_seats + array_length(OLD.seat_numbers, 1)
    WHERE id = OLD.schedule_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_seat_count_adjust ON bookings;
CREATE TRIGGER trigger_seat_count_adjust
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_schedule_seat_count();

-- ============================================================================
-- REAL-TIME PUBLICATION CONFIG
-- ============================================================================
-- Enable real-time listening for live schedule & seat synchronization
-- (Run in Supabase SQL editor)
-- ALTER PUBLICATION supabase_realtime ADD TABLE schedules;
-- ALTER PUBLICATION supabase_realtime ADD TABLE bookings;

-- ============================================================================
-- SEED DATA (THE 4 FLEET BUSES & AUTH PROFILES)
-- ============================================================================

-- Default Profiles for RBAC Demonstration
INSERT INTO profiles (id, full_name, phone, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Tariqul Islam (Super Admin)', '+880 1711 009988', 'super_admin'),
  ('00000000-0000-0000-0000-000000000002', 'Farhana Yasmin (Chief Dispatcher)', '+880 1822 445566', 'editor'),
  ('00000000-0000-0000-0000-000000000003', 'Shuharthu Barua (Passenger)', '+880 1933 778899', 'user')
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- 4 Specific Buses Matching Provided Fleet Images
INSERT INTO buses (id, coach_number, bus_name, service_class, coach_category, deck_type, total_seats, image_url, amenities, rating) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'PVT-DD-701',
    'Double-Decker AC Sleeper',
    'AC',
    'Sleeper',
    'double',
    34,
    'assets/fleet-sleeper.jpg',
    ARRAY['2x1 Sleeper Beds', 'Personal LED Screen', 'USB Port & WiFi', 'Blanket & Water', 'Washroom Onboard'],
    4.9
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'PVT-EX-402',
    'Executive AC Business Coach',
    'AC',
    'Business',
    'single',
    40,
    'assets/fleet-business.jpg',
    ARRAY['2x2 Luxury Recliners', 'Reading Lights', 'USB Fast Charging', 'Onboard Refreshments', 'Air Suspension'],
    4.8
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'PVT-HC-603',
    'Non-AC Fresh Inter-City Coach',
    'Non-AC',
    'Highway',
    'single',
    40,
    'assets/fleet-non-ac.jpg',
    ARRAY['Economical Fare', 'Large Cargo Space', 'Natural Sliding Ventilation', 'Spacious Legroom'],
    4.5
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'PVT-LC-504',
    'Standard Non-AC Local Commuter',
    'Non-AC',
    'Commuter',
    'single',
    40,
    'assets/fleet-commuter.jpg',
    ARRAY['Budget-Friendly', 'Frequent Boarding', 'Inside District Express', 'Convenient Stops'],
    4.3
  )
ON CONFLICT (coach_number) DO UPDATE SET 
  bus_name = EXCLUDED.bus_name,
  amenities = EXCLUDED.amenities,
  image_url = EXCLUDED.image_url;

-- Dynamic Scheduled Trips (Inter-City & Inside-District)
INSERT INTO schedules (
  id, bus_id, route_type, origin, destination, boarding_point, dropping_point,
  departure_time, arrival_time, duration, ticket_price, allow_prebooking, available_seats, status, vip_blocked_seats
) VALUES
  -- 1. Double Decker Luxury Sleeper: Dhaka -> Chattogram
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    'Inter-City',
    'Dhaka',
    'Chattogram',
    'Sayedabad Central Terminal (Gate 3)',
    'Dampara Provati Lounge, Chattogram',
    NOW() + INTERVAL '4 hours',
    NOW() + INTERVAL '9 hours 30 minutes',
    '5h 30m',
    1850.00,
    TRUE,
    22,
    'on-schedule',
    ARRAY['U1', 'U2']
  ),
  -- 2. Double Decker Luxury Sleeper: Dhaka -> Cox''s Bazar (Night Sleeper)
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '11111111-1111-1111-1111-111111111111',
    'Inter-City',
    'Dhaka',
    'Cox''s Bazar',
    'Arambagh Royal Lounge, Dhaka',
    'Kolatoli Beach Circle, Cox''s Bazar',
    NOW() + INTERVAL '8 hours',
    NOW() + INTERVAL '17 hours',
    '9h 00m',
    2400.00,
    TRUE,
    18,
    'on-schedule',
    ARRAY['L1', 'L2']
  ),
  -- 3. Executive AC Business Coach: Dhaka -> Chattogram (Morning Business Express)
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '22222222-2222-2222-2222-222222222222',
    'Inter-City',
    'Dhaka',
    'Chattogram',
    'Kallayanpur VIP Counter, Dhaka',
    'GEC Circle, Chattogram',
    NOW() + INTERVAL '2 hours',
    NOW() + INTERVAL '7 hours',
    '5h 00m',
    1200.00,
    TRUE,
    28,
    'on-schedule',
    ARRAY['A1', 'A2']
  ),
  -- 4. Executive AC Business Coach: Chattogram -> Dhaka (Afternoon Return)
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    '22222222-2222-2222-2222-222222222222',
    'Inter-City',
    'Chattogram',
    'Dhaka',
    'Dampara Terminal, Chattogram',
    'Sayedabad & Arambagh, Dhaka',
    NOW() + INTERVAL '6 hours',
    NOW() + INTERVAL '11 hours 15 minutes',
    '5h 15m',
    1200.00,
    TRUE,
    31,
    'delayed',
    ARRAY['B1']
  ),
  -- 5. Non-AC Fresh Inter-City Coach: Dhaka -> Sylhet (Highway Fresh Air)
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    '33333333-3333-3333-3333-333333333333',
    'Inter-City',
    'Dhaka',
    'Sylhet',
    'Mohakhali Terminal, Dhaka',
    'Kadamtoli Bus Terminal, Sylhet',
    NOW() + INTERVAL '3 hours 30 minutes',
    NOW() + INTERVAL '9 hours',
    '5h 30m',
    680.00,
    TRUE,
    35,
    'on-schedule',
    ARRAY[]::TEXT[]
  ),
  -- 6. Non-AC Fresh Inter-City Coach: Dhaka -> Cumilla (Economical Corridor)
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    '33333333-3333-3333-3333-333333333333',
    'Inter-City',
    'Dhaka',
    'Cumilla',
    'Sayedabad Counter 12',
    'Paduar Bazar Bishwa Road, Cumilla',
    NOW() + INTERVAL '1 hour 30 minutes',
    NOW() + INTERVAL '4 hours',
    '2h 30m',
    420.00,
    TRUE,
    24,
    'on-schedule',
    ARRAY[]::TEXT[]
  ),
  -- 7. Inside-District Local Commuter: Chattogram -> Hathazari & Fatikchhari
  (
    '10101010-1010-1010-1010-101010101010',
    '44444444-4444-4444-4444-444444444444',
    'Inside-District',
    'Chattogram',
    'Hathazari',
    'Muradpur Bus Stand, Chattogram',
    'Hathazari Bus Terminal',
    NOW() + INTERVAL '45 minutes',
    NOW() + INTERVAL '1 hour 45 minutes',
    '1h 00m',
    150.00,
    FALSE,
    36,
    'on-schedule',
    ARRAY[]::TEXT[]
  ),
  -- 8. Inside-District Local Commuter: Dhaka -> Narayanganj & Sonargaon
  (
    '20202020-2020-2020-2020-202020202020',
    '44444444-4444-4444-4444-444444444444',
    'Inside-District',
    'Dhaka',
    'Narayanganj',
    'Gulistan Counter 4, Dhaka',
    'Chashara Central, Narayanganj',
    NOW() + INTERVAL '30 minutes',
    NOW() + INTERVAL '1 hour 30 minutes',
    '1h 00m',
    120.00,
    FALSE,
    38,
    'on-schedule',
    ARRAY[]::TEXT[]
  ),
  -- 9. Advance Pre-Booking Special: Dhaka -> Cox''s Bazar (Holiday Rush Festival Trip)
  (
    '30303030-3030-3030-3030-303030303030',
    '11111111-1111-1111-1111-111111111111',
    'Inter-City',
    'Dhaka',
    'Cox''s Bazar',
    'Sayedabad Central VIP Gate',
    'Laboni Beach Point, Cox''s Bazar',
    NOW() + INTERVAL '35 days',
    NOW() + INTERVAL '35 days 9 hours',
    '9h 00m',
    2600.00,
    TRUE,
    30,
    'on-schedule',
    ARRAY['U1', 'U2']
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Confirmed Bookings & Payments for Manifest
INSERT INTO bookings (
  id, pnr_code, user_id, passenger_name, passenger_phone, passenger_email,
  schedule_id, seat_numbers, is_prebooking, booking_status, total_amount,
  boarding_station, dropping_station
) VALUES
  (
    '99999999-9999-9999-9999-999999999991',
    'PNR PVT-4091A',
    '00000000-0000-0000-0000-000000000003',
    'Shuharthu Barua',
    '+880 1933 778899',
    'shuharthu@example.com',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    ARRAY['U7', 'U8'],
    FALSE,
    'confirmed',
    3885.00,
    'Sayedabad Central Terminal (Gate 3)',
    'Dampara Provati Lounge, Chattogram'
  )
ON CONFLICT (pnr_code) DO NOTHING;

INSERT INTO payments (
  id, booking_id, transaction_id, payment_method, payment_status, account_number
) VALUES
  (
    '88888888-8888-8888-8888-888888888881',
    '99999999-9999-9999-9999-999999999991',
    'TXN-BK-9842109',
    'bKash',
    'paid',
    '01933778899'
  )
ON CONFLICT (transaction_id) DO NOTHING;
