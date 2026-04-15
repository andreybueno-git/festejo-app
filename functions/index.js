/**
 * Cloud Functions do Festejo App
 * - notificarPedido: quando uma barraca cria um pedido, envia push para todos os admins.
 */

const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { logger } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

const REGIAO = 'southamerica-east1'; // São Paulo — mais próximo do usuário

exports.notificarPedido = onDocumentCreated(
  {
    document: 'pedidos/{pedidoId}',
    region: REGIAO,
  },
  async (event) => {
    const snap = event.data;
    if (!snap) {
      logger.warn('Sem snapshot — ignorando');
      return;
    }

    const pedido = snap.data();
    const pedidoId = event.params.pedidoId;

    // Só notifica pedidos novos (status pendente)
    if (pedido.status && pedido.status !== 'pendente') {
      logger.info('Pedido não-pendente — ignorando', { pedidoId, status: pedido.status });
      return;
    }

    // Monta corpo da notificação
    const nomeBarraca = pedido.barracaNome || 'Uma barraca';
    const qtd = pedido.quantidade || '';
    const emb = pedido.embalagemNome || 'embalagem';
    const motivo = pedido.motivo ? ` — ${pedido.motivo}` : '';
    const corpo = `${nomeBarraca}: ${qtd} ${emb}${motivo}`;

    // Busca todos os tokens de admins
    const tokensSnap = await db.collection('fcmTokens').where('tipo', '==', 'admin').get();
    if (tokensSnap.empty) {
      logger.info('Nenhum token de admin registrado', { pedidoId });
      return;
    }

    const tokens = tokensSnap.docs.map((d) => d.data().token).filter(Boolean);
    if (tokens.length === 0) {
      logger.info('Lista de tokens vazia', { pedidoId });
      return;
    }

    const message = {
      notification: {
        title: '🎪 Novo pedido!',
        body: corpo,
      },
      data: {
        pedidoId,
        barracaId: pedido.barracaId || '',
        tipo: 'novo-pedido',
      },
      webpush: {
        notification: {
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
        },
        fcmOptions: {
          link: '/admin',
        },
      },
      tokens,
    };

    try {
      const resp = await messaging.sendEachForMulticast(message);
      logger.info('Push enviado', {
        pedidoId,
        sucesso: resp.successCount,
        falha: resp.failureCount,
      });

      // Limpa tokens inválidos
      const invalidos = [];
      resp.responses.forEach((r, i) => {
        if (!r.success) {
          const code = r.error && r.error.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidos.push(tokens[i]);
          }
        }
      });

      if (invalidos.length > 0) {
        const batch = db.batch();
        invalidos.forEach((t) => batch.delete(db.collection('fcmTokens').doc(t)));
        await batch.commit();
        logger.info('Tokens inválidos removidos', { qtd: invalidos.length });
      }
    } catch (err) {
      logger.error('Erro ao enviar push', err);
    }
  }
);
