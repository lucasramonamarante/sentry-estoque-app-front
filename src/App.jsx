import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Edit, Box, DollarSign, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, History, X, BarChart2, Lock, UserCircle, LogOut, ShieldCheck, PieChart as PieIcon, PackageOpen, Users, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import logoFoquinha from './assets/logo.png';

// --- CONFIGURAÇÃO DA API (PRODUÇÃO KOYEB) ---
axios.defaults.baseURL = 'https://big-blondelle-33techsentrycomunicacao-dd0eca2b.koyeb.app';

const CORES_PIZZA = ['#1e3a8a', '#eab308', '#3b82f6', '#ef4444', '#10b981'];

function App() {
  // --- ESTADOS GERAIS ---
  const [usuario, setUsuario] = useState(null);
  const [formLogin, setFormLogin] = useState({ email: '', senha: '' });
  const [abaAtiva, setAbaAtiva] = useState('estoque');
  
  // --- ESTADOS DA EQUIPE ---
  const [equipe, setEquipe] = useState([]);
  const [formNovoUser, setFormNovoUser] = useState({ nome: '', email: '', senha: '', perfil: 'OPERADOR' });

  // --- ESTADOS DO ESTOQUE ---
  const [produtos, setProdutos] = useState([]);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [dadosPerformance, setDadosPerformance] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({
    sku: '', nome: '', preco_custo: '', preco_venda: '', quantidade_atual: '', quantidade_minima: ''
  });

  const [modalAtivo, setModalAtivo] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [tipoMovimentacao, setTipoMovimentacao] = useState('ENTRADA');
  const [formMov, setFormMov] = useState({ quantidade: '', motivo: '' });
  const [historico, setHistorico] = useState([]);

  // --- FUNÇÕES DE CARREGAMENTO E LOGIN ---
  const carregarPainel = async () => {
    try {
      const [resProd, resGraf, resPerf] = await Promise.all([
        axios.get('/produtos'),
        axios.get('/dashboard/movimentacoes'),
        axios.get('/dashboard/performance-vendas')
      ]);
      setProdutos(resProd.data);
      setDadosGrafico(resGraf.data);
      setDadosPerformance(resPerf.data);

      if (usuario?.perfil === 'ADMIN') {
        const resEquipe = await axios.get('/usuarios');
        setEquipe(resEquipe.data);
      }
    } catch (erro) { console.error("Erro ao carregar dados:", erro); }
  };

  useEffect(() => {
    if (usuario) carregarPainel();
  }, [usuario, abaAtiva]);

  const fazerLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/login', formLogin);
      setUsuario(res.data.usuario);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setAbaAtiva('estoque');
    } catch (erro) { alert('Credenciais Inválidas'); }
  };

  const fazerLogout = () => {
    setUsuario(null);
    setFormLogin({ email: '', senha: '' });
    delete axios.defaults.headers.common['Authorization'];
  };

  // --- FUNÇÕES DE EQUIPE ---
  const cadastrarUsuario = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/cadastro', { ...formNovoUser, solicitante_perfil: usuario.perfil });
      alert('Membro cadastrado com sucesso!');
      setFormNovoUser({ nome: '', email: '', senha: '', perfil: 'OPERADOR' });
      carregarPainel();
    } catch (erro) { alert('Erro ao cadastrar usuário.'); }
  };

  // --- FUNÇÕES DE ESTOQUE ---
  const salvarProduto = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        sku: form.sku, nome: form.nome, preco_custo: parseFloat(form.preco_custo),
        preco_venda: parseFloat(form.preco_venda), quantidade_atual: parseInt(form.quantidade_atual),
        quantidade_minima: parseInt(form.quantidade_minima)
      };
      if (editandoId) await axios.put(`/produtos/${editandoId}`, payload);
      else await axios.post('/produtos', payload);
      setEditandoId(null);
      setForm({ sku: '', nome: '', preco_custo: '', preco_venda: '', quantidade_atual: '', quantidade_minima: '' });
      carregarPainel();
    } catch (erro) { alert('Erro ao salvar produto.'); }
  };

  const deletarProduto = async (id) => {
    if (!window.confirm("Excluir definitivamente este produto?")) return;
    try {
      await axios.delete(`/produtos/${id}`);
      carregarPainel();
    } catch (erro) { alert('Erro ao excluir.'); }
  };

  const abrirModal = async (produto, tipo) => {
    setProdutoSelecionado(produto);
    setTipoMovimentacao(tipo);
    setFormMov({ quantidade: '', motivo: '' });
    if (tipo === 'HISTORICO') {
      try {
        const res = await axios.get(`/movimentacoes/${produto.id}`);
        setHistorico(res.data);
      } catch (err) { alert("Erro ao buscar histórico"); }
    }
    setModalAtivo(true);
  };

  const registrarMovimentacao = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/movimentacoes', {
        produto_id: produtoSelecionado.id, tipo: tipoMovimentacao,
        quantidade: parseInt(formMov.quantidade), motivo: formMov.motivo,
        usuario_id: usuario.id
      });
      setModalAtivo(false);
      carregarPainel();
    } catch (erro) { alert('Erro na movimentação.'); }
  };

  // --- TELA DE LOGIN ---
  if (!usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-100">
          <div className="flex justify-center mb-8 h-24 bg-sky-50 rounded-2xl p-4 border border-blue-100 shadow-inner">
            <img src={logoFoquinha} alt="Logo" className="h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-blue-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-gray-500 mb-8 font-medium">Faça login para gerenciar o sistema.</p>
          <form onSubmit={fazerLogin} className="flex flex-col gap-5">
            <input type="email" placeholder="E-mail corporativo" required value={formLogin.email} onChange={e => setFormLogin({...formLogin, email: e.target.value})} className="p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-700" />
            <input type="password" placeholder="Sua senha" required value={formLogin.senha} onChange={e => setFormLogin({...formLogin, senha: e.target.value})} className="p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-all text-gray-700" />
            <button className="bg-yellow-400 text-blue-950 p-4 rounded-xl font-black hover:bg-yellow-500 transition-colors shadow-lg mt-2 text-lg">Entrar no Painel</button>
          </form>
        </div>
      </div>
    );
  }

  const isAdmin = usuario.perfil === 'ADMIN';
  const totalItens = produtos.reduce((acc, p) => acc + p.quantidade_atual, 0);
  const valorEstoque = produtos.reduce((acc, p) => acc + (p.quantidade_atual * p.preco_custo), 0);
  const alertas = produtos.filter(p => p.quantidade_atual < p.quantidade_minima).length;

  // --- TELA PRINCIPAL (LOGADO) ---
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white border-b-4 border-yellow-400 p-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="bg-white p-2 rounded-xl shadow-inner h-14 flex items-center justify-center">
              <img src={logoFoquinha} alt="Logo" className="h-full object-contain" />
            </div>
            
            <nav className="hidden md:flex gap-2">
              <button onClick={() => setAbaAtiva('estoque')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${abaAtiva === 'estoque' ? 'bg-yellow-400 text-blue-900' : 'hover:bg-blue-800/50'}`}>
                <Package size={18} /> Painel de Estoque
              </button>
              {isAdmin && (
                <button onClick={() => setAbaAtiva('usuarios')} className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${abaAtiva === 'usuarios' ? 'bg-yellow-400 text-blue-900' : 'hover:bg-blue-800/50'}`}>
                  <Users size={18} /> Gestão de Equipe
                </button>
              )}
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm">{usuario.nome}</p>
              <p className="text-xs text-blue-200 flex items-center justify-end gap-1"><ShieldCheck size={12} /> {usuario.perfil}</p>
            </div>
            <button onClick={fazerLogout} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition backdrop-blur-sm"><LogOut size={20}/></button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 mt-6">
        {abaAtiva === 'usuarios' && isAdmin ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2"><Plus className="text-blue-600"/> Novo Membro</h2>
              <form onSubmit={cadastrarUsuario} className="flex flex-col gap-4">
                <input placeholder="Nome Completo" value={formNovoUser.nome} onChange={e => setFormNovoUser({...formNovoUser, nome: e.target.value})} className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" required />
                <input type="email" placeholder="E-mail de Acesso" value={formNovoUser.email} onChange={e => setFormNovoUser({...formNovoUser, email: e.target.value})} className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" required />
                <input type="password" placeholder="Senha Provisória" value={formNovoUser.senha} onChange={e => setFormNovoUser({...formNovoUser, senha: e.target.value})} className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600" required />
                <select value={formNovoUser.perfil} onChange={e => setFormNovoUser({...formNovoUser, perfil: e.target.value})} className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-600 font-bold text-gray-700">
                  <option value="OPERADOR">OPERADOR (Recepção)</option>
                  <option value="ADMIN">GERENTE / ADMIN</option>
                </select>
                <button className="bg-blue-900 text-white p-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-md mt-2">Criar Acesso</button>
              </form>
            </div>
            
            <div className="lg:col-span-2">
              <h2 className="text-xl font-black text-gray-800 mb-6">Equipe Cadastrada</h2>
              <div className="grid grid-cols-1 gap-4">
                {equipe.map(u => (
                  <div key={u.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-full text-blue-600"><UserCircle size={24}/></div>
                      <div>
                        <p className="font-bold text-gray-800">{u.nome}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${u.perfil === 'ADMIN' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>{u.perfil}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
        <div className="animate-in fade-in duration-500">
          <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-10`}>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><Box size={32} /></div>
              <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Estoque Total</p><p className="text-3xl font-black text-gray-800 mt-1">{totalItens} <span className="text-lg font-medium text-gray-500">un</span></p></div>
            </div>
            
            {isAdmin && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
                <div className="bg-green-50 p-4 rounded-2xl text-green-600"><DollarSign size={32} /></div>
                <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Patrimônio (Custo)</p><p className="text-3xl font-black text-green-600 mt-1">R$ {valorEstoque.toFixed(2)}</p></div>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
              <div className="bg-red-50 p-4 rounded-2xl text-red-500"><AlertTriangle size={32} /></div>
              <div><p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Alertas</p><p className="text-3xl font-black text-red-500 mt-1">{alertas}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-2 text-lg"><PieIcon size={22} className="text-blue-600" /> Performance de Saídas</h3>
              <div className="h-64">
                {dadosPerformance.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-slate-50 rounded-xl border-2 border-dashed border-gray-200"><PieIcon size={48} className="mb-2 text-gray-300" /><p className="text-sm font-medium">Sem dados de saída.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={dadosPerformance} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>{dadosPerformance.map((entry, index) => <Cell key={`cell-${index}`} fill={CORES_PIZZA[index % CORES_PIZZA.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-2 text-lg"><BarChart2 size={22} className="text-blue-600" /> Mais Movimentados</h3>
              <div className="h-64">
                {dadosGrafico.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-slate-50 rounded-xl border-2 border-dashed border-gray-200"><BarChart2 size={48} className="mb-2 text-gray-300" /><p className="text-sm font-medium">Aguardando movimentações.</p></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico} layout="vertical" margin={{ left: -20, right: 20 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" /><XAxis type="number" hide /><YAxis dataKey="nome" type="category" width={100} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} /><Tooltip cursor={{fill: '#f8fafc'}} /><Bar dataKey="Movimentacoes" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} /></BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {isAdmin && (
              <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h2 className="text-xl font-black mb-6 text-gray-800 flex items-center gap-2">
                  {editandoId ? <Edit className="text-blue-600"/> : <Plus className="text-blue-600"/>} {editandoId ? 'Editar Item' : 'Novo Produto'}
                </h2>
                <form onSubmit={salvarProduto} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Código SKU</label>
                    <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Nome do Produto</label>
                    <input value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Custo (R$)</label>
                      <input type="number" step="0.01" value={form.preco_custo} onChange={e => setForm({...form, preco_custo: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Venda (R$)</label>
                      <input type="number" step="0.01" value={form.preco_venda} onChange={e => setForm({...form, preco_venda: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Qtd Atual</label>
                      <input type="number" value={form.quantidade_atual} onChange={e => setForm({...form, quantidade_atual: e.target.value})} className="w-full p-3 bg-slate-100 border rounded-xl outline-none" required />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Qtd Mínima</label>
                      <input type="number" value={form.quantidade_minima} onChange={e => setForm({...form, quantidade_minima: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" required />
                    </div>
                  </div>
                  <button className="bg-blue-900 text-white p-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-md">{editandoId ? 'Salvar Alterações' : 'Cadastrar no Estoque'}</button>
                </form>
              </div>
            )}

            <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col gap-4`}>
              <h2 className="text-xl font-black text-gray-800 mb-2">Catálogo de Produtos</h2>
              
              {produtos.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                  <div className="bg-blue-50 p-4 rounded-full mb-4 text-blue-500"><PackageOpen size={48} /></div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">Seu estoque está vazio</h3>
                  <p className="text-gray-500">Comece adicionando novos produtos usando o formulário ao lado.</p>
                </div>
              ) : (
                produtos.map(p => (
                  <div key={p.id} className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${p.quantidade_atual < p.quantidade_minima ? 'ring-2 ring-red-400/50 bg-red-50/30' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg text-gray-800">{p.nome}</h3>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md text-xs font-black tracking-widest">{p.sku}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Em Estoque</span>
                          <span className={`text-xl font-black ${p.quantidade_atual < p.quantidade_minima ? 'text-red-500' : 'text-blue-600'}`}>{p.quantidade_atual} un</span>
                        </div>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <button onClick={() => {setEditandoId(p.id); setForm(p)}} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18}/></button>
                            <button onClick={() => deletarProduto(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button onClick={() => abrirModal(p, 'HISTORICO')} className="flex-1 sm:flex-none flex justify-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-xl"><History size={16} /> Extrato</button>
                      <button onClick={() => abrirModal(p, 'SAIDA')} className="flex-1 sm:flex-none flex justify-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-3 rounded-xl"><ArrowUpFromLine size={16} /> Baixa</button>
                      <button onClick={() => abrirModal(p, 'ENTRADA')} className="flex-1 sm:flex-none flex justify-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-100 px-4 py-3 rounded-xl"><ArrowDownToLine size={16} /> Entrada</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {modalAtivo && produtoSelecionado && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className={`p-5 text-white flex justify-between items-center ${tipoMovimentacao === 'ENTRADA' ? 'bg-green-600' : tipoMovimentacao === 'SAIDA' ? 'bg-red-500' : 'bg-blue-900'}`}>
              <h3 className="font-bold flex items-center gap-2">{tipoMovimentacao === 'HISTORICO' ? 'Extrato do Produto' : `Registrar ${tipoMovimentacao}`}</h3>
              <button onClick={() => setModalAtivo(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition"><X size={20}/></button>
            </div>
            <div className="p-6">
              <p className="mb-6 text-gray-600 text-sm">Produto selecionado:<br/><strong className="text-gray-900 text-lg">{produtoSelecionado.nome}</strong></p>
              {tipoMovimentacao !== 'HISTORICO' ? (
                <form onSubmit={registrarMovimentacao} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantidade</label>
                    <input type="number" required min="1" value={formMov.quantidade} onChange={e => setFormMov({...formMov, quantidade: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-xl" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Motivo / Observação</label>
                    <input required placeholder="Ex: Venda, Avaria..." value={formMov.motivo} onChange={e => setFormMov({...formMov, motivo: e.target.value})} className="w-full p-4 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-600 outline-none" />
                  </div>
                  <button className={`mt-4 text-white font-black py-4 rounded-xl shadow-md ${tipoMovimentacao === 'ENTRADA' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'}`}>Confirmar Transação</button>
                </form>
              ) : (
                <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {historico.length === 0 ? <div className="text-center py-8"><History className="mx-auto text-gray-300 mb-2" size={32}/><p className="text-gray-400 font-medium">Sem histórico.</p></div> : (
                    <ul className="space-y-3">
                      {historico.map(mov => (
                        <li key={mov.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                          <div><p className="font-bold text-gray-800 text-sm">{mov.motivo}</p><p className="text-xs text-gray-500 mt-0.5">{new Date(mov.data).toLocaleString('pt-BR')}</p></div>
                          <span className={`font-black px-3 py-1.5 rounded-lg text-sm ${mov.tipo === 'ENTRADA' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{mov.tipo === 'ENTRADA' ? '+' : '-'}{mov.quantidade}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;