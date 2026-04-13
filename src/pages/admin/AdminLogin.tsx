import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../../components';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginAdmin, fotoFundo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const sucesso = await loginAdmin(senha);
      if (sucesso) {
        navigate('/admin');
      } else {
        setErro('Senha incorreta');
      }
    } catch (error) {
      setErro('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Foto de fundo */}
      {fotoFundo ? (
        <>
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${fotoFundo})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Overlay escuro */}
          <div className="absolute inset-0 z-0 bg-black/60" />
          {/* Blur suave na parte do formulário */}
          <div
            className="absolute inset-0 z-0"
            style={{
              background: 'linear-gradient(to top, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.4) 40%, transparent 70%)',
            }}
          />
        </>
      ) : (
        <>
          {/* Ambient lights (fallback quando não tem foto) */}
          <div className="ambient-light-top" />
          <div className="ambient-light-bottom" />
        </>
      )}

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo/Icon */}
        <div className="mb-8 text-center">
          <div
            className="w-24 h-24 mx-auto mb-4 rounded-[28px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }}
          >
            <span className="text-5xl">⛪</span>
          </div>
          <h1 className="text-2xl font-semibold text-white mb-1">Festejo App</h1>
          <p className="text-white/50 text-sm">Painel Administrativo</p>
        </div>

        {/* Login Card */}
        <GlassCard className="w-full max-w-sm p-6" highlight>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-2 font-medium">
                Senha do Administrador
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                  <Lock size={18} />
                </div>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite a senha"
                  className="glass-input w-full pl-11 pr-11"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-200 text-sm text-center">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !senha}
              className="btn-primary w-full"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </GlassCard>

        {/* Link para barracas */}
        <button
          onClick={() => navigate('/barraca/login')}
          className="mt-6 text-white/40 text-sm hover:text-white/60 transition-colors"
        >
          Sou responsável de barraca →
        </button>

      </main>
    </div>
  );
}
