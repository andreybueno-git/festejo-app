# Known Pitfalls

Real bugs from `festejo-app`. Each has sintoma → causa → prevenção.

## Firestore Timestamp treated as Date

**Sintoma**: Times render as `NaNh`, `NaN min`, `Invalid Date`.

**Causa**: `serverTimestamp()` in Firestore returns a **Timestamp object** (`{seconds, nanoseconds, toDate()}`), not a JS `Date`. `new Date(timestamp)` returns `Invalid Date`.

**Prevenção**: Write a helper that handles all shapes:

```ts
function toMs(value: unknown): number {
  if (!value) return 0;
  if (typeof value === 'object' && value !== null) {
    const v = value as { toDate?: () => Date; seconds?: number };
    if (typeof v.toDate === 'function') return v.toDate().getTime();
    if (typeof v.seconds === 'number') return v.seconds * 1000;
    if (value instanceof Date) return value.getTime();
  }
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const p = new Date(value).getTime();
    return isNaN(p) ? 0 : p;
  }
  return 0;
}
```

## Composite index required for `where + orderBy`

**Sintoma**: `onSnapshot` callback never fires, no errors visible.

**Causa**: Firestore requires a composite index for queries combining `where` on one field with `orderBy` on another. Without the index, the query errors — but if the error handler is empty (`() => {}`), you never see it.

**Prevenção**:
- Option A: pre-create the index in Firebase Console (link appears in the first error log).
- Option B: drop the `orderBy` from the query, sort client-side, limit client-side too.
- Always pass a real error handler to `onSnapshot`: `(err) => console.error('[collection] error:', err)`.

## iOS can't revoke Notification permission

**Sintoma**: Push toggle shows "ativado" (green) but "desativado" label underneath, after user toggled off.

**Causa**: `Notification.permission` stays `'granted'` on iOS even after you delete the FCM token. The browser has no API for apps to rescind their own permission.

**Prevenção**: Don't use `Notification.permission` as the source of truth. Use a `localStorage` flag that the app controls:

```ts
const PUSH_TOKEN_KEY = '<app>:fcm-token';

function temTokenRegistrado(): boolean {
  if (Notification.permission !== 'granted') return false;
  return !!localStorage.getItem(PUSH_TOKEN_KEY);
}
```

Set the key when `getToken` succeeds, clear it in `removerPushAdmin()`.

## User's name not visible to admin

**Sintoma**: Admin panel shows "Sem responsável" even though a user is logged in on the persona side.

**Causa**: Auth state is stored only in `localStorage` on the persona's device. The admin side reads from Firestore, so it doesn't know about the local session.

**Prevenção**: When a persona logs in, `updateDoc` on their owning entity's document with their name + ID + login timestamp:

```ts
await updateDoc(doc(db, 'barracas', barracaId), {
  responsavelNome: nome,
  responsavelId,
  responsavelLoginEm: serverTimestamp(),
});
```

## PWA caches stale version on iOS

**Sintoma**: User swears they updated, but screen looks identical. Refresh doesn't help.

**Causa**: iOS caches PWA assets aggressively. Service worker won't even check for updates on every open.

**Prevenção**: Bump `APP_VERSION` in `src/version.ts` on every release. Include it in a debug/config screen so you can confirm which version is live.

## Firebase web API key flagged as "leaked secret"

**Sintoma**: GitHub's secret scanner fires an alert when you commit `.env.example` or `firebase-messaging-sw.js`.

**Causa**: The scanner pattern-matches API keys but doesn't know Firebase web API keys are public by design.

**Prevenção**: Dismiss the alert as "Used in tests" / "False positive". Firebase restricts access via Firestore rules + auth, not by key secrecy.

## Eventarc propagation delay on first v2 deploy

**Sintoma**: First `firebase deploy --only functions` after upgrading to Blaze fails with Eventarc permissions error.

**Causa**: Google provisions the Eventarc Service Agent lazily. Takes 5-10 min to propagate after Blaze activation.

**Prevenção**: Wait, retry. If still failing after 15 min, check Cloud Console → IAM for the `service-<project-number>@gcp-sa-eventarc.iam.gserviceaccount.com` role.

## Self-check when something misbehaves

Before deep-debugging, ask:
1. Is the Firestore query using a composite index?
2. Is every `onSnapshot` logging errors?
3. Are `Timestamp` fields being treated as Dates?
4. Is `localStorage` being used for client-side push state?
5. Is the latest `APP_VERSION` deployed?

9 times out of 10, one of these is the answer.
