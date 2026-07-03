# Phase 13E-1 Invite Parent Bug Review

## Summary

Admin clicked `Invite Parent to Portal` for parent email `theparvezlegacy@gmail.com`. The UI appeared to complete the invitation, but the user did not appear in Supabase Authentication Users.

No code was modified during this review.

## Files Reviewed

- `supabase/admin.ts`
- `features/parents/actions.ts`
- `services/parents/parent-service.ts`
- `components/parents/parent-portal-account-card.tsx`
- `lib/env.ts`
- `.env.local` key presence only, without reading or exposing secret values
- Parent-related Supabase migrations for `parents.user_id` and `parents.portal_status`

## What Is Working Correctly

- `SUPABASE_SERVICE_ROLE_KEY` is required by `createSupabaseAdminClient()`.
- The admin client uses `process.env.SUPABASE_SERVICE_ROLE_KEY`, not the anon key.
- If `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing, `createSupabaseAdminClient()` throws `supabase_admin_not_configured`.
- `inviteUserByEmail()` errors are not swallowed when that branch runs.
- The parent update to `parents.user_id` and `parents.portal_status` happens after an `authUser` value exists.
- The UI action displays the server action result and does not intentionally force success if the server action returns an error.
- `.env.local` contains the key name `SUPABASE_SERVICE_ROLE_KEY`.

## Likely Root Cause

The most likely root cause is the `parent.user_id` shortcut inside `inviteParentToPortal()`:

```ts
let authUser = parent.user_id ? { id: parent.user_id, email: parent.email ?? undefined } : await findAuthUserByEmail(parent.email ?? "");
```

If `parents.user_id` is already populated, the code assumes the Supabase Auth user exists. It does not verify that the ID exists in Supabase Authentication Users.

That means this flow can happen:

1. Parent has `parents.user_id` set.
2. No matching Supabase Auth user actually exists.
3. `inviteUserByEmail()` is skipped.
4. `user_profiles` is upserted for the assumed user ID.
5. `parents.portal_status` is updated to `invited`.
6. Because no invitation was sent, the code calls `sendParentPortalPasswordReset()`.
7. Password reset does not create a missing Auth user.
8. The UI can report success even though no Supabase Auth user was created.

This matches the reported symptom: the action appears successful, but the parent does not appear under Supabase Authentication Users.

## Other Possible Contributing Issues

### Reset Password Is Not an Invite

When `parent.user_id` exists, the code sends a password reset email instead of creating or inviting an Auth user. If the Auth user is missing, password reset cannot create it.

### Auth User Existence Is Not Rechecked After Invite

When `inviteUserByEmail()` is called, the returned `data.user` is used. That is correct. However, for the `parent.user_id` branch, no equivalent `getUserById()` check exists.

### Generic Error Mapping

Some Supabase Auth errors are currently mapped to the generic parent action error. This does not appear to be the main cause if the UI showed success, but it can make future invite failures harder to diagnose.

## Environment Configuration

Environment configuration is involved because invitation requires `SUPABASE_SERVICE_ROLE_KEY`.

Review result:

- `.env.local` contains `SUPABASE_SERVICE_ROLE_KEY`.
- `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL`.
- `.env.local` contains `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `.env.local` contains `NEXT_PUBLIC_APP_URL`.

Secret values were not displayed or copied into this report.

If `SUPABASE_SERVICE_ROLE_KEY` were missing at runtime, the expected UI error would be:

`Supabase service role access is not configured. Add SUPABASE_SERVICE_ROLE_KEY before inviting portal users.`

Because the reported behaviour looked successful, missing environment configuration is less likely than stale or unverified `parents.user_id`.

## Exact Recommended Fix

Update `inviteParentToPortal()` so it never trusts `parents.user_id` without verifying the Auth user exists.

Recommended flow:

1. Load parent.
2. Validate parent is active, not archived, and has an email.
3. Create Supabase admin client.
4. If `parent.user_id` exists:
   - Call `supabase.auth.admin.getUserById(parent.user_id)`.
   - Verify the returned user exists.
   - Verify the Auth user email matches `parent.email`.
   - If the Auth user does not exist or email does not match, do not treat `parent.user_id` as valid.
5. If no valid Auth user exists by ID:
   - Search Auth users by exact parent email.
6. If no Auth user exists by email:
   - Call `supabase.auth.admin.inviteUserByEmail(parent.email, ...)`.
7. Only after a real Auth user is returned:
   - Upsert `user_profiles`.
   - Update `parents.user_id`.
   - Update `parents.portal_status`.
8. If an existing Auth user is reused:
   - Send a password reset/setup email.
9. If invite or lookup fails:
   - Return a friendly error and do not update `parents.user_id`, `portal_status`, or `user_profiles`.

## Additional Recommended Hardening

- Add safe server-side logging for invite failures, without exposing secrets.
- Add friendly mappings for known invite failures:
  - missing service role key
  - invalid service role key
  - Auth user lookup failed
  - invitation email failed
  - linked user missing from Supabase Auth
  - linked user email mismatch
- Make the success message more accurate:
  - `Parent portal invitation sent and account linked.`
  - `Existing portal account linked and reset email sent.`
- Consider showing separate UI states:
  - `No Account`
  - `Linked Profile Only`
  - `Invited`
  - `Active`
  - `Disabled`

## Whether Code Changes Are Required

Yes. Code changes are required in `services/parents/parent-service.ts`.

The key fix is to verify `parents.user_id` against Supabase Auth before skipping `inviteUserByEmail()`.

Optional but recommended changes:

- Improve invite-specific error mapping in `features/parents/actions.ts`.
- Improve the Portal Account card display to distinguish a linked profile from a real Auth account if the data is available.

## Whether Database Changes Are Required

No database schema change is required for the likely fix.

The existing fields are enough:

- `parents.user_id`
- `parents.portal_status`
- `user_profiles`

## Whether Supabase/RLS Might Be Involved

RLS is unlikely to be the cause of the missing Auth user because Auth admin operations are performed through the service-role admin client.

Supabase configuration can be involved if the deployed environment does not include the service role key, but the current code should surface that as `supabase_admin_not_configured` rather than a successful invite.

## Verification Commands

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
