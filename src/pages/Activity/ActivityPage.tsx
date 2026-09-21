import React, { useState, useEffect } from 'react';
import {
  Activity as ActivityIcon,
  Search,
  Filter,
  Users,
  Calendar,
  Receipt,
  Store,
  MessageSquare,
  Clock,
  Crown,
  UserX,
} from 'lucide-react';
import { activityService } from '@/services/activityService';
import { useSalons } from '@/contexts/SalonContext';
import { ActivityEvent } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatTimeAgo, formatDateTime } from '@/utils/formatters';
import { ExportDropdown } from '@/components/common/ExportDropdown';

export const ActivityPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [salonFilter, setSalonFilter] = useState(selectedSalonId);

  useEffect(() => {
    setSalonFilter(selectedSalonId);
  }, [selectedSalonId]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      const res = await activityService.getRecentActivity(50, salonFilter);
      if (res.data) setActivities(res.data);
      setLoading(false);
    };

    fetchActivities();
  }, [salonFilter]);

  const filteredActivities = activities.filter((act) => {
    const matchSearch =
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.description.toLowerCase().includes(search.toLowerCase()) ||
      (act.salonName || '').toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || act.type === typeFilter;
    return matchSearch && matchType;
  });

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'account_deleted':
        return <UserX className="w-4 h-4 text-rose-700" />;
      case 'customer_created':
        return <Users className="w-4 h-4 text-[#601D49]" />;
      case 'appointment_created':
      case 'appointment_completed':
      case 'appointment_cancelled':
        return <Calendar className="w-4 h-4 text-[#601D49]" />;
      case 'bill_generated':
        return <Receipt className="w-4 h-4 text-[#601D49]" />;
      case 'salon_registered':
        return <Store className="w-4 h-4 text-[#601D49]" />;
      case 'whatsapp_sent':
        return <MessageSquare className="w-4 h-4 text-[#601D49]" />;
      default:
        return <ActivityIcon className="w-4 h-4 text-[#601D49]" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating live platform audit events from Supabase..." size="md" />;
  }

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Platform Audit & Activity Trail</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Real-time aggregated stream of business events, appointments, billing records, and dispatches
          </p>
        </div>

        <ExportDropdown
          data={filteredActivities.map((a) => ({
            Timestamp: a.timestamp,
            Salon: a.salonName,
            Title: a.title,
            Description: a.description,
            EntityType: a.entityType,
          }))}
          fileName="platform_audit_activity_log"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#BD5579]/20 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search activity events..."
          className="flex-1 text-black font-bold"
        />

        <div className="flex items-center gap-2">
          <select
            value={salonFilter}
            onChange={(e) => setSalonFilter(e.target.value)}
            className="bg-white border border-[#BD5579]/20 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40"
          >
            <option value="all">All Salons</option>
            {salons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-[#BD5579]/20 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40"
          >
            <option value="all">All Event Types</option>
            <option value="customer_created">Customer Signups</option>
            <option value="appointment_completed">Completed Visits</option>
            <option value="appointment_created">Appointment Bookings</option>
            <option value="bill_generated">Invoices Generated</option>
            <option value="account_deleted">Account Deletions</option>
            <option value="whatsapp_sent">WhatsApp Dispatches</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline List with White & Wine Styling */}
      <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-5 shadow-card-subtle space-y-3">
        {filteredActivities.length === 0 ? (
          <EmptyState
            icon={<ActivityIcon className="w-6 h-6 text-[#601D49]" />}
            title="No activity events recorded"
            description="Events will automatically appear as salons operate their Style Fleet app."
          />
        ) : (
          filteredActivities.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl bg-white border border-[#BD5579]/15 hover:border-[#601D49] transition-all flex items-start justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#fdf5f8] border border-[#BD5579]/20 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                  {getEventIcon(act.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-black">{act.title}</span>
                    <span className="px-2 py-0.5 rounded bg-[#fdf5f8] text-[#601D49] border border-[#BD5579]/20 text-[10px] font-bold">
                      {act.salonName}
                    </span>
                  </div>
                  <p className="text-black font-semibold text-xs mt-1 leading-relaxed">{act.description}</p>
                  <div className="text-[10.5px] text-[#BD5579] font-bold mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#601D49]" />
                    <span>{formatDateTime(act.timestamp)}</span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-[#BD5579] font-bold whitespace-nowrap">
                {formatTimeAgo(act.timestamp)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
