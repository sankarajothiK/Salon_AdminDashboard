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
          query = query.or(`shop_id.eq.${salonFilter},salon_id.eq.${salonFilter}`);
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

  const totalAmount = expenses.reduce((sum, e) => sum + (Number(e.amount_minor ? e.amount_minor / 100 : e.amount) || 0), 0);

  return (
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#161826] tracking-tight">Salon Expense Management</h1>
          <p className="text-xs text-[#161826]/80 font-semibold mt-1">
            Tracking salon operational costs, inventory supplies, and overheads ({expenses.length} logged entries)
          </p>
        </div>

        <select
          value={salonFilter}
          onChange={(e) => setSalonFilter(e.target.value)}
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

      {/* Overview Stat */}
      <div className="bg-white border-2 border-[#D4AF37]/25 rounded-2xl p-6 shadow-card-subtle flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase text-[#161826]">Total Logged Expenses</div>
          <div className="text-2xl font-bold text-[#161826] mt-1">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#C5A059] text-[#161826] flex items-center justify-center font-bold shadow-gold-sm">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-[#D4AF37]/25 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Querying expense records from Supabase..." size="md" />
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FCF9EE] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
              <PieChart className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h3 className="text-sm font-bold text-[#161826]">No Expenses Recorded</h3>
            <p className="text-xs text-[#161826]/75 font-semibold mt-1 max-w-sm mx-auto">
              Salons have not logged any expense line items in Supabase yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#161826]">
              <thead className="bg-[#FCF9EE] text-[#161826] font-bold uppercase text-[11px] border-b border-[#D4AF37]/20">
                <tr>
                  <th className="px-5 py-3.5 font-bold text-[#161826]">Category</th>
                  <th className="px-4 py-3.5 font-bold text-[#161826]">Description</th>
                  <th className="px-4 py-3.5 font-bold text-[#161826]">Date</th>
                  <th className="px-5 py-3.5 font-bold text-[#161826] text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4AF37]/10">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FCF9EE]/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[#161826]">
                      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FCF9EE] text-[#161826] border border-[#D4AF37]/30">
                        {exp.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-bold text-[#161826]">{exp.description || '—'}</td>
                    <td className="px-4 py-4 font-bold text-[#161826]">{formatDate(exp.created_at)}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#161826] text-sm">
                      {formatCurrency(exp.amount_minor ? exp.amount_minor / 100 : exp.amount)}
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
