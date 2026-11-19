export interface IndicatorData {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down';
  sparklineData: number[];
}

export interface DailySalesData {
  date: string;
  value: number;
  label: string;
}

export interface SellerSalesData {
  name: string;
  value: number;
  formattedValue: string;
}
