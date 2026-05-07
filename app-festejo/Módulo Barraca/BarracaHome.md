# BarracaHome

Arquivo: `src/pages/barraca/BarracaHome.tsx`
Rota: `/barraca`

## O que mostra

- Nome da barraca + ícone
- Responsável logado (nome do user)
- Histórico de pedidos da própria barraca (filtrado por `barracaId`)
- Botão destaque: **Novo Pedido** → [[Módulo Barraca/BarracaNovoPedido]]

## Queries

```ts
query(collection(db, 'pedidos'), where('barracaId', '==', barracaAtual.id))
```

## Veja também
- [[Modelo de Dados#Pedido]]
