# Supabase Auth Setup Guide

This guide sets up the authentication foundation only. It covers the `roles`, `permissions`, `role_permissions`, and `user_profiles` tables created for Phase 2 authentication and authorization.

Do not place real passwords, service-role keys, access tokens, or private user details in this repository.

## Files Included

- `supabase/migrations/202606200001_auth_foundation.sql`
- `supabase/seed/001_auth_roles_permissions.sql`
- `supabase/seed/002_test_user_profiles_template.sql`

## What The Migration Creates

The migration creates the authentication foundation required by the Phase 2 application:

- `roles`
- `permissions`
- `role_permissions`
- `user_profiles`

It also enables Row Level Security and adds starter RLS policies for:

- Authenticated users reading their own active profile and role permissions
- Super Admin full management access
- Admin visibility for non-Super-Admin user profiles
- Users updating their own profile basics

`user_profiles.branch_id` is intentionally nullable and does not yet reference a `branches` table. This preserves future multi-branch support without creating Phase 3 or business-module tables.

## 1. Apply The Migration

Apply the migration to the Supabase project before running seed data.

Recommended local CLI workflow:

```bash
supabase db push
```

Alternative manual workflow:

1. Open the Supabase project dashboard.
2. Go to SQL Editor.
3. Run `supabase/migrations/202606200001_auth_foundation.sql`.
4. Confirm the four tables exist in the `public` schema.

## 2. Seed Roles And Permissions

Run:

```bash
supabase db seed --file supabase/seed/001_auth_roles_permissions.sql
```

Alternative manual workflow:

1. Open Supabase SQL Editor.
2. Run `supabase/seed/001_auth_roles_permissions.sql`.
3. Confirm these roles exist:
   - `super_admin`
   - `admin`
   - `teacher`
   - `parent`

Verification query:

```sql
select name, display_name, status
from public.roles
order by name;
```

Role-permission verification query:

```sql
select r.name as role_name, p.key as permission_key
from public.role_permissions rp
join public.roles r on r.id = rp.role_id
join public.permissions p on p.id = rp.permission_id
order by r.name, p.key;
```

## 3. Create Test Users In Supabase Auth

Create one test user for each role in Supabase Auth:

- Super Admin
- Admin
- Teacher
- Parent

Dashboard workflow:

1. Open Supabase dashboard.
2. Go to Authentication.
3. Open Users.
4. Select Add user.
5. Enter a test email and password.
6. Mark the email as confirmed if the dashboard asks for confirmation and email verification is not being tested.
7. Save the user.
8. Copy the generated Auth user UUID.

Recommended test account pattern:

- `super-admin-test@your-test-domain`
- `admin-test@your-test-domain`
- `teacher-test@your-test-domain`
- `parent-test@your-test-domain`

Do not commit real email addresses or passwords.

## 4. Link Auth Users To User Profiles

Each Supabase Auth user must have a matching `public.user_profiles` row.

Use `supabase/seed/002_test_user_profiles_template.sql` as the manual linking template:

1. Copy the relevant commented insert statement.
2. Replace the placeholder UUID with the Supabase Auth user UUID.
3. Replace the placeholder email with the Auth user email.
4. Confirm the `where r.name = ...` role matches the intended test user.
5. Run the statement in Supabase SQL Editor.

Example shape:

```sql
insert into public.user_profiles (id, role_id, full_name, email, status)
select '<AUTH_USER_UUID>'::uuid, r.id, '<DISPLAY_NAME>', '<AUTH_EMAIL>', 'active'
from public.roles r
where r.name = '<ROLE_NAME>'
on conflict (id) do update set
  role_id = excluded.role_id,
  full_name = excluded.full_name,
  email = excluded.email,
  status = excluded.status;
```

Valid role names are:

- `super_admin`
- `admin`
- `teacher`
- `parent`

Profile verification query:

```sql
select up.email, up.full_name, up.status, r.name as role_name
from public.user_profiles up
join public.roles r on r.id = up.role_id
order by r.name, up.email;
```

## 5. Assign Roles

Roles are assigned through `user_profiles.role_id`.

To change a user's role:

```sql
update public.user_profiles up
set role_id = r.id,
    updated_at = now()
from public.roles r
where up.email = '<AUTH_EMAIL>'
  and r.name = '<ROLE_NAME>';
```

Keep role assignment limited:

- Super Admin should be assigned only to trusted project owners.
- Admin should not be able to create or edit Super Admin profiles.
- Teacher and Parent accounts should use only their own assigned role.

## 6. Verify Login Works

Before logging in:

1. Confirm the app environment variables are configured locally.
2. Do not print or share secret values.
3. Confirm the Auth user exists.
4. Confirm `user_profiles.id` exactly matches `auth.users.id`.
5. Confirm `user_profiles.status = 'active'`.
6. Confirm the linked role has `roles.status = 'active'`.

Run the application locally:

```bash
npm run dev
```

Then verify:

1. Visit the login page.
2. Sign in as each test user.
3. Confirm login succeeds.
4. Confirm protected pages load for authenticated users.
5. Confirm the app can read the user's profile and role.
6. Confirm logout returns the user to the login flow.
7. Confirm an Auth user without a matching active `user_profiles` row is denied application access.

## Troubleshooting

If login succeeds in Supabase Auth but the app blocks access:

- Check that the Auth UUID and `user_profiles.id` are identical.
- Check that the profile status is `active`.
- Check that the role status is `active`.
- Check that the role has permissions in `role_permissions`.
- Check that RLS policies were created successfully.

If permissions do not load:

- Re-run `supabase/seed/001_auth_roles_permissions.sql`.
- Verify `role_permissions` contains rows for the user's role.
- Verify permission keys match the keys expected by the application.

If an Admin can see too much:

- Confirm the target user is not assigned the `super_admin` role.
- Confirm the Admin user is assigned the `admin` role only.
- Review the `user_profiles_select_own_or_management` RLS policy.

## Security Notes

- Never expose the Supabase service-role key in browser code.
- Keep `.env.local` local and uncommitted.
- Use the anon key only where client-side Supabase access is required.
- Use Row Level Security as the enforcement layer for all authenticated data reads.
- Add stricter branch-scoped policies when the future `branches` table is introduced.
