import { useState } from 'react';
import { Layout, GlassCard } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, X, User, Package } from 'lucide-react';

const EMOJIS_BARRACAS = ['🥟', '🍩', '🌭', '🍿', '🍭', '🍕', '🍢', '🍲', '🍰', '🍦', '🥤', '🌮', '🍔', '🥐', '🍳', '🧁'];

export default function AdminBarracas() {
  const { barracas } = useAuth();
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [novaBarraca, setNovaBarraca] = useState({ nome: '', icone: '🥟' });

  const barracasFiltradas = barracas.filter(b => 
    b.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <Layout tipo="admin">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-white text-2xl font-semibold">Barracas</h1>
          <p className="text-white/50 text-sm">{barracas.length} barracas cadastradas</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
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
      <div className="flex-1 overflow-auto space-y-3 pb-20">
        {barracasFiltradas.map(barraca => (
          <GlassCard key={barraca.id} className="p-4">
            <div className="flex items-center gap-4">
              {/* Ícone */}
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">{barraca.icone}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{barraca.nome}</p>
                
                {barraca.responsavelNome ? (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <User size={12} className="text-green-400" />
                    <span className="text-green-400 text-xs">{barraca.responsavelNome}</span>
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
                barraca.ativa 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {barraca.ativa ? 'Ativa' : 'Inativa'}
              </div>
            </div>

            {/* Ações */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
              <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                <Package size={14} />
                Embalagens
              </button>
              <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors">
                Editar
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Modal Nova Barraca */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6" highlight>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white text-lg font-semibold">Nova Barraca</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/40 hover:text-white transition-colors"
              >
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

              <button 
                disabled={!novaBarraca.nome.trim()}
                className="btn-primary w-full mt-2 disabled:opacity-50"
              >
                Cadastrar Barraca
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </Layout>
  );
}
