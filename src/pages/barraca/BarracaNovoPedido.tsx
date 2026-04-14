import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Plus, Minus, Check, Package } from 'lucide-react';
import { GlassCard } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection, onSnapshot, addDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Vinculo, Embalagem } from '../../types';

interface EmbalagemVinculada {
  id: string;            // vinculo id
  embalagemId: string;
  nome: string;
  recebida: number;
  fotoUrl?: string;
}

export default function BarracaNovoPedido() {
  const navigate = useNavigate();
  const { usuario, barracaAtual } = useAuth();
  const [embalagens, setEmbalagens] = useState<EmbalagemVinculada[]>([]);
  const [embalagemId, setEmbalagemId] = useState('');
  const [quantidade, setQuantidade] = useState(50);
  const [motivo, setMotivo] = useState('');
  const [enviarWhatsApp, setEnviarWhatsApp] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Carrega embalagens vinculadas à barraca atual
  useEffect(() => {
    if (!barracaAtual) {
      setCarregando(false);
      return;
    }

    // Ouvir embalagens e vínculos e juntar no cliente
    let embList: Embalagem[] = [];
    let vincList: Vinculo[] = [];

    const atualizar = () => {
      const meusVinculos = vincList.filter(v => v.barracaId === barracaAtual.id);
      const result: EmbalagemVinculada[] = [];
      for (const v of meusVinculos) {
        const emb = embList.find(e => e.id === v.embalagemId);
        if (!emb) continue;
        result.push({
          id: v.id,
          embalagemId: emb.id,
          nome: emb.nome,
          recebida: v.quantidadeRecebida ?? 0,
          fotoUrl: emb.fotoUrl,
        });
      }
      setEmbalagens(result);
      setCarregando(false);
    };

    const unsubEmb = onSnapshot(collection(db, 'embalagens'), (snap) => {
      embList = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Embalagem);
      atualizar();
    });

    const unsubVinc = onSnapshot(collection(db, 'vinculos'), (snap) => {
      vincList = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Vinculo);
      atualizar();
    });

    return () => {
      unsubEmb();
      unsubVinc();
    };
  }, [barracaAtual]);

  const embalagemSelecionada = embalagens.find(e => e.embalagemId === embalagemId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barracaAtual || !usuario || !embalagemSelecionada) return;

    setLoading(true);
    setErro('');

    try {
      // Salva pedido no Firestore
      await addDoc(collection(db, 'pedidos'), {
        barracaId: barracaAtual.id,
        barracaNome: barracaAtual.nome,
        embalagemId: embalagemSelecionada.embalagemId,
        embalagemNome: embalagemSelecionada.nome,
        quantidade,
        motivo: motivo.trim() || '',
        status: 'pendente',
        usuarioPedidoId: usuario.id,
        criadoEm: serverTimestamp(),
      });

      // WhatsApp
      if (enviarWhatsApp) {
        const mensagem = `🔔 *Novo Pedido - ${barracaAtual.nome}*\n\n📦 ${quantidade}× ${embalagemSelecionada.nome}\n📝 Motivo: ${motivo.trim() || 'Não informado'}\n\n👤 ${usuario.nome}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
      }

      navigate('/barraca');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErro(`Erro ao enviar pedido: ${msg}`);
    } finally {
      setLoading(false);
    }
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

        <GlassCard className="flex-1 rounded-[28px] overflow-auto">
          <form onSubmit={handleSubmit} className="p-5 h-full flex flex-col">
            <div className="mb-5">
              <label className="text-white/65 text-sm font-medium block mb-2">Tipo de embalagem</label>

              {carregando ? (
                <div className="glass-input flex items-center justify-center py-4 text-white/40 text-sm">
                  Carregando embalagens...
                </div>
              ) : embalagens.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                  <Package size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-200 text-sm font-medium">
                      Nenhuma embalagem vinculada
                    </p>
                    <p className="text-amber-200/70 text-xs mt-1">
                      Peça ao administrador para vincular embalagens à sua barraca.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="glass-input flex items-center gap-3 w-full"
                  >
                    {embalagemSelecionada ? (
                      <>
                        <div className="w-11 h-11 glass-avatar rounded-xl flex-shrink-0 overflow-hidden">
                          {embalagemSelecionada.fotoUrl ? (
                            <img src={embalagemSelecionada.fotoUrl} alt={embalagemSelecionada.nome} className="w-full h-full object-cover" />
                          ) : (
                            <Package size={20} className="text-white/60" />
                          )}
                        </div>
                        <span className="text-white flex-1 text-left truncate">{embalagemSelecionada.nome}</span>
                      </>
                    ) : (
                      <span className="text-white/35 flex-1 text-left">Selecionar embalagem...</span>
                    )}
                    <ChevronDown size={16} className={`text-white/40 transition-transform flex-shrink-0 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showDropdown && (
                    <div className="mt-2 rounded-[14px] overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 max-h-56 overflow-y-auto">
                      {embalagens.map((emb) => (
                        <button
                          key={emb.id}
                          type="button"
                          onClick={() => { setEmbalagemId(emb.embalagemId); setShowDropdown(false); }}
                          className={`w-full p-3 text-left flex items-center gap-3 border-t border-white/5 first:border-t-0 ${embalagemId === emb.embalagemId ? 'bg-blue-500/15' : ''}`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {emb.fotoUrl ? (
                              <img src={emb.fotoUrl} alt={emb.nome} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={16} className="text-white/50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`truncate ${embalagemId === emb.embalagemId ? 'text-white font-medium' : 'text-white/80'}`}>{emb.nome}</p>
                            <p className="text-white/40 text-xs">Recebidas: {emb.recebida}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
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

            <div className="mb-5">
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
              <span className={`flex-1 text-sm font-medium text-left ${enviarWhatsApp ? 'text-green-300' : 'text-white/60'}`}>
                Também enviar via WhatsApp
              </span>
              <span className="text-xl">📱</span>
            </button>

            {erro && (
              <div className="mb-4 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-200 text-sm text-center">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !embalagemId || embalagens.length === 0}
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
      </div>
    </div>
  );
}
