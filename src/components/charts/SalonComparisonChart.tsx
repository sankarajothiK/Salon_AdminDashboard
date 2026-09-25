import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface SalonComparisonChartProps {
  data: { salonId: string; salonName: string; revenue: number; appointments: number }[];
}

const GOLD_PALETTE = ['#D4AF37', '#161826', '#C5A059', '#343B54', '#DFB847', '#A9B0C3'];

export const SalonComparisonChart: React.FC<SalonComparisonChartProps> = ({ data }) => {
  if (!data || !data.length) {
    return <div className="h-64 flex items-center justify-center text-xs text-[#161826] font-alata font-bold">No salon data recorded</div>;
  }

  return (
    <div className="h-64 w-full font-alata">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#FCF9EE" vertical={false} />
          <XAxis
            dataKey="salonName"
            stroke="#161826"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            fontWeight="bold"
          />
          <YAxis
            stroke="#161826"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            fontWeight="bold"
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#D4AF37',
              borderRadius: '0.75rem',
              color: '#161826',
              boxShadow: '0 10px 15px -3px rgba(22, 24, 38, 0.15)',
              fontSize: '12px',
              fontFamily: 'Alata, sans-serif',
              fontWeight: 'bold',
            }}
            formatter={(value: any, name: string) => [
              name === 'revenue' ? formatCurrency(Number(value)) : value,
              name === 'revenue' ? 'Total Revenue' : 'Appointments',
            ]}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={GOLD_PALETTE[index % GOLD_PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
