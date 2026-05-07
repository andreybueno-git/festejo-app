# Push Notifications (FCM)

Só o **admin** recebe pushes. Barracas não precisam receber.

## Requisitos

- Navegador com suporte a Notification API + Service Worker + FCM.
- **iOS**: só funciona em PWA **instalada na home screen** (não no Safari aberto).
- `VITE_FIREBASE_VAPID_KEY` configurada no `.env`.

## Arquivos envolvidos

- `src/services/pushNotifications.ts` — registrar, remover, listener.
- `public/firebase-messaging-sw.js` — service worker do FCM, mostra notificação em background.
- `functions/src/index.ts` — [[Firebase/Cloud Functions|notificarPedido]] envia o push.

## API pública (pushNotifications.ts)

```ts
registrarPushAdmin(usuarioId, nome) → Promise<string | null>  // retorna token
removerPushAdmin() → Promise<void>
temTokenRegistrado() → boolean
iniciarListenerForeground() → Promise<() => void>
isPushSuportado() → boolean
statusPermissao() → NotificationPermission | 'unsupported'
```

## Fluxo de registro

```
registrarPushAdmin:
  1. Pede permissão (Notification.requestPermission)
  2. Registra SW /firebase-messaging-sw.js em escopo /firebase-cloud-messaging-push-scope
  3. getToken(messaging, { vapidKey })
  4. setDoc(fcmTokens/{token}, { usuarioId, nome, tipo: 'admin', ... })
  5. localStorage.set('festejo:fcm-token', token)
```

## Source of truth do toggle

`temTokenRegistrado()` combina:
- `Notification.permission === 'granted'`
- Presença da chave `festejo:fcm-token` no localStorage

> 💡 Por que não só `Notification.permission`? Porque iOS não deixa apps revogar permissão — mesmo depois de `removerPushAdmin()` a permissão fica `granted`. Precisamos do localStorage pra saber se o usuário ativou *aqui* ou não. Ver [[Bugs & Fixes#Toggle push contraditório]].

## Listener em foreground

Por padrão FCM não mostra notificação quando app tá aberto. `iniciarListenerForeground` dispara `new Notification(...)` manualmente + toca som baixo.

## Veja também
- [[Firebase/Cloud Functions]]
- [[Módulo Admin/AdminConfig]]
- [[Bugs & Fixes]]
