# Firebase Setup Reference

## Firebase Console checklist

Claude can't perform these steps — guide the user through them:

1. **Create project** at console.firebase.google.com — name it after the app.
2. **Enable Firestore** → Start in production mode → region `southamerica-east1` (closest to Brazil users).
3. **Upgrade to Blaze plan** — Settings → Usage and billing → Modify plan → Blaze. Requires a credit card (Pix prepaid doesn't work for v2 functions).
   - Set a **budget alert** around R$25/month via Google Cloud Console → Billing → Budgets.
4. **Enable Cloud Messaging** — Project settings → Cloud Messaging → Web configuration → Generate key pair → copy VAPID key.
5. **Register web app** — Project settings → General → Your apps → Web → copy the config block.
6. **Install tools locally**:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init functions   # TypeScript, install dependencies
   ```

## .env contents

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project>
VITE_FIREBASE_STORAGE_BUCKET=<project>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=B...
```

Mirror these as **Environment Variables** on Vercel.

## src/services/firebase.ts

```ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

export async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (!(await isSupported())) return null;
  try {
    return getMessaging(app);
  } catch {
    return null;
  }
}
```

## src/services/pushNotifications.ts

Full template with:
- `registrarPushAdmin(usuarioId, nome)` — permission prompt + SW register + getToken + Firestore doc + localStorage flag
- `removerPushAdmin()` — clears localStorage first, then tries deleteToken
- `temTokenRegistrado()` — `Notification.permission === 'granted' && localStorage has flag`
- `iniciarListenerForeground()` — onMessage + manual Notification construction + sound
- `isPushSuportado()` / `statusPermissao()` — feature checks

See `festejo-app/src/services/pushNotifications.ts` as the canonical implementation — copy and rename.

**Key subtlety**: use `localStorage['<app>:fcm-token']` as the source of truth for "is push active on this device?" — not `Notification.permission`, because iOS never lets you revoke the permission once granted.

## public/firebase-messaging-sw.js

```js
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIza...',          // Must be hard-coded — SW doesn't read env
  authDomain: '<project>.firebaseapp.com',
  projectId: '<project>',
  storageBucket: '<project>.firebasestorage.app',
  messagingSenderId: '...',
  appId: '...',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification?.title || 'New', {
    body: payload.notification?.body || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'notif-' + Date.now(),
  });
});
```

## functions/src/index.ts — notificarPedido template

```ts
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as admin from 'firebase-admin';

setGlobalOptions({ region: 'southamerica-east1' });
admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const notificarPedido = onDocumentCreated(
  'pedidos/{pedidoId}',
  async (event) => {
    const pedido = event.data?.data();
    if (!pedido) return;

    const title = 'Novo pedido';
    const body = `${pedido.barracaNome}: ${pedido.quantidade}× ${pedido.embalagemNome}`;

    // Pick tokens for admin recipients
    const tokensSnap = await db.collection('fcmTokens').where('tipo', '==', 'admin').get();
    const tokens = tokensSnap.docs.map((d) => d.id);
    if (!tokens.length) return;

    const resp = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      webpush: {
        fcmOptions: { link: '/admin' },
      },
    });

    console.log('Push enviado', {
      sucesso: resp.successCount,
      falha: resp.failureCount,
      pedidoId: event.params.pedidoId,
    });
  }
);
```

Rename the collection and payload fields for the new app's domain.

## Deploy gotchas

- **First-time v2 deploy** after upgrading to Blaze: Eventarc Service Agent takes 5-10 minutes to propagate. If you get an Eventarc permission error, wait and retry.
- **Functions + Firebase Storage are separate**: Artifact Registry stores Docker images for functions (30-day retention is fine). User-uploaded photos live in Firebase Storage — that's unrelated.
- **GitHub's secret scanner** will flag `VITE_FIREBASE_API_KEY` as a leaked secret. It's NOT a secret — Firebase web API keys are public by design. Dismiss as "Used in tests" / "False positive" in the repo alerts.

## Firestore rules

Write rules in `firestore.rules` and commit them. Default-deny, then open what's needed:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/{doc} {
      allow read: if true;
      allow write: if request.auth == null;  // Auth-less model
    }
    match /pedidos/{doc} {
      allow read, write: if true;  // Tighten before prod
    }
    // ... repeat per collection
  }
}
```

If the project is for a closed community (church, event), open rules are acceptable risk. For anything with real PII, lock down and add Firebase Auth.
