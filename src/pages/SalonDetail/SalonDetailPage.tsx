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
        customerService.getCustomers({ salonId: id }),
        appointmentService.getAppointments({ salonId: id }),
        billingService.getBills({ salonId: id }),
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
    return <LoadingSpinner message="Loading royal salon 360 profile..." size="lg" />;
  }

  const completedAppts = appointments.filter((a) => a.status === 'completed').length;
  const totalRevenue = bills.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  const statusStyle = getSalonStatusStyle(salon.status);

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/salons"
          className="inline-flex items-center gap-1.5 text-xs text-black hover:text-emerald-700 font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Salons Directory</span>
        </Link>

        <ExportDropdown
          data={bills.map((b) => ({
            InvoiceID: b.id,
            Customer: b.customer?.name || 'Walk-in',
            Date: b.created_at,
            Subtotal: b.subtotal,
            GST: b.gst_amount,
            Total: b.total,
          }))}
          fileName={`${salon.name.replace(/\s+/g, '_')}_data_export`}
        />
      </div>

      {/* Salon Profile Hero Header */}
      <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-card-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0"
              style={{ backgroundColor: salon.theme_color || '#059669' }}
            >
              {salon.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-black tracking-tight">{salon.name}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-0.5 rounded-full border ${statusStyle.bg} text-black ${statusStyle.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                  {statusStyle.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-black font-bold">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Owner: <strong className="text-black font-bold">{salon.owner_name}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{formatPhoneNumber(salon.phone_number)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{salon.address ? `${salon.address}, ` : ''}{salon.city} ({salon.pin_code})</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Registered: {formatDate(salon.created_at)}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-black uppercase">Customers</div>
          <div className="text-xl font-bold text-black mt-1">{customers.length}</div>
        </div>
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-black uppercase">Appointments</div>
          <div className="text-xl font-bold text-black mt-1">{appointments.length}</div>
        </div>
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-black uppercase">Total Revenue</div>
          <div className="text-xl font-bold text-black mt-1">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-black uppercase">Completed</div>
          <div className="text-xl font-bold text-black mt-1">{completedAppts}</div>
        </div>
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-black uppercase">Staff / Stylists</div>
          <div className="text-xl font-bold text-black mt-1">{staff.length}</div>
        </div>
        <div className="bg-white border-2 border-emerald-100 rounded-2xl p-4 shadow-2xs">
          <div className="text-[11px] font-bold text-black uppercase">Services</div>
          <div className="text-xl font-bold text-black mt-1">{services.length}</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b-2 border-emerald-100 space-x-2">
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
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.key
                ? 'border-emerald-600 text-emerald-950 bg-emerald-100/70 rounded-t-xl'
                : 'border-transparent text-black hover:text-emerald-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle space-y-4">
            <h3 className="text-sm font-bold text-black">Recent Appointments</h3>
            {appointments.length === 0 ? (
              <p className="text-xs text-black font-semibold py-4">No appointments recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {appointments.slice(0, 5).map((appt) => {
                  const style = getAppointmentStatusStyle(appt.status);
                  return (
                    <div
                      key={appt.id}
                      className="p-3.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-black">{appt.customer?.name || 'Client'}</div>
                        <div className="text-black font-semibold">&bull; {appt.service_name}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-black font-bold">{formatDate(appt.start_time)}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} text-black ${style.border}`}>
                          {style.label}
                        </span>
                        <span className="font-bold text-black">{formatCurrency(appt.final_amount || appt.total_amount)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border-2 border-emerald-100 rounded-2xl p-6 shadow-card-subtle space-y-3">
            <h3 className="text-sm font-bold text-black">Salon Activity Log</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {activities.length === 0 ? (
                <p className="text-xs text-black font-semibold py-4">No activities logged yet.</p>
              ) : (
                activities.slice(0, 8).map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-white border border-emerald-200 text-xs">
                    <div className="font-bold text-black">{act.title}</div>
                    <div className="text-[11px] text-black font-semibold mt-0.5">{act.description}</div>
                    <div className="text-[10px] text-emerald-900 font-bold mt-1">{formatTimeAgo(act.timestamp)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'customers' && (
        <div className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-card-subtle">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-emerald-50 text-black font-bold uppercase text-[11px] border-b-2 border-emerald-100">
              <tr>
                <th className="px-5 py-3.5 font-bold text-black">Customer Name</th>
                <th className="px-4 py-3.5 font-bold text-black">Phone</th>
                <th className="px-4 py-3.5 font-bold text-black text-center">Visits</th>
                <th className="px-4 py-3.5 font-bold text-black text-right">Spent</th>
                <th className="px-4 py-3.5 font-bold text-black">Registered</th>
                <th className="px-5 py-3.5 font-bold text-black text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-5 py-4 font-bold text-black">
                    <Link to={`/customers/${c.id}`} className="hover:text-emerald-700">
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-black font-bold">{formatPhoneNumber(c.phone_number)}</td>
                  <td className="px-4 py-4 text-center font-bold text-black">{c.totalVisits || 0}</td>
                  <td className="px-4 py-4 text-right font-bold text-black">
                    {formatCurrency(c.totalSpent)}
                  </td>
                  <td className="px-4 py-4 text-black font-bold">{formatDate(c.created_at)}</td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      to={`/customers/${c.id}`}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold"
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
        <div className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-card-subtle">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-emerald-50 text-black font-bold uppercase text-[11px] border-b-2 border-emerald-100">
              <tr>
                <th className="px-5 py-3.5 font-bold text-black">Customer</th>
                <th className="px-4 py-3.5 font-bold text-black">Service</th>
                <th className="px-4 py-3.5 font-bold text-black">Stylist</th>
                <th className="px-4 py-3.5 font-bold text-black">Date & Time</th>
                <th className="px-4 py-3.5 font-bold text-black text-center">Status</th>
                <th className="px-4 py-3.5 font-bold text-black text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {appointments.map((a) => {
                const style = getAppointmentStatusStyle(a.status);
                return (
                  <tr key={a.id} className="hover:bg-emerald-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-black">{a.customer?.name || 'Client'}</td>
                    <td className="px-4 py-4 font-bold text-black">{a.service_name}</td>
                    <td className="px-4 py-4 font-bold text-black">{a.staff?.name || 'Stylist'}</td>
                    <td className="px-4 py-4 font-bold text-black">
                      {formatDate(a.start_time)}, {formatTime(a.start_time)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} text-black ${style.border}`}>
                        {style.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-black">
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
        <div className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-card-subtle">
          <table className="w-full text-left text-xs text-black">
            <thead className="bg-emerald-50 text-black font-bold uppercase text-[11px] border-b-2 border-emerald-100">
              <tr>
                <th className="px-5 py-3.5 font-bold text-black">Invoice ID</th>
                <th className="px-4 py-3.5 font-bold text-black">Customer</th>
                <th className="px-4 py-3.5 font-bold text-black">Date</th>
                <th className="px-4 py-3.5 font-bold text-black text-right">Subtotal</th>
                <th className="px-4 py-3.5 font-bold text-black text-right">GST</th>
                <th className="px-4 py-3.5 font-bold text-black text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {bills.map((b) => (
                <tr key={b.id} className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-[11px] font-bold text-black">#{b.id.slice(0, 8)}</td>
                  <td className="px-4 py-4 font-bold text-black">{b.customer?.name || 'Walk-in'}</td>
                  <td className="px-4 py-4 text-black font-bold">{formatDate(b.created_at)}</td>
                  <td className="px-4 py-4 text-right font-bold text-black">{formatCurrency(b.subtotal)}</td>
                  <td className="px-4 py-4 text-right font-bold text-black">{formatCurrency(b.gst_amount)}</td>
                  <td className="px-4 py-4 text-right font-bold text-black">{formatCurrency(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => (
            <div key={s.id} className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-card-subtle space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                  {s.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-black text-sm">{s.name}</div>
                  <div className="text-xs text-emerald-900 font-bold">{s.role}</div>
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-100 flex items-center justify-between text-xs font-bold text-black">
                <span>Appointments: <strong className="text-black">{s.appointmentCount || 0}</strong></span>
                <span>Revenue: <strong className="text-black">{formatCurrency(s.revenueGenerated)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <div key={svc.id} className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-card-subtle flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-950 uppercase tracking-wider border border-emerald-300">
                  {svc.category}
                </span>
                <h4 className="font-bold text-black text-sm mt-2">{svc.name}</h4>
                <p className="text-xs text-black font-semibold mt-0.5">{svc.description || `${svc.duration_minutes} mins duration`}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-black">{formatCurrency(svc.price)}</div>
                <div className="text-[10px] text-emerald-900 font-bold">{svc.duration_minutes}m</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
