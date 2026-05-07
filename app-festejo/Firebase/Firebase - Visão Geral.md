# Firebase — Visão Geral

> 💡 **Firebase é o backend do app**. É um BaaS (Backend as a Service) — a gente não mantém servidor próprio, mas existe sim um backend rodando na infra do Google (banco + funções + auth + push). Ver [[Histórico de Decisões#Por que Firebase / serverless]].

Projeto: **festejo-app** (`festejo-app.firebasestorage.app`)
Plano: **Blaze** (pay-as-you-go, obrigatório pra Cloud Functions v2)
Região das Functions: `southamerica-east1`

## Serviços usados

| Serviço | Pra quê |
|---|---|
| **Firestore** | Banco de dados principal |
| **Cloud Functions v2** | Trigger `notificarPedido` |
| **Cloud Messaging (FCM)** | Push notifications pro admin |
| **Storage** | Fotos (fundo, ícones customizados) |

## Serviços NÃO usados

- ❌ **Firebase Auth** — usamos auth caseira, ver [[Firebase/Auth Flow]].
- ❌ **Hosting** — hospedamos na Vercel.
- ❌ **Realtime Database** — só Firestore.

## Cliente Firebase

Configurado em `src/services/firebase.ts`. Expõe:
- `db` — Firestore
- `getMessagingIfSupported()` — retorna Messaging ou null (iOS Safari só suporta em PWA instalada).

Ver [[Services#firebase.ts]].

## Sub-páginas
- [[Firebase/Firestore - Coleções]]
- [[Firebase/Cloud Functions]]
- [[Firebase/Auth Flow]]
- [[Firebase/Push Notifications (FCM)]]
