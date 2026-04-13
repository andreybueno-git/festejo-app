import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Plus, Minus, Check } from 'lucide-react';
import { GlassCard } from '../../components';

const mockEmbalagens = [
  { id: '1', nome: 'Marmitex Grande', icone: '🍱' },
  { id: '2', nome: 'Copo 300ml', icone: '🥤' },
  { id: '3', nome: 'Sacola Kraft', icone: '🛍️' },
  { id: '4', nome: 'Guardanapo', icone: '🧻' },
];

export default function BarracaNovoPedido() {
  const navigate = useNavigate();
  const [embalagemId, setEmbalagemId] = useState('');
  const [quantidade, setQuantidade] = useState(50);
  const [motivo, setMotivo] = useState('');
  const [enviarWhatsApp, setEnviarWhatsApp] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const embalagemSelecionada = mockEmbalagens.find(e => e.id === embalagemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (enviarWhatsApp && embalagemSelecionada) {
      const mensagem = `🔔 *Novo Pedido - Festejo*\n\n📦 ${quantidade}× ${embalagemSelecionada.nome}\n📝 Motivo: ${motivo || 'Não informado'}\n\nPor favor, providenciar!`;
      window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
    }

    setLoading(false);
    navigate('/barraca');
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="ambient-light ambient-light-1" />
      <div className="ambient-light ambient-light-2" />

      <div className="relative z-10 h-full flex flex-col px-5 pt-14 pb-5 safe-area-top safe-area-bottom">
        <div className="flex items-center gap-4 mb-5">
          <button onClick={() => navigate(-1)} className="w-10 h-10 glass-avatar rounded-xl">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white text-2xl font-semibold">Novo Pedido</h1>
        </div>

        <GlassCard className="flex-1 rounded-[28px]">
          <form onSubmit={handleSubmit} className="p-5 h-full flex flex-col">
            <div className="mb-5">
              <label className="text-white/65 text-sm font-medium block mb-2">Tipo de embalagem</label>
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="glass-input flex items-center gap-3 w-full"
              >
                {embalagemSelecionada ? (
                  <>
                    <div className="w-11 h-11 glass-avatar rounded-xl flex-shrink-0">
                      <span className="text-2xl">{embalagemSelecionada.icone}</span>
                    </div>
                    <span className="text-white flex-1 text-left">{embalagemSelecionada.nome}</span>
                  </>
                ) : (
                  <span className="text-white/35 flex-1">Selecionar embalagem...</span>
                )}
                <ChevronDown size={16} className={`text-white/40 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="mt-2 rounded-[14px] overflow-hidden bg-black/35 backdrop-blur-xl border border-white/10">
                  {mockEmbalagens.map((embalagem) => (
                    <button
                      key={embalagem.id}
                      type="button"
                      onClick={() => { setEmbalagemId(embalagem.id); setShowDropdown(false); }}
                      className={`w-full p-3 text-left flex items-center gap-3 border-t border-white/5 first:border-t-0 ${embalagemId === embalagem.id ? 'bg-blue-500/15' : ''}`}
                    >
                      <span className="text-xl">{embalagem.icone}</span>
                      <span className={embalagemId === embalagem.id ? 'text-white font-medium' : 'text-white/70'}>{embalagem.nome}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-5">
              <label className="text-white/65 text-sm font-medium block mb-2">Quantidade</label>
              <div className="glass-input flex items-center justify-between" style={{ padding: '12px 16px' }}>
                <button type="button" onClick={() => setQuantidade(q => Math.max(q - 10, 1))} className="w-12 h-12 glass-avatar rounded-[14px]">
                  <Minus size={20} className="text-white/70" />
                </button>
                <div className="text-center">
                  <p className="text-white text-4xl font-semibold">{quantidade}</p>
                  <p className="text-white/40 text-xs">unidades</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQuantidade(q => Math.min(q + 10, 999))}
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(145deg, rgba(96,165,250,0.25), rgba(59,130,246,0.15))', border: '1px solid rgba(96,165,250,0.3)' }}
                >
                  <Plus size={20} className="text-blue-300" />
                </button>
              </div>
            </div>

            <div className="mb-5 flex-1">
              <label className="text-white/65 text-sm font-medium block mb-2">Motivo do pedido</label>
              <textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: Estoque acabando, movimento alto hoje..."
                className="glass-input h-24 resize-none"
                style={{ minHeight: '100px' }}
              />
            </div>

            <button
              type="button"
              onClick={() => setEnviarWhatsApp(!enviarWhatsApp)}
              className="mb-5 p-4 rounded-[14px] flex items-center gap-3"
              style={{
                background: enviarWhatsApp ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${enviarWhatsApp ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`
              }}
            >
              <div 
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{
                  background: enviarWhatsApp ? 'rgba(34,197,94,0.25)' : 'transparent',
                  border: `1px solid ${enviarWhatsApp ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.2)'}`
                }}
              >
                {enviarWhatsApp && <Check size={14} className="text-green-300" />}
              </div>
              <span className={`flex-1 text-sm font-medium ${enviarWhatsApp ? 'text-green-300' : 'text-white/60'}`}>
                Também enviar via WhatsApp
              </span>
              <span className="text-xl">📱</span>
            </button>

            <button
              type="submit"
              disabled={loading || !embalagemId}
              className="w-full rounded-[16px] py-4 text-center font-semibold text-white disabled:opacity-50"
              style={{
                background: 'linear-gradient(180deg, rgba(59,130,246,0.95) 0%, rgba(37,99,235,0.98) 100%)',
                boxShadow: '0 8px 20px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.2)'
              }}
            >
              {loading ? 'Enviando...' : 'Enviar Pedido'}
            </button>
          </form>
        </GlassCard>

        <div className="flex justify-center pt-4">
          <div className="w-32 h-1 bg-white/25 rounded-full" />
        </div>
      </div>
    </div>
  );
}
