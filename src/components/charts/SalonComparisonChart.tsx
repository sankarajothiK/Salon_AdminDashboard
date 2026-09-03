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

const PALETTE_COLORS = ['#601D49', '#BD5579', '#EA9D9D', '#FFEBB8', '#9d3f7d', '#d77273'];

export const SalonComparisonChart: React.FC<SalonComparisonChartProps> = ({ data }) => {
  if (!data || !data.length) {
    return <div className="h-64 flex items-center justify-center text-xs text-[#BD5579]/60 font-alata">No salon data recorded</div>;
  }

  return (
    <div className="h-64 w-full font-alata">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#fceef3" vertical={false} />
          <XAxis
            dataKey="salonName"
            stroke="#BD5579"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#BD5579"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#BD5579',
              borderRadius: '0.75rem',
              color: '#601D49',
              boxShadow: '0 10px 15px -3px rgba(96, 29, 73, 0.1)',
              fontSize: '12px',
              fontFamily: 'Alata, sans-serif',
            }}
            formatter={(value: any, name: string) => [
              name === 'revenue' ? formatCurrency(Number(value)) : value,
              name === 'revenue' ? 'Total Revenue' : 'Appointments',
            ]}
          />
          <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PALETTE_COLORS[index % PALETTE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
