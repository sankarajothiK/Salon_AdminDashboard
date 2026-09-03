import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Calendar,
  Users,
  IndianRupee,
  Activity,
  ArrowUpRight,
  ExternalLink,
  Crown,
} from 'lucide-react';
import { useSalons } from '@/contexts/SalonContext';
import { SearchInput } from '@/components/common/SearchInput';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDate, formatPhoneNumber, formatTimeAgo } from '@/utils/formatters';
import { getSalonStatusStyle } from '@/utils/statusBadge';

export const SalonsPage: React.FC = () => {
  const { salons, loading, setSelectedSalonId } = useSalons();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredSalons = useMemo(() => {
    return salons.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.owner_name.toLowerCase().includes(search.toLowerCase()) ||
        s.city.toLowerCase().includes(search.toLowerCase()) ||
        s.phone_number.includes(search);

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [salons, search, statusFilter]);

  if (loading) {
    return <LoadingSpinner message="Fetching registered salons from Supabase..." size="lg" />;
  }

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Salon Management</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Overview of all salon businesses onboarded to our CRM platform ({salons.length} registered salons)
          </p>
        </div>

        <ExportDropdown
          data={filteredSalons.map((s) => ({
            Name: s.name,
            Owner: s.owner_name,
            Phone: s.phone_number,
            City: s.city,
            Customers: s.customerCount || 0,
            Appointments: s.appointmentCount || 0,
            Revenue: s.totalRevenue || 0,
            Status: s.status,
            Registered: s.created_at,
          }))}
          fileName="registered_salons_report"
          pdfConfig={{
            title: 'Registered Salons Directory Report',
            subtitle: `Total Salons: ${salons.length}`,
            headers: ['Salon Name', 'Owner', 'City', 'Phone', 'Customers', 'Appts', 'Revenue', 'Status'],
            rows: filteredSalons.map((s) => [
              s.name,
              s.owner_name,
              s.city,
              s.phone_number,
              s.customerCount || 0,
              s.appointmentCount || 0,
              formatCurrency(s.totalRevenue),
              s.status || 'Active',
            ]),
          }}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#BD5579]/20 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by salon name, owner, city, or phone..."
          className="flex-1 text-black font-bold"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#fdf9fa] border border-[#BD5579]/25 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Salons Table with Bold Black Typography */}
      <div className="bg-white border border-[#BD5579]/20 rounded-2xl overflow-hidden shadow-card-subtle">
        {filteredSalons.length === 0 ? (
          <EmptyState
            icon={<Store className="w-6 h-6" />}
            title="No salons matched your criteria"
            description="Try changing the search query or status filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-[#fdf2f6] text-black font-bold uppercase tracking-wider text-[11px] border-b border-[#BD5579]/20">
                <tr>
                  <th className="px-5 py-4 font-bold text-black">Salon Name</th>
                  <th className="px-4 py-4 font-bold text-black">Owner / Contact</th>
                  <th className="px-4 py-4 font-bold text-black">Location</th>
                  <th className="px-4 py-4 font-bold text-black text-center">Customers</th>
                  <th className="px-4 py-4 font-bold text-black text-center">Appts</th>
                  <th className="px-4 py-4 font-bold text-black text-right">Revenue</th>
                  <th className="px-4 py-4 font-bold text-black text-center">Status</th>
                  <th className="px-4 py-4 font-bold text-black">Last Activity</th>
                  <th className="px-5 py-4 font-bold text-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BD5579]/10">
                {filteredSalons.map((salon) => {
                  const statusStyle = getSalonStatusStyle(salon.status);

                  return (
                    <tr key={salon.id} className="hover:bg-[#fcf2f6]/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs flex-shrink-0"
                            style={{ backgroundColor: salon.theme_color || '#601D49' }}
                          >
                            {salon.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/salons/${salon.id}`}
                              className="font-bold text-black hover:text-[#601D49] transition-colors flex items-center gap-1 text-sm"
                            >
                              <span>{salon.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#601D49]" />
                            </Link>
                            <span className="text-[10.5px] text-black font-semibold">
                              Registered {formatDate(salon.created_at)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-black">{salon.owner_name || '—'}</div>
                        <div className="text-[11px] text-black font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-black" />
                          <span>{formatPhoneNumber(salon.phone_number)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-black font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-black" />
                          <span>{salon.city || '—'}</span>
                        </div>
                        <div className="text-[10.5px] text-black font-semibold truncate max-w-[140px]">
                          {salon.address || '—'}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-black text-sm">{salon.customerCount || 0}</span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-black text-sm">{salon.appointmentCount || 0}</span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span className="font-bold text-black text-sm">{formatCurrency(salon.totalRevenue)}</span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} text-black ${statusStyle.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                          {statusStyle.label}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-black text-[11px] font-bold">
                        {formatTimeAgo(salon.lastActivity)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSalonId(salon.id)}
                            className="px-3 py-1 text-[11px] rounded-lg bg-[#FFEBB8] text-black border border-[#BD5579]/30 font-bold transition-colors"
                            title="Filter whole dashboard to this salon"
                          >
                            Set Scope
                          </button>
                          <Link
                            to={`/salons/${salon.id}`}
                            className="p-1.5 rounded-lg bg-[#601D49] text-[#FFEBB8] hover:bg-[#7d265f] transition-colors"
                            title="View 360 Salon Details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
