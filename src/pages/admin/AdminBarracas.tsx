import { useState } from 'react';
import { Layout, GlassCard } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, X, User, Package, Pencil, Check } from 'lucide-react';
import { Barraca } from '../../types';

const EMOJIS_BARRACAS = ['🥟', '🍩', '🌭', '🍿', '🍭', '🍕', '🍢', '🍲', '🍰', '🍦', '🥤', '🌮', '🍔', '🥐', '🍳', '🧁'];

export default function AdminBarracas() {
  const { barracas, adicionarBarraca, editarBarraca } = useAuth();
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [novaBarraca, setNovaBarraca] = useState({ nome: '', icone: '🥟' });
  const [barracaEditando, setBarracaEditando] = useState<Barraca | null>(null);
  const [editDados, setEditDados] = useState({ nome: '', icone: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const barracasFiltradas = barracas.filter(b =>
    b.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const handleCadastrar = async () => {
    if (!novaBarraca.nome.trim()) return;
    setSalvando(true);
    setErro('');
    const ok = await adicionarBarraca(novaBarraca.nome, novaBarraca.icone);
    setSalvando(false);
    if (ok) {
      setNovaBarraca({ nome: '', icone: '🥟' });
      setShowModal(false);
    } else {
      setErro('Erro ao cadastrar. Verifique sua conexão.');
    }
  };

  const abrirEditar = (b: Barraca) => {
    setBarracaEditando(b);
    setEditDados({ nome: b.nome, icone: b.icone });
    setErro('');
    setShowEditModal(true);
  };

  const handleEditar = async () => {
    if (!barracaEditando || !editDados.nome.trim()) return;
    setSalvando(true);
    setErro('');
    const ok = await editarBarraca(barracaEditando.id, {
      nome: editDados.nome.trim(),
      icone: editDados.icone,
    });
    setSalvando(false);
    if (ok) {
      setShowEditModal(false);
      setBarracaEditando(null);
    } else {
      setErro('Erro ao salvar. Verifique sua conexão.');
    }
  };

  return (
    <Layout tipo="admin" showNav>
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-semibold">Barracas</h1>
            <p className="text-white/50 text-sm">{barracas.length} barracas cadastradas</p>
          </div>
          <button
            onClick={() => { setNovaBarraca({ nome: '', icone: '🥟' }); setErro(''); setShowModal(true); }}
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
            placeholder="Buscar barraca..."
            className="glass-input w-full pl-11"
          />
        </div>

        {/* Lista de barracas */}
        <div className="space-y-3">
          {barracas.length === 0 && (
            <GlassCard className="p-8 text-center">
              <span className="text-4xl block mb-3">🏪</span>
              <p className="text-white/50 text-sm">Nenhuma barraca cadastrada</p>
              <p className="text-white/30 text-xs mt-1">Toque em + para adicionar a primeira</p>
            </GlassCard>
          )}
          {barracasFiltradas.map(b => (
            <GlassCard key={b.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Ícone */}
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{b.icone}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{b.nome}</p>
                  {b.responsavelNome ? (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <User size={12} className="text-green-400" />
                      <span className="text-green-400 text-xs">{b.responsavelNome}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <User size={12} className="text-white/30" />
                      <span className="text-white/30 text-xs">Sem responsável</span>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  b.ativa ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {b.ativa ? 'Ativa' : 'Inativa'}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                  <Package size={14} />
                  Embalagens
                </button>
                <button
                  onClick={() => abrirEditar(b)}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                >
                  <Pencil size={14} />
                  Editar
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Modal Nova Barraca */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6" highlight>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-lg font-semibold">Nova Barraca</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Nome da Barraca</label>
                <input
                  type="text"
                  value={novaBarraca.nome}
                  onChange={(e) => setNovaBarraca(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Barraca do Pastel"
                  className="glass-input w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Ícone</label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJIS_BARRACAS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setNovaBarraca(prev => ({ ...prev, icone: emoji }))}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        novaBarraca.icone === emoji
                          ? 'bg-blue-500/30 border-2 border-blue-400 scale-110'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {erro && (
                <p className="text-red-300 text-sm text-center bg-red-500/10 rounded-xl px-3 py-2">{erro}</p>
              )}

              <button
                onClick={handleCadastrar}
                disabled={!novaBarraca.nome.trim() || salvando}
                className="btn-primary w-full mt-2 disabled:opacity-50"
              >
                {salvando ? 'Cadastrando...' : 'Cadastrar Barraca'}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Modal Editar Barraca */}
      {showEditModal && barracaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6" highlight>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-lg font-semibold">Editar Barraca</h3>
              <button onClick={() => setShowEditModal(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Nome da Barraca</label>
                <input
                  type="text"
                  value={editDados.nome}
                  onChange={(e) => setEditDados(prev => ({ ...prev, nome: e.target.value }))}
                  className="glass-input w-full"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">Ícone</label>
                <div className="grid grid-cols-8 gap-2">
                  {EMOJIS_BARRACAS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setEditDados(prev => ({ ...prev, icone: emoji }))}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${
                        editDados.icone === emoji
                          ? 'bg-blue-500/30 border-2 border-blue-400 scale-110'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {erro && (
                <p className="text-red-300 text-sm text-center bg-red-500/10 rounded-xl px-3 py-2">{erro}</p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-white/70 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEditar}
                  disabled={!editDados.nome.trim() || salvando}
                  className="flex-1 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {salvando ? 'Salvando...' : <><Check size={16} /> Salvar</>}
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </Layout>
  );
}
