import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle
} from 'lucide-react';
import { IndicatorCard, DailySalesChart, SellerSalesChart } from '../components/dashboard';
import { dashboardIndicators } from '../data';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const getIcon = (id: string) => {
    switch (id) {
      case 'revenue':
        return <DollarSign size={22} />;
      case 'orders':
        return <ShoppingBag size={22} />;
      case 'activeClients':
        return <Users size={22} />;
      case 'criticalStock':
        return <AlertTriangle size={22} />;
      default:
        return <DollarSign size={22} />;
    }
  };

  const getIconColor = (id: string): 'blue' | 'green' | 'purple' | 'red' => {
    switch (id) {
      case 'revenue':
        return 'blue';
      case 'orders':
        return 'green';
      case 'activeClients':
        return 'purple';
      case 'criticalStock':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="welcome-title">Bem-vindo, Administrador! 👋</h1>
          <p className="welcome-subtitle">Confira o desempenho do seu negócio hoje</p>
        </div>
        <div className="header-actions">
          <button className="period-btn">
            <Calendar size={16} />
            <span>Período</span>
            <span style={{ color: 'var(--text-muted)' }}>10/07/2026 até 09/08/2026</span>
          </button>
          <button className="filter-btn" title="Filtros">
            <Calendar size={16} />
          </button>
        </div>
      </div>

      <div className="indicators-grid">
        {dashboardIndicators.map((indicator) => (
          <IndicatorCard 
            key={indicator.id} 
            data={indicator}
            icon={getIcon(indicator.id)}
            iconColor={getIconColor(indicator.id)}
          />
        ))}
      </div>

      <div className="charts-grid">
        <div className="chart-main">
          <DailySalesChart />
        </div>
        <div className="chart-secondary">
          <SellerSalesChart />
        </div>
      </div>
    </div>
  );
};
