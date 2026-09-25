import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CheckCircle2,
  Clock,
  UserX,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Crown,
} from 'lucide-react';
import { telemetryService } from '@/services/telemetryService';
import { AppTelemetryRecord, SalonLifecycleStatus } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { StatCard } from '@/components/common/StatCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { formatDate, formatDateTime, formatPhoneNumber, formatTimeAgo } from '@/utils/formatters';

export const AppTelemetryPage: React.FC = () => {
  const [records, setRecords] = useState<AppTelemetryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [versionFilter, setVersionFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTelemetry = async () => {
      setLoading(true);
      const res = await telemetryService.getTelemetryRecords();
      if (res.data) setRecords(res.data);
      setLoading(false);
    };

    fetchTelemetry();
  }, []);

  const activeCount = records.filter((r) => r.status === 'active').length;
  const inactiveCount = records.filter((r) => r.status === 'inactive').length;
  const uninstalledCount = records.filter((r) => r.status === 'uninstalled').length;
  const deletedCount = records.filter((r) => r.status === 'deleted').length;

  const filteredRecords = records.filter((r) => {
    const term = search.toLowerCase();
    const matchSearch =
      r.salon_name.toLowerCase().includes(term) ||
      r.owner_name.toLowerCase().includes(term) ||
      r.phone_number.includes(term) ||
      r.app_version.includes(term) ||
      (r.deletion_reason || '').toLowerCase().includes(term);

    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchVersion = versionFilter === 'all' || r.app_version === versionFilter;

    return matchSearch && matchStatus && matchVersion;
  });

  const getStatusBadge = (status: SalonLifecycleStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FCF9EE] text-[#161826] border border-[#D4AF37]/40 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span>Active</span>
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Inactive</span>
          </span>
        );
      case 'uninstalled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#161826] text-[#DFB847] border border-[#161826]">
            <span className="w-2 h-2 rounded-full bg-[#DFB847]" />
            <span>Uninstalled</span>
          </span>
        );
      case 'deleted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-900 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Deleted</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-[#FCF9EE] via-white to-[#FCF9EE]/50 border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-7 shadow-card-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#161826] flex items-center justify-center text-[#DFB847] shadow-dark-sm flex-shrink-0 border border-[#D4AF37]/40">
              <Smartphone className="w-4 h-4 text-[#DFB847]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#161826] tracking-tight">
              App Version & User Lifecycle Telemetry
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-[#FCF9EE] text-[#161826] border border-[#D4AF37]/40 text-xs font-bold shadow-2xs">
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-[#161826]/80 mt-1.5 leading-relaxed font-bold">
            Track which app version users are running, active app usage, dormant/inactive accounts, app uninstalls, and account deletions.
          </p>
        </div>

        <ExportDropdown
          data={records.map((r) => ({
            Salon: r.salon_name,
            Owner: r.owner_name,
            Phone: r.phone_number,
            AppVersion: r.app_version,
            Platform: r.platform,
            Status: r.status,
            LastActive: r.last_active_at,
            DeletionReason: r.deletion_reason || 'N/A',
          }))}
          fileName="app_version_telemetry_report"
          pdfConfig={{
            title: 'App Version & User Lifecycle Report',
            subtitle: `Total Tracked Salons: ${records.length}`,
            headers: ['Salon Name', 'Owner', 'Phone', 'App Version', 'Status', 'Last Active'],
            rows: records.map((r) => [
              r.salon_name,
              r.owner_name,
              r.phone_number,
              `v${r.app_version} (${r.platform})`,
              r.status.toUpperCase(),
              formatDate(r.last_active_at),
            ]),
          }}
        />
      </div>

      {/* 4 Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Users"
          value={activeCount}
          icon={<CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />}
          subtitle="Operating within 14 days"
          variant="gold"
        />
        <StatCard
          title="Inactive / Dormant"
          value={inactiveCount}
          icon={<Clock className="w-5 h-5 text-amber-700" />}
          subtitle="No activity in 14–45 days"
          variant="amber"
        />
        <StatCard
          title="Uninstalled App"
          value={uninstalledCount}
          icon={<Smartphone className="w-5 h-5 text-[#DFB847]" />}
          subtitle="Disconnected >45 days"
          variant="dark"
        />
        <StatCard
          title="Deleted Accounts"
          value={deletedCount}
          icon={<UserX className="w-5 h-5 text-rose-800" />}
          subtitle="Account deletion recorded"
          variant="rose"
        />
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-[#D4AF37]/25 p-4 rounded-2xl shadow-card-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[#FCF9EE] p-1 rounded-xl border border-[#D4AF37]/25">
            {['all', 'active', 'inactive', 'uninstalled', 'deleted'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                  statusFilter === st
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] shadow-gold-sm font-bold'
                    : 'text-[#161826] hover:text-[#D4AF37]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={versionFilter}
              onChange={(e) => setVersionFilter(e.target.value)}
              className="bg-white border border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
            >
              <option value="all">All App Versions</option>
              <option value="1.0.0">v1.0.0 (Release)</option>
              <option value="1.0.1">v1.0.1 (Patch)</option>
              <option value="1.1.0">v1.1.0 (Next)</option>
            </select>
          </div>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by salon name, owner, phone number, version, or reason..."
          className="text-[#161826] font-bold"
        />
      </div>

      {/* Telemetry Table */}
      <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Calculating app version distribution & lifecycle statuses..." size="md" />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={<Smartphone className="w-6 h-6 text-[#D4AF37]" />}
            title="No telemetry records found"
            description="No salon matches your filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#161826]">
              <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase tracking-wider text-[11px] border-b border-[#D4AF37]/20">
                <tr>
                  <th className="px-5 py-4 font-bold text-[#161826]">Salon & Owner</th>
                  <th className="px-4 py-4 font-bold text-[#161826]">Contact Phone</th>
                  <th className="px-4 py-4 font-bold text-[#161826]">App Version</th>
                  <th className="px-4 py-4 font-bold text-[#161826]">Platform & Device</th>
                  <th className="px-4 py-4 font-bold text-[#161826] text-center">Lifecycle Status</th>
                  <th className="px-4 py-4 font-bold text-[#161826]">Last Active</th>
                  <th className="px-5 py-4 font-bold text-[#161826]">Notes / Exit Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FCF9EE]/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-[#161826] text-sm">{item.salon_name}</div>
                      <div className="text-[11px] text-[#D4AF37] font-semibold">{item.owner_name}</div>
                    </td>

                    <td className="px-4 py-4 font-bold text-[#161826] text-xs">
                      {formatPhoneNumber(item.phone_number)}
                    </td>

                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#FCF9EE] text-[#161826] font-mono font-bold text-xs border border-[#D4AF37]/30">
                        v{item.app_version}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-bold text-[#161826] capitalize">{item.platform}</div>
                      <div className="text-[10.5px] text-[#D4AF37] font-semibold">{item.device_model}</div>
                    </td>

                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-[#161826] font-bold">{formatDate(item.last_active_at)}</div>
                      <div className="text-[10.5px] text-[#D4AF37] font-semibold">{formatTimeAgo(item.last_active_at)}</div>
                    </td>

                    <td className="px-5 py-4">
                      {item.status === 'deleted' && item.deletion_reason ? (
                        <span className="text-rose-900 font-bold text-xs bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                          {item.deletion_reason}
                        </span>
                      ) : (
                        <span className="text-[#161826] font-semibold text-xs">
                          {item.status === 'active' ? 'Operational & syncing live' : item.status === 'inactive' ? 'Dormant account' : 'App uninstalled'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
