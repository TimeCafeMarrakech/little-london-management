# Phase 13E-1 Completion Report

## Summary

Phase 13E-1 implemented Parent Portal Account Management for administrators.

This phase adds operational controls to the Parent Detail page so Super Admin and Admin users can invite parents to the Parent Portal, send password reset links, enable portal access, disable portal access, and review the parent portal account state.

Parent document downloads were not implemented in this step.

## Files Created

- `supabase/admin.ts`
- `components/parents/parent-portal-account-card.tsx`
- `app/(dashboard)/portal/layout.tsx`
- `docs/PHASE_13E1_COMPLETION_REPORT.md`

## Files Modified

- `app/(dashboard)/parents/[parentId]/page.tsx`
- `features/parents/actions.ts`
- `features/parents/types.ts`
- `services/parents/parent-service.ts`
- `services/parent-portal/parent-portal-service.ts`

## Portal Account Card

The Parent Detail page now includes a Premium Dashboard v3 `Portal Account` card for administrators.

The card displays:

- Portal Status
- Portal Email
- Linked User
- Parent Portal Enabled
- Last Invitation placeholder
- Last Login placeholder or linked profile value when available

Portal status badges follow the approved colours:

- No Account: grey
- Invited: warm yellow
- Active: sage green
- Disabled: coral/red

## Copy Login Email

The Portal Account card includes a `Copy Login Email` button.

The button copies the parent portal email to the clipboard when an email is available. It is disabled when the parent has no usable email address.

## Admin Actions Implemented

The following management actions were added:

- Invite Parent to Portal
- Reset Password
- Enable Portal
- Disable Portal

All actions verify the current user can manage parents before performing the operation.

Invite Parent to Portal:

- Verifies the parent exists.
- Verifies the parent is active.
- Verifies the parent is not archived.
- Verifies the parent has an email address.
- Uses the Supabase Auth invitation flow when no matching auth user exists.
- Links an existing auth user when one already exists for the parent email.
- Creates or updates the parent `user_profiles` record.
- Links `parents.user_id`.
- Updates `parents.portal_status` to `invited`.
- Sends a password setup/reset email when an existing auth user is linked.

Reset Password:

- Sends a Supabase password reset email.
- Does not expose passwords.

Disable Portal:

- Sets `parents.portal_status` to `disabled`.
- Updates the linked `user_profiles.status` to `disabled` when a linked user exists.
- Does not delete the auth account, parent record, finance records, relationships, or history.

Enable Portal:

- Sets `parents.portal_status` to `active`.
- Updates the linked `user_profiles.status` to `active`.

## Portal Status Enforcement

Parent Portal access now checks the linked parent account before rendering `/portal` routes.

Parent access is denied when:

- The current profile is not a parent.
- No parent record is linked to the current auth user.
- The parent record is archived or deleted.
- The parent record is not active.
- `parents.portal_status` is not `active`.

Disabled parents are redirected to access denied and cannot use the Parent Portal.

Existing parent ownership checks remain in place.

## Security Review

- Parent portal management actions are restricted to Super Admin/Admin through the existing `canManageParents` helper.
- Passwords are never generated or displayed to administrators.
- Supabase Auth invitation and password reset flows are used instead of manual password handling.
- Parent Portal routes now enforce active portal status.
- No parent document downloads were added.
- No Business Documents, PDF generation, finance, attendance, courses, reports, database schema, migrations, routes, or RBAC model changes were introduced.

## Known Limitations

- Supabase service role access is required for account invitation/linking and parent portal access enforcement. The environment must provide `SUPABASE_SERVICE_ROLE_KEY`.
- Last invitation timestamp is displayed as a placeholder because no invitation audit table or timestamp column currently exists.
- Last login depends on the existing `user_profiles.last_login_at` value.
- Email delivery depends on the configured Supabase Auth email provider.
- Phase 13E-2 parent document downloads remain deferred.

## Command Results

`npm.cmd run lint`

Result: Passed

`npm.cmd run type-check`

Result: Passed

`npm.cmd run build`

Result: Passed
