import { getToken, onMessage, deleteToken } from 'firebase/messaging';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { getMessagingIfSupported, db } from './firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY as string | undefined;

/**
 * Pede permissão ao usuário e registra o token FCM no Firestore.
 * Retorna o token salvo ou null se falhou / não suportado.
 */
export async function registrarPushAdmin(usuarioId: string, nome: string): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('[push] VITE_FIREBASE_VAPID_KEY não configurada');
    return null;
  }

  if (!('Notification' in window)) {
    console.warn('[push] Navegador sem suporte a Notification API');
    return null;
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) {
    console.warn('[push] FCM não suportado neste navegador');
    return null;
  }

  // Pede permissão
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') {
    console.warn('[push] Permissão negada');
    return null;
  }

  // Registra o service worker do FCM
  let swReg: ServiceWorkerRegistration | undefined;
  if ('serviceWorker' in navigator) {
    try {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope',
      });
    } catch (e) {
      console.warn('[push] Falha ao registrar SW do FCM:', e);
      return null;
    }
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) {
      console.warn('[push] getToken retornou vazio');
      return null;
    }

    // Salva no Firestore: fcmTokens/{token} → dono + timestamp
    await setDoc(doc(db, 'fcmTokens', token), {
      token,
      usuarioId,
      nome,
      tipo: 'admin',
      userAgent: navigator.userAgent,
      atualizadoEm: serverTimestamp(),
    });

    console.log('[push] Token registrado:', token.slice(0, 20) + '...');
    return token;
  } catch (e) {
    console.error('[push] Erro ao obter/salvar token:', e);
    return null;
  }
}

/**
 * Remove o registro do push para este dispositivo (logout ou toggle off).
 */
export async function removerPushAdmin(): Promise<void> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return;

  try {
    // Não há API direta pra "ver o token atual" — obtemos de novo só pra deletar
    const token = VAPID_KEY ? await getToken(messaging, { vapidKey: VAPID_KEY }).catch(() => null) : null;
    if (token) {
      await deleteDoc(doc(db, 'fcmTokens', token)).catch(() => {});
      await deleteToken(messaging).catch(() => {});
    }
  } catch (e) {
    console.warn('[push] Erro ao remover push:', e);
  }
}

/**
 * Listener de mensagens em foreground (app aberto).
 * Mostra notificação nativa mesmo assim — por padrão o FCM não mostra em foreground.
 */
export async function iniciarListenerForeground(): Promise<() => void> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    const titulo = payload.notification?.title || 'Novo pedido';
    const corpo = payload.notification?.body || '';

    if (Notification.permission === 'granted') {
      new Notification(titulo, {
        body: corpo,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'pedido-' + Date.now(),
      });
    }

    // Tocar som leve
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    } catch {
      /* empty */
    }
  });
}

export function isPushSuportado(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && !!VAPID_KEY;
}

export function statusPermissao(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
