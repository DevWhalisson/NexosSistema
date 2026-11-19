import React from 'react';
import { Maximize2, Calendar, LineChart as LineChartIcon } from 'lucide-react';
import { 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { dailySalesData } from '../../data';
import './DailySalesChart.css';

export const DailySalesChart: React.FC = () => {
  const formatCurrency = (value: number) => {
    if (value >= 1000) {
      return `R$ ${value / 1000}k`;
    }
    return `R$ ${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = dailySalesData.find(d => d.date === label);
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{data?.label || label}</p>
          <p className="tooltip-value">
            R$ {payload[0].value.toLocaleString('pt-BR')}
          </p>
        </div>
      );
    }
    return null;
  };

  const filteredData = dailySalesData.filter((_, index) => index % 3 === 0);

  return (
    <div className="daily-sales-chart">
      <div className="chart-header">
        <div className="chart-title-section">
          <h2 className="chart-title">Vendas por dia</h2>
        </div>
        <div className="chart-actions">
          <button className="chart-filter-btn">
            <Calendar size={14} />
            <span>Diário</span>
          </button>
          <button className="chart-filter-btn">
            <LineChartIcon size={14} />
          </button>
          <button className="chart-expand-btn" title="Expandir">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dailySalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1473E6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#1473E6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              ticks={filteredData.map(d => d.date)}
            />
            <YAxis 
              stroke="#94A3B8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#1473E6" 
              strokeWidth={2}
              fill="url(#colorSales)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: '#1473E6', fill: '#fff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
