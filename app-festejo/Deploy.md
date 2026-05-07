# Deploy

Dois destinos de deploy separados:

## Frontend — Vercel

- Auto-deploy no push pra `main`.
- Config em `vercel.json`.
- Env vars no dashboard do Vercel (`VITE_FIREBASE_*`, `VITE_FIREBASE_VAPID_KEY`, etc).

### Forçar atualização do PWA

Bumpar `src/version.ts` (`APP_VERSION`) força o SW atualizar e o user pegar a versão nova sem limpar cache manualmente.

```ts
export const APP_VERSION = 'v2.6';
export const BUILD_DATE = '2026-04-15';
```

## Backend — Firebase Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

Primeira vez depois de upgrade pra Blaze: pode demorar 5-10 min pra Eventarc Service Agent propagar.

## Firebase Blaze

Necessário pra Cloud Functions v2. Pago via cartão (não Pix prepago).

**Alerta de budget**: ~R$25/mês recomendado. Configurar em Google Cloud Console → Billing → Budgets.

## Dependências externas
- **FCM** — key VAPID configurada em `VITE_FIREBASE_VAPID_KEY`.
- **Firestore** — regras no console (⚠️ não versionadas).

## Veja também
- [[Firebase/Firebase - Visão Geral]]
- [[Firebase/Cloud Functions]]
