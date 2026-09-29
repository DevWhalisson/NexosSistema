import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { Pessoas } from './pages/Pessoas';
import { Clientes } from './pages/Clientes';
import { FichaCliente } from './pages/FichaCliente';
import { Comercial } from './pages/Comercial';
import { Estoque } from './pages/Estoque';
import { Financeiro } from './pages/Financeiro';
import { Fiscal } from './pages/Fiscal';
import { Relatorios } from './pages/Relatorios';
import { Placeholder } from './pages/Placeholder';
import './styles/globals.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          
          {/* Pessoas */}
          <Route path="pessoas" element={<Pessoas />} />
          <Route 
            path="pessoas/pessoas" 
            element={<Placeholder title="Pessoas" description="Gerenciamento de pessoas" backPath="/pessoas" />} 
          />
          <Route 
            path="pessoas/clientes" 
            element={<Clientes />} 
          />
          <Route 
            path="pessoas/clientes/:clienteId" 
            element={<FichaCliente />} 
          />
          <Route 
            path="pessoas/fornecedores" 
            element={<Placeholder title="Fornecedores" description="Gerenciamento de fornecedores" backPath="/pessoas" />} 
          />
          <Route 
            path="pessoas/funcionarios" 
            element={<Placeholder title="Funcionários" description="Gerenciamento de funcionários" backPath="/pessoas" />} 
          />
          
          {/* Comercial */}
          <Route path="comercial" element={<Comercial />} />
          <Route 
            path="comercial/vendas" 
            element={<Placeholder title="Vendas" description="Gerenciamento de vendas" backPath="/comercial" />} 
          />
          <Route 
            path="comercial/pdv" 
            element={<Placeholder title="PDV" description="Ponto de vendas" backPath="/comercial" />} 
          />
          <Route 
            path="comercial/comissoes" 
            element={<Placeholder title="Comissões" description="Gestão de comissões" backPath="/comercial" />} 
          />
          <Route 
            path="comercial/orcamentos" 
            element={<Placeholder title="Orçamentos" description="Gerenciamento de orçamentos" backPath="/comercial" />} 
          />
          <Route 
            path="comercial/pedidos" 
            element={<Placeholder title="Pedidos" description="Gerenciamento de pedidos" backPath="/comercial" />} 
          />
          
          {/* Estoque */}
          <Route path="estoque" element={<Estoque />} />
          <Route 
            path="estoque/entradas" 
            element={<Placeholder title="Entradas" description="Registro de entradas no estoque" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/saidas" 
            element={<Placeholder title="Saídas" description="Registro de saídas do estoque" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/transferencias" 
            element={<Placeholder title="Transferências" description="Transferência entre depósitos" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/atual" 
            element={<Placeholder title="Estoque atual" description="Consulta de estoque disponível" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/movimentacoes" 
            element={<Placeholder title="Movimentações" description="Histórico de movimentações" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/historico" 
            element={<Placeholder title="Histórico" description="Histórico completo de estoque" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/inventario" 
            element={<Placeholder title="Inventário" description="Contagem e inventário de estoque" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/lotes" 
            element={<Placeholder title="Lotes" description="Gerenciamento de lotes" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/ajustes" 
            element={<Placeholder title="Ajustes" description="Ajustes de estoque" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/produtos" 
            element={<Placeholder title="Produtos" description="Gerenciamento de produtos" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/categorias" 
            element={<Placeholder title="Categorias" description="Gerenciamento de categorias" backPath="/estoque" />} 
          />
          <Route 
            path="estoque/marcas" 
            element={<Placeholder title="Marcas" description="Gerenciamento de marcas" backPath="/estoque" />} 
          />
          
          {/* Financeiro */}
          <Route path="financeiro" element={<Financeiro />} />
          <Route 
            path="financeiro/visao-geral" 
            element={<Placeholder title="Visão geral" description="Panorama financeiro" backPath="/financeiro" />} 
          />
          <Route 
            path="financeiro/contas-a-pagar" 
            element={<Placeholder title="Contas a pagar" description="Gerenciamento de contas a pagar" backPath="/financeiro" />} 
          />
          <Route 
            path="financeiro/contas-a-receber" 
            element={<Placeholder title="Contas a receber" description="Gerenciamento de contas a receber" backPath="/financeiro" />} 
          />
          <Route 
            path="financeiro/fluxo-de-caixa" 
            element={<Placeholder title="Fluxo de caixa" description="Controle de fluxo de caixa" backPath="/financeiro" />} 
          />
          <Route 
            path="financeiro/caixas" 
            element={<Placeholder title="Caixas" description="Gerenciamento de caixas" backPath="/financeiro" />} 
          />
          <Route 
            path="financeiro/bancos" 
            element={<Placeholder title="Bancos" description="Gerenciamento bancário" backPath="/financeiro" />} 
          />
          <Route 
            path="financeiro/conciliacao" 
            element={<Placeholder title="Conciliação" description="Conciliação bancária" backPath="/financeiro" />} 
          />
          
          {/* Fiscal */}
          <Route path="fiscal" element={<Fiscal />} />
          <Route 
            path="fiscal/notas-fiscais" 
            element={<Placeholder title="Notas fiscais" description="Gerenciamento de notas fiscais" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/nfe" 
            element={<Placeholder title="NF-e" description="Nota Fiscal Eletrônica" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/nfce" 
            element={<Placeholder title="NFC-e" description="Nota Fiscal de Consumidor Eletrônica" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/documentos" 
            element={<Placeholder title="Documentos fiscais" description="Gerenciamento de documentos fiscais" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/tributos" 
            element={<Placeholder title="Tributos" description="Gestão de tributos" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/configuracoes" 
            element={<Placeholder title="Configurações fiscais" description="Configurações do módulo fiscal" backPath="/fiscal" />} 
          />
          
          {/* Relatórios */}
          <Route path="relatorios" element={<Relatorios />} />
          <Route 
            path="relatorios/vendas" 
            element={<Placeholder title="Relatório de Vendas" description="Análise de vendas" backPath="/relatorios" />} 
          />
          <Route 
            path="relatorios/financeiro" 
            element={<Placeholder title="Relatório Financeiro" description="Análise financeira" backPath="/relatorios" />} 
          />
          <Route 
            path="relatorios/estoque" 
            element={<Placeholder title="Relatório de Estoque" description="Análise de estoque" backPath="/relatorios" />} 
          />
          <Route 
            path="relatorios/clientes" 
            element={<Placeholder title="Relatório de Clientes" description="Análise de clientes" backPath="/relatorios" />} 
          />
          <Route 
            path="relatorios/produtos" 
            element={<Placeholder title="Relatório de Produtos" description="Análise de produtos" backPath="/relatorios" />} 
          />
          <Route 
            path="relatorios/gerencial" 
            element={<Placeholder title="Relatório Gerencial" description="Painel gerencial" backPath="/relatorios" />} 
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
