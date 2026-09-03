import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  IndianRupee,
  Calendar,
  Sparkles,
  Phone,
  Crown,
  Award,
} from 'lucide-react';
import { staffService } from '@/services/staffService';
import { useSalons } from '@/contexts/SalonContext';
import { Staff } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency, formatPhoneNumber } from '@/utils/formatters';
import { ExportDropdown } from '@/components/common/ExportDropdown';

export const StaffPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [salonFilter, setSalonFilter] = useState(selectedSalonId);

  useEffect(() => {
    setSalonFilter(selectedSalonId);
  }, [selectedSalonId]);

  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      const res = await staffService.getStaff(salonFilter === 'all' ? undefined : salonFilter);
      if (res.data) setStaffList(res.data);
      setLoading(false);
    };

    fetchStaff();
  }, [salonFilter]);

  const filteredStaff = staffList.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.role || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.phone_number || '').includes(search);

    return matchSearch;
  });

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Staff & Stylist Performance</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Tracking stylist productivity, appointment volumes, and attributed billing revenue ({staffList.length} total staff)
          </p>
        </div>

        <ExportDropdown
          data={filteredStaff.map((s) => ({
            Name: s.name,
            Role: s.role,
            Phone: s.phone_number,
            Salon: s.salon?.name || 'Salon',
            Appointments: s.appointmentCount || 0,
            Revenue: s.revenueGenerated || 0,
          }))}
          fileName="stylist_performance_report"
          pdfConfig={{
            title: 'Staff & Stylist Productivity Report',
            subtitle: `Total Stylists: ${staffList.length}`,
            headers: ['Stylist Name', 'Role', 'Salon', 'Appointments', 'Revenue Generated'],
            rows: filteredStaff.map((s) => [
              s.name,
              s.role,
              s.salon?.name || '—',
              s.appointmentCount || 0,
              formatCurrency(s.revenueGenerated),
            ]),
          }}
        />
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border-2 border-emerald-100 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by stylist name, role, or phone..."
          className="flex-1 text-black font-bold"
        />

        <select
          value={salonFilter}
          onChange={(e) => setSalonFilter(e.target.value)}
          className="bg-white border-2 border-emerald-200 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">All Salons</option>
          {salons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Staff Cards Grid with Emerald & White Styling */}
      {loading ? (
        <LoadingSpinner message="Calculating stylist metrics from Supabase..." size="md" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((s) => (
            <div
              key={s.id}
              className="bg-white border-2 border-emerald-100 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-card-elevated transition-all shadow-card-subtle space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-emerald-sm flex-shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-black text-sm">{s.name}</h3>
                  <div className="text-xs text-emerald-900 font-bold">{s.role}</div>
                  <div className="text-[11px] text-black font-semibold mt-0.5">{s.salon?.name || 'Salon'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-emerald-100">
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="text-[10.5px] font-bold text-emerald-950 uppercase">Bookings</div>
                  <div className="text-base font-bold text-black mt-0.5">{s.appointmentCount || 0}</div>
                </div>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="text-[10.5px] font-bold text-emerald-950 uppercase">Revenue</div>
                  <div className="text-base font-bold text-black mt-0.5">{formatCurrency(s.revenueGenerated)}</div>
                </div>
              </div>

              {s.phone_number && (
                <div className="text-[11px] text-black flex items-center gap-1.5 font-bold">
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{formatPhoneNumber(s.phone_number)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
