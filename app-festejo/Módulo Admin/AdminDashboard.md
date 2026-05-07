# AdminDashboard

Arquivo: `src/pages/admin/AdminDashboard.tsx`
Rota: `/admin`

## O que mostra

- Saudação personalizada (nome do admin)
- KPIs: total de barracas ativas, total de embalagens ativas
- Alerta amarelo se alguma embalagem está em estoque baixo
- Lista de **pedidos pendentes** (até 10)
- Sino de notificações (canto superior direito) com contador
- Ações rápidas: Distribuir, Estoque

## Listeners (onSnapshot)

### Pedidos pendentes
```ts
query(collection(db, 'pedidos'), where('status', '==', 'pendente'))
```
Ordena desc por `criadoEm` no cliente, pega top 10.

### Embalagens ativas
```ts
query(collection(db, 'embalagens'), where('ativo', '==', true))
```

### Barracas ativas
```ts
query(collection(db, 'barracas'), where('ativa', '==', true))
```

Todos os listeners têm `console.error` no callback de erro (pra debugging).

## Push registration

`useEffect` separado registra push quando `usuario` carrega:
```ts
if (statusPermissao() === 'granted' && temTokenRegistrado()) {
  await registrarPushAdmin(usuario.id, usuario.nome);
}
```

Só re-registra se já tinha ativado antes. Respeita escolha do user em [[Módulo Admin/AdminConfig]].

## Helpers

- `formatTime(criadoEm)` — aceita Firestore Timestamp, Date, number, string, null. Retorna "agora", "X min", "Xh".
- `concluirPedido(pedido)` — `updateDoc(pedidos/{id}, { status: 'concluido', concluidoEm: serverTimestamp() })`

## Bugs resolvidos
- [[Bugs & Fixes#Sininho admin vazio]]
- [[Bugs & Fixes#NaNh no tempo dos pedidos]]

## Veja também
- [[Firebase/Push Notifications (FCM)]]
- [[Modelo de Dados#Pedido]]
