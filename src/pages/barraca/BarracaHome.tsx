import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Check, LogOut } from 'lucide-react';
import { Layout, GlassCard, BottomNav, ChatBubble, LoadingSkeleton } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { versiculos } from '../../data/versiculos';
import {
  collection, onSnapshot, query, where, orderBy
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Pedido } from '../../types';

export function BarracaHome() {
  const navigate = useNavigate();
  const { usuario, barracaAtual, logout } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);
  const diaFestejo = 1;

  useEffect(() => {
    if (!barracaAtual) {
      setCarregando(false);
      return;
    }

    // Escuta pedidos da barraca atual (sem composite index — filtramos no cliente)
    const unsub = onSnapshot(
      query(collection(db, 'pedidos'), orderBy('criadoEm', 'desc')),
      (snap) => {
        const lista = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          criadoEm: d.data().criadoEm?.toDate?.() ?? new Date(),
          concluidoEm: d.data().concluidoEm?.toDate?.() ?? undefined,
        })) as Pedido[];
        setPedidos(lista.filter(p => p.barracaId === barracaAtual.id));
        setCarregando(false);
      },
      (err) => {
        console.error('Erro ao carregar pedidos:', err);
        // Tenta sem orderBy se índice for problema
        const unsubFallback = onSnapshot(
          query(collection(db, 'pedidos'), where('barracaId', '==', barracaAtual.id)),
          (snap) => {
            const lista = snap.docs.map(d => ({
              id: d.id,
              ...d.data(),
              criadoEm: d.data().criadoEm?.toDate?.() ?? new Date(),
              concluidoEm: d.data().concluidoEm?.toDate?.() ?? undefined,
            })) as Pedido[];
            // Ordena no cliente
            lista.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
            setPedidos(lista);
            setCarregando(false);
          }
        );
        return () => unsubFallback();
      }
    );

    return () => unsub();
  }, [barracaAtual]);

  const versiculoDoDia = versiculos[diaFestejo - 1] || versiculos[0];

  const formatarTempo = (data: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'agora';
    if (minutos < 60) return `há ${minutos} min`;
    if (horas < 24) return `há ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias === 1) return 'ontem';
    return `há ${dias} dias`;
  };

  const handleLogout = () => {
    logout();
    navigate('/barraca/login');
  };

  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
  const pedidosConcluidos = pedidos.filter(p => p.status === 'concluido');

  return (
    <Layout>
      <div className="flex flex-col h-full">
        {/* Header com info da barraca */}
        <div className="px-5 pt-6 pb-4">
          <GlassCard className="p-4" variant="success">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <span className="text-2xl">{barracaAtual?.icone || '🎪'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-white text-lg font-semibold truncate">
                  {barracaAtual?.nome || 'Barraca'}
                </h1>
                <p className="text-white/50 text-sm truncate">
                  Responsável: {usuario?.nome || '—'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Balão do versículo */}
        <div className="px-5 mb-4">
          <ChatBubble
            titulo={`Dia ${diaFestejo} do Festejo`}
            texto={versiculoDoDia.texto}
            referencia={versiculoDoDia.referencia}
          />
        </div>

        {/* Botão Fazer Pedido */}
        <div className="px-5 mb-6">
          <button
            onClick={() => navigate('/barraca/novo-pedido')}
            className="w-full"
          >
            <GlassCard className="p-5 text-center" variant="primary" highlight>
              <div
                className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))',
                  border: '1px solid rgba(255,255,255,0.15)'
                }}
              >
                <Package size={28} className="text-white" />
              </div>
              <h2 className="text-white text-lg font-semibold mb-1">Fazer Pedido</h2>
              <p className="text-white/50 text-sm">Solicitar embalagens</p>
            </GlassCard>
          </button>
        </div>

        {/* Lista de pedidos */}
        <div
          className="flex-1 px-5 overflow-auto"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 100px)' }}
        >
          <h2 className="text-white text-lg font-semibold mb-3">Meus Pedidos</h2>

          <div className="space-y-3">
            {carregando && <LoadingSkeleton count={2} />}

            {!carregando && pedidos.length === 0 && (
              <div className="text-center py-10">
                <Package size={48} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40">Nenhum pedido ainda</p>
                <p className="text-white/25 text-xs mt-1">Toque em "Fazer Pedido" para começar</p>
              </div>
            )}

            {/* Pedidos pendentes */}
            {pedidosPendentes.map(pedido => (
              <GlassCard
                key={pedido.id}
                className="p-4"
                style={{
                  borderLeft: '3px solid',
                  borderImage: 'linear-gradient(180deg, #fcd34d, #f59e0b) 1'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">
                      {pedido.quantidade}× {pedido.embalagemNome}
                    </p>
                    {pedido.motivo && (
                      <p className="text-white/60 text-xs mt-1 truncate">{pedido.motivo}</p>
                    )}
                    <p className="text-white/45 text-sm mt-1">
                      {formatarTempo(pedido.criadoEm)}
                    </p>
                  </div>
                  <div className="bg-amber-500/20 rounded-lg px-2 py-1 flex-shrink-0 ml-2">
                    <span className="text-amber-300 text-xs font-semibold flex items-center gap-1">
                      <Clock size={12} />
                      Pendente
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}

            {/* Pedidos concluídos */}
            {pedidosConcluidos.map(pedido => (
              <GlassCard
                key={pedido.id}
                className="p-4 opacity-75"
                style={{
                  borderLeft: '3px solid',
                  borderImage: 'linear-gradient(180deg, #86efac, #22c55e) 1'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-white/85 font-semibold truncate">
                      {pedido.quantidade}× {pedido.embalagemNome}
                    </p>
                    <p className="text-white/40 text-sm mt-1">
                      {formatarTempo(pedido.criadoEm)}
                    </p>
                  </div>
                  <div className="bg-green-500/15 rounded-lg px-2 py-1 flex-shrink-0 ml-2">
                    <span className="text-green-300 text-xs font-semibold flex items-center gap-1">
                      <Check size={12} />
                      Concluído
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav tipo="barraca" />
      </div>
    </Layout>
  );
}

export default BarracaHome;
