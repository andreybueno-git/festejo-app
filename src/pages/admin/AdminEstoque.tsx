import { useState } from 'react';
import { Layout, GlassCard } from '../../components';
import { Plus, Search, Package, AlertTriangle, Minus, X, Camera } from 'lucide-react';
import { Embalagem } from '../../types';

// Dados mock de embalagens
const MOCK_EMBALAGENS: Embalagem[] = [
  { id: '1', nome: 'Copo 300ml', estoqueAtual: 500, estoqueMinimo: 100, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
  { id: '2', nome: 'Guardanapo', estoqueAtual: 1200, estoqueMinimo: 200, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
  { id: '3', nome: 'Sachê de Ketchup', estoqueAtual: 45, estoqueMinimo: 100, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
  { id: '4', nome: 'Sachê de Mostarda', estoqueAtual: 180, estoqueMinimo: 100, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
  { id: '5', nome: 'Prato de Papelão', estoqueAtual: 350, estoqueMinimo: 150, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
  { id: '6', nome: 'Talher Descartável', estoqueAtual: 600, estoqueMinimo: 200, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
  { id: '7', nome: 'Saco de Papel G', estoqueAtual: 280, estoqueMinimo: 100, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
  { id: '8', nome: 'Copo 500ml', estoqueAtual: 320, estoqueMinimo: 100, unidade: 'unidade', ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
];

export default function AdminEstoque() {
  const [embalagens, setEmbalagens] = useState<Embalagem[]>(MOCK_EMBALAGENS);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'nova' | 'entrada' | 'saida'>('nova');
  const [embalagemSelecionada, setEmbalagemSelecionada] = useState<Embalagem | null>(null);
  const [quantidade, setQuantidade] = useState('');

  const embalagensFiltradas = embalagens.filter(e => 
    e.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const estoqueBaixo = (emb: Embalagem) => emb.estoqueAtual <= emb.estoqueMinimo;

  const abrirModalEntrada = (emb: Embalagem) => {
    setEmbalagemSelecionada(emb);
    setModalType('entrada');
    setQuantidade('');
    setShowModal(true);
  };

  const abrirModalSaida = (emb: Embalagem) => {
    setEmbalagemSelecionada(emb);
    setModalType('saida');
    setQuantidade('');
    setShowModal(true);
  };

  const confirmarMovimentacao = () => {
    if (!embalagemSelecionada || !quantidade) return;

    const qtd = parseInt(quantidade);
    setEmbalagens(prev => prev.map(e => {
      if (e.id === embalagemSelecionada.id) {
        const novoEstoque = modalType === 'entrada' 
          ? e.estoqueAtual + qtd 
          : Math.max(0, e.estoqueAtual - qtd);
        return { ...e, estoqueAtual: novoEstoque };
      }
      return e;
    }));

    setShowModal(false);
    setEmbalagemSelecionada(null);
    setQuantidade('');
  };

  return (
    <Layout tipo="admin">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white text-2xl font-semibold">Estoque</h1>
          <p className="text-white/50 text-sm">{embalagens.length} embalagens cadastradas</p>
        </div>
        <button 
          onClick={() => { setModalType('nova'); setShowModal(true); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar embalagem..."
          className="glass-input w-full pl-11"
        />
      </div>

      {/* Lista de embalagens */}
      <div className="flex-1 overflow-auto space-y-3 pb-20">
        {embalagensFiltradas.map(emb => (
          <GlassCard 
            key={emb.id} 
            className="p-4"
            variant={estoqueBaixo(emb) ? 'warning' : 'default'}
          >
            <div className="flex items-start gap-3">
              {/* Ícone/Foto */}
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Package size={24} className="text-white/60" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium truncate">{emb.nome}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-lg font-semibold ${estoqueBaixo(emb) ? 'text-amber-400' : 'text-white'}`}>
                        {emb.estoqueAtual}
                      </span>
                      <span className="text-white/40 text-xs">un</span>
                      {estoqueBaixo(emb) && (
                        <AlertTriangle size={14} className="text-amber-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => abrirModalEntrada(emb)}
                    className="flex-1 py-2 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-xs font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    Entrada
                  </button>
                  <button 
                    onClick={() => abrirModalSaida(emb)}
                    className="flex-1 py-2 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                  >
                    <Minus size={14} />
                    Saída
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6" highlight>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-lg font-semibold">
                {modalType === 'nova' && 'Nova Embalagem'}
                {modalType === 'entrada' && 'Entrada de Estoque'}
                {modalType === 'saida' && 'Saída de Estoque'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {modalType === 'nova' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Copo 300ml"
                    className="glass-input w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Estoque Inicial</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="glass-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Estoque Mínimo</label>
                    <input
                      type="number"
                      placeholder="50"
                      className="glass-input w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Foto (opcional)</label>
                  <button className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 text-sm flex items-center justify-center gap-2 hover:border-white/40 transition-colors">
                    <Camera size={18} />
                    Adicionar foto
                  </button>
                </div>
                <button className="btn-primary w-full mt-2">
                  Cadastrar
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-3 text-center">
                  <p className="text-white/60 text-sm">Embalagem</p>
                  <p className="text-white font-medium">{embalagemSelecionada?.nome}</p>
                  <p className="text-white/40 text-xs mt-1">
                    Estoque atual: {embalagemSelecionada?.estoqueAtual} un
                  </p>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Quantidade ({modalType === 'entrada' ? 'adicionar' : 'remover'})
                  </label>
                  <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="0"
                    className="glass-input w-full text-center text-xl"
                    min="1"
                  />
                </div>
                <button 
                  onClick={confirmarMovimentacao}
                  disabled={!quantidade || parseInt(quantidade) <= 0}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    modalType === 'entrada' 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30' 
                      : 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30'
                  } disabled:opacity-50`}
                >
                  Confirmar {modalType === 'entrada' ? 'Entrada' : 'Saída'}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </Layout>
  );
}
