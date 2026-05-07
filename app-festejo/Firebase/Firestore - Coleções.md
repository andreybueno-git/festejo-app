# Firestore — Coleções

## Coleções

| Coleção | Doc schema | Quem escreve | Quem lê |
|---|---|---|---|
| `pedidos` | [[Modelo de Dados#Pedido]] | Barraca (create) + Admin (status) | Admin (listener) |
| `barracas` | [[Modelo de Dados#Barraca]] | Admin (CRUD) + Barraca (responsavel) | Todos |
| `embalagens` | [[Modelo de Dados#Embalagem]] | Admin | Todos |
| `fcmTokens` | [[Modelo de Dados#fcmTokens]] | Admin (ao registrar push) | Cloud Function |
| `config/geral` | [[Modelo de Dados#config/geral]] | Admin | Todos |

## Queries importantes

### Pedidos pendentes (AdminDashboard)
```ts
query(collection(db, 'pedidos'), where('status', '==', 'pendente'))
```
> ⚠️ Sem `orderBy` pra não precisar de índice composto. Sort feito no cliente.
> Ver [[Bugs & Fixes#Sininho admin vazio|bug do sininho]].

### Barracas ativas
```ts
query(collection(db, 'barracas'), where('ativa', '==', true))
```

### Embalagens ativas
```ts
query(collection(db, 'embalagens'), where('ativo', '==', true))
```

### Tokens FCM de admins (Cloud Function)
```ts
query(collection(db, 'fcmTokens'), where('tipo', '==', 'admin'))
```

## Regras

⚠️ Atualmente não versionadas em `firestore.rules`. Estão no Firebase Console. **TODO: exportar e commitar.**

## Veja também
- [[Modelo de Dados]]
- [[Firebase/Cloud Functions]]
