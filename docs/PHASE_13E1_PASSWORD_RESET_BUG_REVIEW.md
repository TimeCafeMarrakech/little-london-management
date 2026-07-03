# Phase 13E-1 Password Reset Bug Review

## Summary

Admin sent a parent password reset email successfully. The parent opened the email and tried to set a new password, but the reset page showed `Session expired.`

After the admin refreshed the dashboard and sent reset again, the UI showed `Something went wrong.`

No code was modified during this review.

## Files Reviewed

- `app/(auth)/reset-password/page.tsx`
- `app/(auth)/forgot-password/page.tsx`
- `features/auth/actions/auth-actions.ts`
- `services/parents/parent-service.ts`
- `features/parents/actions.ts`
- `supabase/server.ts`
- `supabase/middleware.ts`
- `middleware.ts`
- `lib/auth/routes.ts`
- `lib/env.ts`
- Existing app route files
- `.env.local` key presence only, without exposing secret values

## Likely Root Cause

The reset password page does not process Supabase Auth recovery tokens.

Supabase password reset links normally return to the app with a recovery token, commonly as:

- `?code=...` for PKCE-style flows, requiring `exchangeCodeForSession(code)`
- URL hash tokens such as `#access_token=...&refresh_token=...&type=recovery`, requiring client-side session handling

The current reset page only renders the form:

- It does not read `code`.
- It does not call `supabase.auth.exchangeCodeForSession(code)`.
- It does not process hash tokens.
- It does not establish the recovery session before submitting the new password.

Then `resetPasswordAction()` calls:

```ts
supabase.auth.updateUser({ password })
```

If no recovery session exists in cookies, Supabase rejects the update and the app redirects to:

`/session-expired?reason=reset-token`

This explains why the parent sees `Session expired` after opening the reset email.

## Secondary Likely Cause: Middleware Redirect

`supabase/middleware.ts` redirects any signed-in user away from auth pages:

```ts
if (user && isAuthPath(pathname)) {
  return redirectTo(request, "/dashboard");
}
```

Because `/reset-password` is listed as an auth path, a successful recovery session could be redirected away from the reset page before the user updates the password.

The reset password route needs special handling so recovery sessions are allowed to stay on `/reset-password`.

## Why the Second Reset Shows Generic Error

The admin reset action calls:

```ts
supabase.auth.resetPasswordForEmail(parent.email, {
  redirectTo: `${appUrl ?? "http://localhost:3000"}/reset-password`,
});
```

If Supabase rejects this request, `sendParentPortalPasswordReset()` throws the raw Supabase error message. `features/parents/actions.ts` does not map reset-specific Auth errors, so the UI falls back to:

`Something went wrong. Please review the details and try again.`

Likely reasons include:

- Supabase email rate limiting after repeated password reset attempts.
- Redirect URL not allowed in Supabase Auth URL configuration.
- Invalid or stale linked Auth user state.
- Email provider failure.
- Local app URL mismatch.

Because there is no safe logging around reset failures, the exact Supabase Auth error is currently hidden from administrators and difficult to diagnose.

## Redirect URL Review

The app uses:

```ts
NEXT_PUBLIC_APP_URL + "/reset-password"
```

for both:

- Forgot password flow
- Parent portal admin reset flow

`.env.local` contains `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY`.

Secret values were not displayed or copied into this report.

The redirect URL can still be involved if the value does not exactly match the local app URL being used in the browser, or if Supabase Auth settings do not allow the redirect URL.

Supabase Auth settings should allow:

- The local app URL, for example `http://localhost:3000`
- The exact reset redirect URL, for example `http://localhost:3000/reset-password`
- The production app URL and production `/reset-password` URL when deployed

## Parent Portal Status and Linkage

The reset action checks:

- Parent exists.
- Parent has an email.
- Parent has `parents.user_id`.

It does not currently verify the linked Auth user immediately before sending the reset email. The Phase 13E-1 invite fix improved invite-time verification, but reset should also verify the linked Auth user exists and matches the parent email before sending reset.

Recommended reset hardening:

- Verify `parents.user_id` via `supabase.auth.admin.getUserById()`.
- Verify the Auth email matches `parents.email`.
- Return a friendly `portal_auth_user_missing` or `portal_auth_email_mismatch` error when invalid.
- Do not report reset success if the Auth user is stale.

## Exact Recommended Fix

### 1. Add recovery-session handling to `/reset-password`

Implement a safe Supabase recovery flow before allowing password update:

- If `searchParams.code` exists, call `supabase.auth.exchangeCodeForSession(code)` on the server or in a route handler.
- Ensure Supabase cookies are set before rendering the password form.
- If using hash tokens, add a small client-side recovery handler to call `supabase.auth.setSession(...)` or the current Supabase-supported recovery handling.
- Show a friendly expired/invalid link message only when token exchange fails.

### 2. Do not redirect recovery sessions away from `/reset-password`

Update middleware logic so `/reset-password` is exempt from the generic signed-in auth redirect.

The reset page should remain accessible when the user is in a recovery session.

### 3. Improve parent reset action verification

Before sending a parent reset link:

- Verify the linked Auth user exists.
- Verify the linked Auth user email matches the parent email.
- If invalid, return a friendly message that the portal account needs to be re-invited or repaired.

### 4. Add safe logging for reset email failures

Add server-side logging for Supabase reset failures without exposing secrets:

- Parent ID
- Parent email
- Linked user ID
- Supabase Auth error code/name/status when available

### 5. Improve user-facing error mapping

Add friendly messages for:

- Reset email rate limit
- Redirect URL not allowed
- Linked Auth user missing
- Linked Auth user email mismatch
- Supabase Auth email delivery failure
- Supabase reset request failed

## Whether Supabase Redirect Settings Are Involved

Possibly.

Even with correct code handling, Supabase must allow the redirect URL used by the app. The project should verify the Supabase dashboard Auth URL settings include the local and production `/reset-password` URLs.

However, the primary code issue is still that the app does not exchange or process recovery tokens on `/reset-password`.

## Whether Code Changes Are Required

Yes.

Required code changes:

- Reset password page or route must process Supabase recovery tokens.
- Middleware must allow recovery sessions to remain on `/reset-password`.
- Parent portal reset action should verify linked Auth user existence and add safe logging/friendly errors.

No database schema change is required.

No migration is required.

## Manual Test Steps After Fix

1. Confirm `NEXT_PUBLIC_APP_URL` exactly matches the local app URL.
2. Confirm Supabase Auth redirect URLs allow `/reset-password`.
3. From a parent detail page, send `Reset Password`.
4. Open the reset email in a fresh browser/private window.
5. Confirm the reset page loads without redirecting to dashboard.
6. Enter a valid password.
7. Confirm password update succeeds.
8. Log in as the parent with the new password.
9. Confirm parent portal access works only when `portal_status = active`.
10. Disable the portal account and confirm the parent is denied access.
11. Send another reset email after Supabase rate-limit window if necessary.
12. Confirm any reset failure displays a friendly message and logs safe server details.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
