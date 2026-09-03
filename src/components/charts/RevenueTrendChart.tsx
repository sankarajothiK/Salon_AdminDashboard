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
    return <div className="h-64 flex items-center justify-center text-xs text-emerald-800 font-alata font-bold">No revenue data recorded</div>;
  }

  return (
    <div className="h-64 w-full font-alata">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ecfdf5" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#065f46"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            fontWeight="bold"
          />
          <YAxis
            stroke="#065f46"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            fontWeight="bold"
            tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderColor: '#059669',
              borderRadius: '0.75rem',
              color: '#000000',
              boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.15)',
              fontSize: '12px',
              fontFamily: 'Alata, sans-serif',
              fontWeight: 'bold',
            }}
            formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
            labelStyle={{ color: '#064e3b', fontWeight: 'bold', marginBottom: '4px' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#059669"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
