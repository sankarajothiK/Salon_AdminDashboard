export type UserRole = 'super_admin' | 'company_admin' | 'support_admin' | 'salon_admin';

export type SalonLifecycleStatus = 'active' | 'inactive' | 'uninstalled' | 'deleted';

export interface AdminUser {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  role: UserRole;
  salonId?: string;
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
  updated_at?: string;
  // Computed / Aggregated properties from Supabase & Telemetry
  app_version?: string;
  platform?: 'android' | 'ios';
  lifecycle_status?: SalonLifecycleStatus;
  last_active_at?: string;
  customerCount?: number;
  appointmentCount?: number;
  totalRevenue?: number;
  staffCount?: number;
  status?: 'active' | 'inactive' | 'trial' | 'suspended';
  lastActivity?: string;
}

export interface Customer {
  id: string;
  salon_id?: string;
  salon_name?: string;
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
  salon_name?: string;
  name: string;
  role: string;
  phone?: string;
  phone_number?: string;
  created_at: string;
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
  category: 'HAIR' | 'BEARD' | 'SPA' | 'GENERAL' | string;
  is_default?: boolean;
  created_at?: string;
}

export interface Appointment {
  id: string;
  salon_id: string;
  salon_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  staff_id?: string | null;
  staff_name?: string;
  service_id?: string;
  service_name: string;
  start_time: string;
  duration_minutes?: number;
  duration?: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'done' | 'cancelled' | 'noshow' | string;
  payment_status?: 'pending' | 'paid' | 'billed' | string;
  payment_method?: 'cash' | 'upi' | 'card' | 'online' | string;
  total_amount?: number;
  discount?: number;
  final_amount?: number;
  notes?: string;
  created_at: string;
  is_billed?: boolean;
  salon?: Salon;
  customer?: Customer;
  staff?: Staff;
}

export interface Bill {
  id: string;
  salon_id: string;
  salon_name?: string;
  customer_id?: string | null;
  customer_name?: string;
  subtotal: number;
  discount: number;
  gst_percent?: number;
  gst_amount: number;
  total: number;
  payment_method?: string;
  created_at: string;
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

export interface WhatsAppMessage {
  id: string;
  customer_id?: string;
  phone_number: string;
  message: string;
  type: string;
  status: string;
  created_at: string;
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

export interface SupportMessageAnswer {
  id: string;
  support_message_id: string;
  salon_id?: string | null;
  salon_name?: string | null;
  phone?: string | null;
  answer: string;
  answered_by: string;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  salon_id?: string | null;
  salon_name?: string | null;
  owner_name?: string | null;
  customer_name?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  email?: string | null;
  subject?: string | null;
  message: string;
  category: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'replied' | 'closed';
  app_version?: string;
  platform?: 'android' | 'ios' | 'web';
  created_at: string;
  resolved_at?: string;
  notes?: string;
  answers?: SupportMessageAnswer[];
}

export interface AppTelemetryRecord {
  id: string;
  salon_id: string;
  salon_name: string;
  owner_name: string;
  phone_number: string;
  city?: string;
  app_version: string;
  platform: 'android' | 'ios';
  status: SalonLifecycleStatus;
  last_active_at: string;
  login_count: number;
  device_model: string;
  os_version: string;
  uninstalled_at?: string;
  deleted_at?: string;
  deletion_reason?: string;
  errors_count: number;
}

export interface ActivityEvent {
  id: string;
  type: 'customer_created' | 'appointment_created' | 'appointment_completed' | 'appointment_cancelled' | 'bill_generated' | 'notification_sent' | 'salon_registered' | 'whatsapp_sent' | 'account_deleted' | 'support_received' | 'support_answered' | 'error_logged';
  title: string;
  description: string;
  salonId: string;
  salonName?: string;
  timestamp: string;
  entityId?: string;
  entityType?: 'customer' | 'appointment' | 'bill' | 'salon' | 'staff' | 'account_deletion' | 'support' | 'error';
  metadata?: Record<string, any>;
}

export interface PlatformMetrics {
  totalSalons: number;
  activeSalons: number;
  inactiveSalons?: number;
  uninstalledSalons?: number;
  deletedSalons?: number;
  totalCustomers: number;
  newCustomersThisMonth?: number;
  returningCustomers?: number;
  todayAppointments?: number;
  completedAppointmentsToday?: number;
  todayRevenue?: number;
  thisMonthRevenue: number;
  totalRevenue?: number;
  totalStaff?: number;
  openSupportMessages?: number;
  resolvedSupportMessages?: number;
  versionDistribution?: { version: string; count: number; percentage: number }[];
  statusDistribution?: { status: SalonLifecycleStatus; count: number; label: string }[];
  revenueBySalon: { salonId: string; salonName: string; revenue: number; appointments: number }[];
  dailyRevenueTrend: { date: string; revenue: number; count: number }[];
  appointmentStatusCounts?: { status: string; count: number }[];
  recentErrorsCount?: number;
}

export interface SystemAlert {
  id: string;
  salonId: string;
  salonName: string;
  type: 'inactivity' | 'cancellation_spike' | 'failed_messaging' | 'revenue_drop' | 'uninstall_detected' | 'error_spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
}
