import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components';
import { Key, User, ChevronDown, Check, Store } from 'lucide-react';

export function BarracaLogin() {
  const [etapa, setEtapa] = useState<'codigo' | 'selecao'>('codigo');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [barracaSelecionada, setBarracaSelecionada] = useState('');
  const [showBarracas, setShowBarracas] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginBarraca, verificarCodigo, barracasDisponiveis, fotoFundo } = useAuth();
  const navigate = useNavigate();

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const valido = await verificarCodigo(codigoAcesso);
      if (valido) {
        setEtapa('selecao');
      } else {
        setErro('Código de acesso inválido');
      }
    } catch {
      setErro('Erro ao verificar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (!nomeResponsavel.trim()) {
      setErro('Digite seu nome');
      return;
    }

    if (!barracaSelecionada) {
      setErro('Selecione uma barraca');
      return;
    }

    setLoading(true);

    try {
      const sucesso = await loginBarraca(nomeResponsavel.trim(), barracaSelecionada);
      if (sucesso) {
        navigate('/barraca');
      } else {
        setErro('Erro ao fazer login. Barraca pode ter sido removida.');
      }
    } catch {
      setErro('Erro ao fazer login. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  const barracaAtual = barracasDisponiveis.find(b => b.id === barracaSelecionada);

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={fotoFundo ? {
        backgroundImage: `url(${fotoFundo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {/* Overlay escuro quando tem foto de fundo */}
      {fotoFundo && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      )}

      {/* Ambient lights */}
      <div className="ambient-light-top" />
      <div className="ambient-light-bottom" />

      {/* Content */}
      <main
        className="flex-1 flex flex-col items-center justify-center px-6 relative z-10"
        style={{ paddingTop: 'env(safe-area-inset-top, 24px)', paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      >
        {/* Logo/Icon */}
        <div className="mb-8 text-center">
          <div
            className="w-24 h-24 mx-auto mb-4 rounded-[28px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(34,197,94,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            <span className="text-5xl">🎪</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">Festejo App</h1>
          <p className="text-white/50 text-sm">
            {etapa === 'codigo' ? 'Acesso das Barracas' : 'Identificação'}
          </p>
        </div>

        {/* Etapa 1: Código de Acesso */}
        {etapa === 'codigo' && (
          <GlassCard className="w-full max-w-sm p-6" highlight>
            <form onSubmit={handleVerificarCodigo} className="space-y-5">
              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">
                  Código de Acesso
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <Key size={18} />
                  </div>
                  <input
                    type="text"
                    value={codigoAcesso}
                    onChange={(e) => setCodigoAcesso(e.target.value.toUpperCase())}
                    placeholder="Digite o código"
                    className="glass-input w-full pl-11 uppercase tracking-wider"
                    disabled={loading}
                    autoCapitalize="characters"
                    autoFocus
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">
                  Peça o código ao administrador do festejo
                </p>
              </div>

              {erro && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-red-200 text-sm text-center">{erro}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !codigoAcesso}
                className="btn-primary w-full"
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          </GlassCard>
        )}

        {/* Etapa 2: Seleção de Barraca */}
        {etapa === 'selecao' && (
          <GlassCard className="w-full max-w-sm p-6" highlight>
            <form onSubmit={handleEntrar} className="space-y-5">
              {/* Nome do responsável */}
              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">
                  Seu Nome
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={nomeResponsavel}
                    onChange={(e) => setNomeResponsavel(e.target.value)}
                    placeholder="Digite seu nome"
                    className="glass-input w-full pl-11"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {/* Seleção de barraca */}
              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">
                  Sua Barraca
                </label>

                {barracasDisponiveis.length === 0 ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 flex items-start gap-3">
                    <Store size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-200 text-sm font-medium">
                        Nenhuma barraca cadastrada
                      </p>
                      <p className="text-amber-200/70 text-xs mt-1">
                        Peça ao administrador para cadastrar sua barraca antes de entrar.
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBarracas(true)}
                    className="glass-input w-full text-left flex items-center justify-between"
                    disabled={loading}
                  >
                    {barracaAtual ? (
                      <span className="flex items-center gap-3">
                        <span className="text-xl">{barracaAtual.icone}</span>
                        <span className="text-white truncate">{barracaAtual.nome}</span>
                      </span>
                    ) : (
                      <span className="text-white/40">Selecione uma barraca</span>
                    )}
                    <ChevronDown
                      size={18}
                      className="text-white/40 flex-shrink-0 ml-2"
                    />
                  </button>
                )}
              </div>

              {erro && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-red-200 text-sm text-center">{erro}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !nomeResponsavel.trim() || !barracaSelecionada || barracasDisponiveis.length === 0}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              {/* Botão voltar */}
              <button
                type="button"
                onClick={() => {
                  setEtapa('codigo');
                  setErro('');
                  setBarracaSelecionada('');
                  setNomeResponsavel('');
                }}
                className="w-full text-white/40 text-sm hover:text-white/60 transition-colors"
              >
                ← Voltar para o código
              </button>
            </form>
          </GlassCard>
        )}

        {/* Link para admin */}
        <button
          onClick={() => navigate('/')}
          className="mt-6 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Sou administrador →
        </button>
      </main>

      {/* Bottom sheet de seleção de barraca (sempre scroll nativo) */}
      {showBarracas && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
          onClick={() => setShowBarracas(false)}
        >
          <div
            className="mt-auto max-h-[80vh] flex flex-col rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, rgba(20,30,60,0.99) 0%, rgba(10,22,40,0.99) 100%)',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/10">
              <h2 className="text-white text-lg font-semibold">Selecione sua barraca</h2>
              <button
                onClick={() => setShowBarracas(false)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Lista com scroll nativo */}
            <div
              className="flex-1 overflow-y-auto px-3 py-3"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {barracasDisponiveis.map(barraca => (
                <button
                  key={barraca.id}
                  type="button"
                  onClick={() => {
                    setBarracaSelecionada(barraca.id);
                    setShowBarracas(false);
                  }}
                  className={`w-full px-4 py-4 mb-2 rounded-xl flex items-center justify-between transition-colors ${
                    barracaSelecionada === barraca.id
                      ? 'bg-blue-500/25 border border-blue-400/40'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl flex-shrink-0">{barraca.icone}</span>
                    <span className="text-white font-medium truncate">{barraca.nome}</span>
                  </span>
                  {barracaSelecionada === barraca.id && (
                    <Check size={20} className="text-green-400 flex-shrink-0 ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BarracaLogin;
