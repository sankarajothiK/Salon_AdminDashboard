import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface AppointmentStatusDonutProps {
  data: { status: string; count: number }[];
}

const PALETTE_STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#059669', // emerald
  SCHEDULED: '#FFEBB8', // Cream
  CONFIRMED: '#BD5579', // Berry
  'IN PROGRESS': '#601D49', // Plum
  CANCELLED: '#EA9D9D', // Blush
  NOSHOW: '#94a3b8', // slate
};

export const AppointmentStatusDonut: React.FC<AppointmentStatusDonutProps> = ({ data }) => {
  const activeData = data.filter((d) => d.count > 0);

  if (!activeData.length) {
    return <div className="h-64 flex items-center justify-center text-xs text-[#BD5579]/60 font-alata">No appointments recorded</div>;
  }

  return (
    <div className="h-64 w-full font-alata">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="count"
            nameKey="status"
          >
            {activeData.map((entry) => (
              <Cell
                key={`cell-${entry.status}`}
                fill={PALETTE_STATUS_COLORS[entry.status] || '#BD5579'}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
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
            formatter={(val: any) => [val, 'Count']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-[#601D49] text-xs font-bold">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
