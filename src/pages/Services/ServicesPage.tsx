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
    <div className="space-y-6 font-alata text-[#161826]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#161826] tracking-tight">Services & Treatment Catalog</h1>
          <p className="text-xs text-[#161826]/80 font-semibold mt-1">
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
      <div className="bg-white border border-[#D4AF37]/25 p-4 rounded-2xl shadow-card-subtle space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 bg-[#FCF9EE] p-1 rounded-xl border border-[#D4AF37]/25">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#161826] shadow-gold-sm font-bold'
                    : 'text-[#161826] hover:text-[#D4AF37]'
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
            className="bg-white border border-[#D4AF37]/30 text-[#161826] font-bold text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
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
          className="text-[#161826] font-bold"
        />
      </div>

      {/* Services Grid with Gold & Dark Styling */}
      {loading ? (
        <LoadingSpinner message="Querying live service catalog from Supabase..." size="md" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((svc) => (
            <div
              key={svc.id}
              className="bg-white border-2 border-[#D4AF37]/25 rounded-2xl p-5 hover:border-[#D4AF37] hover:shadow-card-elevated transition-all shadow-card-subtle flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FCF9EE] text-[#161826] border border-[#D4AF37]/30">
                    {svc.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#D4AF37] font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{svc.duration_minutes} min</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-[#161826] mt-3 group-hover:text-[#D4AF37] transition-colors">
                  {svc.name}
                </h3>
                <p className="text-xs text-[#161826]/80 font-semibold mt-1 line-clamp-2">
                  {svc.description || 'Professional salon treatment service.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D4AF37]/20 flex items-center justify-between">
                <span className="text-xs text-[#161826] font-bold">Pricing</span>
                <span className="text-base font-bold text-[#161826]">
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
