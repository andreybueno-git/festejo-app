import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, Plus } from 'lucide-react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Layout, GlassCard, BottomNav } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { Pedido, Embalagem } from '../../types';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [pedidosPendentes, setPedidosPendentes] = useState<Pedido[]>([]);
  const [embalagensAlerta, setEmbalagensAlerta] = useState<Embalagem[]>([]);
  const [totalBarracas, setTotalBarracas] = useState(0);
  const [totalEmbalagens, setTotalEmbalagens] = useState(0);
  const diaFestejo = 2;

  useEffect(() => {
    const pedidosQuery = query(
      collection(db, 'pedidos'),
      where('status', '==', 'pendente'),
      orderBy('criadoEm', 'desc'),
      limit(5)
    );

    const unsubPedidos = onSnapshot(pedidosQuery, (snapshot) => {
      const pedidos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pedido[];
      setPedidosPendentes(pedidos);
    });

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
    });

    const barracasQuery = query(
      collection(db, 'barracas'),
      where('ativa', '==', true)
    );

    const unsubBarracas = onSnapshot(barracasQuery, (snapshot) => {
      setTotalBarracas(snapshot.size);
    });

    return () => {
      unsubPedidos();
      unsubEmbalagens();
      unsubBarracas();
    };
  }, []);

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
          
          <div className="relative">
            <div className="w-[46px] h-[46px] relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-[20px] rounded-full border border-white/20 shadow-lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bell className="text-white" size={20} />
              </div>
            </div>
            {pedidosPendentes.length > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a1628]">
                <span className="text-white text-[11px] font-semibold">{pedidosPendentes.length}</span>
              </div>
            )}
          </div>
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
              pedidosPendentes.map((pedido) => (
                <GlassCard key={pedido.id}>
                  <div className="p-4 flex justify-between items-center">
                    <div>
                      <p className="text-white text-[15px] font-medium mb-0.5">{pedido.barracaNome}</p>
                      <p className="text-white/50 text-[13px]">
                        {pedido.quantidade}× {pedido.embalagemNome} · {formatTime(pedido.criadoEm)}
                      </p>
                    </div>
                    <div className="w-2.5 h-2.5 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full shadow-lg shadow-yellow-500/50" />
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        <div className="mb-auto">
          <h2 className="text-white text-lg font-semibold mb-3">Ações rápidas</h2>
          <div className="flex gap-3">
            <GlassCard variant="success" className="flex-1" onClick={() => navigate('/admin/distribuir')}>
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
    </Layout>
  );
};

export default AdminDashboard;
