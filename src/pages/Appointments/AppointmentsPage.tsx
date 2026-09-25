import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Search,
  Filter,
  Clock,
  Eye,
  Crown,
} from 'lucide-react';
import { appointmentService } from '@/services/appointmentService';
import { useSalons } from '@/contexts/SalonContext';
import { Appointment } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { formatCurrency, formatDate, formatTime, formatDateTime, formatPhoneNumber } from '@/utils/formatters';
import { getAppointmentStatusStyle } from '@/utils/statusBadge';

export const AppointmentsPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [salonFilter, setSalonFilter] = useState(selectedSalonId);
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'upcoming'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Detail Modal
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    setSalonFilter(selectedSalonId);
  }, [selectedSalonId]);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);

      let dateRange: { start?: string; end?: string } | undefined;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (viewMode === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateRange = { start: today.toISOString(), end: tomorrow.toISOString() };
      } else if (viewMode === 'upcoming') {
        dateRange = { start: today.toISOString() };
      }

      const res = await appointmentService.getAppointments({
        salonId: salonFilter,
        status: statusFilter,
        search,
        dateRange,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      if (res.data) {
        setAppointments(res.data);
        setTotalCount(res.totalCount);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [salonFilter, statusFilter, search, viewMode, currentPage]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#161826] tracking-tight">Appointment Operations</h1>
          <p className="text-xs text-[#161826]/80 font-semibold mt-1">
            Tracking customer bookings, stylist assignments, and completion states ({totalCount} total bookings)
          </p>
        </div>

        <ExportDropdown
          data={appointments.map((a) => ({
            ID: a.id,
            Salon: a.salon_name || 'Salon',
            Customer: a.customer_name || 'Client',
            Phone: a.customer_phone || '',
            Service: a.service_name,
            Stylist: a.staff_name || 'Stylist',
            DateTime: a.start_time || a.created_at,
            Status: a.status,
            Amount: a.final_amount || a.total_amount,
          }))}
          fileName="appointments_log"
          pdfConfig={{
            title: 'Appointments Schedule & Log Report',
            subtitle: `Total Count: ${totalCount}`,
            headers: ['Customer', 'Salon', 'Service', 'Stylist', 'Date & Time', 'Status', 'Amount'],
            rows: appointments.map((a) => [
              a.customer_name || 'Client',
              a.salon_name || '—',
              a.service_name,
              a.staff_name || '—',
              formatDateTime(a.start_time || a.created_at),
              a.status?.toUpperCase(),
              formatCurrency(a.final_amount || a.total_amount),
            ]),
          }}
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#D4AF37]/25 p-4 rounded-2xl shadow-card-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Buttons */}
          <div className="flex rounded-xl bg-[#FCF9EE] p-1 border border-[#D4AF37]/25">
            <button
              onClick={() => {
                setViewMode('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'all' ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] shadow-gold-sm font-bold' : 'text-[#161826] hover:text-[#D4AF37]'
              }`}
            >
              All Bookings
            </button>
            <button
              onClick={() => {
                setViewMode('today');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'today' ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] shadow-gold-sm font-bold' : 'text-[#161826] hover:text-[#D4AF37]'
              }`}
            >
              Today's Schedule
            </button>
            <button
              onClick={() => {
                setViewMode('upcoming');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'upcoming' ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] shadow-gold-sm font-bold' : 'text-[#161826] hover:text-[#D4AF37]'
              }`}
            >
              Upcoming
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Salon Filter */}
            <select
              value={salonFilter}
              onChange={(e) => {
                setSalonFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
            >
              <option value="all">All Salons</option>
              {salons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="noshow">No Show</option>
            </select>
          </div>
        </div>

        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by service name, notes..."
          className="text-[#161826] font-bold"
        />
      </div>

      {/* Appointments Table with Gold & Dark Styling */}
      <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Fetching appointments from Supabase..." size="md" />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="w-6 h-6 text-[#D4AF37]" />}
            title="No appointments found"
            description="No bookings matched your filter criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#161826]">
                <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase tracking-wider text-[11px] border-b border-[#D4AF37]/20">
                  <tr>
                    <th className="px-5 py-4 font-bold text-[#161826]">Customer & Salon</th>
                    <th className="px-4 py-4 font-bold text-[#161826]">Service</th>
                    <th className="px-4 py-4 font-bold text-[#161826]">Stylist</th>
                    <th className="px-4 py-4 font-bold text-[#161826]">Schedule</th>
                    <th className="px-4 py-4 font-bold text-[#161826] text-center">Status</th>
                    <th className="px-4 py-4 font-bold text-[#161826] text-right">Amount</th>
                    <th className="px-5 py-4 font-bold text-[#161826] text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/10">
                  {appointments.map((appt) => {
                    const style = getAppointmentStatusStyle(appt.status);

                    return (
                      <tr key={appt.id} className="hover:bg-[#FCF9EE]/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-[#161826] text-sm">
                            {appt.customer_id ? (
                              <Link
                                to={`/customers/${appt.customer_id}`}
                                className="hover:text-[#D4AF37] transition-colors"
                              >
                                {appt.customer_name || 'Client'}
                              </Link>
                            ) : (
                              appt.customer_name || 'Walk-in Client'
                            )}
                          </div>
                          <div className="text-[10.5px] text-[#D4AF37] font-semibold mt-0.5">{appt.salon_name || 'Salon'}</div>
                        </td>

                        <td className="px-4 py-4 font-bold text-[#161826] text-sm">{appt.service_name}</td>

                        <td className="px-4 py-4 text-[#161826] font-bold">{appt.staff_name || '—'}</td>

                        <td className="px-4 py-4">
                          <div className="text-[#161826] font-bold">{formatDate(appt.start_time || appt.created_at)}</div>
                          <div className="text-[11px] text-[#D4AF37] font-semibold">{formatTime(appt.start_time || appt.created_at)}</div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${style.bg} text-[#161826] ${style.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right font-bold text-[#161826] text-sm">
                          {formatCurrency(appt.final_amount || appt.total_amount)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            className="p-1.5 rounded-lg bg-[#FCF9EE] hover:bg-[#161826] hover:text-[#DFB847] text-[#161826] transition-colors border border-[#D4AF37]/30 shadow-2xs"
                            title="View Booking Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title="Appointment Details"
          subtitle={`Booking Reference ID: ${selectedAppt.id}`}
        >
          <div className="space-y-4 text-xs font-alata text-[#161826]">
            <div className="bg-[#FCF9EE] p-4 rounded-xl border border-[#D4AF37]/30 space-y-2 font-bold text-[#161826]">
              <div className="flex justify-between">
                <span>Salon:</span>
                <span className="font-bold text-[#161826]">{selectedAppt.salon_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-[#161826]">{selectedAppt.customer_name} ({formatPhoneNumber(selectedAppt.customer_phone || '')})</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Stylist:</span>
                <span className="font-bold text-[#D4AF37]">{selectedAppt.staff_name || 'Unassigned'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#D4AF37]/25 font-bold text-[#161826]">
              <div className="flex justify-between">
                <span>Services:</span>
                <span className="font-bold text-[#161826]">{selectedAppt.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Scheduled Time:</span>
                <span className="text-[#161826]">{formatDateTime(selectedAppt.start_time || selectedAppt.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-[#161826]">{selectedAppt.duration_minutes || selectedAppt.duration || 30} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold uppercase text-[#161826]">{selectedAppt.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-[#161826] uppercase">{selectedAppt.payment_status || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#161826] pt-2 border-t border-[#D4AF37]/25">
                <span>Total Amount:</span>
                <span className="text-[#161826]">{formatCurrency(selectedAppt.final_amount || selectedAppt.total_amount)}</span>
              </div>
            </div>

            {selectedAppt.notes && (
              <div className="p-3 bg-[#FCF9EE] rounded-xl border border-[#D4AF37]/30 text-[#161826] font-bold">
                <span className="text-[#161826] font-bold block mb-1">Appointment Notes:</span>
                {selectedAppt.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
