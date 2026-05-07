# BarracaNovoPedido

Arquivo: `src/pages/barraca/BarracaNovoPedido.tsx`
Rota: `/barraca/pedido`

## Fluxo

1. User seleciona embalagem (de `embalagens` ativas).
2. Digita quantidade + motivo (opcional).
3. Clica em enviar.
4. `addDoc(collection(db, 'pedidos'), {...})` com `status: 'pendente'`.
5. Opcional: abre WhatsApp com mensagem pré-formatada.

## Schema do doc criado

```ts
{
  barracaId,
  barracaNome,
  embalagemId,
  embalagemNome,
  quantidade,
  motivo: motivo.trim() || '',
  status: 'pendente',
  usuarioPedidoId: usuario.id,
  criadoEm: serverTimestamp(),
}
```

## Trigger de Cloud Function

O `addDoc` dispara [[Firebase/Cloud Functions|notificarPedido]] que envia push pro admin.

## Veja também
- [[Modelo de Dados#Pedido]]
- [[Firebase/Cloud Functions]]
