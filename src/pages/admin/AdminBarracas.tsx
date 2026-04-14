import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, GlassCard, LoadingSkeleton } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, X, User, Package, Pencil, Check, Trash2, ArrowRight, Minus, Send } from 'lucide-react';
import { Barraca, Embalagem, Vinculo } from '../../types';
import {
  collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase';

const EMOJIS_BARRACAS = ['🥟', '🍩', '🌭', '🍿', '🍭', '🍕', '🍢', '🍲', '🍰', '🍦', '🥤', '🌮', '🍔', '🥐', '🍳', '🧁'];

export default function AdminBarracas() {
  const { barracas, adicionarBarraca, editarBarraca, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [novaBarraca, setNovaBarraca] = useState({ nome: '', icone: '🥟' });
  const [barracaEditando, setBarracaEditando] = useState<Barraca | null>(null);
  const [editDados, setEditDados] = useState({ nome: '', icone: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  // Embalagens modal state
  const [showEmbModal, setShowEmbModal] = useState(false);
  const [barracaEmbalagens, setBarracaEmbalagens] = useState<Barraca | null>(null);
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [vinculos, setVinculos] = useState<(Vinculo & { embalagemNome?: string })[]>([]);
  const [showAddEmb, setShowAddEmb] = useState(false);
  const [embSelecionada, setEmbSelecionada] = useState<Embalagem | null>(null);
  const [qtdDistribuir, setQtdDistribuir] = useState('');
  const [sucesso, setSucesso] = useState('');

  // Load all embalagens
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'embalagens'),
      (snap) => {
        const lista = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          criadoEm: d.data().criadoEm?.toDate?.() ?? new Date(),
          atualizadoEm: d.data().atualizadoEm?.toDate?.() ?? new Date(),
        })) as Embalagem[];
        setEmbalagens(lista.filter(e => e.ativo !== false));
      },
      () => {}
    );
    return () => unsub();
  }, []);

  // Load vinculos when a barraca is selected
  useEffect(() => {
    if (!barracaEmbalagens) {
      setVinculos([]);
      return;
    }
    // Usar listener simples na coleção inteira e filtrar no cliente
    // (evita necessidade de índice composto no Firestore)
    const unsub = onSnapshot(
      collection(db, 'vinculos'),
      (snap) => {
        const todos = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          criadoEm: d.data().criadoEm?.toDate?.() ?? new Date(),
          atualizadoEm: d.data().atualizadoEm?.toDate?.() ?? new Date(),
        })) as Vinculo[];
        // Filtrar pelo barracaId no cliente
        const lista = todos.filter(v => v.barracaId === barracaEmbalagens.id);
        // Enrich with embalagem name
        const enriched = lista.map(v => {
          const emb = embalagens.find(e => e.id === v.embalagemId);
          return { ...v, embalagemNome: emb?.nome ?? 'Embalagem removida' };
        });
        setVinculos(enriched);
      },
      (err) => {
        console.error('Erro ao carregar vínculos:', err);
      }
    );
    return () => unsub();
  }, [barracaEmbalagens, embalagens]);

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

  const abrirEmbalagens = (b: Barraca) => {
    setBarracaEmbalagens(b);
    setShowAddEmb(false);
    setEmbSelecionada(null);
    setQtdDistribuir('');
    setShowDistribuir(null);
    setQtdMais('');
    setErro('');
    setSucesso('');
    setShowEmbModal(true);
  };

  // IDs of embalagens already linked
  const embVinculadosIds = vinculos.map(v => v.embalagemId);
  const embalagensDisponiveis = embalagens.filter(e => !embVinculadosIds.includes(e.id));

  const selecionarEmbalagem = (emb: Embalagem) => {
    setEmbSelecionada(emb);
    setQtdDistribuir('');
    setErro('');
  };

  const adicionarVinculo = async () => {
    if (!barracaEmbalagens || !embSelecionada) return;
    const qtd = parseInt(qtdDistribuir) || 0;

    if (qtd > embSelecionada.estoqueAtual) {
      setErro(`Estoque insuficiente! Disponível: ${embSelecionada.estoqueAtual} un`);
      return;
    }

    setSalvando(true);
    setErro('');
    setSucesso('');
    try {
      // 1. Criar vínculo com a quantidade distribuída
      await addDoc(collection(db, 'vinculos'), {
        barracaId: barracaEmbalagens.id,
        embalagemId: embSelecionada.id,
        quantidadePrevista: qtd,
        quantidadeRecebida: qtd,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      // 2. Decrementar estoque geral
      if (qtd > 0) {
        const novoEstoque = Math.max(0, embSelecionada.estoqueAtual - qtd);
        await updateDoc(doc(db, 'embalagens', embSelecionada.id), {
          estoqueAtual: novoEstoque,
          atualizadoEm: serverTimestamp(),
        });
      }

      const nome = embSelecionada.nome;
      setEmbSelecionada(null);
      setQtdDistribuir('');
      setShowAddEmb(false);
      setSucesso(`${qtd > 0 ? `${qtd}× ` : ''}"${nome}" distribuída!`);
      setTimeout(() => setSucesso(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Erro ao vincular embalagem:', err);
      setErro(`Erro ao vincular: ${msg}`);
    } finally {
      setSalvando(false);
    }
  };

  // Distribuir mais unidades para uma barraca já vinculada
  const [showDistribuir, setShowDistribuir] = useState<string | null>(null);
  const [qtdMais, setQtdMais] = useState('');

  const distribuirMais = async (vinculo: Vinculo & { embalagemNome?: string }) => {
    const qtd = parseInt(qtdMais) || 0;
    if (qtd <= 0) return;

    const emb = embalagens.find(e => e.id === vinculo.embalagemId);
    if (!emb) return;

    if (qtd > emb.estoqueAtual) {
      setErro(`Estoque insuficiente! Disponível: ${emb.estoqueAtual} un`);
      return;
    }

    setSalvando(true);
    setErro('');
    try {
      // Atualizar vínculo
      await updateDoc(doc(db, 'vinculos', vinculo.id), {
        quantidadePrevista: (vinculo.quantidadePrevista || 0) + qtd,
        quantidadeRecebida: (vinculo.quantidadeRecebida || 0) + qtd,
        atualizadoEm: serverTimestamp(),
      });

      // Decrementar estoque geral
      const novoEstoque = Math.max(0, emb.estoqueAtual - qtd);
      await updateDoc(doc(db, 'embalagens', emb.id), {
        estoqueAtual: novoEstoque,
        atualizadoEm: serverTimestamp(),
      });

      setShowDistribuir(null);
      setQtdMais('');
      setSucesso(`+${qtd} "${emb.nome}" distribuídas!`);
      setTimeout(() => setSucesso(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErro(`Erro: ${msg}`);
    } finally {
      setSalvando(false);
    }
  };

  const removerVinculo = async (vinculoId: string) => {
    setSalvando(true);
    try {
      await deleteDoc(doc(db, 'vinculos', vinculoId));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Erro ao remover vínculo:', err);
      setErro(`Erro ao remover: ${msg}`);
    } finally {
      setSalvando(false);
    }
  };


  return (
    <Layout tipo="admin" showNav={!showEmbModal}>
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
          {authLoading && <LoadingSkeleton count={3} />}
          {!authLoading && barracas.length === 0 && (
            <GlassCard className="p-8 text-center">
              <span className="text-4xl block mb-3">🏪</span>
              <p className="text-white/50 text-sm">Nenhuma barraca cadastrada</p>
              <p className="text-white/30 text-xs mt-1">Toque em + para adicionar a primeira</p>
            </GlassCard>
          )}
          {barracasFiltradas.map(b => (
            <GlassCard key={b.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{b.icone}</span>
                </div>
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
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  b.ativa ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  {b.ativa ? 'Ativa' : 'Inativa'}
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/10">
                <button
                  onClick={() => abrirEmbalagens(b)}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                >
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

      {/* Modal Embalagens da Barraca */}
      {showEmbModal && barracaEmbalagens && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black/60 backdrop-blur-sm" onClick={() => setShowEmbModal(false)}>
          <div
            className="mt-auto max-h-[85vh] overflow-auto rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, rgba(20,30,60,0.99) 0%, rgba(10,22,40,0.99) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 px-6 pt-5 pb-3" style={{ background: 'rgba(20,30,60,0.99)' }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{barracaEmbalagens.icone}</span>
                  <div>
                    <h2 className="text-white text-lg font-semibold">{barracaEmbalagens.nome}</h2>
                    <p className="text-white/40 text-xs">{vinculos.length} embalagens vinculadas</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEmbModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              {/* Botão Adicionar embalagem - SEMPRE VISÍVEL NO TOPO */}
              {embalagens.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-white/40 text-sm mb-3">Nenhuma embalagem cadastrada no sistema</p>
                  <button
                    onClick={() => { setShowEmbModal(false); navigate('/admin/estoque'); }}
                    className="py-3 px-5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 transition-colors inline-flex items-center gap-2"
                  >
                    Ir para Estoque <ArrowRight size={16} />
                  </button>
                  <p className="text-white/25 text-xs mt-2">Cadastre embalagens primeiro para poder vinculá-las</p>
                </div>
              ) : !showAddEmb ? (
                <button
                  onClick={() => { setShowAddEmb(true); setQtdDistribuir(''); setEmbSelecionada(null); }}
                  className="w-full py-3.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-500/30 transition-colors"
                >
                  <Plus size={18} />
                  Adicionar embalagem
                </button>
              ) : embSelecionada ? (
                <GlassCard className="p-4" highlight>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-medium">Quanto distribuir?</p>
                    <button
                      onClick={() => { setEmbSelecionada(null); setQtdDistribuir(''); setErro(''); }}
                      className="text-white/40 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3 mb-3 flex items-center gap-3">
                    <Package size={18} className="text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{embSelecionada.nome}</p>
                      <p className="text-white/40 text-xs">
                        Estoque disponível: <span className="text-green-400 font-medium">{embSelecionada.estoqueAtual} un</span>
                      </p>
                    </div>
                  </div>

                  <label className="block text-white/70 text-sm mb-2">Quantidade a entregar</label>
                  <input
                    type="number"
                    value={qtdDistribuir}
                    onChange={(e) => setQtdDistribuir(e.target.value)}
                    placeholder="0"
                    className="glass-input w-full text-center text-xl mb-3"
                    min="0"
                    max={embSelecionada.estoqueAtual}
                    autoFocus
                  />

                  <button
                    onClick={adicionarVinculo}
                    disabled={salvando || parseInt(qtdDistribuir || '0') > embSelecionada.estoqueAtual}
                    className="w-full py-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send size={16} />
                    {salvando ? 'Distribuindo...' : 'Distribuir'}
                  </button>
                </GlassCard>
              ) : (
                <GlassCard className="p-4" highlight>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white text-sm font-medium">Selecione a embalagem</p>
                    <button onClick={() => setShowAddEmb(false)} className="text-white/40 hover:text-white">
                      <X size={16} />
                    </button>
                  </div>

                  {embalagensDisponiveis.length === 0 ? (
                    <p className="text-white/40 text-xs text-center py-4">Todas as embalagens já foram vinculadas a esta barraca</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-auto">
                      {embalagensDisponiveis.map(emb => (
                        <button
                          key={emb.id}
                          onClick={() => selecionarEmbalagem(emb)}
                          disabled={salvando || emb.estoqueAtual === 0}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left disabled:opacity-40"
                        >
                          <Package size={16} className="text-white/40 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{emb.nome}</p>
                            <p className={`text-xs ${emb.estoqueAtual === 0 ? 'text-red-400' : 'text-white/30'}`}>
                              Estoque: {emb.estoqueAtual} un {emb.estoqueAtual === 0 && '(vazio)'}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-blue-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </GlassCard>
              )}

              {sucesso && (
                <p className="text-green-300 text-sm text-center bg-green-500/10 rounded-xl px-3 py-2">{sucesso}</p>
              )}
              {erro && (
                <p className="text-red-300 text-sm text-center bg-red-500/10 rounded-xl px-3 py-2">{erro}</p>
              )}

              {/* Embalagens vinculadas */}
              {vinculos.length === 0 && !showAddEmb && (
                <div className="text-center py-6">
                  <Package size={28} className="mx-auto text-white/20 mb-2" />
                  <p className="text-white/40 text-sm">Nenhuma embalagem vinculada</p>
                  <p className="text-white/25 text-xs mt-1">Use o botão acima para adicionar</p>
                </div>
              )}

              {vinculos.map(v => {
                const emb = embalagens.find(e => e.id === v.embalagemId);
                const estoqueGeral = emb?.estoqueAtual ?? 0;
                const expandido = showDistribuir === v.id;
                return (
                  <GlassCard key={v.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                        <Package size={18} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{v.embalagemNome}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-green-400 text-xs font-medium">{v.quantidadeRecebida} un</span>
                          <span className="text-white/30 text-xs">· Estoque geral: {estoqueGeral}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowDistribuir(expandido ? null : v.id); setQtdMais(''); setErro(''); }}
                        disabled={estoqueGeral === 0 && !expandido}
                        className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400/70 hover:text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-30"
                        title="Distribuir mais"
                      >
                        {expandido ? <Minus size={14} /> : <Plus size={14} />}
                      </button>
                      <button
                        onClick={() => removerVinculo(v.id)}
                        className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {expandido && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <label className="block text-white/60 text-xs mb-2">
                          Quanto distribuir a mais? (disponível: {estoqueGeral} un)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={qtdMais}
                            onChange={(e) => setQtdMais(e.target.value)}
                            placeholder="0"
                            className="glass-input flex-1 text-center"
                            min="1"
                            max={estoqueGeral}
                            autoFocus
                          />
                          <button
                            onClick={() => distribuirMais(v)}
                            disabled={salvando || !qtdMais || parseInt(qtdMais) <= 0 || parseInt(qtdMais) > estoqueGeral}
                            className="px-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            <Send size={14} />
                            {salvando ? '...' : 'OK'}
                          </button>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>

            {/* Espaço extra para não ficar atrás do BottomNav */}
            <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 80px)' }} />
          </div>
        </div>
      )}
    </Layout>
  );
}
