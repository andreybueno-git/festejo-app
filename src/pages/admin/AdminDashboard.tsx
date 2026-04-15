import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, Plus, X, AlertTriangle, ShoppingCart, Check } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Layout, GlassCard, BottomNav } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { Pedido, Embalagem } from '../../types';
import { registrarPushAdmin, iniciarListenerForeground, isPushSuportado, statusPermissao, temTokenRegistrado } from '../../services/pushNotifications';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pedidosPendentes, setPedidosPendentes] = useState<Pedido[]>([]);
  const [embalagensAlerta, setEmbalagensAlerta] = useState<Embalagem[]>([]);
  const [totalBarracas, setTotalBarracas] = useState(0);
  const [totalEmbalagens, setTotalEmbalagens] = useState(0);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const diaFestejo = 2;

  useEffect(() => {
    const pedidosQuery = query(
      collection(db, 'pedidos'),
      where('status', '==', 'pendente'),
      orderBy('criadoEm', 'desc'),
      limit(10)
    );

    const unsubPedidos = onSnapshot(pedidosQuery, (snapshot) => {
      const pedidos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pedido[];
      setPedidosPendentes(pedidos);
    }, () => {});

    const embalagensQuery = query(
      collection(db, 'embalagens'),
      where('ativo', '==', true)
    );

    const unsubEmbalagens = onSnapshot(embalagensQuery, (snapshot) => {
      const embalagens = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Embalagem[];

      setTotalEmbalagens(embalagens.length);
      setEmbalagensAlerta(embalagens.filter(e => e.estoqueAtual <= e.estoqueMinimo));
    }, () => {});

    const barracasQuery = query(
      collection(db, 'barracas'),
      where('ativa', '==', true)
    );

    const unsubBarracas = onSnapshot(barracasQuery, (snapshot) => {
      setTotalBarracas(snapshot.size);
    }, () => {});

    return () => {
      unsubPedidos();
      unsubEmbalagens();
      unsubBarracas();
    };
  }, []);

  // Registra push FCM pro admin + listener de mensagens em foreground
  useEffect(() => {
    if (!usuario || !isPushSuportado()) return;

    let unsub: (() => void) | null = null;

    (async () => {
      // Só re-registra se o usuário JÁ ativou antes neste dispositivo (tem token salvo).
      // Se ele desligou explicitamente em Config, respeita a escolha.
      if (statusPermissao() === 'granted' && temTokenRegistrado()) {
        await registrarPushAdmin(usuario.id, usuario.nome || 'Admin');
      }
      unsub = await iniciarListenerForeground();
    })();

    return () => {
      if (unsub) unsub();
    };
  }, [usuario]);

  const totalNotificacoes = pedidosPendentes.length + embalagensAlerta.length;

  const concluirPedido = async (pedido: Pedido) => {
    try {
      await updateDoc(doc(db, 'pedidos', pedido.id), {
        status: 'concluido',
        concluidoEm: serverTimestamp(),
      });
    } catch (err) {
      console.error('Erro ao concluir pedido:', err);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 60000);
    if (diff < 1) return 'agora';
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h`;
  };

  return (
    <Layout>
      <div className="min-h-screen flex flex-col px-5 py-14 pb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-white/50 text-[13px] tracking-wide">Dia {diaFestejo} do Festejo</p>
            <h1 className="text-white text-[28px] font-semibold tracking-tight">
              Olá, {usuario?.nome?.split(' ')[0] || 'Admin'}
            </h1>
          </div>

          {/* Sino de notificações */}
          <button
            onClick={() => setShowNotificacoes(true)}
            className="relative"
          >
            <div className="w-[46px] h-[46px] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[20px] rounded-full border border-white/20 shadow-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell className="text-white" size={20} />
              </div>
            </div>
            {totalNotificacoes > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a1628]">
                <span className="text-white text-[11px] font-semibold">{totalNotificacoes}</span>
              </div>
            )}
          </button>
        </div>

        <div className="flex gap-3 mb-4">
          <GlassCard className="flex-1">
            <div className="p-4">
              <p className="text-white/60 text-[13px] mb-1">Barracas</p>
              <p className="text-white text-[34px] font-semibold tracking-tight">{totalBarracas}</p>
            </div>
          </GlassCard>
          <GlassCard className="flex-1">
            <div className="p-4">
              <p className="text-white/60 text-[13px] mb-1">Embalagens</p>
              <p className="text-white text-[34px] font-semibold tracking-tight">{totalEmbalagens}</p>
            </div>
          </GlassCard>
        </div>

        {embalagensAlerta.length > 0 && (
          <GlassCard variant="warning" className="mb-5">
            <div className="p-4 flex items-center gap-3.5">
              <div className="w-9 h-9 bg-yellow-500/20 rounded-[10px] flex items-center justify-center">
                <span className="text-lg">⚠️</span>
              </div>
              <div>
                <p className="text-yellow-300 text-sm font-semibold">Estoque baixo</p>
                <p className="text-yellow-300/70 text-[13px]">
                  {embalagensAlerta[0].nome}: {embalagensAlerta[0].estoqueAtual} un.
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        <div className="mb-5">
          <h2 className="text-white text-lg font-semibold mb-3">Pedidos pendentes</h2>
          <div className="space-y-2.5">
            {pedidosPendentes.length === 0 ? (
              <GlassCard>
                <div className="p-4 text-center">
                  <p className="text-white/50 text-sm">Nenhum pedido pendente</p>
                </div>
              </GlassCard>
            ) : (
              pedidosPendentes.slice(0, 5).map((pedido) => (
                <GlassCard key={pedido.id}>
                  <div className="p-4 flex justify-between items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[15px] font-medium mb-0.5 truncate">{pedido.barracaNome}</p>
                      <p className="text-white/50 text-[13px] truncate">
                        {pedido.quantidade}× {pedido.embalagemNome} · {formatTime(pedido.criadoEm)}
                      </p>
                    </div>
                    <button
                      onClick={() => concluirPedido(pedido)}
                      className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-300 hover:bg-green-500/30 transition-colors flex-shrink-0"
                      title="Marcar como concluído"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        <div className="mb-auto">
          <h2 className="text-white text-lg font-semibold mb-3">Ações rápidas</h2>
          <div className="flex gap-3">
            <GlassCard variant="success" className="flex-1" onClick={() => navigate('/admin/barracas')}>
              <div className="p-4 text-center">
                <Package className="mx-auto mb-2 text-green-300" size={24} />
                <p className="text-green-300 text-sm font-medium">Distribuir</p>
              </div>
            </GlassCard>
            <GlassCard variant="info" className="flex-1" onClick={() => navigate('/admin/estoque')}>
              <div className="p-4 text-center">
                <Plus className="mx-auto mb-2 text-blue-300" size={24} />
                <p className="text-blue-300 text-sm font-medium">Estoque</p>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="mt-4">
          <BottomNav tipo="admin" />
        </div>
      </div>

      {/* Painel de Notificações */}
      {showNotificacoes && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm" onClick={() => setShowNotificacoes(false)}>
          <div
            className="mt-auto max-h-[75vh] overflow-auto rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, rgba(20,30,60,0.98) 0%, rgba(10,22,40,0.98) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 pt-5 pb-3" style={{ background: 'inherit' }}>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-white text-xl font-semibold">Notificações</h2>
                <button
                  onClick={() => setShowNotificacoes(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-white/40 text-sm">
                {totalNotificacoes === 0 ? 'Tudo certo por aqui' : `${totalNotificacoes} alerta${totalNotificacoes > 1 ? 's' : ''}`}
              </p>
            </div>

            <div className="px-6 pb-8 space-y-3">
              {/* Alertas de estoque baixo */}
              {embalagensAlerta.length > 0 && (
                <>
                  <p className="text-white/30 text-xs font-medium uppercase tracking-wider mt-2">Estoque baixo</p>
                  {embalagensAlerta.map(emb => (
                    <button
                      key={emb.id}
                      onClick={() => { setShowNotificacoes(false); navigate('/admin/estoque'); }}
                      className="w-full text-left"
                    >
                      <GlassCard className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle size={18} className="text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{emb.nome}</p>
                            <p className="text-amber-300/70 text-xs mt-0.5">
                              Restam {emb.estoqueAtual} un (mín. {emb.estoqueMinimo})
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </button>
                  ))}
                </>
              )}

              {/* Pedidos pendentes */}
              {pedidosPendentes.length > 0 && (
                <>
                  <p className="text-white/30 text-xs font-medium uppercase tracking-wider mt-4">Pedidos pendentes</p>
                  {pedidosPendentes.map(pedido => (
                    <GlassCard key={pedido.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                          <ShoppingCart size={18} className="text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{pedido.barracaNome}</p>
                          <p className="text-white/50 text-xs mt-0.5 truncate">
                            {pedido.quantidade}× {pedido.embalagemNome} · {formatTime(pedido.criadoEm)}
                          </p>
                          {pedido.motivo && (
                            <p className="text-white/40 text-xs mt-0.5 italic truncate">"{pedido.motivo}"</p>
                          )}
                        </div>
                        <button
                          onClick={() => concluirPedido(pedido)}
                          className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-300 hover:bg-green-500/30 transition-colors flex-shrink-0"
                          title="Concluir"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </>
              )}

              {/* Vazio */}
              {totalNotificacoes === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Bell size={28} className="text-white/20" />
                  </div>
                  <p className="text-white/40 text-sm">Nenhuma notificação</p>
                  <p className="text-white/25 text-xs mt-1">Tudo certo por enquanto</p>
                </div>
              )}
            </div>

            {/* Safe area bottom */}
            <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }} />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
