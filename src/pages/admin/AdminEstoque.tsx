import { useState, useEffect, useRef } from 'react';
import { Layout, GlassCard } from '../../components';
import { Plus, Search, Package, AlertTriangle, Minus, X, Camera, Trash2 } from 'lucide-react';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { Embalagem } from '../../types';
import { comprimirImagem } from '../../utils/imageUtils';

export default function AdminEstoque() {
  const [embalagens, setEmbalagens] = useState<Embalagem[]>([]);
  const [busca, setBusca] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'nova' | 'entrada' | 'saida'>('nova');
  const [embalagemSelecionada, setEmbalagemSelecionada] = useState<Embalagem | null>(null);
  const [quantidade, setQuantidade] = useState('');
  const [novaEmb, setNovaEmb] = useState({ nome: '', estoqueInicial: '', estoqueMinimo: '50' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      () => { /* silently handle offline */ }
    );
    return () => unsub();
  }, []);

  const embalagensFiltradas = embalagens.filter(e =>
    e.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const estoqueBaixo = (emb: Embalagem) => emb.estoqueAtual <= emb.estoqueMinimo;

  const abrirModalEntrada = (emb: Embalagem) => {
    setEmbalagemSelecionada(emb);
    setModalType('entrada');
    setQuantidade('');
    setErro('');
    setShowModal(true);
  };

  const abrirModalSaida = (emb: Embalagem) => {
    setEmbalagemSelecionada(emb);
    setModalType('saida');
    setQuantidade('');
    setErro('');
    setShowModal(true);
  };

  const handleFotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setFotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removerFoto = () => {
    setFoto(null);
    setFotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const confirmarMovimentacao = async () => {
    if (!embalagemSelecionada || !quantidade) return;
    setSalvando(true);
    setErro('');
    const qtd = parseInt(quantidade);
    const novoEstoque = modalType === 'entrada'
      ? embalagemSelecionada.estoqueAtual + qtd
      : Math.max(0, embalagemSelecionada.estoqueAtual - qtd);

    try {
      await updateDoc(doc(db, 'embalagens', embalagemSelecionada.id), {
        estoqueAtual: novoEstoque,
        atualizadoEm: serverTimestamp(),
      });
      setShowModal(false);
      setEmbalagemSelecionada(null);
      setQuantidade('');
    } catch {
      setErro('Erro ao salvar. Verifique sua conexão.');
    } finally {
      setSalvando(false);
    }
  };

  const cadastrarEmbalagem = async () => {
    if (!novaEmb.nome.trim()) return;
    setSalvando(true);
    setErro('');
    try {
      let fotoUrl: string | undefined;

      if (foto) {
        try {
          // Tentar upload via Firebase Storage
          const timestamp = Date.now();
          const filename = foto.name.replace(/\s+/g, '_');
          const storagePath = `embalagens/${timestamp}_${filename}`;
          const storageRef = ref(storage, storagePath);
          await uploadBytes(storageRef, foto);
          fotoUrl = await getDownloadURL(storageRef);
        } catch {
          // Fallback: comprimir e salvar como base64 no Firestore
          try {
            fotoUrl = await comprimirImagem(foto, 400, 400, 0.5);
          } catch {
            // Se nem comprimir funcionar, ignorar a foto
          }
        }
      }

      await addDoc(collection(db, 'embalagens'), {
        nome: novaEmb.nome.trim(),
        estoqueAtual: parseInt(novaEmb.estoqueInicial) || 0,
        estoqueMinimo: parseInt(novaEmb.estoqueMinimo) || 50,
        unidade: 'unidade',
        ativo: true,
        fotoUrl: fotoUrl || null,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });

      setNovaEmb({ nome: '', estoqueInicial: '', estoqueMinimo: '50' });
      removerFoto();
      setShowModal(false);
    } catch {
      setErro('Erro ao cadastrar. Verifique sua conexão.');
    } finally {
      setSalvando(false);
    }
  };

  const excluirEmbalagem = async (emb: Embalagem) => {
    if (!confirm(`Excluir "${emb.nome}"?`)) return;
    try {
      await deleteDoc(doc(db, 'embalagens', emb.id));
    } catch {
      setErro('Erro ao excluir.');
    }
  };

  return (
    <Layout tipo="admin" showNav>
      <div className="page-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white text-2xl font-semibold">Estoque</h1>
            <p className="text-white/50 text-sm">{embalagens.length} embalagens cadastradas</p>
          </div>
          <button
            onClick={() => { setNovaEmb({ nome: '', estoqueInicial: '', estoqueMinimo: '50' }); setErro(''); removerFoto(); setModalType('nova'); setShowModal(true); }}
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

        {/* Lista */}
        <div className="space-y-3">
          {embalagens.length === 0 && (
            <GlassCard className="p-8 text-center">
              <Package size={32} className="mx-auto text-white/30 mb-2" />
              <p className="text-white/50 text-sm">Nenhuma embalagem cadastrada</p>
              <p className="text-white/30 text-xs mt-1">Toque em + para adicionar</p>
            </GlassCard>
          )}
          {embalagensFiltradas.map(emb => (
            <GlassCard
              key={emb.id}
              className="p-4"
              variant={estoqueBaixo(emb) ? 'warning' : 'default'}
            >
              <div className="flex items-start gap-3">
                {/* Ícone */}
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  {emb.fotoUrl
                    ? <img src={emb.fotoUrl} alt={emb.nome} className="w-full h-full object-cover rounded-xl" />
                    : <Package size={24} className="text-white/60" />
                  }
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
                      <p className="text-white/30 text-xs mt-0.5">Mín: {emb.estoqueMinimo}</p>
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
                    <button
                      onClick={() => excluirEmbalagem(emb)}
                      className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
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
                onClick={() => {
                  setShowModal(false);
                  if (modalType === 'nova') {
                    removerFoto();
                  }
                }}
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
                    value={novaEmb.nome}
                    onChange={(e) => setNovaEmb(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Copo 300ml"
                    className="glass-input w-full"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Estoque Inicial</label>
                    <input
                      type="number"
                      value={novaEmb.estoqueInicial}
                      onChange={(e) => setNovaEmb(prev => ({ ...prev, estoqueInicial: e.target.value }))}
                      placeholder="0"
                      className="glass-input w-full"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Estoque Mínimo</label>
                    <input
                      type="number"
                      value={novaEmb.estoqueMinimo}
                      onChange={(e) => setNovaEmb(prev => ({ ...prev, estoqueMinimo: e.target.value }))}
                      placeholder="50"
                      className="glass-input w-full"
                      min="1"
                    />
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoSelect}
                    className="hidden"
                  />
                  {fotoPreview ? (
                    <div className="relative">
                      <img
                        src={fotoPreview}
                        alt="preview"
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <button
                        onClick={removerFoto}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 text-sm flex items-center justify-center gap-2 hover:border-white/40 transition-colors"
                    >
                      <Camera size={18} />
                      Adicionar foto
                    </button>
                  )}
                </div>

                {erro && (
                  <p className="text-red-300 text-sm text-center bg-red-500/10 rounded-xl px-3 py-2">{erro}</p>
                )}

                <button
                  onClick={cadastrarEmbalagem}
                  disabled={!novaEmb.nome.trim() || salvando}
                  className="btn-primary w-full mt-2 disabled:opacity-50"
                >
                  {salvando ? 'Cadastrando...' : 'Cadastrar Embalagem'}
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
                    autoFocus
                  />
                </div>

                {erro && (
                  <p className="text-red-300 text-sm text-center bg-red-500/10 rounded-xl px-3 py-2">{erro}</p>
                )}

                <button
                  onClick={confirmarMovimentacao}
                  disabled={!quantidade || parseInt(quantidade) <= 0 || salvando}
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    modalType === 'entrada'
                      ? 'bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30'
                      : 'bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30'
                  } disabled:opacity-50`}
                >
                  {salvando ? 'Salvando...' : `Confirmar ${modalType === 'entrada' ? 'Entrada' : 'Saída'}`}
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      )}
    </Layout>
  );
}
