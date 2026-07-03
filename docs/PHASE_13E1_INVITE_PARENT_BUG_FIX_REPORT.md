# Phase 13E-1 Invite Parent Bug Fix Report

## Summary

Fixed the Parent Portal invitation flow so it no longer trusts `parents.user_id` unless the linked Supabase Auth user is verified first.

Previously, if `parents.user_id` was populated but the matching Supabase Auth user did not exist, the invite flow skipped `inviteUserByEmail()`. The UI could then appear successful while no Auth user was created.

## Files Modified

- `services/parents/parent-service.ts`
- `features/parents/actions.ts`

## Root Cause Fixed

`inviteParentToPortal()` previously treated any existing `parents.user_id` as a valid Auth user:

- It did not call Supabase Auth to verify the user exists.
- It did not verify that the Auth user email matches the parent email.
- It skipped `inviteUserByEmail()` when `parents.user_id` existed.

This allowed stale or invalid `parents.user_id` values to bypass Auth user creation.

## What Changed

The invite flow now:

1. Loads and validates the parent.
2. Creates the Supabase admin client using the service role key.
3. If `parents.user_id` exists, calls `supabase.auth.admin.getUserById(parent.user_id)`.
4. Verifies the Auth user exists.
5. Verifies the Auth user email matches the parent email.
6. Treats missing or mismatched linked users as stale/invalid.
7. Searches Supabase Auth users by exact parent email when no valid linked Auth user exists.
8. Calls `supabase.auth.admin.inviteUserByEmail(parent.email)` if no Auth user exists by ID or email.
9. Only upserts `user_profiles` after a real Auth user is confirmed or created.
10. Only updates `parents.user_id` and `parents.portal_status` after a real Auth user is confirmed or created.
11. Sends a password setup/reset email when an existing Auth user is reused.

## Safe Server-Side Logging

Added safe server-side logging for invite failures.

The logs include operational context such as:

- Parent ID
- Linked user ID
- Parent email
- Supabase Auth error code/name

The logs do not expose service role keys, tokens, passwords, or secrets.

## Friendly Error Mapping

Added friendly user-facing messages for:

- Supabase Auth lookup failure
- Supabase Auth invitation failure

Raw Supabase Auth errors remain hidden from users.

## Security Review

- `SUPABASE_SERVICE_ROLE_KEY` remains required for admin Auth operations.
- The admin client still uses the service role key, not the anon key.
- Passwords are not exposed.
- `user_profiles`, `parents.user_id`, and `parents.portal_status` are not updated unless a real Auth user exists.
- Invitation failures return friendly errors.

## Scope Confirmation

No database schema changes were made.

No migrations were created or modified.

No Business Documents or PDF files were modified.

No parent document downloads were implemented.

No authentication configuration, RBAC model, routes, finance, attendance, courses, reports, or business document logic was changed.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
