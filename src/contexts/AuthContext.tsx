import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { Usuario, Barraca, AuthContextType } from '../types';

const ADMIN_USUARIO: Usuario = {
  id: 'admin-1',
  nome: 'Administrador',
  tipo: 'admin',
  criadoEm: new Date(),
  ativo: true
};

const DEFAULT_SENHA_ADMIN = 'admin123';
const DEFAULT_CODIGO_ACESSO = 'FESTEJO2026';
const CONFIG_DOC = 'geral';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [barraca, setBarraca] = useState<Barraca | null>(null);
  const [barracas, setBarracas] = useState<Barraca[]>([]);
  const [loading, setLoading] = useState(true);
  const [senhaAdmin, setSenhaAdmin] = useState(DEFAULT_SENHA_ADMIN);
  const [codigoAcesso, setCodigoAcesso] = useState(DEFAULT_CODIGO_ACESSO);

  useEffect(() => {
    // Restaurar sessão salva
    try {
      const savedUser = localStorage.getItem('festejo_usuario');
      const savedBarraca = localStorage.getItem('festejo_barraca');
      if (savedUser) {
        setUsuario(JSON.parse(savedUser));
        if (savedBarraca) setBarraca(JSON.parse(savedBarraca));
      }
    } catch {
      localStorage.removeItem('festejo_usuario');
      localStorage.removeItem('festejo_barraca');
    }

    // Ouvir barracas do Firestore
    const unsubBarracas = onSnapshot(
      collection(db, 'barracas'),
      (snap) => {
        const lista = snap.docs
          .map(d => ({
            id: d.id,
            ...d.data(),
            criadaEm: d.data().criadaEm?.toDate?.() ?? new Date(),
            atualizadaEm: d.data().atualizadaEm?.toDate?.() ?? undefined,
          })) as Barraca[];
        setBarracas(lista.filter(b => b.ativa !== false));
      },
      () => { /* silently handle offline */ }
    );

    // Ouvir configurações do Firestore
    const unsubConfig = onSnapshot(
      doc(db, 'config', CONFIG_DOC),
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data.senhaAdmin) setSenhaAdmin(data.senhaAdmin);
          if (data.codigoAcesso) setCodigoAcesso(data.codigoAcesso);
        } else {
          // Criar doc de config padrão na primeira execução
          try {
            await setDoc(doc(db, 'config', CONFIG_DOC), {
              senhaAdmin: DEFAULT_SENHA_ADMIN,
              codigoAcesso: DEFAULT_CODIGO_ACESSO,
              nomeFestejo: 'Festejo 2026',
              criadoEm: serverTimestamp(),
            });
          } catch { /* ignore */ }
        }
      },
      () => { /* silently handle offline */ }
    );

    setLoading(false);

    return () => {
      unsubBarracas();
      unsubConfig();
    };
  }, []);

  const isAdmin = usuario?.tipo === 'admin';
  const isBarraca = usuario?.tipo === 'responsavel' && barraca !== null;

  const loginAdmin = async (senha: string): Promise<boolean> => {
    if (senha === senhaAdmin) {
      setUsuario(ADMIN_USUARIO);
      localStorage.setItem('festejo_usuario', JSON.stringify(ADMIN_USUARIO));
      return true;
    }
    return false;
  };

  const verificarCodigo = async (codigo: string): Promise<boolean> => {
    return codigo.toUpperCase() === codigoAcesso;
  };

  const loginBarraca = async (nomeResponsavel: string, barracaId: string): Promise<boolean> => {
    const barracaSelecionada = barracas.find(b => b.id === barracaId);
    if (!barracaSelecionada) return false;

    const novoUsuario: Usuario = {
      id: `resp-${Date.now()}`,
      nome: nomeResponsavel,
      tipo: 'responsavel',
      barracaId,
      criadoEm: new Date(),
      ativo: true
    };

    setUsuario(novoUsuario);
    setBarraca(barracaSelecionada);
    localStorage.setItem('festejo_usuario', JSON.stringify(novoUsuario));
    localStorage.setItem('festejo_barraca', JSON.stringify(barracaSelecionada));
    return true;
  };

  const logout = () => {
    setUsuario(null);
    setBarraca(null);
    localStorage.removeItem('festejo_usuario');
    localStorage.removeItem('festejo_barraca');
  };

  const atualizarCodigoAcesso = async (novoCodigo: string): Promise<boolean> => {
    try {
      await setDoc(doc(db, 'config', CONFIG_DOC), {
        codigoAcesso: novoCodigo.toUpperCase()
      }, { merge: true });
      setCodigoAcesso(novoCodigo.toUpperCase());
      return true;
    } catch {
      return false;
    }
  };

  const deslogarTodasBarracas = async (): Promise<void> => {
    try {
      await setDoc(doc(db, 'config', CONFIG_DOC), {
        sessionToken: Date.now()
      }, { merge: true });
    } catch { /* ignore */ }
    if (isBarraca) logout();
  };

  const adicionarBarraca = async (nome: string, icone: string): Promise<boolean> => {
    try {
      await addDoc(collection(db, 'barracas'), {
        nome: nome.trim(),
        icone,
        ativa: true,
        criadaEm: serverTimestamp(),
      });
      return true;
    } catch {
      return false;
    }
  };

  const editarBarraca = async (id: string, dados: Partial<Barraca>): Promise<boolean> => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, criadaEm: _c, ...resto } = dados as any;
      await updateDoc(doc(db, 'barracas', id), {
        ...resto,
        atualizadaEm: serverTimestamp(),
      });
      return true;
    } catch {
      return false;
    }
  };

  const value: AuthContextType = {
    usuario,
    barraca,
    barracaAtual: barraca,
    barracas,
    barracasDisponiveis: barracas,
    loading,
    isAdmin,
    isBarraca,
    codigoAcesso,
    loginAdmin,
    verificarCodigo,
    loginBarraca,
    logout,
    atualizarCodigoAcesso,
    deslogarTodasBarracas,
    adicionarBarraca,
    editarBarraca,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
