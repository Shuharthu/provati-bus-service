# Provati Bus Service (প্রভাতী বাস সার্ভিস)
> **"Shorok pothe Biman" (সড়ক পথে বিমান)** — Premium Highway Transit & Smart Fleet Reservation System

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-blue)](index.html)
[![Database](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ECF8E?logo=supabase)](schema.sql)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](#)

---

## 🚌 Overview

**Provati Bus Service** is a modern, high-performance bus ticketing and fleet management web application built for regional and long-haul inter-city transit across Bangladesh. It delivers a dark glassmorphic UI, real-time seat selection, multi-tier coach configurations, multi-method payment gateway simulation (bKash, Nagad, Card, Counter Hold), and scannable digital boarding passes.

---

## ✨ Key Features

1. **Top Fleet Showcase ("OUR PREMIUM FLEET")**:
   - Double-Decker AC Sleeper (2x1 berths, personal LED, Wi-Fi, blanket & water)
   - Executive AC Business Coach (2x2 luxury recliners, USB charging, onboard snacks)
   - Non-AC Fresh Inter-City Coach (large sliding windows, economical, cargo space)
   - Standard Non-AC Local Commuter (frequent boarding, inside-district express)

2. **Advanced Route Engine**:
   - Inter-City (Long-Haul) vs. Inside-District (Local) segmented search
   - Origin & Destination auto-suggest with swap toggle
   - Advance Pre-Booking filter (15–90 days festival/holiday rush guarantee)
   - Service filters: AC, Non-AC, Sleeper, Seater

3. **Dynamic Responsive Seat Layout Engine**:
   - Double-decker Upper/Lower deck view switch (34 Sleeper Berths, 2x1 layout)
   - Single-deck 2x2 layout (40 Reclining Seats with center aisle)
   - Interactive reactive seat color states: Available, Selected (Emerald), Booked (Red), Hold (Amber)
   - Front cabin indicator with animated driver's steering wheel
   - Enforced **maximum 4 seats per booking** limit

4. **Multi-Method PayGateway**:
   - **Mobile Banking**: bKash (Pink) and Nagad (Orange) with account input, simulated 2-step OTP, and PIN
   - **Card Payment**: VISA, Mastercard, AMEX with real-time interactive credit card preview
   - **6-Hour Cash-at-Counter Hold**: Offline reserve-only ticket holding model

5. **Printable Digital E-Ticket & Scannable QR**:
   - Unique PNR generation (e.g. `PNR PVT-4091A`)
   - Route path visualization with Highway N1 transit corridor
   - Dynamic scannable QR Code
   - Dedicated print layout (`window.print()`)

6. **Role-Based Access Control (RBAC)**:
   - **Passenger (User)**: Browse, book, pay, and lookup tickets by PNR
   - **Counter Editor (Dispatcher)**: Add schedules, edit ticket pricing, update delay statuses, lock VIP seats, inspect passenger manifests
   - **Super Admin**: Financial revenue charts, seat occupancy utilization, user role assignment directory, audit logs, and Supabase database connector

---

## 🛠️ Project Structure

```
Bus Ticket Counter/
├── index.html            # Main Single-Page Application (SPA)
├── styles.css            # Dark glassmorphic styling system & print rules
├── app.js                # Core interactive client logic & audio effects
├── supabase-config.js    # Supabase Cloud API & offline local mock engine
├── schema.sql            # PostgreSQL tables, RLS policies, triggers & seed
├── .gitignore            # Git exclusion rules
├── README.md             # Project documentation
└── assets/               # Fleet photography, transparent logo & graphics
    ├── logo.png
    ├── logo-transparent.png
    ├── fleet-sleeper.jpg
    ├── fleet-business.jpg
    ├── fleet-non-ac.jpg
    └── fleet-commuter.jpg
```

---

## 🚀 Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/Shuharthu/provati-bus-service.git
   cd provati-bus-service
   ```

2. Open `index.html` in your web browser, or serve via Python:
   ```bash
   python -m http.server 8080
   ```
   Open `http://localhost:8080`.

3. *(Optional)* Connect to your live Supabase database:
   - Run `schema.sql` in your Supabase SQL Editor.
   - Click the database pill in the header to enter your Supabase URL & Anon Key.

---

## 📄 License
This project is licensed under the MIT License.
