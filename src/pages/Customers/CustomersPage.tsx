import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Phone,
  Calendar,
  IndianRupee,
  Star,
  ArrowUpRight,
  Sparkles,
  Crown,
} from 'lucide-react';
import { customerService } from '@/services/customerService';
import { useSalons } from '@/contexts/SalonContext';
import { Customer } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { ExportDropdown } from '@/components/common/ExportDropdown';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { formatCurrency, formatDate, formatPhoneNumber, formatTimeAgo } from '@/utils/formatters';

export const CustomersPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'new' | 'returning' | 'vip' | 'inactive'>('all');
  const [salonFilter, setSalonFilter] = useState<string>(selectedSalonId);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  useEffect(() => {
    setSalonFilter(selectedSalonId);
  }, [selectedSalonId]);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      const res = await customerService.getCustomers({
        salonId: salonFilter,
        search,
        segment: segmentFilter,
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
      });

      if (res.data) {
        setCustomers(res.data);
        setTotalCount(res.totalCount);
      }
      setLoading(false);
    };

    fetchCustomers();
  }, [salonFilter, search, segmentFilter, currentPage]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Customer Intelligence & CRM</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Central customer directory and retention analytics across {salons.length} salons ({totalCount} total customers)
          </p>
        </div>

        <ExportDropdown
          data={customers.map((c) => ({
            Name: c.name,
            Phone: c.phone_number,
            Salon: c.salon?.name || 'Salon',
            TotalVisits: c.totalVisits,
            TotalSpent: c.totalSpent,
            Segment: c.segment,
            RegisteredDate: c.created_at,
          }))}
          fileName="customers_directory_export"
          pdfConfig={{
            title: 'Customer Directory Report',
            subtitle: `Total Customers: ${totalCount}`,
            headers: ['Customer Name', 'Phone', 'Salon', 'Visits', 'Spent', 'Segment', 'Registered'],
            rows: customers.map((c) => [
              c.name,
              c.phone_number,
              c.salon?.name || '—',
              c.totalVisits || 0,
              formatCurrency(c.totalSpent),
              c.segment?.toUpperCase() || 'NEW',
              formatDate(c.created_at),
            ]),
          }}
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white border-2 border-emerald-100 p-4 rounded-2xl shadow-card-subtle">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
          placeholder="Search by customer name, phone number, or notes..."
          className="flex-1 text-black font-bold"
        />

        <div className="flex items-center gap-2">
          {/* Salon filter */}
          <select
            value={salonFilter}
            onChange={(e) => {
              setSalonFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-white border-2 border-emerald-200 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All Salons</option>
            {salons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Segment filter */}
          <select
            value={segmentFilter}
            onChange={(e) => {
              setSegmentFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="bg-white border-2 border-emerald-200 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All Customer Segments</option>
            <option value="new">New Customers (1 Visit)</option>
            <option value="returning">Returning Customers</option>
            <option value="vip">VIP / Starred</option>
          </select>
        </div>
      </div>

      {/* Customers Table with Emerald & White Styling */}
      <div className="bg-white border-2 border-emerald-100 rounded-2xl overflow-hidden shadow-card-subtle">
        {loading ? (
          <LoadingSpinner message="Querying customer database from Supabase..." size="md" />
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-6 h-6" />}
            title="No customers found"
            description="No customer records matched your query or filter criteria."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-black">
                <thead className="bg-emerald-50 text-black font-bold uppercase tracking-wider text-[11px] border-b-2 border-emerald-100">
                  <tr>
                    <th className="px-5 py-4 font-bold text-black">Customer</th>
                    <th className="px-4 py-4 font-bold text-black">Phone</th>
                    <th className="px-4 py-4 font-bold text-black">Salon</th>
                    <th className="px-4 py-4 font-bold text-black text-center">Visits</th>
                    <th className="px-4 py-4 font-bold text-black text-right">Lifetime Spend</th>
                    <th className="px-4 py-4 font-bold text-black">Last Visit</th>
                    <th className="px-4 py-4 font-bold text-black text-center">Segment</th>
                    <th className="px-5 py-4 font-bold text-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {customers.map((c) => {
                    const getSegmentBadge = () => {
                      if (c.starred || c.segment === 'vip') {
                        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 text-amber-950 border border-amber-300">VIP ⭐</span>;
                      }
                      if (c.segment === 'returning') {
                        return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-950 border border-emerald-300">Returning</span>;
                      }
                      return <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-100 text-blue-950 border border-blue-300">New</span>;
                    };

                    return (
                      <tr key={c.id} className="hover:bg-emerald-50/50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-2xs">
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <Link
                                to={`/customers/${c.id}`}
                                className="font-bold text-black text-sm hover:text-emerald-700 transition-colors flex items-center gap-1"
                              >
                                <span>{c.name}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600" />
                              </Link>
                              {c.notes && <span className="text-[10.5px] text-emerald-900 font-semibold block truncate max-w-[150px]">{c.notes}</span>}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 font-bold text-black text-xs">
                          {formatPhoneNumber(c.phone_number)}
                        </td>

                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-200 text-[11px] font-bold">
                            {c.salon?.name || 'Salon'}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-black text-sm">
                          {c.totalVisits || 0}
                        </td>

                        <td className="px-4 py-4 text-right font-bold text-black text-sm">
                          {formatCurrency(c.totalSpent)}
                        </td>

                        <td className="px-4 py-4 text-black text-xs font-bold">
                          {formatTimeAgo(c.lastVisit)}
                        </td>

                        <td className="px-4 py-4 text-center">{getSegmentBadge()}</td>

                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/customers/${c.id}`}
                            className="px-3 py-1.5 text-xs rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold transition-all shadow-emerald-sm"
                          >
                            Profile 360&deg;
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
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
    </div>
  );
};
