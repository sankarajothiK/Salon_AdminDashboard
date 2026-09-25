import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  IndianRupee,
} from 'lucide-react';
import { billingService } from '@/services/billingService';
import { useSalons } from '@/contexts/SalonContext';
import { Bill } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { StatCard } from '@/components/common/StatCard';
import { formatCurrency, formatDate, formatDateTime, formatPhoneNumber } from '@/utils/formatters';

export const BillingPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [bills, setBills] = useState<Bill[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Summary KPIs
  const [summary, setSummary] = useState<{
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    allTimeRevenue: number;
  }>({ todayRevenue: 0, weekRevenue: 0, monthRevenue: 0, allTimeRevenue: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [salonFilter, setSalonFilter] = useState(selectedSalonId);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Modal for Bill Detail Receipt
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  useEffect(() => {
    setSalonFilter(selectedSalonId);
  }, [selectedSalonId]);

  useEffect(() => {
    const fetchBillingData = async () => {
      setLoading(true);
      const [billsRes, summaryRes] = await Promise.all([
        billingService.getBills(salonFilter),
        billingService.getRevenueSummary(salonFilter),
      ]);

      if (billsRes.data) {
        setBills(billsRes.data);
        setTotalCount(billsRes.data.length);
      }

      if (summaryRes.data) {
        setSummary({
          todayRevenue: summaryRes.data.todayRevenue || 0,
          weekRevenue: summaryRes.data.weekRevenue || 0,
          monthRevenue: summaryRes.data.monthRevenue || 0,
          allTimeRevenue: summaryRes.data.allTimeRevenue || summaryRes.data.totalRevenue || 0,
        });
      } else if (billsRes.data && billsRes.data.length > 0) {
        // Fallback calculation directly from fetched bills
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let tRev = 0, wRev = 0, mRev = 0, aRev = 0;
        billsRes.data.forEach((b) => {
          const amt = Number(b.total) || 0;
          const time = new Date(b.created_at).getTime();
          aRev += amt;
          if (time >= todayStart) tRev += amt;
          if (time >= weekStart) wRev += amt;
          if (time >= monthStart) mRev += amt;
        });

        setSummary({
          todayRevenue: tRev,
          weekRevenue: wRev,
          monthRevenue: mRev,
          allTimeRevenue: aRev,
        });
      }

      setLoading(false);
    };

    fetchBillingData();
  }, [salonFilter, currentPage]);

  const filteredBills = bills.filter((b) => {
    const term = search.toLowerCase();
    const custName = (b.customer_name || '').toLowerCase();
    const invId = (b.id || '').toLowerCase();
    const salonName = (b.salon_name || '').toLowerCase();
    return custName.includes(term) || invId.includes(term) || salonName.includes(term);
  });

  const totalPages = Math.ceil(filteredBills.length / pageSize);
  const paginatedBills = filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#161826] tracking-tight">Master Invoices & Financial Ledger</h1>
          <p className="text-xs text-[#161826]/80 font-semibold mt-1">
            Real-time billing transactions, GST distribution, and revenue audit ({bills.length} total invoices)
          </p>
        </div>

        <ExportDropdown
          data={bills.map((b) => ({
            InvoiceID: b.id,
            Salon: b.salon_name || 'Salon',
            Customer: b.customer_name || 'Walk-in',
            Date: b.created_at,
            Subtotal: b.subtotal,
            GST: b.gst_amount,
            Total: b.total,
          }))}
          fileName="master_invoices_ledger"
          pdfConfig={{
            title: 'Master Invoices & Financial Ledger Report',
            subtitle: `Total Revenue: ${formatCurrency(summary.allTimeRevenue)} | Total Invoices: ${bills.length}`,
            headers: ['Invoice ID', 'Salon', 'Customer', 'Date', 'Subtotal', 'GST', 'Total Paid'],
            rows: bills.map((b) => [
              `#${b.id.slice(0, 8)}`,
              b.salon_name || '—',
              b.customer_name || 'Walk-in',
              formatDate(b.created_at),
              formatCurrency(b.subtotal),
              formatCurrency(b.gst_amount),
              formatCurrency(b.total),
            ]),
          }}
        />
      </div>

      {/* Revenue KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Billing"
          value={formatCurrency(summary.todayRevenue)}
          icon={<IndianRupee className="w-5 h-5 text-[#D4AF37]" />}
          variant="gold"
        />
        <StatCard
          title="This Week"
          value={formatCurrency(summary.weekRevenue)}
          icon={<IndianRupee className="w-5 h-5 text-[#DFB847]" />}
          variant="dark"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(summary.monthRevenue)}
          icon={<IndianRupee className="w-5 h-5 text-[#D4AF37]" />}
          variant="gold"
        />
        <StatCard
          title="All-Time Platform Billing"
          value={formatCurrency(summary.allTimeRevenue)}
          icon={<IndianRupee className="w-5 h-5 text-[#DFB847]" />}
          variant="dark"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#D4AF37]/25 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by customer name, salon, or invoice ID..."
          className="flex-1 text-[#161826] font-bold"
        />

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
      </div>

      {/* Invoices Table with Gold & Dark Styling */}
      <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Reading invoice ledger from Supabase..." size="md" />
        ) : filteredBills.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-6 h-6 text-[#D4AF37]" />}
            title="No invoices recorded"
            description="Invoices will appear automatically as salons generate bills."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#161826]">
                <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase tracking-wider text-[11px] border-b border-[#D4AF37]/20">
                  <tr>
                    <th className="px-5 py-4 font-bold text-[#161826]">Invoice ID</th>
                    <th className="px-4 py-4 font-bold text-[#161826]">Customer & Salon</th>
                    <th className="px-4 py-4 font-bold text-[#161826]">Date & Time</th>
                    <th className="px-4 py-4 font-bold text-[#161826] text-right">Subtotal</th>
                    <th className="px-4 py-4 font-bold text-[#161826] text-right">GST</th>
                    <th className="px-4 py-4 font-bold text-[#161826] text-right">Total Amount</th>
                    <th className="px-5 py-4 font-bold text-[#161826] text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D4AF37]/10">
                  {paginatedBills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-[#FCF9EE]/50 transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] font-bold text-[#161826]">
                        #{bill.id.slice(0, 8)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-[#161826] text-sm">
                          {bill.customer_id ? (
                            <Link to={`/customers/${bill.customer_id}`} className="hover:text-[#D4AF37]">
                              {bill.customer_name || 'Customer'}
                            </Link>
                          ) : (
                            bill.customer_name || 'Walk-in Client'
                          )}
                        </div>
                        <div className="text-[10.5px] text-[#D4AF37] font-semibold mt-0.5">{bill.salon_name || 'Salon'}</div>
                      </td>

                      <td className="px-4 py-4 text-[#161826] font-bold">
                        {formatDateTime(bill.created_at)}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-[#161826]">{formatCurrency(bill.subtotal)}</td>

                      <td className="px-4 py-4 text-right text-[#161826] font-bold">
                        {formatCurrency(bill.gst_amount)}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-[#161826] text-sm">
                        {formatCurrency(bill.total)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] hover:opacity-95 text-xs font-bold transition-all shadow-gold-sm"
                        >
                          View Receipt
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
              totalItems={filteredBills.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Itemized Receipt Modal */}
      {selectedBill && (
        <Modal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title={`Invoice Receipt #${selectedBill.id.slice(0, 8)}`}
          subtitle={`Issued on ${formatDateTime(selectedBill.created_at)}`}
        >
          <div className="space-y-4 text-xs font-alata text-[#161826] font-bold">
            <div className="bg-[#FCF9EE] p-4 rounded-xl border border-[#D4AF37]/30 space-y-2 font-bold text-[#161826]">
              <div className="flex justify-between">
                <span>Salon:</span>
                <span className="font-bold text-[#161826]">{selectedBill.salon_name || 'Salon'}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-[#161826]">
                  {selectedBill.customer_name || 'Walk-in'}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-[#161826] mb-2">Itemized Services</h4>
              {!selectedBill.items || selectedBill.items.length === 0 ? (
                <p className="text-xs text-[#161826]/80 font-semibold py-2">Services bundled in total bill.</p>
              ) : (
                <div className="space-y-2">
                  {selectedBill.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#D4AF37]/20 font-bold text-[#161826]"
                    >
                      <div>
                        <div className="font-bold text-[#161826]">{item.service_name}</div>
                        <div className="text-[10.5px] text-[#D4AF37] font-semibold">Qty: {item.qty}</div>
                      </div>
                      <div className="font-bold text-[#161826]">{formatCurrency(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#D4AF37]/30 space-y-1.5 font-bold text-[#161826]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedBill.subtotal)}</span>
              </div>
              {selectedBill.discount > 0 && (
                <div className="flex justify-between text-rose-700">
                  <span>Discount:</span>
                  <span>-{formatCurrency(selectedBill.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST:</span>
                <span>{formatCurrency(selectedBill.gst_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#161826] pt-2 border-t border-[#D4AF37]/30">
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
