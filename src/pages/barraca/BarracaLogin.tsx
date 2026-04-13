import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components';
import { Key, User, ChevronDown, Check } from 'lucide-react';

export function BarracaLogin() {
  const [etapa, setEtapa] = useState<'codigo' | 'selecao'>('codigo');
  const [codigoAcesso, setCodigoAcesso] = useState('');
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [barracaSelecionada, setBarracaSelecionada] = useState('');
  const [showBarracas, setShowBarracas] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginBarraca } = useAuth();
  const navigate = useNavigate();

  // Mock de barracas disponíveis (virá do Firebase)
  const barracas = [
    { id: '1', nome: 'Barraca do Pastel', icone: '🥟' },
    { id: '2', nome: 'Barraca do Churros', icone: '🍩' },
    { id: '3', nome: 'Barraca da Pipoca', icone: '🍿' },
    { id: '4', nome: 'Barraca do Espetinho', icone: '🍢' },
    { id: '5', nome: 'Barraca das Bebidas', icone: '🥤' },
    { id: '6', nome: 'Barraca do Cachorro-Quente', icone: '🌭' },
  ];

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    // Simula verificação do código
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock: código válido é "FESTEJO2026"
    if (codigoAcesso.toUpperCase() === 'FESTEJO2026') {
      setEtapa('selecao');
    } else {
      setErro('Código de acesso inválido');
    }
    setLoading(false);
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
      const sucesso = await loginBarraca(nomeResponsavel, barracaSelecionada);
      if (sucesso) {
        navigate('/barraca');
      } else {
        setErro('Erro ao fazer login');
      }
    } catch (error) {
      setErro('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const barracaAtual = barracas.find(b => b.id === barracaSelecionada);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient lights */}
      <div className="ambient-light-top" />
      <div className="ambient-light-bottom" />
      
      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
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
                    placeholder="Ex: FESTEJO2026"
                    className="glass-input w-full pl-11 uppercase tracking-wider"
                    disabled={loading}
                    autoCapitalize="characters"
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
                  />
                </div>
              </div>

              {/* Seleção de barraca */}
              <div>
                <label className="block text-white/70 text-sm mb-2 font-medium">
                  Sua Barraca
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBarracas(!showBarracas)}
                    className="glass-input w-full text-left flex items-center justify-between"
                    disabled={loading}
                  >
                    {barracaAtual ? (
                      <span className="flex items-center gap-3">
                        <span className="text-xl">{barracaAtual.icone}</span>
                        <span className="text-white">{barracaAtual.nome}</span>
                      </span>
                    ) : (
                      <span className="text-white/40">Selecione uma barraca</span>
                    )}
                    <ChevronDown 
                      size={18} 
                      className={`text-white/40 transition-transform ${showBarracas ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Dropdown */}
                  {showBarracas && (
                    <div 
                      className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-20"
                      style={{
                        background: 'linear-gradient(165deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                      }}
                    >
                      {barracas.map(barraca => (
                        <button
                          key={barraca.id}
                          type="button"
                          onClick={() => {
                            setBarracaSelecionada(barraca.id);
                            setShowBarracas(false);
                          }}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/10 transition-colors"
                        >
                          <span className="flex items-center gap-3">
                            <span className="text-xl">{barraca.icone}</span>
                            <span className="text-white">{barraca.nome}</span>
                          </span>
                          {barracaSelecionada === barraca.id && (
                            <Check size={18} className="text-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {erro && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-red-200 text-sm text-center">{erro}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !nomeResponsavel || !barracaSelecionada}
                className="btn-primary w-full"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              {/* Botão voltar */}
              <button
                type="button"
                onClick={() => {
                  setEtapa('codigo');
                  setErro('');
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

        {/* Dica para desenvolvimento */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">
            Modo desenvolvimento: código = FESTEJO2026
          </p>
        </div>
      </main>
    </div>
  );
}

export default BarracaLogin;
