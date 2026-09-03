export type UserRole = 'super_admin';

export interface AdminUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Salon {
  id: string;
  name: string;
  owner_name: string;
  phone_number: string;
  address: string;
  city: string;
  pin_code: string;
  gstin?: string | null;
  theme_color?: string;
  created_at: string;
  // Computed / Aggregated properties from Supabase
  customerCount?: number;
  appointmentCount?: number;
  totalRevenue?: number;
  staffCount?: number;
  status?: 'active' | 'inactive' | 'trial' | 'suspended';
  lastActivity?: string;
}

export interface Customer {
  id: string;
  salon_id: string;
  name: string;
  phone_number: string;
  notes?: string;
  starred: boolean;
  created_at: string;
  // Join / Computed fields from Supabase
  salon?: Salon;
  totalVisits?: number;
  totalSpent?: number;
  lastVisit?: string;
  firstVisit?: string;
  preferredStylist?: string;
  mostUsedService?: string;
  segment?: 'new' | 'returning' | 'vip' | 'inactive';
}

export interface Staff {
  id: string;
  salon_id: string;
  name: string;
  role: string;
  created_at: string;
  // Computed fields from Supabase
  salon?: Salon;
  appointmentCount?: number;
  completedAppointments?: number;
  revenueGenerated?: number;
}

export interface Service {
  id: string;
  salon_id?: string;
  name: string;
  price: number;
  duration_minutes: number;
  duration?: number;
  description?: string | null;
  category: 'HAIR' | 'BEARD' | 'SPA' | 'GENERAL';
  is_default?: boolean;
  created_at?: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  customer_id: string;
  staff_id: string;
  service_name: string;
  start_time: string;
  duration_minutes?: number;
  duration?: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'noshow';
  payment_status?: 'pending' | 'paid' | 'billed';
  payment_method?: 'cash' | 'upi' | 'card' | 'online' | string;
  total_amount?: number;
  discount?: number;
  final_amount?: number;
  notes?: string;
  created_at: string;
  is_billed?: boolean;
  // Relational joins from Supabase
  salon?: Salon;
  customer?: Customer;
  staff?: Staff;
}

export interface Bill {
  id: string;
  salon_id: string;
  customer_id?: string | null;
  subtotal: number;
  discount: number;
  gst_percent: number;
  gst_amount: number;
  total: number;
  created_at: string;
  // Relational joins from Supabase
  salon?: Salon;
  customer?: Customer;
  items?: BillItem[];
}

export interface BillItem {
  id: string;
  bill_id: string;
  service_name: string;
  price: number;
  qty: number;
  staff_id?: string | null;
  staff?: Staff;
}

export interface Expense {
  id: string;
  salon_id: string;
  amount: number;
  category?: string;
  description: string;
  created_at: string;
  salon?: Salon;
}

export interface NotificationLog {
  id: string;
  salon_id?: string | null;
  customer_id?: string | null;
  appointment_id?: string | null;
  type: string;
  title: string;
  message: string;
  status: string;
  created_at: string;
  salon?: Salon;
  customer?: Customer;
}

export interface WhatsAppMessage {
  id: string;
  salon_id: string;
  customer_id?: string | null;
  bill_id?: string | null;
  phone_number: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  api_response?: any;
  created_at: string;
  salon?: Salon;
  customer?: Customer;
}

export interface AccountDeletion {
  id: string;
  salon_id?: string;
  salon_name?: string;
  owner_name?: string;
  phone_number?: string;
  reason: string;
  deleted_at?: string;
  created_at?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'customer_created' | 'appointment_created' | 'appointment_completed' | 'appointment_cancelled' | 'bill_generated' | 'notification_sent' | 'salon_registered' | 'whatsapp_sent' | 'account_deleted';
  title: string;
  description: string;
  salonId: string;
  salonName?: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'customer' | 'appointment' | 'bill' | 'salon' | 'staff' | 'account_deletion';
  metadata?: Record<string, any>;
}

export interface PlatformMetrics {
  totalSalons: number;
  activeSalons: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  returningCustomers: number;
  todayAppointments: number;
  completedAppointmentsToday: number;
  todayRevenue: number;
  thisMonthRevenue: number;
  totalStaff: number;
  revenueBySalon: { salonId: string; salonName: string; revenue: number; appointments: number }[];
  dailyRevenueTrend: { date: string; revenue: number; count: number }[];
  appointmentStatusCounts: { status: string; count: number }[];
}

export interface SystemAlert {
  id: string;
  salonId: string;
  salonName: string;
  type: 'inactivity' | 'cancellation_spike' | 'failed_messaging' | 'revenue_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}
