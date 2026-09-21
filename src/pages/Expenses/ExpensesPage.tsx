import React, { useState, useEffect } from 'react';
import {
  PieChart,
  IndianRupee,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSalons } from '@/contexts/SalonContext';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export const ExpensesPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salonFilter, setSalonFilter] = useState(selectedSalonId);

  useEffect(() => {
    setSalonFilter(selectedSalonId);
  }, [selectedSalonId]);

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      try {
        let query = supabase.from('expenses').select('*').order('created_at', { ascending: false });
        if (salonFilter !== 'all') {
          query = query.eq('salon_id', salonFilter);
        }
        const { data, error } = await query;
        if (!error && data) {
          setExpenses(data);
        }
      } catch (e) {
        console.log('Expenses query error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [salonFilter]);

  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Salon Expense Management</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Tracking salon operational costs, inventory supplies, and overheads ({expenses.length} logged entries)
          </p>
        </div>

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
      </div>

      {/* Overview Stat */}
      <div className="bg-white border border-[#BD5579]/20 rounded-2xl p-6 shadow-card-subtle flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase text-black">Total Logged Expenses</div>
          <div className="text-2xl font-bold text-black mt-1">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#601D49] to-[#BD5579] text-white flex items-center justify-center font-bold shadow-wine-sm">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-[#BD5579]/20 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Querying expense records from Supabase..." size="md" />
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#fdf5f8] text-[#601D49] border border-[#BD5579]/20 flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-6 h-6 text-[#601D49]" />
            </div>
            <h3 className="text-sm font-bold text-black">No Expenses Recorded</h3>
            <p className="text-xs text-black font-semibold mt-1 max-w-sm mx-auto">
              Salons have not logged any expense line items in Supabase yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-black">
              <thead className="bg-[#fdf5f8] text-black font-bold uppercase text-[11px] border-b border-[#BD5579]/20">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-black">Category</th>
                  <th className="px-4 py-3.5 font-bold text-black">Description</th>
                  <th className="px-4 py-3.5 font-bold text-black">Date</th>
                  <th className="px-5 py-3.5 font-bold text-black text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#BD5579]/10">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#fdf5f8]/70 transition-colors">
                    <td className="px-5 py-4 font-bold text-black">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#fdf5f8] text-[#601D49] border border-[#BD5579]/20">
                        {exp.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-black">{exp.description || '—'}</td>
                    <td className="px-4 py-4 font-bold text-black">{formatDate(exp.created_at)}</td>
                    <td className="px-5 py-4 text-right font-bold text-black text-sm">
                      {formatCurrency(exp.amount)}
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
