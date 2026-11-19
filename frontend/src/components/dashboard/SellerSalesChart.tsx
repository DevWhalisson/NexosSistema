import React from 'react';
import { Filter } from 'lucide-react';
import { sellerSalesData } from '../../data';
import './SellerSalesChart.css';

export const SellerSalesChart: React.FC = () => {
  const maxValue = Math.max(...sellerSalesData.map(seller => seller.value));
  
  const updatedData = sellerSalesData.map(seller => ({
    ...seller,
    name: seller.name === 'Administrador' ? 'Você (Administrador)' : seller.name
  }));

  return (
    <div className="seller-sales-chart">
      <div className="seller-header">
        <h2 className="seller-title">Vendas por vendedor</h2>
        <button className="seller-filter-btn">
          <Filter size={14} />
          <span>Este período</span>
        </button>
      </div>
      <div className="seller-list">
        {updatedData.map((seller, index) => (
          <div key={index} className="seller-item">
            <div className="seller-info">
              <span className="seller-name">{seller.name}</span>
              <span className="seller-value">{seller.formattedValue}</span>
            </div>
            <div className="seller-bar-container">
              <div 
                className="seller-bar"
                style={{ width: `${(seller.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
