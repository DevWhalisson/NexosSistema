import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { IndicatorData } from '../../types';
import './IndicatorCard.css';

interface IndicatorCardProps {
  data: IndicatorData;
  icon: React.ReactNode;
  iconColor: 'blue' | 'green' | 'purple' | 'red';
}

export const IndicatorCard: React.FC<IndicatorCardProps> = ({ data, icon, iconColor }) => {
  const sparklineData = data.sparklineData.map((value) => ({ value }));
  const color = data.trend === 'up' ? '#10B981' : '#EF4444';

  return (
    <div className="indicator-card">
      <div className="indicator-top">
        <div className="indicator-content">
          <span className="indicator-label">{data.label}</span>
          <span className="indicator-value">{data.value}</span>
          <span className={`indicator-change ${data.trend}`}>
            {data.trend === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {data.change}% {data.changeLabel}
          </span>
        </div>
        <div className={`indicator-icon ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className="indicator-sparkline">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparklineData}>
            <defs>
              <linearGradient id={`gradient-${data.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${data.id})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
