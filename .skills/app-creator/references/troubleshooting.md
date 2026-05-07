# Troubleshooting Reference

Errors you'll hit during deploy, install, and day-2 ops. Each has the exact message, what it means, and the fix.

## `npm install` / build

### `Module not found: firebase/messaging`
**Causa**: `firebase` dependency is missing or wrong version.
**Fix**: `npm install firebase@^10.13.0`. The v9 modular API differs — stick with v10.

### `Cannot find module 'vite-plugin-pwa'`
**Causa**: Forgot the PWA plugin in `devDependencies`.
**Fix**: `npm install -D vite-plugin-pwa`, then verify `vite.config.ts` imports it.

### Tailwind classes not applying
**Causa**: `content` array in `tailwind.config.js` doesn't cover your files.
**Fix**: Confirm it includes `'./src/**/*.{ts,tsx}'`. Check `postcss.config.js` also exists and has `tailwindcss` + `autoprefixer` plugins.

### `noUncheckedIndexedAccess` errors on Firestore docs
**Causa**: Strict TS correctly flags `snap.docs[0]` as possibly undefined.
**Fix**: Guard with `if (!snap.docs.length) return;` or use optional chaining and type the return. Don't disable the flag — it catches real bugs.

## Firebase CLI

### `Error: HTTP Error: 403, The caller does not have permission`
**Causa**: You're logged into the wrong Google account, or the account doesn't own the project.
**Fix**: `firebase logout && firebase login`. Verify project owner in Firebase Console → Settings → Users.

### `Error: Failed to get Firebase project`
**Causa**: `.firebaserc` points to a project ID that doesn't exist or you don't have access to.
**Fix**: `firebase use --add`, pick the right project, confirm.

### `Build failed: functions predeploy error`
**Causa**: TypeScript compile error in `functions/src/`.
**Fix**: `cd functions && npm run build` locally first. Fix the errors before deploying.

## Cloud Functions v2

### `Eventarc: Permission denied` (first deploy after Blaze)
**Causa**: Eventarc Service Agent provisions lazily. Takes 5-10 min after upgrading to Blaze.
**Fix**: Wait 10 min, retry `firebase deploy --only functions`. If still failing after 15 min, check Cloud Console → IAM for `service-<project-number>@gcp-sa-eventarc.iam.gserviceaccount.com`. You can manually assign `roles/eventarc.serviceAgent` to it.

### `Cloud Functions API has not been used in project X`
**Causa**: The API needs to be enabled once per project.
**Fix**: Click the link in the error message — it opens Cloud Console with the correct project and "Enable" button pre-loaded. Or go to Cloud Console → APIs & Services → enable "Cloud Functions API", "Cloud Build API", "Artifact Registry API".

### `Container Healthcheck failed`
**Causa**: Your function is throwing an error at module load (not runtime). Common culprit: `admin.initializeApp()` called twice.
**Fix**: Run functions shell locally: `cd functions && npm run shell`. The error will print to console. Fix, redeploy.

### Function deploys but doesn't fire on Firestore writes
**Causa**: Wrong path pattern, or the trigger is in a different region than the document.
**Fix**: 
- Double-check the path: `'pedidos/{pedidoId}'` (no leading slash).
- `setGlobalOptions({ region: 'southamerica-east1' })` must match where you write docs — both default to the same Firestore region, but if you split, triggers won't fire.
- Tail the logs: `firebase functions:log --only notificarPedido`.

## FCM / Push Notifications

### `messaging/unsupported-browser`
**Causa**: iOS Safari < 16.4, or desktop Safari without PWA installed.
**Fix**: Wrap `getMessaging` in `isSupported()` check — see `getMessagingIfSupported` helper. Gracefully degrade: hide the push toggle on unsupported browsers.

