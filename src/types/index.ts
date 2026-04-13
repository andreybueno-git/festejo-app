// Tipos principais do App Festejo

export type TipoUsuario = 'admin' | 'responsavel';

export interface Usuario {
  id: string;
  nome: string;
  tipo: TipoUsuario;
  barracaId?: string;
  ativo: boolean;
  ultimoAcesso?: Date;
  criadoEm: Date;
}

export interface Barraca {
  id: string;
  nome: string;
  icone: string;
  descricao?: string;
  responsavelNome?: string;
  responsavelId?: string;
  ativa: boolean;
  criadaEm: Date;
  atualizadaEm?: Date;
}

export interface Embalagem {
  id: string;
  nome: string;
  descricao?: string;
  fotoUrl?: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  unidade: 'unidade' | 'pacote';
  ativo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Vinculo {
  id: string;
  barracaId: string;
  embalagemId: string;
  quantidadePrevista: number;
  quantidadeRecebida: number;
  criadoEm: Date;
  atualizadoEm: Date;
}

export interface Movimentacao {
  id: string;
  tipo: 'entrada' | 'saida';
  embalagemId: string;
  embalagemNome: string;
  quantidade: number;
  barracaId?: string;
  barracaNome?: string;
  motivo?: string;
  data: Date;
  diaFestejo: number;
  usuarioId: string;
  criadoEm: Date;
}

export interface Pedido {
  id: string;
  barracaId: string;
  barracaNome: string;
  embalagemId: string;
  embalagemNome: string;
  quantidade: number;
  motivo: string;
  status: 'pendente' | 'concluido';
  diaFestejo: number;
  criadoEm: Date;
  concluidoEm?: Date;
  usuarioPedidoId: string;
  usuarioConclusaoId?: string;
}

export interface ConfigFestejo {
  id: string;
  codigoAcesso: string;
  nomeFestejo: string;
  dataInicio: Date;
  dataFim: Date;
  diasFestejo: number;
  alertaEstoqueBaixo: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

// Tipos de contexto
export interface AuthContextType {
  usuario: Usuario | null;
  barraca: Barraca | null;
  barracaAtual: Barraca | null; // alias para barraca
  barracas: Barraca[];
  barracasDisponiveis: Barraca[]; // alias para barracas
  loading: boolean;
  isAdmin: boolean;
  isBarraca: boolean;
  codigoAcesso: string;
  loginAdmin: (senha: string) => Promise<boolean>;
  verificarCodigo: (codigo: string) => Promise<boolean>;
  loginBarraca: (nomeResponsavel: string, barracaId: string) => Promise<boolean>;
  logout: () => void;
  atualizarCodigoAcesso: (novoCodigo: string) => Promise<boolean>;
  deslogarTodasBarracas: () => Promise<void>;
}

// Versículo
export interface Versiculo {
  dia: number;
  texto: string;
  referencia: string;
}
