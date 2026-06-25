# Release Process

## Purpose

This document defines the official release process for the Little London Management System before every production deployment.

Every future release must follow this workflow to ensure the application is tested, documented, reviewed, approved, and safely deployed.

---

## Development Complete

Before starting the release process, confirm:

- Feature implementation completed
- Local testing completed
- Documentation updated

No release should begin while required implementation work is incomplete.

---

## Code Verification

Run:

```powershell
npm.cmd run lint
```

Expected:

Pass

Run:

```powershell
npm.cmd run type-check
```

Expected:

Pass

Run:

```powershell
npm.cmd run build
```

Expected:

Pass

All three commands must pass before deployment.

---

## Manual Smoke Testing

Reference:

`docs/SYSTEM_SMOKE_TEST_CHECKLIST.md`

Every section of the smoke test checklist must pass before deployment.

The smoke test checklist covers:

- Authentication
- Dashboard
- Students
- Parents
- Teachers
- Courses
- Classes
- Enrolments
- Attendance
- Finance
- Events
- Reports
- Parent Portal
- Responsive layouts
- Security
- Build verification
- Deployment checks

---

## Documentation Review

Confirm:

- `PROJECT_STATUS.md` updated
- Phase reports completed
- Review reports completed
- Approval reports completed

Documentation must accurately reflect the release state before deployment.

---

## Git Workflow

Run:

```powershell
git add .
```

Run:

```powershell
git commit -m "<release message>"
```

Run:

```powershell
git push
```

Run:

```powershell
git tag <release tag>
```

Run:

```powershell
git push origin <release tag>
```

Use a clear release message and release tag that match the approved project milestone or phase.

---

## Deployment

Deploy to Vercel.

Before and after deployment, verify:

- Environment variables are configured correctly
- Supabase connectivity works
- No secrets are exposed in logs or documentation

---

## Production Verification

After deployment, verify the following in production:

- Login
- Dashboard
- Students
- Parents
- Teachers
- Attendance
- Finance
- Reports
- Parent Portal
- Logout

Any production issue must be resolved before the release is considered approved.

---

## Approval

Reviewer:

Date:

Version:

□ Approved

□ Rejected

---

## Best Practices

- Always deploy from a clean working tree.
- Never deploy with failing lint.
- Never deploy with failing type-check.
- Never deploy with failing build.
- Never skip smoke testing.
- Always create a Git tag for approved releases.
- Always update `PROJECT_STATUS.md` after an approved phase.

This document is the official release procedure for the Little London Management System.
