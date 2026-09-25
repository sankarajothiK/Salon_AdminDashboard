import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Phone,
  Calendar,
  Smartphone,
  CheckCircle2,
  Clock,
  UserX,
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
    return <LoadingSpinner message="Fetching registered salons and app telemetry from Supabase..." size="lg" />;
  }

  return (
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#161826] tracking-tight">Salon Management & Telemetry</h1>
          <p className="text-xs text-[#161826]/80 font-semibold mt-1">
            Overview of all onboarded salon partners, installed app versions, and operational health ({salons.length} registered salons)
          </p>
        </div>

        <ExportDropdown
          data={filteredSalons.map((s) => ({
            Name: s.name,
            Owner: s.owner_name,
            Phone: s.phone_number,
            City: s.city,
            AppVersion: s.app_version || '1.0.0',
            Status: s.status || 'Active',
            Registered: s.created_at,
          }))}
          fileName="registered_salons_report"
          pdfConfig={{
            title: 'Registered Salons Directory Report',
            subtitle: `Total Salons: ${salons.length}`,
            headers: ['Salon Name', 'Owner', 'City', 'Phone', 'App Version', 'Status'],
            rows: filteredSalons.map((s) => [
              s.name,
              s.owner_name,
              s.city,
              s.phone_number,
              `v${s.app_version || '1.0.0'}`,
              s.status?.toUpperCase() || 'ACTIVE',
            ]),
          }}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#D4AF37]/25 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by salon name, owner, city, or phone..."
          className="flex-1 text-[#161826] font-bold"
        />

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="uninstalled">Uninstalled</option>
            <option value="trial">Trial</option>
          </select>
        </div>
      </div>

      {/* Salons Table with Gold & Dark Styling */}
      <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
        {filteredSalons.length === 0 ? (
          <EmptyState
            icon={<Store className="w-6 h-6 text-[#D4AF37]" />}
            title="No salons matched your criteria"
            description="Try changing the search query or status filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#161826]">
              <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase tracking-wider text-[11px] border-b border-[#D4AF37]/20">
                <tr>
                  <th className="px-5 py-4 font-bold text-[#161826]">Salon Name</th>
                  <th className="px-4 py-4 font-bold text-[#161826]">Owner / Contact</th>
                  <th className="px-4 py-4 font-bold text-[#161826]">Location</th>
                  <th className="px-4 py-4 font-bold text-[#161826] text-center">App Version</th>
                  <th className="px-4 py-4 font-bold text-[#161826] text-center">Lifecycle Status</th>
                  <th className="px-4 py-4 font-bold text-[#161826]">Registered</th>
                  <th className="px-5 py-4 font-bold text-[#161826] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredSalons.map((salon) => {
                  return (
                    <tr key={salon.id} className="hover:bg-[#FCF9EE]/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-2xs flex-shrink-0"
                            style={{ backgroundColor: salon.theme_color || '#D4AF37' }}
                          >
                            {salon.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/salons/${salon.id}`}
                              className="font-bold text-[#161826] hover:text-[#D4AF37] transition-colors flex items-center gap-1 text-sm"
                            >
                              <span>{salon.name}</span>
                              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#D4AF37]" />
                            </Link>
                            <span className="text-[10.5px] text-[#D4AF37] font-semibold">
                              ID: {salon.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-[#161826]">{salon.owner_name || '—'}</div>
                        <div className="text-[11px] text-[#161826]/80 font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{formatPhoneNumber(salon.phone_number)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-[#161826] font-bold flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{salon.city || '—'}</span>
                        </div>
                        <div className="text-[10.5px] text-[#161826]/70 font-semibold truncate max-w-[140px]">
                          {salon.address || '—'}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FCF9EE] text-[#161826] font-mono font-bold text-xs border border-[#D4AF37]/30">
                          v{salon.app_version || '1.0.0'}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FCF9EE] text-[#161826] border border-[#D4AF37]/40">
                          <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                          <span>Active</span>
                        </span>
                      </td>

                      <td className="px-4 py-4 text-[#161826] text-xs font-bold">
                        {formatDate(salon.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSalonId(salon.id)}
                            className="px-3 py-1 text-[11px] rounded-lg bg-[#FCF9EE] hover:bg-[#F9F2D6] text-[#161826] border border-[#D4AF37]/30 font-bold transition-colors"
                            title="Filter dashboard to this salon"
                          >
                            Set Scope
                          </button>
                          <Link
                            to={`/salons/${salon.id}`}
                            className="p-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] hover:opacity-90 transition-opacity shadow-gold-sm"
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
