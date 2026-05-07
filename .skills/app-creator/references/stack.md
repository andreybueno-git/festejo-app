# Stack Reference

## Package.json dependencies

Core runtime:
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "firebase": "^10.13.0",
    "lucide-react": "^0.445.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

## vite.config.ts

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'App Name',
        short_name: 'App',
        theme_color: '#0a1628',
        background_color: '#0a1628',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        // FCM SW handles its own scope — don't claim it
        navigateFallbackDenylist: [/^\/firebase-cloud-messaging-push-scope/],
      },
    }),
  ],
});
```

## tailwind.config.js

```js
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'app-bg': '#0a1628',
      },
    },
  },
};
```

## tsconfig.json

Use `strict: true` and `noUncheckedIndexedAccess: true` — catches a lot of bugs before runtime.

## Why each choice

- **React 18** — Concurrent rendering for snappy UI, huge ecosystem.
- **Vite** — Sub-second HMR. Replaces CRA entirely.
- **TypeScript strict** — Catches Firestore shape bugs at compile time, not in production.
- **Tailwind** — Utility-first lets you iterate on design without file-switching. Works perfectly for mobile-first.
- **vite-plugin-pwa** — Hands you an installable PWA with one config block.
- **React Router v6** — Nested routes, loader API if you need it later.
- **lucide-react** — Clean icons, tree-shakable.
- **Firebase SDK v10** — Modular imports (tree-shakes unused services).

## Version pinning

Bump `src/version.ts`'s `APP_VERSION` on every release. iOS caches PWAs aggressively; bumping the constant changes the bundle hash and forces a service worker update.

```ts
// src/version.ts
export const APP_VERSION = 'v1.0';
export const BUILD_DATE = '2026-04-15';
```

Display it in a config/debug screen so you can tell which version the user is running in the wild.
