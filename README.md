# Salon CRM — Company / Admin Dashboard

A dedicated, enterprise-grade multi-tenant web administration, monitoring, and analytics platform built for the **Salon CRM platform**.

This dashboard connects directly to our existing **Supabase** backend as the single source of truth without altering mobile application behavior, without duplicating tables, and without creating secondary databases.

---

## 🚀 Key Features & Modules

1. **Multi-Salon Architecture & Scoping**
   - Seamless monitoring of all registered salons (*salon*, *Friends Salon*, *Sameer Salon*, *Hp Salon*).
   - Global multi-salon scope switcher in the navigation bar to isolate single salon telemetry or view company-wide aggregates.

2. **Role-Based Access Control (RBAC)**
   - **Super Admin**: Complete platform access, all salons, all financial ledgers, and reporting.
   - **Company Admin**: Multi-salon oversight, operational monitoring, analytics, and customer tracking.
   - **Support Staff**: Operational customer and appointment access with read-only financial permissions.
   - **Salon Admin**: Isolated single-salon view strictly bounded to the assigned salon ID.

3. **Executive Dashboard Overview**
   - Company KPIs: Total Salons, Active Salons, Total Customers, Today's Bookings, Today's & Monthly Revenue, Stylist headcounts.
   - Revenue trajectory chart (14-day rolling window).
   - Salon benchmark leaderboard ranking revenue and appointments.
   - Live system activity stream.

4. **Salon Management & 360° Overview**
   - Filterable directory with salon owners, contact numbers, locations, and health badges.
   - Deep 360° Salon Overview: tabbed breakdown of salon customers, appointment schedules, invoice ledgers, stylists, services, and live event logs.

5. **Customer Intelligence & Profile 360°**
   - Search by name, phone (+91 formatting), and notes.
   - Customer segmentation (*New Clients*, *Returning Clients*, *VIP / Starred Clients*).
   - **Chronological Customer Journey Timeline**: Visual narrative from registration $\to$ bookings $\to$ completed treatments $\to$ invoice generation $\to$ WhatsApp dispatches.
   - Full appointment history, billing history, and itemized receipt breakdown modals.

6. **Appointments Module**
   - List, Today, and Upcoming schedule views.
   - Filter by Salon, Stylist, Service, and Status (*Scheduled, Confirmed, In Progress, Completed, Cancelled, No-Show*).
   - Detailed appointment modal with service durations and payment states.

7. **Services & Pricing Catalog**
   - Catalog view combining salon custom treatments and standard presets (HAIR, BEARD, SPA, GENERAL).
   - Category distribution cards and pricing.

8. **Staff & Stylist Performance**
   - Stylist productivity directory: appointment volume, completed service count, and generated revenue attribution.

9. **Master Billing & Invoicing Ledger**
   - Financial ledger across all salons.
   - Itemized bill receipt breakdown modals (services rendered, quantities, stylists, GST breakdown, totals).
   - Revenue summaries for Today, This Week, This Month, and All Time.

10. **Activity & Audit Trail**
    - Real-time aggregated event stream synthesized from across Supabase tables (`salons`, `customers`, `appointments`, `bills`, `whatsapp_messages`, `notifications`).

11. **Automated Salon Health Alerts**
    - Rule-based heuristics detecting prolonged salon inactivity (7+ days), high cancellation rates, and WhatsApp delivery errors.

12. **Business Intelligence & Multi-Format Exports**
    - Instant export of any table or analytics dataset to **CSV**, **Excel (.xlsx)**, and **PDF**.

13. **Real-time Live Supabase Synchronization**
    - Integrated Supabase Realtime channel subscriptions on Postgres database changes with non-intrusive live toast alerts.

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS with custom SaaS dark theme
- **Backend & Database**: Supabase JS Client (`@supabase/supabase-js`)
- **Routing**: React Router v6
- **Charts & Visualizations**: Recharts
- **Icons**: Lucide React
- **Export Engines**: jsPDF, jspdf-autotable, XLSX, PapaParse
- **Date Handling**: date-fns

---

## 📁 Project Structure

```
salon-crm-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── charts/         # Area charts, Bar charts, Donut charts
│   │   ├── common/         # StatCard, Button, Badge, SearchInput, Pagination, Modal, ExportDropdown
│   │   └── layout/         # Sidebar, TopNav, AppLayout, SalonSelector, LiveNotificationToast
│   ├── contexts/
│   │   ├── AuthContext.tsx # RBAC, login/logout, session persistence
│   │   ├── SalonContext.tsx# Multi-salon scope selector
│   │   └── RealtimeContext.tsx # Supabase Realtime postgres_changes listeners
│   ├── lib/
│   │   ├── supabase.ts     # Supabase client singleton
│   │   └── exportUtils.ts  # CSV, Excel, PDF exporters
│   ├── pages/
│   │   ├── Login/          # Admin login with role selectors
│   │   ├── Dashboard/      # Main executive dashboard
│   │   ├── Salons/         # Salons directory
│   │   ├── SalonDetail/    # 360° salon overview
│   │   ├── Customers/      # Customer directory
│   │   ├── CustomerDetail/ # 360° profile with journey timeline
│   │   ├── Appointments/   # Appointments list & schedule
│   │   ├── Services/       # Services catalog
│   │   ├── Staff/          # Stylist directory & attribution
│   │   ├── Billing/        # Master invoices ledger
│   │   ├── Expenses/       # Operational expenses tracking
│   │   ├── Reports/        # BI analytics & comparison
│   │   ├── Activity/       # Realtime audit log
│   │   ├── Alerts/         # System & salon health alerts
│   │   └── Settings/       # RBAC matrix & live connection diagnostic
│   ├── services/           # Supabase API services
│   ├── types/              # TypeScript schema definitions
│   ├── utils/              # Currency (₹), date, phone formatters, status badges
│   ├── App.tsx             # Routing configuration
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind CSS & theme definitions
├── .env                    # Supabase URL & Anon Key
├── package.json
└── README.md
```

---

## ⚙️ Environment Variables

The application reads from `.env`:

```env
VITE_SUPABASE_URL=https://fqjvrbzrmsoaymaxdysk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_9VNrJQr8G6kGTpGBvxhYJw_UU5DGnUx
```

*Note: The Supabase Service-Role Key is never exposed in frontend/browser code.*

---

## 🏃 Running Locally

```bash
# Navigate to the dashboard directory
cd salon-crm-dashboard

# Start the Vite development server
pnpm dev
# or
npm run dev

# Open http://localhost:5173 in your browser
```
