# 03 — Estrutura de Pastas

```
festejo-app/
├── app-festejo/           # Este vault Obsidian 📒
├── functions/             # Cloud Functions (Node)
│   └── src/index.ts       # notificarPedido
├── public/                # Assets estáticos + firebase-messaging-sw.js
├── src/
│   ├── App.tsx            # Root + rotas
│   ├── main.tsx           # Entry
│   ├── version.ts         # APP_VERSION, força update PWA
│   ├── components/        # Componentes compartilhados (GlassCard, Layout, BottomNav)
│   ├── contexts/
│   │   └── AuthContext.tsx  # Auth + estado global
│   ├── pages/
│   │   ├── admin/         # Telas do admin
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminBarracas.tsx
│   │   │   ├── AdminEstoque.tsx
│   │   │   └── AdminConfig.tsx
│   │   └── barraca/       # Telas da barraca
│   │       ├── BarracaLogin.tsx
│   │       ├── BarracaHome.tsx
│   │       └── BarracaNovoPedido.tsx
│   ├── services/
│   │   ├── firebase.ts           # Init Firebase + messaging
│   │   └── pushNotifications.ts  # Registrar/remover/listener FCM
│   ├── types/index.ts     # Types compartilhados
│   ├── utils/             # Helpers
│   └── styles/            # CSS global
├── firebase.json          # Config Firebase deploy
├── vercel.json            # Config Vercel
├── vite.config.ts         # Vite + PWA plugin
└── package.json
```

## Observações

- **`.skills/`** — skills locais do Cloud/Cowork. Considere adicionar no `.gitignore`.
- **`app-festejo/`** — vault Obsidian. Pode ou não ser commitado (depende se quer versionar a documentação).
- **`functions/node_modules`** — ignorado via `firebase.json`.

## Veja também
- [[02 - Stack & Arquitetura]]
- [[Componentes Compartilhados]]
- [[Services]]
