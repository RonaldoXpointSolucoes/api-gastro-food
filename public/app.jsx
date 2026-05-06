const { useState, useEffect, useRef, memo } = React;

const Icon = memo(({ name, className }) => {
  const ref = useRef();
  useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = `<i data-lucide="${name}" class="${className || ''}"></i>`;
      window.lucide.createIcons({ root: ref.current });
    }
  }, [name, className]);
  return <span ref={ref} className="inline-flex items-center justify-center" />;
});

const App = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fkStore: '', softwareName: '' });
  const [creating, setCreating] = useState(false);
  
  // Confirmação para exclusão
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Estados para Modal de Pedidos (Master-Detail)
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeOrders, setStoreOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/tokens');
      const data = await res.json();
      setTokens(data);
    } catch (err) {
      console.error('Erro ao buscar tokens', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ fkStore: '', softwareName: '' });
        fetchTokens();
      } else {
        const err = await res.json();
        alert('Erro: ' + err.error);
      }
    } catch (err) {
      console.error(err);
      alert('Erro na requisição');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/admin/tokens/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTokens(tokens.filter(t => t.id !== id));
        setConfirmDelete(null);
      } else {
        alert('Erro ao excluir token');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openStoreOrders = async (fkStore) => {
    setSelectedStore(fkStore);
    setLoadingOrders(true);
    setSelectedOrder(null);
    try {
      const res = await fetch(`/api/admin/orders/${fkStore}`);
      const data = await res.json();
      setStoreOrders(data || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 pt-12">
      {/* Header animate-in */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 animate-in-slide opacity-0" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/20">
            <Icon name="shield-check" className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Credenciais</h1>
            <p className="text-zinc-400 mt-1 text-sm">Gastro Food API - Controle de acesso de integrações ERP</p>
          </div>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-zinc-100 text-zinc-900 hover:bg-white px-5 py-2.5 rounded-2xl font-medium transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
        >
          <Icon name="plus" className="w-4 h-4" />
          Novo Acesso
        </button>
      </header>

      {/* Content */}
      <main className="animate-in-slide opacity-0" style={{animationDelay: '0.2s'}}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Icon name="loader-2" className="w-8 h-8 animate-spin mb-4 text-primary" />
            <p>Carregando credenciais...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border border-dashed border-zinc-700">
            <div className="w-16 h-16 bg-surfaceHover rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Icon name="key" className="w-8 h-8 text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum acesso criado</h3>
            <p className="text-zinc-400 max-w-md mx-auto">Você ainda não gerou nenhuma credencial. Crie um novo acesso para permitir que softwares parceiros integrem com a Gastro Food API.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tokens.map((token, index) => (
              <div 
                key={token.id} 
                className="glass-panel rounded-3xl p-6 relative group overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 animate-in-fade opacity-0"
                style={{animationDelay: `${0.1 * (index + 1)}s`}}
              >
                {/* Status Indicator */}
                <div className="absolute top-6 right-6 flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-medium text-emerald-400">Ativo</span>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-surfaceHover flex items-center justify-center text-primary border border-zinc-700/50">
                    <Icon name="server" className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white leading-tight">{token.softwareName || 'Software API'}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">Criado em {new Date(token.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-1">Store ID (fkStore)</p>
                    <div className="bg-surface rounded-xl p-2.5 text-xs text-zinc-300 font-mono border border-zinc-800/80 flex justify-between items-center group/copy">
                      <span className="break-all">{token.fkStore}</span>
                      <button onClick={() => handleCopy(token.fkStore, token.id + 'store')} className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-700 transition-colors opacity-0 group-hover/copy:opacity-100 shrink-0 ml-2">
                        <Icon name={copiedId === token.id + 'store' ? 'check' : 'copy'} className={copiedId === token.id + 'store' ? 'w-4 h-4 text-emerald-400' : 'w-4 h-4'} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-medium mb-1">Bearer Token</p>
                    <div className="bg-surface rounded-xl p-2.5 text-xs text-primary font-mono border border-zinc-800/80 group-hover:border-primary/20 transition-colors flex justify-between items-center group/copy">
                      <span className="truncate">{token.token.substring(0, 16)}••••••••••••••••••••••••••••</span>
                      <button onClick={() => handleCopy(token.token, token.id + 'bearer')} className="text-primary hover:text-white p-1.5 rounded-lg hover:bg-primary/20 transition-colors opacity-0 group-hover/copy:opacity-100 shrink-0 ml-2">
                        <Icon name={copiedId === token.id + 'bearer' ? 'check' : 'copy'} className={copiedId === token.id + 'bearer' ? 'w-4 h-4 text-emerald-400' : 'w-4 h-4'} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center h-14">
                  {confirmDelete === token.id ? (
                    <div className="flex items-center gap-2 w-full animate-in-fade">
                      <span className="text-xs text-danger font-medium flex-1">Tem certeza?</span>
                      <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-white bg-surfaceHover hover:bg-zinc-700 transition-colors">
                        Cancelar
                      </button>
                      <button onClick={() => handleDelete(token.id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-danger hover:bg-red-600 transition-colors flex items-center gap-1">
                        Excluir
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => openStoreOrders(token.fkStore)}
                        className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white bg-surfaceHover hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-zinc-600"
                      >
                        <Icon name="shopping-bag" className="w-3.5 h-3.5" />
                        Ver Pedidos
                      </button>
                      <button 
                        onClick={() => setConfirmDelete(token.id)}
                        className="text-zinc-500 hover:text-danger p-2 rounded-xl hover:bg-danger/10 transition-colors"
                        title="Excluir Acesso"
                      >
                        <Icon name="trash-2" className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Criar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="glass-panel w-full max-w-md rounded-[2rem] overflow-hidden relative z-10 animate-in-slide opacity-0 shadow-2xl border-zinc-800">
            <div className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary border border-primary/20">
                <Icon name="network" className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Novo Acesso API</h2>
              <p className="text-sm text-zinc-400 mb-8">Gere um Token seguro para um ERP ou Software externo acessar os pedidos de uma loja específica.</p>

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">UUID da Empresa (fkStore) *</label>
                  <div className="relative">
                    <Icon name="store" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" 
                      className="w-full bg-surface border border-zinc-700/50 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-zinc-600"
                      value={formData.fkStore}
                      onChange={e => setFormData({...formData, fkStore: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 ml-1">Nome do Software ERP</label>
                  <div className="relative">
                    <Icon name="layout-dashboard" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Ex: Sistema XPoint, ContaAzul..." 
                      className="w-full bg-surface border border-zinc-700/50 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:text-zinc-600"
                      value={formData.softwareName}
                      onChange={e => setFormData({...formData, softwareName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-3 rounded-2xl text-sm font-medium text-zinc-300 hover:text-white bg-surfaceHover hover:bg-zinc-700 transition-colors border border-transparent hover:border-zinc-600"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating}
                    className="flex-1 px-4 py-3 rounded-2xl text-sm font-medium text-zinc-900 bg-white hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    {creating ? (
                      <Icon name="loader-2" className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Icon name="check" className="w-4 h-4" />
                        Gerar Token
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal/Overlay de Pedidos (Master-Detail) */}
      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => { setSelectedStore(null); setSelectedOrder(null); }}></div>
          
          <div className="bg-[#121214] w-full max-w-6xl h-[90vh] rounded-[2rem] overflow-hidden relative z-10 animate-in-slide opacity-0 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-zinc-800 flex flex-col">
            {/* Header Overlay */}
            <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-surface/50 backdrop-blur-md z-20">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setSelectedStore(null); setSelectedOrder(null); }}
                  className="w-10 h-10 rounded-xl bg-surfaceHover hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  <Icon name="arrow-left" className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Icon name="shopping-bag" className="w-5 h-5 text-primary" />
                    Pedidos da Loja
                  </h2>
                  <p className="text-xs text-zinc-500 font-mono mt-0.5 tracking-wider hidden sm:block">{selectedStore}</p>
                </div>
              </div>
              <button 
                onClick={() => openStoreOrders(selectedStore)} 
                className="flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white bg-surfaceHover hover:bg-zinc-700 px-4 py-2 rounded-xl transition-colors"
              >
                <Icon name="refresh-cw" className="w-4 h-4" />
                <span className="hidden sm:inline">Atualizar Lista</span>
              </button>
            </div>

            {/* Body Master-Detail */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
              {/* Painel Esquerdo: Lista de Pedidos */}
              <div className={`flex-1 overflow-y-auto p-6 scrollbar-thin ${selectedOrder ? 'hidden md:block md:w-1/3 md:max-w-[400px] border-r border-zinc-800/80' : ''}`}>
                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <Icon name="loader-2" className="w-8 h-8 animate-spin mb-4 text-primary" />
                    <p>Carregando pedidos...</p>
                  </div>
                ) : storeOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-surfaceHover rounded-2xl flex items-center justify-center mb-4 border border-zinc-800">
                      <Icon name="inbox" className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-300">Nenhum pedido</h3>
                    <p className="text-sm text-zinc-500 mt-1 max-w-xs">Ainda não recebemos integrações para esta credencial.</p>
                  </div>
                ) : (
                  <div className={selectedOrder ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
                    {storeOrders.map((order, idx) => {
                      const isSelected = selectedOrder?.id === order.id;
                      return (
                        <div 
                          key={order.id} 
                          onClick={() => setSelectedOrder(order)}
                          className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border animate-in-fade opacity-0 group
                            ${isSelected 
                              ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,100,255,0.1)] ring-1 ring-primary/20' 
                              : 'bg-surface border-zinc-800/50 hover:border-zinc-600 hover:bg-surfaceHover'}
                          `}
                          style={{animationDelay: `${Math.min(idx * 0.05, 0.5)}s`}}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                              order.module === 1 ? 'bg-indigo-500/10 text-indigo-400' :
                              order.module === 2 ? 'bg-amber-500/10 text-amber-400' :
                              'bg-emerald-500/10 text-emerald-400'
                            }`}>
                              {order.module === 1 ? 'Delivery' : order.module === 2 ? 'Balcão' : 'Mesa ' + (order.table || '')}
                            </span>
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">R$ {order.received?.toFixed(2) || '0.00'}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <Icon name="user" className="w-3.5 h-3.5 text-zinc-500" />
                              <span className="truncate font-medium text-zinc-300">{order.accessName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                              <Icon name="credit-card" className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{order.pagto} {order.pagto === 'CREDIT' && <span className="ml-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[9px]">{order.transaction?.cardBrand}</span>}</span>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-800/50">
                              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Icon name="clock" className="w-3.5 h-3.5" />
                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </div>
                              <span className="text-[10px] text-zinc-400 bg-surfaceHover px-1.5 py-0.5 rounded">
                                {order.items?.length || 0} itens
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Painel Direito: Detalhe Fundo (Nível 3) */}
              {selectedOrder ? (
                <div className="flex-[2] overflow-y-auto bg-[#0a0a0c] relative animate-in-slide-left opacity-0 p-6 md:p-8 scrollbar-thin">
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="md:hidden absolute top-4 right-4 w-8 h-8 rounded-full bg-surface border border-zinc-800 flex items-center justify-center text-zinc-400"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                  
                  {/* Cabeçalho do Detalhe */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold text-white">Pedido <span className="text-zinc-500 font-mono">#{selectedOrder.id.split('-')[0]}</span></h3>
                        {selectedOrder.integrated ? (
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                            <Icon name="check-circle-2" className="w-3 h-3" /> Integrado
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                            <Icon name="clock-3" className="w-3 h-3" /> Pendente
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <Icon name="calendar" className="w-4 h-4 text-zinc-500" />
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-surface border border-zinc-800/80 rounded-2xl p-4 text-right min-w-[140px] shadow-lg">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Valor Recebido</p>
                      <p className="text-3xl font-bold text-emerald-400">R$ {selectedOrder.received?.toFixed(2)}</p>
                      {selectedOrder.discount > 0 && (
                        <p className="text-xs text-danger mt-1">Desconto: - R$ {selectedOrder.discount.toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  {/* Grid de Informações Secundárias */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-8">
                    {/* Cliente Info */}
                    <div className="bg-surface rounded-2xl p-5 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Icon name="user-circle" className="w-4 h-4 text-primary" />
                        Dados do Cliente
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-500">Nome</span>
                          <span className="text-sm font-medium text-zinc-200">{selectedOrder.accessName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-500">CPF</span>
                          <span className="text-sm font-medium text-zinc-200">{selectedOrder.cpf || 'Não informado'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-500">Telefone</span>
                          <span className="text-sm font-medium text-zinc-200">{selectedOrder.phone || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pagamento Info */}
                    <div className="bg-surface rounded-2xl p-5 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors">
                      <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <Icon name="wallet" className="w-4 h-4 text-primary" />
                        Informações de Pagamento
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-500">Método</span>
                          <span className="text-sm font-medium text-zinc-200">{selectedOrder.pagto}</span>
                        </div>
                        {selectedOrder.transaction && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500">Transação Cartão</span>
                            <span className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                              {selectedOrder.transaction.cardBrand} <span className="text-zinc-600">|</span> {selectedOrder.transaction.installments}x
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-zinc-500">Subtotal Bruto</span>
                          <span className="text-sm font-medium text-zinc-200">R$ {selectedOrder.subTotal?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Itens do Pedido */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2 px-1">
                      <Icon name="package-open" className="w-4 h-4 text-primary" />
                      Produtos Solicitados ({selectedOrder.items?.length || 0})
                    </h4>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item, idx) => (
                        <div key={item.id || idx} className="bg-surface rounded-2xl p-4 border border-zinc-800/50 flex gap-4 hover:bg-surfaceHover transition-colors">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-zinc-900 flex-shrink-0 overflow-hidden border border-zinc-800">
                            <img src={item.imgProd || 'https://placehold.co/100x100?text=Item'} alt={item.name} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1 gap-1">
                              <h5 className="font-medium text-zinc-200 truncate pr-2"><span className="text-primary font-bold mr-1">{item.amount}x</span> {item.name}</h5>
                              <span className="font-bold text-white whitespace-nowrap">R$ {item.price?.toFixed(2)}</span>
                            </div>
                            
                            {/* Complementos e Observações */}
                            {item.complement && (
                              <div className="flex items-start gap-1.5 mt-2">
                                <Icon name="message-square" className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                                <p className="text-xs text-amber-500/90 font-medium">{item.complement}</p>
                              </div>
                            )}
                            
                            {/* Adicionais Custon */}
                            {item.itemsCuston && item.itemsCuston.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-zinc-800/50">
                                <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2 font-semibold">Adicionais Customizados</p>
                                <div className="space-y-1.5">
                                  {item.itemsCuston.map((cust, cIdx) => (
                                    <div key={cust.id || cIdx} className="flex justify-between items-center text-xs text-zinc-400 bg-black/20 p-2 rounded-lg">
                                      <span className="flex items-center gap-2">
                                        <span className="bg-zinc-800 px-1.5 rounded text-[10px] text-zinc-300">+{cust.amount}</span>
                                        {cust.name}
                                      </span>
                                      <span className="font-medium text-zinc-300">R$ {cust.price?.toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
