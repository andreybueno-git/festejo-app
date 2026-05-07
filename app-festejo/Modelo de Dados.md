# Modelo de Dados

Fonte canônica: `src/types/index.ts`.

## Usuario

```ts
type TipoUsuario = 'admin' | 'responsavel';

interface Usuario {
  id: string;
  nome: string;
  tipo: TipoUsuario;
  barracaId?: string;     // só pra responsável
  criadoEm: Date;
  ativo: boolean;
}
```

Guardado em `localStorage` (`festejo_usuario`), não em Firestore.

## Barraca

```ts
interface Barraca {
  id: string;
  nome: string;
  icone: string;          // emoji
  ativa: boolean;
  responsavelNome?: string;
  responsavelId?: string;
  criadaEm: Date;
}
```

Coleção: `barracas`. [[Módulo Barraca/BarracaLogin]] grava `responsavelNome` + `responsavelId` quando a pessoa entra.

## Embalagem

```ts
interface Embalagem {
  id: string;
  nome: string;
  icone: string;
  estoqueAtual: number;
  estoqueMinimo: number;  // limiar pra alerta
  ativo: boolean;
}
```

Coleção: `embalagens`. Alerta de estoque baixo aparece quando `estoqueAtual <= estoqueMinimo`.

## Pedido

```ts
interface Pedido {
  id: string;
  barracaId: string;
  barracaNome: string;
  embalagemId: string;
  embalagemNome: string;
  quantidade: number;
  motivo: string;
  status: 'pendente' | 'concluido';
  usuarioPedidoId: string;
  criadoEm: FirestoreTimestamp;
  concluidoEm?: FirestoreTimestamp;
}
```

Coleção: `pedidos`. Trigger [[Firebase/Cloud Functions|notificarPedido]] dispara quando um pedido é criado.

> ⚠️ `criadoEm` é um **Firestore Timestamp**, não `Date`. Precisa de `.toDate()` ou leitura de `.seconds` antes de usar. Ver [[Bugs & Fixes#NaNh no tempo dos pedidos|bug NaNh]].

## fcmTokens

Coleção: `fcmTokens`. Doc id = o próprio token FCM.

```ts
{
  token: string;
  usuarioId: string;
  nome: string;
  tipo: 'admin';
  userAgent: string;
  atualizadoEm: Timestamp;
}
```

Criado por [[Firebase/Push Notifications (FCM)|pushNotifications.registrarPushAdmin]].

## config/geral

Doc singleton: `config/geral`.

```ts
{
  senhaAdmin?: string;
  codigoAcesso?: string;
  fotoFundo?: string;
  sessionToken?: number;   // bump pra forçar logout de todas as barracas
}
```

## Veja também
- [[Firebase/Firestore - Coleções]]
- [[Firebase/Auth Flow]]
