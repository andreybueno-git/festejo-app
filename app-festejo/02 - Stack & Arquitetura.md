# 02 — Stack & Arquitetura

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Estado global | React Context ([[Services#AuthContext|AuthContext]]) |
| Roteamento | React Router |
| Backend | Firebase (serverless) |
| Banco | Firestore |
| Auth | Custom (senha + código, sem Firebase Auth) |
| Functions | Firebase Cloud Functions v2 (Node) |
| Push | Firebase Cloud Messaging (FCM) + VAPID |
| Hosting | Vercel |
| PWA | vite-plugin-pwa (Workbox) |

## Arquitetura de alto nível

```
┌──────────────┐    onSnapshot     ┌──────────────┐
│   Admin PWA  │ ◄──────────────── │   Firestore  │
│ (iOS/Android)│                   │              │
└──────┬───────┘                   └──────▲───────┘
       │ push FCM                         │ addDoc(pedidos)
       │                                  │
┌──────▼───────┐    Cloud Function ┌──────┴───────┐
│   FCM        │ ◄──────────────── │ Barraca PWA  │
│   (Google)   │   notificarPedido │              │
└──────────────┘                   └──────────────┘
```

**O backend existe — é o Firebase**, só que é *serverless*. A gente não mantém servidor Node próprio, mas há um backend de verdade rodando na infra do Google:

1. **Firestore** — banco de dados (fonte da verdade para pedidos, barracas, embalagens, config, tokens FCM).
2. **Cloud Function `notificarPedido`** — código server-side rodando no Google, disparado quando um doc é criado em `pedidos/*`. Lê tokens do admin e envia push via FCM.
3. **Frontend** — escuta Firestore via `onSnapshot` e re-renderiza em tempo real.

> 💡 **Backend tradicional vs Firebase**
>
> Em uma stack tradicional você teria um servidor Node/Django/Rails com endpoints `POST /pedidos`, gerenciamento de deploy, scaling, uptime, banco separado, etc.
>
> No Firebase o cliente escreve direto no Firestore (via SDK, com regras de segurança), e lógica de servidor vira Cloud Function. O "servidor" é a infra do Google. Isso chama-se **BaaS** (Backend as a Service) ou **serverless**.
>
> Pra esse projeto (uso curto, poucos usuários concorrentes) é a escolha certa — zero ops, deploy instantâneo, escala automática. Um backend tradicional seria overkill.

Ver [[Histórico de Decisões#Por que Firebase / serverless]] pro racional.

## Decisões de arquitetura

- [[Histórico de Decisões#Sem Firebase Auth|Sem Firebase Auth]] — auth caseira por simplicidade.
- [[Histórico de Decisões#Cloud Function v2|Cloud Function v2]] — região `southamerica-east1`.
- [[Histórico de Decisões#Sem índice composto|Sem índice composto]] — sort/limit feito client-side no [[Módulo Admin/AdminDashboard|dashboard]].

## Veja também
- [[03 - Estrutura de Pastas]]
- [[Deploy]]
- [[Firebase/Firebase - Visão Geral]]
