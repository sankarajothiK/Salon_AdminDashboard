import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Phone,
  Calendar,
  IndianRupee,
  Star,
  Scissors,
  Receipt,
  Clock,
  Sparkles,
  Crown,
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import { Customer, Appointment, Bill, NotificationLog, WhatsAppMessage } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDate, formatTime, formatPhoneNumber, formatDateTime } from '@/utils/formatters';
import { getAppointmentStatusStyle } from '@/utils/statusBadge';

export const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Bill receipt modal
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadCustomer = async () => {
      setLoading(true);
      const res = await customerService.getCustomerById(id);
      if (res.customer) setCustomer(res.customer);
      setAppointments(res.appointments);
      setBills(res.bills);
      setNotifications(res.notifications);
      setWhatsappMessages(res.whatsappMessages);
      setLoading(false);
    };

    loadCustomer();
  }, [id]);

  if (loading || !customer) {
    return <LoadingSpinner message="Assembling complete royal customer profile & journey timeline..." size="lg" />;
  }

  // Calculate statistics
  const totalSpent = customer.totalSpent || 0;
  const totalVisits = customer.totalVisits || 0;
  const avgBill = totalVisits > 0 ? totalSpent / totalVisits : 0;

  // Build Chronological Timeline
  interface TimelineEvent {
    id: string;
    type: 'created' | 'appointment' | 'bill' | 'notification' | 'whatsapp';
    title: string;
    description: string;
    timestamp: string;
    badge?: string;
  }

  const timelineEvents: TimelineEvent[] = [
    {
      id: `cust-${customer.id}`,
      type: 'created',
      title: 'Customer Profile Registered',
      description: `Registered at ${customer.salon?.name || 'Salon'} with phone ${formatPhoneNumber(customer.phone_number)}.`,
      timestamp: customer.created_at,
    },
    ...appointments.map((a) => ({
      id: `appt-${a.id}`,
      type: 'appointment' as const,
      title: `Appointment: ${a.service_name}`,
      description: `Status: ${a.status?.toUpperCase()} • Stylist: ${a.staff?.name || 'Assigned Stylist'} • Amount: ${formatCurrency(a.final_amount || a.total_amount)}`,
      timestamp: a.start_time || a.created_at,
      badge: a.status,
    })),
    ...bills.map((b) => ({
      id: `bill-${b.id}`,
      type: 'bill' as const,
      title: `Invoice Generated (${formatCurrency(b.total)})`,
      description: `Billed subtotal ${formatCurrency(b.subtotal)} + GST ${formatCurrency(b.gst_amount)}. Line items: ${(b.items || []).map((i) => `${i.service_name} (x${i.qty})`).join(', ') || 'Services'}`,
      timestamp: b.created_at,
    })),
    ...notifications.map((n) => ({
      id: `notif-${n.id}`,
      type: 'notification' as const,
      title: n.title || 'Notification Dispatched',
      description: n.message,
      timestamp: n.created_at,
    })),
    ...whatsappMessages.map((w) => ({
      id: `wa-${w.id}`,
      type: 'whatsapp' as const,
      title: `WhatsApp Invoice (${w.status})`,
      description: w.message.split('\n')[0] || 'WhatsApp message sent',
      timestamp: w.created_at,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/customers"
          className="inline-flex items-center gap-1.5 text-xs text-black hover:text-[#601D49] font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customers</span>
        </Link>
        <div className="text-xs text-black font-bold">Customer ID: {customer.id}</div>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-white border border-[#BD5579]/20 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-card-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#601D49] via-[#BD5579] to-[#EA9D9D] flex items-center justify-center text-[#FFEBB8] text-2xl font-bold shadow-md flex-shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-black tracking-tight">{customer.name}</h1>
                {customer.starred && (
                  <span className="px-3 py-0.5 rounded-full bg-[#FFEBB8] text-black border border-[#BD5579]/40 text-xs font-bold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-[#BD5579] text-[#BD5579]" />
                    <span>VIP Customer</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-black font-bold">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-black" />
                  <span>{formatPhoneNumber(customer.phone_number)}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Scissors className="w-3.5 h-3.5 text-black" />
                  <span>
                    Salon:{' '}
                    <Link
                      to={`/salons/${customer.salon_id}`}
                      className="text-[#601D49] font-bold hover:underline"
                    >
                      {customer.salon?.name || 'Salon'}
                    </Link>
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-black" />
                  <span>Client since {formatDate(customer.created_at)}</span>
                </span>
              </div>

              {customer.notes && (
                <div className="mt-3 p-3 rounded-xl bg-[#fdf2f6] border border-[#BD5579]/30 text-xs text-black font-bold">
                  <strong className="text-black">Preferences / Notes:</strong> {customer.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 360 Customer Analytics KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-black uppercase">Total Visits</div>
          <div className="text-xl font-bold text-black mt-1">{totalVisits}</div>
        </div>
        <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-black uppercase">Lifetime Spend</div>
          <div className="text-xl font-bold text-black mt-1">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-black uppercase">Average Bill</div>
          <div className="text-xl font-bold text-black mt-1">{formatCurrency(avgBill)}</div>
        </div>
        <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-black uppercase">Preferred Stylist</div>
          <div className="text-sm font-bold text-black mt-1 truncate">{customer.preferredStylist || '—'}</div>
        </div>
        <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-black uppercase">Top Service</div>
          <div className="text-sm font-bold text-black mt-1 truncate">{customer.mostUsedService || '—'}</div>
        </div>
        <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-4 shadow-card-subtle">
          <div className="text-[11px] font-bold text-black uppercase">Last Visit</div>
          <div className="text-xs font-bold text-black mt-1">{formatDate(customer.lastVisit)}</div>
        </div>
      </div>

      {/* Main Grid: Left Timeline, Right History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Journey Chronological Timeline */}
        <div className="lg:col-span-1 bg-white border border-[#BD5579]/20 rounded-2xl p-6 shadow-card-subtle flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-[#601D49]" />
            <h3 className="text-sm font-bold text-black">Customer Journey Timeline</h3>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#BD5579]/30 flex-1 overflow-y-auto max-h-[500px]">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#601D49] shadow-2xs" />
                <div>
                  <span className="text-[10px] text-black font-bold uppercase tracking-wider">
                    {formatDateTime(evt.timestamp)}
                  </span>
                  <div className="text-xs font-bold text-black mt-0.5">{evt.title}</div>
                  <p className="text-xs text-black font-semibold mt-0.5 leading-relaxed">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Appointments and Billing History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment History */}
          <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-6 shadow-card-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-black">Appointment History</h3>
              <span className="text-xs text-black font-bold">{appointments.length} Total</span>
            </div>

            {appointments.length === 0 ? (
              <p className="text-xs text-black font-semibold py-4">No appointments recorded.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-black">
                  <thead className="bg-[#fdf2f6] text-black font-bold uppercase text-[11px] border-b border-[#BD5579]/20">
                    <tr>
                      <th className="px-4 py-3 font-bold text-black">Date & Time</th>
                      <th className="px-4 py-3 font-bold text-black">Services</th>
                      <th className="px-4 py-3 font-bold text-black">Stylist</th>
                      <th className="px-4 py-3 font-bold text-black text-center">Status</th>
                      <th className="px-4 py-3 font-bold text-black text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BD5579]/10">
                    {appointments.map((a) => {
                      const style = getAppointmentStatusStyle(a.status);
                      return (
                        <tr key={a.id} className="hover:bg-[#fcf2f6]/60">
                          <td className="px-4 py-3.5 text-black font-bold">
                            {formatDate(a.start_time)}, {formatTime(a.start_time)}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-black">{a.service_name}</td>
                          <td className="px-4 py-3.5 text-black font-bold">{a.staff?.name || '—'}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} text-black ${style.border}`}>
                              {style.label}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-black">
                            {formatCurrency(a.final_amount || a.total_amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Billing & Invoice History */}
          <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-6 shadow-card-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-black">Invoices & Billing History</h3>
              <span className="text-xs text-black font-bold">{bills.length} Invoices</span>
            </div>

            {bills.length === 0 ? (
              <p className="text-xs text-black font-semibold py-4">No billing records found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-black">
                  <thead className="bg-[#fdf2f6] text-black font-bold uppercase text-[11px] border-b border-[#BD5579]/20">
                    <tr>
                      <th className="px-4 py-3 font-bold text-black">Invoice ID</th>
                      <th className="px-4 py-3 font-bold text-black">Date</th>
                      <th className="px-4 py-3 font-bold text-black text-right">Subtotal</th>
                      <th className="px-4 py-3 font-bold text-black text-right">GST</th>
                      <th className="px-4 py-3 font-bold text-black text-right">Total Paid</th>
                      <th className="px-4 py-3 font-bold text-black text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BD5579]/10">
                    {bills.map((b) => (
                      <tr key={b.id} className="hover:bg-[#fcf2f6]/60">
                        <td className="px-4 py-3.5 font-mono text-[11px] text-black font-bold">#{b.id.slice(0, 8)}</td>
                        <td className="px-4 py-3.5 text-black font-bold">{formatDate(b.created_at)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-black">{formatCurrency(b.subtotal)}</td>
                        <td className="px-4 py-3.5 text-right text-black font-bold">{formatCurrency(b.gst_amount)}</td>
                        <td className="px-4 py-3.5 text-right font-bold text-black">{formatCurrency(b.total)}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setSelectedBill(b)}
                            className="text-xs text-[#601D49] hover:underline font-bold"
                          >
                            View Items &rarr;
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Itemized Bill Receipt Modal */}
      {selectedBill && (
        <Modal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title={`Invoice Receipt #${selectedBill.id.slice(0, 8)}`}
          subtitle={`Generated on ${formatDateTime(selectedBill.created_at)} for ${customer.name}`}
        >
          <div className="space-y-4 font-alata text-xs text-black">
            <div className="bg-[#fdf9fa] p-4 rounded-xl border border-[#BD5579]/20 space-y-2">
              <div className="flex justify-between text-black font-bold">
                <span>Salon:</span>
                <span className="font-bold text-black">{customer.salon?.name}</span>
              </div>
              <div className="flex justify-between text-black font-bold">
                <span>Customer:</span>
                <span className="font-bold text-black">{customer.name} ({formatPhoneNumber(customer.phone_number)})</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-black mb-2">Itemized Services</h4>
              {!selectedBill.items || selectedBill.items.length === 0 ? (
                <p className="text-xs text-black font-semibold py-2">Service line items bundled in invoice total.</p>
              ) : (
                <div className="space-y-2">
                  {selectedBill.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#fdf2f6]/80 border border-[#BD5579]/15 font-bold text-black"
                    >
                      <div>
                        <div className="font-bold text-black">{item.service_name}</div>
                        <div className="text-[10px] text-black font-semibold">Quantity: {item.qty}</div>
                      </div>
                      <div className="font-bold text-black">{formatCurrency(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#BD5579]/20 space-y-1.5 font-bold text-black">
              <div className="flex justify-between text-black">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedBill.subtotal)}</span>
              </div>
              {selectedBill.discount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Discount:</span>
                  <span>-{formatCurrency(selectedBill.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-black">
                <span>GST ({selectedBill.gst_percent}%):</span>
                <span>{formatCurrency(selectedBill.gst_amount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-black pt-2 border-t border-[#BD5579]/20">
                <span>Total Paid:</span>
                <span>{formatCurrency(selectedBill.total)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
