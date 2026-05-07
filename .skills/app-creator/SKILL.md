---
name: app-creator
description: Scaffolds a production-ready PWA + documents it in an Obsidian vault. Use this whenever the user wants to create a new app from scratch, start a new project, build a "Firebase app", build a real-time PWA with push notifications, or when they say things like "fazer outro app igual ao festejo", "começar um projeto novo", "novo app", "criar um PWA", "app com push", "app tempo real", "app com backend serverless". The skill covers the full stack: React + TypeScript + Vite + Tailwind + vite-plugin-pwa on the frontend; Firebase (Firestore + Cloud Functions v2 + FCM + Storage) as the serverless backend; Vercel for hosting. It also builds an Obsidian documentation vault with wikilinked notes so the project is self-documented from day one. Trigger even when the user doesn't explicitly mention Firebase or Obsidian — if they want to build a PWA with real-time data and push notifications, this skill is the right starting point.
---

# App Creator

Scaffolds a new PWA project with the same battle-tested stack used for `festejo-app`, and simultaneously seeds an Obsidian vault documenting the architecture.

## When to use this skill

Any of these cues should trigger:

- "Quero fazer um app novo"
- "Começar um projeto parecido com o festejo"
- "Preciso de um PWA com push"
- "App de [X] pra festa/igreja/loja com admin e clientes"
- The user describes a real-time mobile-first app with admin + end-users + notifications
- The user wants Firebase as backend (or wants "backend sem ter que manter servidor")

## Core philosophy

The stack is opinionated. Don't propose alternatives unless the user explicitly rejects one of the choices. The opinions exist because they've been proven together:

- **React + TypeScript + Vite** — Fast DX, good types, mature ecosystem.
- **Tailwind CSS** — Lets you move fast on mobile-first UI without context-switching to CSS files.
- **vite-plugin-pwa** — Installable, offline-capable PWA with automated service worker.
- **Firebase (Firestore + Functions + FCM + Storage)** — Serverless backend. Zero ops, real-time listeners, push notifications, file uploads — all managed.
- **Auth caseira via `config/geral`** — A single password + access code for end-users, stored in Firestore. Works great when you don't need per-user OAuth/SSO.
- **Vercel for frontend, Firebase for functions** — Deploy preview per branch on Vercel, `firebase deploy --only functions` for backend.
- **Obsidian vault** — Living documentation inside the repo, wikilinked, grows with the project.

For the full rationale on each choice, see `references/stack.md`.

## Workflow

Run these phases in order. Stop and ask the user between phases if anything is ambiguous.

### Phase 1 — Capture project identity

Before writing any code, collect:

1. **App name** (slug for folder + Firebase project). Ask if not given.
2. **Domain** — 1-line description of what the app does.
3. **Personas** — who logs in? Almost always: `admin` + `end-user` (barraca, cliente, funcionário, etc.). If the user only has one persona, flag it and confirm.
4. **Data entities** — what are the main "things" the app tracks? E.g., `pedidos`, `produtos`, `clientes`. 3-5 entities is typical for v1.
5. **Real-time needs** — what changes should admins see the moment they happen? (Drives `onSnapshot` + push design.)
6. **Deploy targets** — confirm Vercel + Firebase Blaze. If the user hasn't set up Firebase Blaze yet, warn them it's required for Cloud Functions v2.

Summarize findings back to the user and get confirmation before moving on.

### Phase 2 — Scaffold the project

Create the directory structure. Use these defaults — they mirror `festejo-app`:

```
<app-name>/
├── public/
│   ├── firebase-messaging-sw.js    # FCM service worker
│   └── icons/                       # PWA icons
├── functions/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/index.ts                 # Cloud Functions (start with notificarPedido template)
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── version.ts                   # APP_VERSION bumping forces PWA update
│   ├── components/                  # GlassCard, Layout, BottomNav
│   ├── contexts/AuthContext.tsx     # Global auth + Firestore subscriptions
│   ├── pages/
│   │   ├── admin/                   # One page per admin screen
│   │   └── <persona>/               # End-user pages (named after user's persona)
│   ├── services/
│   │   ├── firebase.ts              # Firebase init + getMessagingIfSupported
│   │   └── pushNotifications.ts     # Register/remove/listen FCM
│   ├── types/index.ts               # Shared TypeScript types
│   └── styles/
├── vite.config.ts                   # With PWA plugin config
├── tailwind.config.js
├── tsconfig.json
├── firebase.json
├── vercel.json
├── package.json
└── <app-name>-docs/                 # Obsidian vault (see Phase 4)
```

**Don't generate every file inline in the chat.** Use the Write tool to create them directly on disk. Reference files in `references/` have boilerplate for the tricky ones.

Files with non-trivial boilerplate — delegate to references:
- `firebase-messaging-sw.js` → `references/firebase-setup.md`
- `src/services/firebase.ts` → `references/firebase-setup.md`
- `src/services/pushNotifications.ts` → `references/firebase-setup.md`
- `functions/src/index.ts` (notificarPedido) → `references/firebase-setup.md`
- `vite.config.ts` with PWA plugin → `references/stack.md`
- `src/components/GlassCard.tsx` → `references/ui-primitives.md`

