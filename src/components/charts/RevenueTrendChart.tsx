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
    return <div className="h-64 flex items-center justify-center text-xs text-[#BD5579]/60 font-alata">No revenue data recorded</div>;
  }

  return (
    <div className="h-64 w-full font-alata">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#BD5579" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#FFEBB8" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#fceef3" vertical={false} />
          <XAxis
            dataKey="date"
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
            formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
            labelStyle={{ color: '#BD5579', fontWeight: 600, marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#601D49"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
