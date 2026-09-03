import React, { useState, useEffect } from 'react';
import {
  Clock,
  Search,
} from 'lucide-react';
import { serviceCatalogService } from '@/services/serviceCatalogService';
import { useSalons } from '@/contexts/SalonContext';
import { Service } from '@/types';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { formatCurrency } from '@/utils/formatters';
import { ExportDropdown } from '@/components/common/ExportDropdown';

export const ServicesPage: React.FC = () => {
  const { salons, selectedSalonId } = useSalons();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [salonFilter, setSalonFilter] = useState<string>(selectedSalonId);

  useEffect(() => {
    setSalonFilter(selectedSalonId);
  }, [selectedSalonId]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      const res = await serviceCatalogService.getServices(salonFilter === 'all' ? undefined : salonFilter);
      if (res.data) setServices(res.data);
      setLoading(false);
    };

    fetchServices();
  }, [salonFilter]);

  const categories = ['ALL', 'HAIR', 'BEARD', 'SPA', 'GENERAL'];

  const filteredServices = services.filter((svc) => {
    const matchSearch =
      svc.name.toLowerCase().includes(search.toLowerCase()) ||
      (svc.description || '').toLowerCase().includes(search.toLowerCase());

    const matchCat =
      selectedCategory === 'ALL' || svc.category.toUpperCase() === selectedCategory;

    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6 font-alata text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-black tracking-tight">Services & Treatment Catalog</h1>
          <p className="text-xs text-black font-semibold mt-1">
            Global service directory across Hair, Beard, Spa, and Salon Treatments ({services.length} unique services)
          </p>
        </div>

        <ExportDropdown
          data={filteredServices.map((s) => ({
            Name: s.name,
            Category: s.category,
            Price: s.price,
            DurationMinutes: s.duration_minutes,
            Description: s.description,
          }))}
          fileName="services_catalog"
          pdfConfig={{
            title: 'Salon Services & Treatment Price List',
            subtitle: `Total Services: ${services.length}`,
            headers: ['Service Name', 'Category', 'Duration (Mins)', 'Price (INR)'],
            rows: filteredServices.map((s) => [s.name, s.category, s.duration_minutes, formatCurrency(s.price)]),
          }}
        />
      </div>

      {/* Filter and Category Bar */}
      <div className="bg-white border-2 border-emerald-100 p-4 rounded-2xl shadow-card-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-emerald-50/70 p-1 rounded-xl border border-emerald-200">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-black hover:text-emerald-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Salon selector */}
          <select
            value={salonFilter}
            onChange={(e) => setSalonFilter(e.target.value)}
            className="bg-white border-2 border-emerald-200 text-black font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <option value="all">All Salons (Direct Supabase)</option>
            {salons.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by treatment or service name..."
          className="text-black font-bold"
        />
      </div>

      {/* Services Grid with Emerald & White Styling */}
      {loading ? (
        <LoadingSpinner message="Querying live service catalog from Supabase..." size="md" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white border-2 border-emerald-100 rounded-2xl p-5 hover:border-emerald-500 hover:shadow-card-elevated transition-all shadow-card-subtle flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
                    {svc.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-900 font-bold">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{svc.duration_minutes} min</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-black mt-3 group-hover:text-emerald-700 transition-colors">
                  {svc.name}
                </h3>
                <p className="text-xs text-black font-semibold mt-1 line-clamp-2">
                  {svc.description || 'Professional salon treatment service.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-emerald-100 flex items-center justify-between">
                <span className="text-xs text-black font-bold">Pricing</span>
                <span className="text-base font-bold text-black">
                  {formatCurrency(svc.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
