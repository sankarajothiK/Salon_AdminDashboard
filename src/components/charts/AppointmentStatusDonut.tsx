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

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#D4AF37', // Luxury Gold
  SCHEDULED: '#161826', // Dark Accent
  CONFIRMED: '#C5A059', // Deep Warm Gold
  'IN PROGRESS': '#DFB847', // Light Gold
  CANCELLED: '#f43f5e', // Rose
  NOSHOW: '#94a3b8', // Slate
};

export const AppointmentStatusDonut: React.FC<AppointmentStatusDonutProps> = ({ data }) => {
  const activeData = data.filter((d) => d.count > 0);

  if (!activeData.length) {
    return <div className="h-64 flex items-center justify-center text-xs text-[#161826] font-alata font-bold">No appointments recorded</div>;
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
                fill={STATUS_COLORS[entry.status] || '#D4AF37'}
                stroke="#ffffff"
                strokeWidth={2}
              />
            ))}
          </Pie>
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
            formatter={(val: any) => [val, 'Count']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-[#161826] text-xs font-bold">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
