export interface IndicatorData {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down';
  sparklineData: number[];
}

export const dashboardIndicators: IndicatorData[] = [
  {
    id: 'revenue',
    label: 'Faturamento do mês',
    value: 'R$ 125.430,00',
    change: 18.6,
    changeLabel: 'vs mês anterior',
    trend: 'up',
    sparklineData: [85000, 92000, 98000, 105000, 112000, 118000, 125430],
  },
  {
    id: 'orders',
    label: 'Pedidos',
    value: '358',
    change: 12.4,
    changeLabel: 'vs mês anterior',
    trend: 'up',
    sparklineData: [280, 295, 310, 325, 338, 348, 358],
  },
  {
    id: 'activeClients',
    label: 'Clientes ativos',
    value: '1.248',
    change: 9.3,
    changeLabel: 'vs mês anterior',
    trend: 'up',
    sparklineData: [1080, 1120, 1150, 1180, 1210, 1235, 1248],
  },
  {
    id: 'criticalStock',
    label: 'Estoque crítico',
    value: '23 itens',
    change: 6.5,
    changeLabel: 'vs mês anterior',
    trend: 'down',
    sparklineData: [32, 30, 28, 26, 25, 24, 23],
  },
];
