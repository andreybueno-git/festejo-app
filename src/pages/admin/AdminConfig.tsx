import { useState, useRef } from 'react';
import { Layout, GlassCard } from '../../components';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Key, Calendar, Bell, Users, RefreshCw, Check, Copy, LogOut, MessageCircle, Image, Trash2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../../services/firebase';

export default function AdminConfig() {
  const { codigoAcesso, atualizarCodigoAcesso, deslogarTodasBarracas, logout, fotoFundo } = useAuth();
  const navigate = useNavigate();
  const [novoCodigo, setNovoCodigo] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState({
    nomeFestejo: 'Festejo Paróquia São José 2026',
    dataInicio: '2026-06-15',
    dataFim: '2026-06-20',
    alertaEstoque: true,
    notificacoesPush: true,
    diaAtual: 2
  });

  const handleSalvarCodigo = async () => {
    if (!novoCodigo.trim()) return;
    setSalvando(true);
    await atualizarCodigoAcesso(novoCodigo);
    setNovoCodigo('');
    setSalvando(false);
  };

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoAcesso);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const compartilharWhatsApp = () => {
    const appUrl = 'https://festejo-app.vercel.app/barraca/login';
    const mensagem = `🎉 *Festejo App*\n\nOlá! Use o código abaixo para acessar o app das barracas:\n\n🔑 *Código:* ${codigoAcesso}\n\n📱 Acesse: ${appUrl}`;
    const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (ev) => setFotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    uploadFoto(file);
  };

  const uploadFoto = async (file: File) => {
    setUploadingFoto(true);
    try {
      const storageRef = ref(storage, `config/fundo_${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await setDoc(doc(db, 'config', 'geral'), {
        fotoFundo: url
      }, { merge: true });

      setFotoPreview(null);
    } catch (err) {
      console.error('Erro ao enviar foto:', err);
    } finally {
      setUploadingFoto(false);
    }
  };

  const removerFoto = async () => {
    setUploadingFoto(true);
    try {
      await setDoc(doc(db, 'config', 'geral'), {
        fotoFundo: ''
      }, { merge: true });
      setFotoPreview(null);
    } catch (err) {
      console.error('Erro ao remover foto:', err);
    } finally {
      setUploadingFoto(false);
    }
  };

  return (
    <Layout tipo="admin" showNav>
      <div className="page-content">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-white text-2xl font-semibold">Configurações</h1>
          <p className="text-white/50 text-sm">Gerencie o festejo</p>
        </div>

        <div className="space-y-4">

          {/* Foto de Fundo */}
          <GlassCard className="p-5" highlight>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Image size={20} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-medium">Foto de Fundo</p>
                <p className="text-white/50 text-xs">Imagem exibida na tela de login</p>
              </div>
            </div>

            {/* Preview da foto atual */}
            {(fotoFundo || fotoPreview) ? (
              <div className="relative rounded-xl overflow-hidden mb-4">
                <img
                  src={fotoPreview || fotoFundo}
                  alt="Fundo do app"
                  className="w-full h-40 object-cover"
                />
                {/* Overlay para simular como fica no login */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl">⛪</span>
                    <p className="text-white text-sm font-medium mt-1">Festejo App</p>
                  </div>
                </div>
                {uploadingFoto && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <RefreshCw size={24} className="text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/20 h-32 flex items-center justify-center mb-4">
                <div className="text-center">
                  <Image size={24} className="mx-auto text-white/20 mb-2" />
                  <p className="text-white/30 text-xs">Nenhuma foto definida</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFotoSelect}
              className="hidden"
            />

            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFoto}
                className="flex-1 py-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {uploadingFoto ? (
                  <><RefreshCw size={16} className="animate-spin" /> Enviando...</>
                ) : (
                  <><Image size={16} /> {fotoFundo ? 'Trocar foto' : 'Escolher foto'}</>
                )}
              </button>
              {fotoFundo && (
                <button
                  onClick={removerFoto}
                  disabled={uploadingFoto}
                  className="px-4 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </GlassCard>

          {/* Código de Acesso */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Key size={20} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Código de Acesso</p>
                <p className="text-white/50 text-xs">Para as barracas entrarem</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-white text-2xl font-mono tracking-widest">{codigoAcesso}</span>
                <button
                  onClick={copiarCodigo}
                  className="p-2 rounded-lg bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  {copiado ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={compartilharWhatsApp}
                className="flex-1 py-2.5 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-medium hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle size={16} />
                WhatsApp
              </button>
            </div>

            <div className="border-t border-white/10 pt-4">
              <label className="block text-white/70 text-sm mb-2">Alterar código</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={novoCodigo}
                  onChange={(e) => setNovoCodigo(e.target.value.toUpperCase())}
                  placeholder="NOVO CÓDIGO"
                  className="glass-input flex-1 uppercase tracking-widest"
                  maxLength={12}
                />
                <button
                  onClick={handleSalvarCodigo}
                  disabled={!novoCodigo.trim() || salvando}
                  className="px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50"
                >
                  {salvando ? <RefreshCw size={18} className="animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Informações do Festejo */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <Calendar size={20} className="text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium">Festejo</p>
                <p className="text-white/50 text-xs">Informações gerais</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-white/50 text-xs mb-1">Nome</label>
                <input
                  type="text"
                  value={config.nomeFestejo}
                  onChange={(e) => setConfig(prev => ({ ...prev, nomeFestejo: e.target.value }))}
                  className="glass-input w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-xs mb-1">Data Início</label>
                  <input
                    type="date"
                    value={config.dataInicio}
                    onChange={(e) => setConfig(prev => ({ ...prev, dataInicio: e.target.value }))}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={config.dataFim}
                    onChange={(e) => setConfig(prev => ({ ...prev, dataFim: e.target.value }))}
                    className="glass-input w-full"
                  />
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-white/50 text-xs">Dia atual do festejo</p>
                <p className="text-white text-2xl font-semibold">{config.diaAtual}</p>
              </div>
            </div>
          </GlassCard>

          {/* Notificações */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Bell size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-medium">Notificações</p>
                <p className="text-white/50 text-xs">Alertas e avisos</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-white/80 text-sm">Alerta de estoque baixo</span>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, alertaEstoque: !prev.alertaEstoque }))}
                  className={`w-12 h-7 rounded-full transition-colors ${config.alertaEstoque ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.alertaEstoque ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-white/80 text-sm">Notificações push</span>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, notificacoesPush: !prev.notificacoesPush }))}
                  className={`w-12 h-7 rounded-full transition-colors ${config.notificacoesPush ? 'bg-green-500' : 'bg-white/20'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${config.notificacoesPush ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Sessões das Barracas */}
          <GlassCard className="p-5" variant="danger">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Users size={20} className="text-red-400" />
              </div>
              <div>
                <p className="text-white font-medium">Sessões</p>
                <p className="text-white/50 text-xs">Gerenciar acessos</p>
              </div>
            </div>

            <button
              onClick={deslogarTodasBarracas}
              className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Deslogar todas as barracas
            </button>
            <p className="text-white/40 text-xs text-center mt-2">
              Isso forçará todos a fazer login novamente
            </p>
          </GlassCard>

          {/* Logout Admin */}
          <GlassCard className="p-5">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-white/5 border border-white/15 text-white/70 font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Sair da conta de administrador
            </button>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
