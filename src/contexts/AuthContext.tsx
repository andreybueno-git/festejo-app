import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Usuario, Barraca, AuthContextType } from '../types';

// ============================================
// DADOS MOCK PARA DESENVOLVIMENTO
// Em produção, substituir por chamadas ao Firebase
// ============================================

const MOCK_ADMIN: Usuario = {
  id: 'admin-1',
  nome: 'Administrador',
  tipo: 'admin',
  criadoEm: new Date(),
  ativo: true
};

const MOCK_BARRACAS: Barraca[] = [
  { id: '1', nome: 'Barraca do Pastel', icone: '🥟', criadaEm: new Date(), ativa: true },
  { id: '2', nome: 'Barraca do Churros', icone: '🍩', criadaEm: new Date(), ativa: true },
  { id: '3', nome: 'Barraca do Hot Dog', icone: '🌭', criadaEm: new Date(), ativa: true },
  { id: '4', nome: 'Barraca da Pipoca', icone: '🍿', criadaEm: new Date(), ativa: true },
  { id: '5', nome: 'Barraca do Algodão Doce', icone: '🍭', criadaEm: new Date(), ativa: true },
  { id: '6', nome: 'Barraca da Pizza', icone: '🍕', criadaEm: new Date(), ativa: true },
  { id: '7', nome: 'Barraca do Espetinho', icone: '🍢', criadaEm: new Date(), ativa: true },
  { id: '8', nome: 'Barraca do Caldo', icone: '🍲', criadaEm: new Date(), ativa: true },
];

// Credenciais mock
const MOCK_CODIGO_ACESSO = 'FESTEJO2026';
const MOCK_SENHA_ADMIN = 'admin123';

// ============================================

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [barraca, setBarraca] = useState<Barraca | null>(null);
  const [barracas] = useState<Barraca[]>(MOCK_BARRACAS);
  const [loading, setLoading] = useState(true);
  const [codigoAcesso, setCodigoAcesso] = useState(MOCK_CODIGO_ACESSO);

  // Verificar se há sessão salva
  useEffect(() => {
    const checkSession = () => {
      try {
        const savedUser = localStorage.getItem('festejo_usuario');
        const savedBarraca = localStorage.getItem('festejo_barraca');
        
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUsuario(parsed);
          
          if (savedBarraca) {
            setBarraca(JSON.parse(savedBarraca));
          }
        }
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        localStorage.removeItem('festejo_usuario');
        localStorage.removeItem('festejo_barraca');
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, []);

  const isAdmin = usuario?.tipo === 'admin';
  const isBarraca = usuario?.tipo === 'responsavel' && barraca !== null;

  // Login Admin (apenas senha)
  const loginAdmin = async (senha: string): Promise<boolean> => {
    // Em produção, verificar no Firebase
    if (senha === MOCK_SENHA_ADMIN) {
      setUsuario(MOCK_ADMIN);
      localStorage.setItem('festejo_usuario', JSON.stringify(MOCK_ADMIN));
      return true;
    }
    return false;
  };

  // Verificar código de acesso das barracas
  const verificarCodigo = async (codigo: string): Promise<boolean> => {
    // Em produção, verificar no Firebase
    return codigo.toUpperCase() === codigoAcesso;
  };

  // Login Barraca
  const loginBarraca = async (nomeResponsavel: string, barracaId: string): Promise<boolean> => {
    const barracaSelecionada = barracas.find(b => b.id === barracaId);
    
    if (!barracaSelecionada) {
      return false;
    }

    const novoUsuario: Usuario = {
      id: `resp-${Date.now()}`,
      nome: nomeResponsavel,
      tipo: 'responsavel',
      barracaId: barracaId,
      criadoEm: new Date(),
      ativo: true
    };

    setUsuario(novoUsuario);
    setBarraca(barracaSelecionada);
    
    localStorage.setItem('festejo_usuario', JSON.stringify(novoUsuario));
    localStorage.setItem('festejo_barraca', JSON.stringify(barracaSelecionada));
    
    return true;
  };

  // Logout
  const logout = () => {
    setUsuario(null);
    setBarraca(null);
    localStorage.removeItem('festejo_usuario');
    localStorage.removeItem('festejo_barraca');
  };

  // Atualizar código de acesso
  const atualizarCodigoAcesso = async (novoCodigo: string): Promise<boolean> => {
    // Em produção, salvar no Firebase
    setCodigoAcesso(novoCodigo.toUpperCase());
    return true;
  };

  // Deslogar todas as barracas
  const deslogarTodasBarracas = async () => {
    // Em produção, invalidar todas as sessões no Firebase
    // Por enquanto, só limpa localmente se for barraca
    if (isBarraca) {
      logout();
    }
  };

  const value: AuthContextType = {
    usuario,
    barraca,
    barracaAtual: barraca, // alias
    barracas,
    barracasDisponiveis: barracas, // alias
    loading,
    isAdmin,
    isBarraca,
    codigoAcesso,
    loginAdmin,
    verificarCodigo,
    loginBarraca,
    logout,
    atualizarCodigoAcesso,
    deslogarTodasBarracas
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
