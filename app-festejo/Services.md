# Services

## firebase.ts

Path: `src/services/firebase.ts`

Inicializa Firebase App e expõe:
- `db` — Firestore instance
- `messaging` — via `getMessagingIfSupported()` (nullable)
- Config lida de `import.meta.env.VITE_FIREBASE_*`

## pushNotifications.ts

Path: `src/services/pushNotifications.ts`

Ver [[Firebase/Push Notifications (FCM)]] pra detalhes.

API pública:
- `registrarPushAdmin(usuarioId, nome)`
- `removerPushAdmin()`
- `iniciarListenerForeground()`
- `temTokenRegistrado()`
- `isPushSuportado()`
- `statusPermissao()`

## AuthContext

Path: `src/contexts/AuthContext.tsx`

Não é um service, mas é central. Expõe:
- Estado: `usuario`, `barraca`, `barracas`, `loading`, `codigoAcesso`, `senhaAdmin`, `fotoFundo`
- Getters: `isAdmin`, `isBarraca`
- Ações: `loginAdmin`, `loginBarraca`, `verificarCodigo`, `logout`, `atualizarCodigoAcesso`, `atualizarSenhaAdmin`, `deslogarTodasBarracas`, `adicionarBarraca`, `editarBarraca`, `removerBarraca`, `atualizarFotoFundo`...

Ver [[Firebase/Auth Flow]].

## Veja também
- [[03 - Estrutura de Pastas]]
- [[Firebase/Firebase - Visão Geral]]
