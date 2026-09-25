import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Calendar,
  Users,
  IndianRupee,
  UserCheck,
  Sparkles,
  Receipt,
  ArrowLeft,
  Activity,
  Crown,
  ExternalLink,
} from 'lucide-react';
import { salonService } from '@/services/salonService';
import { customerService } from '@/services/customerService';
import { appointmentService } from '@/services/appointmentService';
import { billingService } from '@/services/billingService';
import { staffService } from '@/services/staffService';
import { serviceCatalogService } from '@/services/serviceCatalogService';
import { activityService } from '@/services/activityService';
import { Salon, Customer, Appointment, Bill, Staff, Service, ActivityEvent } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency, formatDate, formatTime, formatPhoneNumber, formatTimeAgo } from '@/utils/formatters';
import { getAppointmentStatusStyle, getSalonStatusStyle } from '@/utils/statusBadge';
import { ExportDropdown } from '@/components/common/ExportDropdown';

export const SalonDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'appointments' | 'bills' | 'staff' | 'services'>('overview');

  useEffect(() => {
    if (!id) return;

    const loadSalonData = async () => {
      setLoading(true);
      const [
        salonRes,
        custRes,
        apptsRes,
        billsRes,
        staffRes,
        servicesRes,
        actRes,
      ] = await Promise.all([
        salonService.getSalonById(id),
        customerService.getCustomers(id),
        appointmentService.getAppointments(id),
        billingService.getBills(id),
        staffService.getStaff(id),
        serviceCatalogService.getServices(id),
        activityService.getRecentActivity(20, id),
      ]);

      if (salonRes.data) setSalon(salonRes.data);
      if (custRes.data) setCustomers(custRes.data);
      if (apptsRes.data) setAppointments(apptsRes.data);
      if (billsRes.data) setBills(billsRes.data);
      if (staffRes.data) setStaff(staffRes.data);
      if (servicesRes.data) setServices(servicesRes.data);
      if (actRes.data) setActivities(actRes.data);

      setLoading(false);
    };

    loadSalonData();
  }, [id]);

  if (loading || !salon) {
    return <LoadingSpinner message="Loading salon 360 profile..." size="lg" />;
  }

  const completedAppts = appointments.filter((a) => a.status === 'completed').length;
  const totalRevenue = bills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  const statusStyle = getSalonStatusStyle(salon.status);

  return (
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/salons"
          className="inline-flex items-center gap-1.5 text-xs text-[#161826] hover:text-[#D4AF37] font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" />
          <span>Back to Salons Directory</span>
        </Link>

        <ExportDropdown
          data={bills.map((b) => ({
            InvoiceID: b.id,
            Customer: b.customer_name || 'Walk-in',
            Date: b.created_at,
            Subtotal: b.subtotal,
            GST: b.gst_amount,
            Total: b.total,
          }))}
          fileName={`${salon.name.replace(/\s+/g, '_')}_data_export`}
        />
      </div>

      {/* Salon Profile Hero Header */}
      <div className="bg-white border-2 border-[#D4AF37]/25 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-card-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
              style={{ backgroundColor: salon.theme_color || '#D4AF37' }}
            >
              {salon.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#161826] tracking-tight">{salon.name}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full border ${statusStyle.bg} text-[#161826] ${statusStyle.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-[#161826] font-bold">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Owner: <strong className="text-[#161826] font-bold">{salon.owner_name}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{formatPhoneNumber(salon.phone_number)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{salon.address ? `${salon.address}, ` : ''}{salon.city} ({salon.pin_code})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Registered: {formatDate(salon.created_at)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-[#161826] uppercase">Customers</div>
          <div className="text-xl font-bold text-[#161826] mt-1">{customers.length}</div>
        </div>
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-[#161826] uppercase">Appointments</div>
          <div className="text-xl font-bold text-[#161826] mt-1">{appointments.length}</div>
        </div>
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-[#161826] uppercase">Total Revenue</div>
          <div className="text-xl font-bold text-[#161826] mt-1">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-[#161826] uppercase">Completed</div>
          <div className="text-xl font-bold text-[#161826] mt-1">{completedAppts}</div>
        </div>
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-[#161826] uppercase">Staff / Stylists</div>
          <div className="text-xl font-bold text-[#161826] mt-1">{staff.length}</div>
        </div>
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-[#161826] uppercase">Services</div>
          <div className="text-xl font-bold text-[#161826] mt-1">{services.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#D4AF37]/25 space-x-2 overflow-x-auto whitespace-nowrap pb-1">
        {[
          { key: 'overview', label: 'Overview & Activity' },
          { key: 'customers', label: `Customers (${customers.length})` },
          { key: 'appointments', label: `Appointments (${appointments.length})` },
          { key: 'bills', label: `Invoices & Bills (${bills.length})` },
          { key: 'staff', label: `Stylists (${staff.length})` },
          { key: 'services', label: `Services (${services.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all flex-shrink-0 ${
              activeTab === tab.key
                ? 'border-[#D4AF37] text-[#161826] bg-[#FCF9EE] rounded-t-xl'
                : 'border-transparent text-[#161826] hover:text-[#D4AF37]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#D4AF37]/25 rounded-2xl p-6 shadow-card-subtle space-y-4">
            <h3 className="text-sm font-bold text-[#161826]">Recent Appointments</h3>
            {appointments.length === 0 ? (
              <p className="text-xs text-[#161826]/75 font-semibold py-4">No appointments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {appointments.slice(0, 5).map((appt) => {
                  const style = getAppointmentStatusStyle(appt.status);
                  return (
                    <div
                      key={appt.id}
                      className="p-3.5 rounded-xl bg-white border border-[#D4AF37]/20 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-[#161826]">{appt.customer_name || 'Client'}</div>
                        <div className="text-[#161826]/80 font-semibold">&bull; {appt.service_name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#161826] font-bold">{formatDate(appt.start_time || appt.created_at)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} text-[#161826] ${style.border}`}>
                          {style.label}
                        </span>
                        <span className="font-bold text-[#161826]">{formatCurrency(appt.final_amount || appt.total_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-[#D4AF37]/25 rounded-2xl p-6 shadow-card-subtle space-y-3">
            <h3 className="text-sm font-bold text-[#161826]">Salon Activity Log</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-[#161826]/75 font-semibold py-4">No activities logged yet.</p>
              ) : (
                activities.slice(0, 8).map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-white border border-[#D4AF37]/20 text-xs">
                    <div className="font-bold text-[#161826]">{act.title}</div>
                    <div className="text-[11px] text-[#161826]/80 font-semibold mt-0.5">{act.description}</div>
                    <div className="text-[10px] text-[#D4AF37] font-bold mt-1">{formatTimeAgo(act.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
          <table className="w-full text-left text-xs text-[#161826]">
            <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase text-[11px] border-b border-[#D4AF37]/20">
              <tr>
                <th className="px-5 py-3.5 font-bold text-[#161826]">Customer Name</th>
                <th className="px-4 py-3.5 font-bold text-[#161826]">Phone</th>
                <th className="px-4 py-3.5 font-bold text-[#161826] text-center">Visits</th>
                <th className="px-4 py-3.5 font-bold text-[#161826] text-right">Spent</th>
                <th className="px-4 py-3.5 font-bold text-[#161826]">Registered</th>
                <th className="px-5 py-3.5 font-bold text-[#161826] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#FCF9EE]/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-[#161826]">
                    <Link to={`/customers/${c.id}`} className="hover:text-[#D4AF37]">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-[#161826] font-bold">{formatPhoneNumber(c.phone_number)}</td>
                  <td className="px-4 py-4 text-center font-bold text-[#161826]">{c.totalVisits || 0}</td>
                  <td className="px-4 py-4 text-right font-bold text-[#161826]">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="px-4 py-4 text-[#161826] font-bold">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/customers/${c.id}`}
                      className="text-xs text-[#161826] hover:text-[#D4AF37] font-bold"
                    >
                      View Profile &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'appointments' && (
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
          <table className="w-full text-left text-xs text-[#161826]">
            <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase text-[11px] border-b border-[#D4AF37]/20">
              <tr>
                <th className="px-5 py-3.5 font-bold text-[#161826]">Customer</th>
                <th className="px-4 py-3.5 font-bold text-[#161826]">Service</th>
                <th className="px-4 py-3.5 font-bold text-[#161826]">Stylist</th>
                <th className="px-4 py-3.5 font-bold text-[#161826]">Date & Time</th>
                <th className="px-4 py-3.5 font-bold text-[#161826] text-center">Status</th>
                <th className="px-4 py-3.5 font-bold text-[#161826] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {appointments.map((a) => {
                const style = getAppointmentStatusStyle(a.status);
                return (
                  <tr key={a.id} className="hover:bg-[#FCF9EE]/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#161826]">{a.customer_name || 'Client'}</td>
                    <td className="px-4 py-4 font-bold text-[#161826]">{a.service_name}</td>
                    <td className="px-4 py-4 font-bold text-[#161826]">{a.staff_name || 'Stylist'}</td>
                    <td className="px-4 py-4 font-bold text-[#161826]">
                      {formatDate(a.start_time || a.created_at)}, {formatTime(a.start_time || a.created_at)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} text-[#161826] ${style.border}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-[#161826]">
                      {formatCurrency(a.final_amount || a.total_amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'bills' && (
        <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
          <table className="w-full text-left text-xs text-[#161826]">
            <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase text-[11px] border-b border-[#D4AF37]/20">
              <tr>
                <th className="px-5 py-3.5 font-bold text-[#161826]">Invoice ID</th>
                <th className="px-4 py-3.5 font-bold text-[#161826]">Customer</th>
                <th className="px-4 py-3.5 font-bold text-[#161826]">Date</th>
                <th className="px-4 py-3.5 font-bold text-[#161826] text-right">Subtotal</th>
                <th className="px-4 py-3.5 font-bold text-[#161826] text-right">GST</th>
                <th className="px-4 py-3.5 font-bold text-[#161826] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-[#FCF9EE]/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-[11px] font-bold text-[#161826]">#{b.id.slice(0, 8)}</td>
                  <td className="px-4 py-4 font-bold text-[#161826]">{b.customer_name || 'Walk-in'}</td>
                  <td className="px-4 py-4 text-[#161826] font-bold">{formatDate(b.created_at)}</td>
                  <td className="px-4 py-4 text-right font-bold text-[#161826]">{formatCurrency(b.subtotal)}</td>
                  <td className="px-4 py-4 text-right font-bold text-[#161826]">{formatCurrency(b.gst_amount)}</td>
                  <td className="px-4 py-4 text-right font-bold text-[#161826]">{formatCurrency(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <div key={s.id} className="bg-white border border-[#D4AF37]/25 rounded-2xl p-5 shadow-card-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#C5A059] text-[#161826] flex items-center justify-center font-bold text-sm shadow-gold-sm">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#161826] text-sm">{s.name}</div>
                  <div className="text-xs text-[#D4AF37] font-bold">{s.role}</div>
                </div>
              </div>
              <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between text-xs font-bold text-[#161826]">
                <span>Appointments: <strong className="text-[#161826]">{s.appointmentCount || 0}</strong></span>
                <span>Revenue: <strong className="text-[#161826]">{formatCurrency(s.revenueGenerated)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white border border-[#D4AF37]/25 rounded-2xl p-5 shadow-card-subtle flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FCF9EE] text-[#161826] uppercase tracking-wider border border-[#D4AF37]/30">
                  {svc.category}
                </span>
                <h4 className="font-bold text-[#161826] text-sm mt-2">{svc.name}</h4>
                <p className="text-xs text-[#161826]/80 font-semibold mt-0.5">{svc.description || `${svc.duration_minutes} mins duration`}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#161826]">{formatCurrency(svc.price)}</div>
                <div className="text-[10px] text-[#D4AF37] font-bold">{svc.duration_minutes}m</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
