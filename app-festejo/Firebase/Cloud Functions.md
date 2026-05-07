# Cloud Functions

Código: `functions/src/index.ts`
Runtime: Node 20
Region: `southamerica-east1`
Gen: **v2**

## `notificarPedido`

Trigger: `onDocumentCreated('pedidos/{pedidoId}')`.

### Fluxo

1. Doc de pedido criado em `pedidos/*`.
2. Função lê o doc → extrai `barracaNome`, `quantidade`, `embalagemNome`.
3. Busca todos tokens com `tipo === 'admin'` em `fcmTokens`.
4. Monta payload FCM:
   ```
   title: "Novo pedido"
   body:  "{barracaNome}: {quantidade}× {embalagemNome}"
   ```
5. Envia via `sendEachForMulticast` (admin.messaging()).
6. Loga `{ sucesso, falha, pedidoId }`.

### Deploy

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Primeira vez: precisa esperar o **Eventarc Service Agent** propagar (~5-10 min), depois retry.

### Monitoramento

- **Console logs**: Firebase Console → Functions → Logs
- Exemplo visto: `Push enviado` com `sucesso: 1, falha: 0, pedidoId: m0patyc40z6zSHnDWrLd`

## Veja também
- [[Firebase/Push Notifications (FCM)]]
- [[Firebase/Firestore - Coleções]]
- [[Deploy]]
