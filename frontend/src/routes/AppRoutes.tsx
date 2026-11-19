import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { Placeholder } from '../components/common';
import { Dashboard } from '../pages/dashboard/Dashboard';
import { Pessoas } from '../pages/cadastros/Pessoas';
import { Clientes } from '../pages/cadastros/clientes/Clientes';
import { FichaCliente } from '../pages/cadastros/clientes/FichaCliente';
import { Fornecedores } from '../pages/cadastros/fornecedores/Fornecedores';
import { FichaFornecedor } from '../pages/cadastros/fornecedores/FichaFornecedor';
import { Produtos } from '../pages/cadastros/produtos/Produtos';
import { FichaProduto } from '../pages/cadastros/produtos/FichaProduto';
import { Usuarios } from '../pages/cadastros/usuarios/Usuarios';
import { FichaUsuario } from '../pages/cadastros/usuarios/FichaUsuario';
import { Estoque } from '../pages/estoque/Estoque';
import { Financeiro } from '../pages/financeiro/Financeiro';
import { Fiscal } from '../pages/fiscal/Fiscal';
import { Relatorios } from '../pages/relatorios/Relatorios';
import { Configuracoes } from '../pages/configuracoes/Configuracoes';
import { Suporte } from '../pages/suporte/Suporte';
import { Notificacoes } from '../pages/notificacoes/Notificacoes';

/** Mantém links antigos de produtos funcionando, sem exibir o item em Cadastros. */
const RedirecionarProduto = () => {
  const { produtoId } = useParams<{ produtoId: string }>();
  const location = useLocation();
  const destino = produtoId
    ? `/estoque/produtos/${produtoId}${location.search}`
    : `/estoque/produtos${location.search}`;
  return <Navigate to={destino} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
          
          {/* Cadastros */}
          <Route path="cadastros" element={<Pessoas />} />
          <Route 
            path="cadastros/pessoas" 
            element={<Placeholder title="Pessoas" description="Gerenciamento de pessoas" backPath="/cadastros" />} 
          />
          <Route 
            path="cadastros/clientes" 
            element={<Clientes />} 
          />
          <Route 
            path="cadastros/clientes/:clienteId" 
            element={<FichaCliente />} 
          />
          <Route 
            path="cadastros/fornecedores" 
            element={<Fornecedores />} 
          />
          <Route 
            path="cadastros/fornecedores/:fornecedorId" 
            element={<FichaFornecedor />} 
          />
          {/* Compatibilidade: produtos agora pertencem ao módulo Estoque. */}
          <Route path="cadastros/produtos" element={<RedirecionarProduto />} />
          <Route path="cadastros/produtos/:produtoId" element={<RedirecionarProduto />} />
          {/* Alias de rota solicitado na especificação do módulo */}
          <Route path="pessoas/fornecedores" element={<Fornecedores />} />
          <Route path="pessoas/fornecedores/:fornecedorId" element={<FichaFornecedor />} />
          <Route 
            path="cadastros/usuarios" 
            element={<Usuarios />} 
          />
          <Route 
            path="cadastros/usuarios/:usuarioId" 
            element={<FichaUsuario />} 
          />
          <Route 
            path="cadastros/funcionarios" 
            element={<Usuarios />} 
          />
          <Route 
            path="cadastros/funcionarios/:usuarioId" 
            element={<FichaUsuario />} 
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
          <Route path="estoque/produtos" element={<Produtos />} />
          <Route path="estoque/produtos/:produtoId" element={<FichaProduto />} />
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
            path="fiscal/vendas" 
            element={<Placeholder title="Vendas" description="Gerenciamento de vendas" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/pdv" 
            element={<Placeholder title="PDV" description="Ponto de vendas" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/comissoes" 
            element={<Placeholder title="Comissões" description="Gestão de comissões" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/orcamentos" 
            element={<Placeholder title="Orçamentos" description="Gerenciamento de orçamentos" backPath="/fiscal" />} 
          />
          <Route 
            path="fiscal/pedidos" 
            element={<Placeholder title="Pedidos" description="Gerenciamento de pedidos" backPath="/fiscal" />} 
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

          {/* Configurações */}
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route 
            path="configuracoes/empresa" 
            element={<Placeholder title="Dados da empresa" description="Identificação, CNPJ e endereço" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/identidade" 
            element={<Placeholder title="Logotipo e identidade" description="Logotipo e identidade visual do sistema" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/niveis-de-acesso" 
            element={<Placeholder title="Níveis de acesso" description="Perfis de acesso e permissões" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/seguranca" 
            element={<Placeholder title="Senhas e políticas" description="Políticas de senha e segurança" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/fiscais" 
            element={<Placeholder title="Configurações fiscais" description="Configurações do módulo fiscal" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/fiscal-serie" 
            element={<Placeholder title="Série e numeração" description="Série e numeração de documentos fiscais" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/fiscal-produtos" 
            element={<Placeholder title="Produtos e serviços (NCM)" description="Códigos NCM de produtos e serviços" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/depositos" 
            element={<Placeholder title="Depósitos e locais" description="Depósitos e locais de estoque" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/unidades" 
            element={<Placeholder title="Unidades de medida" description="Unidades de medida de produtos" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/moedas" 
            element={<Placeholder title="Moedas" description="Moedas e bandeiras utilizadas" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/formas-pagamento" 
            element={<Placeholder title="Formas de pagamento" description="Formas de pagamento e condições" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/parametros" 
            element={<Placeholder title="Parâmetros do sistema" description="Parâmetros gerais do sistema" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/logs" 
            element={<Placeholder title="Logs e auditoria" description="Histórico de operações do sistema" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/backup" 
            element={<Placeholder title="Backup e restauração" description="Backup e restauração de dados" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/integracoes" 
            element={<Placeholder title="Integrações" description="Integrações com serviços externos" backPath="/configuracoes" />} 
          />
          <Route 
            path="configuracoes/sobre" 
            element={<Placeholder title="Sobre o sistema" description="Informações do sistema" backPath="/configuracoes" />} 
          />

          {/* Suporte */}
          <Route path="suporte" element={<Suporte />} />
          <Route 
            path="suporte/duvidas" 
            element={<Placeholder title="Perguntas frequentes" description="Dúvidas mais comuns sobre o sistema" backPath="/suporte" />} 
          />
          <Route 
            path="suporte/manuais" 
            element={<Placeholder title="Manuais do sistema" description="Manuais de uso do Nexos" backPath="/suporte" />} 
          />
          <Route 
            path="suporte/procedimentos" 
            element={<Placeholder title="Roteiros de procedimentos" description="Passo a passo das rotinas do sistema" backPath="/suporte" />} 
          />
          <Route 
            path="suporte/abrir-chamado" 
            element={<Placeholder title="Abrir chamado" description="Registro de uma solicitação de suporte" backPath="/suporte" />} 
          />
          <Route 
            path="suporte/chamados" 
            element={<Placeholder title="Meus chamados" description="Acompanhamento dos chamados abertos" backPath="/suporte" />} 
          />

          {/* Notificações */}
          <Route path="notificacoes" element={<Notificacoes />} />
        </Route>
    </Routes>
  );
};
