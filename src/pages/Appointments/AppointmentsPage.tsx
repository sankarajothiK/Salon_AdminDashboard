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
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Appointment Operations</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Tracking customer bookings, stylist assignments, and completion states ({totalCount} total bookings)
          </p>
        </div>

        <ExportDropdown
          data={appointments.map((a) => ({
            ID: a.id,
            Salon: a.salon?.name || 'Salon',
            Customer: a.customer?.name || 'Client',
            Phone: a.customer?.phone_number || '',
            Service: a.service_name,
            Stylist: a.staff?.name || 'Stylist',
            DateTime: a.start_time,
            Status: a.status,
            Amount: a.final_amount || a.total_amount,
          }))}
          fileName="appointments_log"
          pdfConfig={{
            title: 'Appointments Schedule & Log Report',
            subtitle: `Total Count: ${totalCount}`,
            headers: ['Customer', 'Salon', 'Service', 'Stylist', 'Date & Time', 'Status', 'Amount'],
            rows: appointments.map((a) => [
              a.customer?.name || 'Client',
              a.salon?.name || '—',
              a.service_name,
              a.staff?.name || '—',
              formatDateTime(a.start_time),
              a.status?.toUpperCase(),
              formatCurrency(a.final_amount || a.total_amount),
            ]),
          }}
        />
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-[#BD5579]/20 p-4 rounded-2xl shadow-card-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Buttons */}
          <div className="flex rounded-xl bg-[#fdf5f8] p-1 border border-[#BD5579]/20">
            <button
              onClick={() => {
                setViewMode('all');
                setCurrentPage(1);
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'all' ? 'bg-gradient-to-r from-[#601D49] to-[#BD5579] text-white shadow-wine-sm' : 'text-black hover:text-[#601D49]'
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
                viewMode === 'today' ? 'bg-gradient-to-r from-[#601D49] to-[#BD5579] text-white shadow-wine-sm' : 'text-black hover:text-[#601D49]'
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
                viewMode === 'upcoming' ? 'bg-gradient-to-r from-[#601D49] to-[#BD5579] text-white shadow-wine-sm' : 'text-black hover:text-[#601D49]'
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
              className="bg-white border border-[#BD5579]/20 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40"
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
              className="bg-white border border-[#BD5579]/20 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40"
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
          className="text-black font-bold"
        />
      </div>

      {/* Appointments Table with White & Wine Styling */}
      <div className="bg-white border border-[#BD5579]/20 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Fetching appointments from Supabase..." size="md" />
        ) : appointments.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="w-6 h-6 text-[#601D49]" />}
            title="No appointments found"
            description="No bookings matched your filter criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-black">
                <thead className="bg-[#fdf5f8] text-black font-bold uppercase tracking-wider text-[11px] border-b border-[#BD5579]/20">
                  <tr>
                    <th className="px-5 py-4 font-bold text-black">Customer & Salon</th>
                    <th className="px-4 py-4 font-bold text-black">Service</th>
                    <th className="px-4 py-4 font-bold text-black">Stylist</th>
                    <th className="px-4 py-4 font-bold text-black">Schedule</th>
                    <th className="px-4 py-4 font-bold text-black text-center">Status</th>
                    <th className="px-4 py-4 font-bold text-black text-right">Amount</th>
                    <th className="px-5 py-4 font-bold text-black text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BD5579]/10">
                  {appointments.map((appt) => {
                    const style = getAppointmentStatusStyle(appt.status);

                    return (
                      <tr key={appt.id} className="hover:bg-[#fdf5f8]/70 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-black text-sm">
                            {appt.customer ? (
                              <Link
                                to={`/customers/${appt.customer.id}`}
                                className="hover:text-[#601D49] transition-colors"
                              >
                                {appt.customer.name}
                              </Link>
                            ) : (
                              'Walk-in Client'
                            )}
                          </div>
                          <div className="text-[10.5px] text-[#601D49]/70 font-semibold mt-0.5">{appt.salon?.name || 'Salon'}</div>
                        </td>

                        <td className="px-4 py-4 font-bold text-black text-sm">{appt.service_name}</td>

                        <td className="px-4 py-4 text-black font-bold">{appt.staff?.name || '—'}</td>

                        <td className="px-4 py-4">
                          <div className="text-black font-bold">{formatDate(appt.start_time)}</div>
                          <div className="text-[11px] text-[#BD5579] font-semibold">{formatTime(appt.start_time)}</div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${style.bg} text-black ${style.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                            {style.label}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right font-bold text-black text-sm">
                          {formatCurrency(appt.final_amount || appt.total_amount)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            className="p-1.5 rounded-lg bg-[#fdf5f8] hover:bg-[#601D49] hover:text-white text-[#601D49] transition-colors border border-[#BD5579]/20 shadow-2xs"
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
          <div className="space-y-4 text-xs font-alata text-black">
            <div className="bg-[#fdf5f8] p-4 rounded-xl border border-[#BD5579]/20 space-y-2 font-bold text-black">
              <div className="flex justify-between">
                <span>Salon:</span>
                <span className="font-bold text-black">{selectedAppt.salon?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-black">{selectedAppt.customer?.name} ({formatPhoneNumber(selectedAppt.customer?.phone_number)})</span>
              </div>
              <div className="flex justify-between">
                <span>Assigned Stylist:</span>
                <span className="font-bold text-[#601D49]">{selectedAppt.staff?.name || 'Unassigned'}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#BD5579]/20 font-bold text-black">
              <div className="flex justify-between">
                <span>Services:</span>
                <span className="font-bold text-black">{selectedAppt.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Scheduled Time:</span>
                <span className="text-black">{formatDateTime(selectedAppt.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-black">{selectedAppt.duration_minutes || selectedAppt.duration || 30} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-bold uppercase text-black">{selectedAppt.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className="font-bold text-black uppercase">{selectedAppt.payment_status || 'Pending'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-[#BD5579]/20">
                <span>Total Amount:</span>
                <span className="text-black">{formatCurrency(selectedAppt.final_amount || selectedAppt.total_amount)}</span>
              </div>
            </div>

            {selectedAppt.notes && (
              <div className="p-3 bg-[#fdf5f8] rounded-xl border border-[#BD5579]/20 text-black font-bold">
                <span className="text-black font-bold block mb-1">Appointment Notes:</span>
                {selectedAppt.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