### Phase 3 — Wire up Firebase

Guide the user through the manual steps they have to do in the Firebase Console (Claude can't do these):

1. Create Firebase project named after the app.
2. Enable Firestore in `southamerica-east1` (or closest region).
3. Upgrade to **Blaze plan** (needed for Cloud Functions v2). Warn about ~R$25 budget alert.
4. Register the web app, copy the config into `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   VITE_FIREBASE_VAPID_KEY=...      # Cloud Messaging → Web Push certificates
   ```
5. Enable Cloud Messaging and generate the VAPID key.

See `references/firebase-setup.md` for the complete checklist with Firebase Console screenshots descriptions.

### Phase 4 — Build the Obsidian vault

Create the documentation vault *inside* the repo (e.g., `<app-name>-docs/`) so it's version-controlled alongside the code.

Mandatory notes (all interlinked with `[[wikilinks]]`):

```
<app-name>-docs/
├── 00 - Home.md                    # Index with nav sections
├── 01 - Visão Geral.md             # What the app is + why
├── 02 - Stack & Arquitetura.md     # High-level diagram + BaaS explanation
├── 03 - Estrutura de Pastas.md     # File layout
├── Modelo de Dados.md              # All Firestore collections + TS types
├── Componentes Compartilhados.md   # GlassCard, Layout, BottomNav
├── Services.md                     # firebase.ts, pushNotifications.ts
├── Deploy.md                       # Vercel + firebase deploy
├── Bugs & Fixes.md                 # Start empty; grows as bugs are fixed
├── Histórico de Decisões.md        # Why BaaS, why no Firebase Auth, trade-offs
├── Firebase/
│   ├── Firebase - Visão Geral.md
│   ├── Firestore - Coleções.md
│   ├── Cloud Functions.md
│   ├── Auth Flow.md
│   └── Push Notifications (FCM).md
├── Módulo Admin/
│   ├── Admin - Visão Geral.md
│   └── <one note per admin screen>.md
└── Módulo <Persona>/
    ├── <Persona> - Visão Geral.md
    └── <one note per persona screen>.md
```

Template content for each is in `references/obsidian-vault.md`.

Core principle: **every screen has a note, every note cross-links to related ones** — `Dashboard` links to `Auth Flow` links to `AuthContext` links to `Services`, etc. That's what makes Obsidian's graph view useful.

Key framing that MUST appear in the vault:
- In `Histórico de Decisões` and `02 - Stack`, explicitly state that **Firebase IS the backend** (it's BaaS, not no-backend). This prevents the user ever wondering "why doesn't my app have a backend?"
- In `Bugs & Fixes`, encourage the user to document each non-trivial bug fix as a section — this becomes priceless institutional memory for the project.

### Phase 5 — First push + sanity check

After scaffolding, walk through:

1. `npm install` on root + `functions/`
2. `npm run dev` — confirm the skeleton loads
3. Commit + push to GitHub
4. Connect Vercel project → first deploy
5. `firebase deploy --only functions` → first deploy (warn about Eventarc propagation on first-time v2 deploy, ~5-10min wait)

If any of these fail, check `references/troubleshooting.md`.

## Post-scaffold iteration

Once the skeleton is up, the user will naturally want to add features. Stay in character as a collaborator who knows the project:

- **New screen** → add `Module X/NewScreen.md` to vault, cross-link
- **New entity** → update `Modelo de Dados.md`, add collection note in `Firebase/`
- **Bug fix** → add section in `Bugs & Fixes.md` with sintoma/causa/fix/versão
- **Architectural decision** → append to `Histórico de Decisões.md`

Always bump `APP_VERSION` in `src/version.ts` when a user-visible change goes out. This forces PWA update on iOS which caches aggressively.

## Common pitfalls to avoid

- **Don't** create Firestore queries with `where + orderBy` on different fields without warning about composite indexes. Either pre-create the index or sort client-side.
- **Don't** use `Notification.permission` as source-of-truth for the push toggle on iOS. Use a `localStorage` flag. (iOS doesn't allow apps to revoke permission.)
- **Don't** use `new Date(firestoreTimestamp)` — it returns Invalid Date. Always call `.toDate()` or use `.seconds * 1000`.
- **Don't** forget to save `responsavelNome`/user name on the entity's Firestore doc when they log in — the admin panel needs that visible field.
- **Don't** use Firebase Auth unless the user explicitly needs OAuth/email flow. The shared-password approach is simpler and works great for closed communities (church, event, small business).

All of these come from real bugs in `festejo-app`. See `references/pitfalls.md` for the full list with detection cues.

## Reference files

- `references/stack.md` — Stack choices, config files, `vite.config.ts`, Tailwind setup
- `references/firebase-setup.md` — Firebase console steps, boilerplate for `firebase.ts`, `pushNotifications.ts`, Cloud Functions
- `references/ui-primitives.md` — GlassCard, Layout, BottomNav components
- `references/obsidian-vault.md` — Full note templates for the Obsidian vault
- `references/pitfalls.md` — Known footguns and how to avoid them
- `references/troubleshooting.md` — Common deploy errors and fixes

Read only what's relevant for the current phase — no need to load everything upfront.