### `FirebaseError: Registration failed - push service error`
**Causa**: VAPID key mismatch, or `firebase-messaging-sw.js` has wrong config.
**Fix**:
1. Copy the VAPID key from Firebase Console → Cloud Messaging → Web Push certificates. Paste into `.env` as `VITE_FIREBASE_VAPID_KEY`.
2. In `firebase-messaging-sw.js`, the config is **hardcoded** (SW can't read env vars). Verify every field matches your Firebase project.

### Notification doesn't arrive on iPhone
**Checklist**:
1. Is the PWA **installed** to home screen? (Required — Safari tabs can't receive push.)
2. Is `Notification.permission` `'granted'`? Check via debug panel.
3. Is the FCM token in Firestore (`fcmTokens/{token}`)?
4. Check Cloud Function logs — did it send? `firebase functions:log --only notificarPedido`. Look for `sucesso: N` > 0.
5. If sent successfully but not delivered: iOS sometimes silences repeat notifications with same `tag`. Use `tag: 'notif-' + Date.now()` to force new ones.
6. Focus mode / Do Not Disturb on the device.

### Notification arrives but no sound
**Causa**: Web Push API doesn't support custom sounds. iOS uses system default.
**Fix**: In the foreground listener, manually play an `<audio>` element. For background, accept the platform limitation.

## Firestore

### `FirebaseError: The query requires an index`
**Causa**: Composite index required for `where + orderBy` on different fields.
**Fix**: Click the link in the error — it opens Firebase Console with the index pre-configured. Wait 1-2 min for it to build, retry. Alternatively, drop the `orderBy`, sort client-side.

### `onSnapshot` never fires (no error, no data)
**Causa**: 99% of the time it's a missing composite index and the error handler is empty. See `pitfalls.md`.
**Fix**: Replace `onSnapshot(q, callback)` with `onSnapshot(q, callback, (err) => console.error('[listener] error:', err))`. The real error will surface.

### `FirebaseError: Missing or insufficient permissions`
**Causa**: Firestore security rules block the operation.
**Fix**:
1. Open `firestore.rules`, identify which rule blocks the path.
2. For development, temporarily open the collection: `allow read, write: if true;`. **Remember to tighten before prod.**
3. Deploy rules: `firebase deploy --only firestore:rules`.

## Vercel deploy

### Build fails with `Command "npm run build" exited with 1`
**Causa**: TypeScript error. Vercel runs `tsc` as part of Vite build by default.
**Fix**: Run `npm run build` locally first — fix the errors there before pushing.

### `Environment Variable "VITE_FIREBASE_API_KEY" references Secret "..." which does not exist`
**Causa**: You set env vars as "Secrets" but Vercel secrets are a different feature.
**Fix**: Go to Vercel dashboard → Project → Settings → Environment Variables. Add each `VITE_FIREBASE_*` as a regular Plain Text variable, not Secret.

### App loads but Firebase calls fail with `API key not valid`
**Causa**: `.env` not mirrored to Vercel.
**Fix**: Add **every** `VITE_FIREBASE_*` from your local `.env` to Vercel's Environment Variables. Redeploy.

### PWA works in dev but not in production
**Causa**: Service worker registers but serves cached old bundle.
**Fix**: 
1. Bump `APP_VERSION` in `src/version.ts`.
2. Add `?v=<timestamp>` to the `registerType: 'autoUpdate'` rebuild.
3. On the device, clear PWA data: Safari → Settings → Advanced → Website Data → Remove.

## GitHub

### Secret scanner alert on `VITE_FIREBASE_API_KEY`
**Causa**: GitHub pattern-matches any `AIza...` key as a leaked Google API key.
**Fix**: The Firebase web API key is **not a secret** — it's designed to be public and is gated by Firestore rules + App Check. Dismiss the alert as "Used in tests" / "False positive".

### Secret scanner alert on `firebase-messaging-sw.js`
**Causa**: Same — the SW has the API key hardcoded because it can't read env vars.
**Fix**: Same — dismiss as false positive.

## Browser weirdness

### "Notification permission denied" but I never saw the prompt
**Causa**: User dismissed the prompt without picking, OR browser silently denied because site had too many prompts.
**Fix**:
1. Desktop Chrome: click the lock icon in URL bar → Site settings → Notifications → Allow.
2. iOS PWA: Settings → Notifications → find the PWA → Allow Notifications.
3. Never auto-call `Notification.requestPermission()` on page load — always gate behind a user click.

### `ReferenceError: importScripts is not defined`
**Causa**: Vite's default dev mode tries to load `firebase-messaging-sw.js` as an ES module.
**Fix**: `firebase-messaging-sw.js` must be in `public/` and use `importScripts` (not ES imports). Don't put it under `src/`. Vite copies it as-is to the build output.

## Process for a mystery bug

1. Reproduce it — exact steps, device, browser version.
2. Check browser console for errors.
3. Check Cloud Function logs: `firebase functions:log`.
4. Check Firestore rules — could a silent permission block be the cause?
5. Check network tab — are API requests failing?
6. Bump `APP_VERSION` and reload — is it a stale cache?
7. Still stuck? Grep for the symptom in `pitfalls.md`. If it's there, the answer is already written.
