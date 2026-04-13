import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, Check } from 'lucide-react';
import { Layout, GlassCard, BottomNav, ChatBubble } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { versiculos } from '../../data/versiculos';

interface Pedido {
  id: string;
  embalagem: string;
  quantidade: number;
  status: 'pendente' | 'concluido';
  criadoEm: Date;
  motivo?: string;
}

export function BarracaHome() {
  const navigate = useNavigate();
  const { usuario, barracaAtual } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [diaFestejo, setDiaFestejo] = useState(1);

  // Mock de pedidos (virá do Firebase)
  useEffect(() => {
    setPedidos([
      {
        id: '1',
        embalagem: 'Marmitex Grande',
        quantidade: 50,
        status: 'pendente',
        criadoEm: new Date(Date.now() - 5 * 60 * 1000), // 5 min atrás
        motivo: 'Acabou o estoque'
      },
      {
        id: '2',
        embalagem: 'Sacola Kraft',
        quantidade: 100,
        status: 'concluido',
        criadoEm: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      },
      {
        id: '3',
        embalagem: 'Guardanapo',
        quantidade: 30,
        status: 'concluido',
        criadoEm: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      },
    ]);

    // Simula dia do festejo (virá da config do Firebase)
    setDiaFestejo(2);
  }, []);

  const versiculoDoDia = versiculos[diaFestejo - 1] || versiculos[0];

  const formatarTempo = (data: Date) => {
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 60) return `há ${minutos} min`;
    if (horas < 24) return `há ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias === 1) return 'ontem';
    return `há ${dias} dias`;
  };

  const pedidosPendentes = pedidos.filter(p => p.status === 'pendente');
  const pedidosConcluidos = pedidos.filter(p => p.status === 'concluido');

  const navItems = [
    { id: 'home', icon: '🏠', label: 'Início', path: '/barraca' },
    { id: 'pedidos', icon: '📋', label: 'Pedidos', path: '/barraca/pedidos' },
  ];

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
              <div className="flex-1">
                <h1 className="text-white text-lg font-semibold">
                  {barracaAtual?.nome || 'Barraca do Pastel'}
                </h1>
                <p className="text-white/50 text-sm">
                  Responsável: {usuario?.nome || 'Maria'}
                </p>
              </div>
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
        <div className="flex-1 px-5 overflow-auto pb-24">
          <h2 className="text-white text-lg font-semibold mb-3">Meus Pedidos</h2>

          <div className="space-y-3">
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
                  <div>
                    <p className="text-white font-semibold">
                      {pedido.quantidade}× {pedido.embalagem}
                    </p>
                    <p className="text-white/45 text-sm">
                      {formatarTempo(pedido.criadoEm)}
                    </p>
                  </div>
                  <div className="bg-amber-500/20 rounded-lg px-2 py-1">
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
                  <div>
                    <p className="text-white/85 font-semibold">
                      {pedido.quantidade}× {pedido.embalagem}
                    </p>
                    <p className="text-white/40 text-sm">
                      {formatarTempo(pedido.criadoEm)}
                    </p>
                  </div>
                  <div className="bg-green-500/15 rounded-lg px-2 py-1">
                    <span className="text-green-300 text-xs font-semibold flex items-center gap-1">
                      <Check size={12} />
                      Concluído
                    </span>
                  </div>
                </div>
              </GlassCard>
            ))}

            {pedidos.length === 0 && (
              <div className="text-center py-10">
                <Package size={48} className="mx-auto text-white/20 mb-3" />
                <p className="text-white/40">Nenhum pedido ainda</p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav items={navItems} activeId="home" />
      </div>
    </Layout>
  );
}

export default BarracaHome;
