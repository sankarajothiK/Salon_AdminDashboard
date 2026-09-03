import React, { useState, useEffect } from 'react';
import {
  UserX,
  Search,
  Calendar,
  Phone,
  Store,
  FileText,
  AlertTriangle,
  Clock,
  Eye,
  Crown,
  ShieldAlert,
} from 'lucide-react';
import { accountDeletionService } from '@/services/accountDeletionService';
import { AccountDeletion } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { StatCard } from '@/components/common/StatCard';
import { formatDate, formatDateTime, formatPhoneNumber, formatTimeAgo } from '@/utils/formatters';

export const AccountDeletionsPage: React.FC = () => {
  const [deletions, setDeletions] = useState<AccountDeletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modal for Viewing Full Reason Details
  const [selectedRecord, setSelectedRecord] = useState<AccountDeletion | null>(null);

  useEffect(() => {
    const fetchDeletions = async () => {
      setLoading(true);
      const res = await accountDeletionService.getAccountDeletions();
      if (res.data) {
        setDeletions(res.data);
      }
      setLoading(false);
    };

    fetchDeletions();
  }, []);

  const filteredDeletions = deletions.filter((d) => {
    const term = search.toLowerCase();
    return (
      (d.salon_name || '').toLowerCase().includes(term) ||
      (d.owner_name || '').toLowerCase().includes(term) ||
      (d.phone_number || '').includes(term) ||
      (d.reason || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredDeletions.length / pageSize);
  const paginatedData = filteredDeletions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Compute stats
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentDeletionsCount = deletions.filter(
    (d) => new Date(d.deleted_at || d.created_at || 0).getTime() >= thirtyDaysAgo
  ).length;

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-rose-100/60 via-[#FFEBB8]/40 to-white border-2 border-rose-300/60 rounded-3xl p-6 sm:p-7 shadow-card-subtle">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-700 to-[#601D49] flex items-center justify-center text-[#FFEBB8] shadow-plum-sm flex-shrink-0 border-2 border-[#FFEBB8]">
              <UserX className="w-4 h-4 text-[#FFEBB8]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">
              Salon Account Deletions & Feedback Reasons
            </h1>
            <span className="px-3 py-0.5 rounded-full bg-rose-100 text-black border border-rose-300 text-xs font-bold shadow-2xs">
              Live Supabase
            </span>
          </div>
          <p className="text-xs text-black mt-1.5 leading-relaxed font-bold">
            Audit log of salon owners who requested or initiated account deletion, along with their recorded exit reasons.
          </p>
        </div>

        <ExportDropdown
          data={deletions.map((d) => ({
            SalonName: d.salon_name,
            OwnerName: d.owner_name,
            Phone: d.phone_number,
            DeletionDate: d.deleted_at || d.created_at,
            Reason: d.reason,
            SalonID: d.salon_id,
          }))}
          fileName="salon_account_deletions_log"
          pdfConfig={{
            title: 'Salon Account Deletions & Reasons Report',
            subtitle: `Total Account Deletions: ${deletions.length}`,
            headers: ['Salon Name', 'Owner Name', 'Phone', 'Deletion Date', 'Exit Reason'],
            rows: deletions.map((d) => [
              d.salon_name || '—',
              d.owner_name || '—',
              d.phone_number || '—',
              formatDate(d.deleted_at || d.created_at),
              d.reason || 'No reason specified',
            ]),
          }}
        />
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Deleted Salons"
          value={deletions.length}
          icon={<UserX className="w-5 h-5" />}
          subtitle="All-time account deletion requests"
          variant="rose"
        />
        <StatCard
          title="Recent Deletions (30 Days)"
          value={recentDeletionsCount}
          icon={<Clock className="w-5 h-5" />}
          subtitle="Churn activity this month"
          variant="plum"
        />
        <StatCard
          title="Audit Table Status"
          value="Connected"
          icon={<ShieldAlert className="w-5 h-5" />}
          subtitle="account_deletions table synced"
          variant="emerald"
        />
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#BD5579]/20 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by salon name, owner name, phone number, or reason keywords..."
          className="flex-1 text-black font-bold"
        />
      </div>

      {/* Deletions Table with Bold Black Typography */}
      <div className="bg-white border-2 border-[#BD5579]/20 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Querying account deletions from Supabase..." size="md" />
        ) : filteredDeletions.length === 0 ? (
          <EmptyState
            icon={<UserX className="w-6 h-6" />}
            title="No Account Deletions Recorded"
            description="No salon owners have deleted their accounts or all records have been cleared."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-black">
                <thead className="bg-[#fdf2f6] text-black font-bold uppercase tracking-wider text-[11px] border-b border-[#BD5579]/20">
                  <tr>
                    <th className="px-5 py-4 font-bold text-black">Salon Name</th>
                    <th className="px-4 py-4 font-bold text-black">Owner / Contact</th>
                    <th className="px-4 py-4 font-bold text-black">Phone Number</th>
                    <th className="px-4 py-4 font-bold text-black">Deletion Date & Time</th>
                    <th className="px-5 py-4 font-bold text-black">Exit Reason</th>
                    <th className="px-4 py-4 font-bold text-black text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BD5579]/10">
                  {paginatedData.map((item) => (
                    <tr key={item.id} className="hover:bg-rose-50/50 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                            <Store className="w-4 h-4 text-rose-800" />
                          </div>
                          <div>
                            <div className="font-bold text-black text-sm">{item.salon_name}</div>
                            {item.salon_id && (
                              <div className="text-[10px] text-black font-mono font-semibold">
                                ID: {item.salon_id.slice(0, 10)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-black text-xs">
                        {item.owner_name || '—'}
                      </td>

                      <td className="px-4 py-4 font-bold text-black text-xs">
                        {item.phone_number ? formatPhoneNumber(item.phone_number) : '—'}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-black">
                          {formatDate(item.deleted_at || item.created_at)}
                        </div>
                        <div className="text-[10.5px] text-black font-semibold">
                          {formatTimeAgo(item.deleted_at || item.created_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-xs">
                        <div className="p-2.5 rounded-xl bg-[#fdf2f6] border border-[#BD5579]/25 text-black font-bold text-xs line-clamp-2">
                          {item.reason}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setSelectedRecord(item)}
                          className="px-3 py-1.5 rounded-xl bg-[#601D49] text-[#FFEBB8] hover:bg-[#7d265f] text-xs font-bold transition-all shadow-plum-sm inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Reason</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDeletions.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Full Reason Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          title="Account Deletion Record"
          subtitle={`Deletion Audit ID: ${selectedRecord.id}`}
        >
          <div className="space-y-4 text-xs font-alata text-black">
            <div className="bg-[#fdf9fa] p-4 rounded-xl border border-[#BD5579]/20 space-y-2 font-bold text-black">
              <div className="flex justify-between">
                <span>Salon Name:</span>
                <span className="font-bold text-black">{selectedRecord.salon_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Owner Name:</span>
                <span className="font-bold text-black">{selectedRecord.owner_name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact Phone:</span>
                <span className="font-bold text-black">
                  {selectedRecord.phone_number ? formatPhoneNumber(selectedRecord.phone_number) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-black">{formatDateTime(selectedRecord.deleted_at || selectedRecord.created_at)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-black">Salon Owner's Stated Reason:</h4>
              <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-black font-bold text-sm leading-relaxed whitespace-pre-wrap">
                "{selectedRecord.reason}"
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
