# Firebase Utils — Status: Unused / Legacy

These files (`firebase.ts`, `auth.ts`) were created during an earlier phase of DKK
when Firebase was considered for authentication.

**Current state:** All authentication is handled exclusively through **Supabase**
(via `@supabase/ssr` and `@supabase/auth-ui-react`). Firebase auth utilities are
not imported anywhere in the application.

## Decision

Keep Firebase dependency in `package.json` only if Firebase is needed for:
- Firestore (real-time data)
- Firebase Storage
- Push notifications (FCM)

**If none of the above apply, remove the `firebase` package and these files to
reduce bundle size and eliminate an unnecessary auth surface.**

To clean up:
```bash
pnpm remove firebase
rm -rf utils/firebase
```
