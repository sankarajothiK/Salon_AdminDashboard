import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface RevenueTrendChartProps {
  data: { date: string; revenue: number; count: number }[];
}

export const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data }) => {
  if (!data || !data.length) {
    return <div className="h-64 flex items-center justify-center text-xs text-[#161826] font-alata font-bold">No revenue data recorded</div>;
  }

  return (
    <div className="h-64 w-full font-alata">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGoldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#FCF9EE" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F9F2D6" vertical={false} />
          <XAxis
            dataKey="date"
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
            formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
            labelStyle={{ color: '#161826', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#D4AF37"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#revenueGoldGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
