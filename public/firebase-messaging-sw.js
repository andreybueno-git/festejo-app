// Service Worker do Firebase Cloud Messaging
// Roda em segundo plano para receber pushes quando o app está fechado.
// Importante: este arquivo tem que estar em /public/ e ser servido em / (raiz).

/* global importScripts, firebase, self, clients */

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Config do Firebase — precisa bater com VITE_FIREBASE_* do projeto.
// Esses valores são públicos, tudo bem estarem aqui.
firebase.initializeApp({
  apiKey: 'REPLACE_FIREBASE_API_KEY',
  authDomain: 'REPLACE_FIREBASE_AUTH_DOMAIN',
  projectId: 'REPLACE_FIREBASE_PROJECT_ID',
  storageBucket: 'REPLACE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'REPLACE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'REPLACE_FIREBASE_APP_ID',
});

const messaging = firebase.messaging();

// Mensagens em background (app fechado ou em outra aba)
messaging.onBackgroundMessage((payload) => {
  const titulo = (payload.notification && payload.notification.title) || 'Novo pedido';
  const opcoes = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'pedido-novo',
    renotify: true,
    data: payload.data || {},
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };
  self.registration.showNotification(titulo, opcoes);
});

// Clique na notificação → abre/foca o app na tela do admin
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = '/admin';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ('focus' in c) {
          c.navigate(url);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
