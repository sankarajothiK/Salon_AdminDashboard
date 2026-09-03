import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  Search,
  Filter,
  IndianRupee,
  FileText,
  Eye,
  Calendar,
  Crown,
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
        billingService.getBills({
          salonId: salonFilter,
          limit: pageSize,
          offset: (currentPage - 1) * pageSize,
        }),
        billingService.getRevenueSummary(salonFilter),
      ]);

      if (billsRes.data) {
        setBills(billsRes.data);
        setTotalCount(billsRes.totalCount);
      }
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
      setLoading(false);
    };

    fetchBillingData();
  }, [salonFilter, currentPage]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Master Invoices & Financial Ledger</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Real-time billing transactions, GST distribution, and revenue audit ({totalCount} total invoices)
          </p>
        </div>

        <ExportDropdown
          data={bills.map((b) => ({
            InvoiceID: b.id,
            Salon: b.salon?.name || 'Salon',
            Customer: b.customer?.name || 'Walk-in',
            Date: b.created_at,
            Subtotal: b.subtotal,
            GST: b.gst_amount,
            Total: b.total,
          }))}
          fileName="master_invoices_ledger"
          pdfConfig={{
            title: 'Master Invoices & Financial Ledger Report',
            subtitle: `Total Revenue: ${formatCurrency(summary.allTimeRevenue)} | Total Invoices: ${totalCount}`,
            headers: ['Invoice ID', 'Salon', 'Customer', 'Date', 'Subtotal', 'GST', 'Total Paid'],
            rows: bills.map((b) => [
              `#${b.id.slice(0, 8)}`,
              b.salon?.name || '—',
              b.customer?.name || 'Walk-in',
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
          icon={<IndianRupee className="w-5 h-5" />}
          variant="amber"
        />
        <StatCard
          title="This Week"
          value={formatCurrency(summary.weekRevenue)}
          icon={<IndianRupee className="w-5 h-5" />}
          variant="blue"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(summary.monthRevenue)}
          icon={<IndianRupee className="w-5 h-5" />}
          variant="purple"
        />
        <StatCard
          title="All-Time Platform Billing"
          value={formatCurrency(summary.allTimeRevenue)}
          icon={<IndianRupee className="w-5 h-5" />}
          variant="emerald"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border border-[#BD5579]/20 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by customer name or invoice ID..."
          className="flex-1 text-black font-bold"
        />

        <select
          value={salonFilter}
          onChange={(e) => {
            setSalonFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-[#fdf9fa] border border-[#BD5579]/25 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#BD5579]/40"
        >
          <option value="all">All Salons</option>
          {salons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Invoices Table with Bold Black Typography */}
      <div className="bg-white border border-[#BD5579]/20 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Reading invoice ledger from Supabase..." size="md" />
        ) : bills.length === 0 ? (
          <EmptyState
            icon={<Receipt className="w-6 h-6" />}
            title="No invoices recorded"
            description="Invoices will appear automatically as salons generate bills."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-black">
                <thead className="bg-[#fdf2f6] text-black font-bold uppercase tracking-wider text-[11px] border-b border-[#BD5579]/20">
                  <tr>
                    <th className="px-5 py-4 font-bold text-black">Invoice ID</th>
                    <th className="px-4 py-4 font-bold text-black">Customer & Salon</th>
                    <th className="px-4 py-4 font-bold text-black">Date & Time</th>
                    <th className="px-4 py-4 font-bold text-black text-right">Subtotal</th>
                    <th className="px-4 py-4 font-bold text-black text-right">GST</th>
                    <th className="px-4 py-4 font-bold text-black text-right">Total Amount</th>
                    <th className="px-5 py-4 font-bold text-black text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#BD5579]/10">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-[#fcf2f6]/60 transition-colors">
                      <td className="px-5 py-4 font-mono text-[11px] font-bold text-black">
                        #{bill.id.slice(0, 8)}
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-black text-sm">
                          {bill.customer ? (
                            <Link to={`/customers/${bill.customer.id}`} className="hover:text-[#601D49]">
                              {bill.customer.name}
                            </Link>
                          ) : (
                            'Walk-in Client'
                          )}
                        </div>
                        <div className="text-[10.5px] text-black font-semibold mt-0.5">{bill.salon?.name || 'Salon'}</div>
                      </td>

                      <td className="px-4 py-4 text-black font-bold">
                        {formatDateTime(bill.created_at)}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-black">{formatCurrency(bill.subtotal)}</td>

                      <td className="px-4 py-4 text-right text-black font-bold">
                        {formatCurrency(bill.gst_amount)}
                      </td>

                      <td className="px-4 py-4 text-right font-bold text-black text-sm">
                        {formatCurrency(bill.total)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedBill(bill)}
                          className="px-3 py-1.5 rounded-xl bg-[#601D49] text-[#FFEBB8] hover:bg-[#7d265f] text-xs font-bold transition-all shadow-plum-sm"
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
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Itemized Receipt Modal with Bold Black text */}
      {selectedBill && (
        <Modal
          isOpen={!!selectedBill}
          onClose={() => setSelectedBill(null)}
          title={`Invoice Receipt #${selectedBill.id.slice(0, 8)}`}
          subtitle={`Issued on ${formatDateTime(selectedBill.created_at)}`}
        >
          <div className="space-y-4 text-xs font-alata text-black font-bold">
            <div className="bg-[#fdf9fa] p-4 rounded-xl border border-[#BD5579]/20 space-y-2 font-bold text-black">
              <div className="flex justify-between">
                <span>Salon:</span>
                <span className="font-bold text-black">{selectedBill.salon?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-bold text-black">
                  {selectedBill.customer?.name || 'Walk-in'} {selectedBill.customer?.phone_number && `(${formatPhoneNumber(selectedBill.customer.phone_number)})`}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase text-black mb-2">Itemized Services</h4>
              {!selectedBill.items || selectedBill.items.length === 0 ? (
                <p className="text-xs text-black font-semibold py-2">Services bundled in total bill.</p>
              ) : (
                <div className="space-y-2">
                  {selectedBill.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#fdf2f6]/80 border border-[#BD5579]/15 font-bold text-black"
                    >
                      <div>
                        <div className="font-bold text-black">{item.service_name}</div>
                        <div className="text-[10.5px] text-black font-semibold">Qty: {item.qty}</div>
                      </div>
                      <div className="font-bold text-black">{formatCurrency(item.price * item.qty)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#BD5579]/20 space-y-1.5 font-bold text-black">
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
              <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-[#BD5579]/20">
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
