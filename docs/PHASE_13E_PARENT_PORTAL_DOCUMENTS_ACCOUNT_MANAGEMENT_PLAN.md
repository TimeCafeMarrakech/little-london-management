# Phase 13E Parent Portal Documents & Account Management Plan

## 1. Purpose

Phase 13E will extend the approved Parent Portal and Business Documents foundation with two focused capabilities:

1. Parent Portal Account Management for admins.
2. Parent Portal Document Downloads for parents.

The goal is to let Little London staff manage parent portal access clearly, and let parent users download their own family documents safely from the read-only portal.

Phase 13E must reuse the existing Phase 13A-13D Business Documents foundation. It must not duplicate PDF generation logic, expose admin routes to parents, allow parent editing workflows, or let parents access another family's documents.

## 2. Current State

Implemented foundations already available:

- Parent Management exists with `parents.portal_status`.
- Parent Portal MVP exists and is read-only.
- Parent Portal data is scoped through parent-safe views such as `parent_portal_*`.
- Parent ownership is based on `parents.user_id` and active `parent_student_relationships`.
- Parent Portal pages already verify `profile.role === "parent"`.
- Business Documents foundation exists:
  - Registration Form PDF
  - Invoice PDF
  - Receipt PDF
  - Shared PDF theme, formatters, layout helpers and PDF route helper
  - Shared `BusinessDocumentActions`
- Current PDF routes are management-only:
  - `/students/[studentId]/registration-form`
  - `/invoices/[invoiceId]/invoice-pdf`
  - `/payments/[paymentId]/receipt-pdf`

Important current gap:

- Parents can view portal finance data, but cannot yet download parent-safe PDFs.
- Admins can view parent portal status, but there is no complete account lifecycle workflow for creating, inviting, enabling, disabling or resetting portal access.

## 3. Missing Parent Portal Account Lifecycle Tools

The parent management module needs explicit admin tools for:

- Create portal account
- Send invitation / password setup email
- Send reset password link
- Enable portal access
- Disable portal access
- Show portal account status:
  - No Account
  - Invited
  - Active
  - Disabled

Current documented database model already expects:

- `parents.user_id`
- `parents.portal_status`
- `user_profiles`
- Parent role assignment through the existing auth/profile model

Phase 13E should make these existing fields operational through admin UI and server-side workflows.

## 4. Required Admin Workflows

### Create Portal Account

Admin opens a parent detail page and chooses **Create Portal Account**.

Expected workflow:

- Verify admin has parent management permission.
- Verify parent is active and not archived.
- Verify parent has an email address.
- Verify parent does not already have a linked `user_id`.
- Create or invite a Supabase Auth user using the parent email.
- Create or link a `user_profiles` row with role `parent`.
- Link `parents.user_id` to the profile/user identity.
- Set `parents.portal_status = 'invited'` or `active` depending on the auth workflow used.
- Show a clear success message.

### Send Invitation / Password Setup Email

Admin chooses **Send Invitation**.

Expected workflow:

- Verify parent has an email.
- Use Supabase Auth invite or password setup flow.
- Do not expose passwords to staff.
- Update `portal_status` to `invited`.
- Show timestamp/status if available.

### Reset Password Link

Admin chooses **Send Reset Password Link**.

Expected workflow:

- Verify parent has linked portal account.
- Send a Supabase password reset email.
- Do not change parent data other than optional audit/status metadata if available.
- Keep this separate from account creation.

### Enable Portal Access

Admin chooses **Enable Portal Access**.

Expected workflow:

- Verify linked portal account exists.
- Set `parents.portal_status = 'active'`.
- Ensure corresponding user profile/account is not disabled in the application model.
- Parent can log in and access read-only portal pages.

### Disable Portal Access

Admin chooses **Disable Portal Access**.

Expected workflow:

- Set `parents.portal_status = 'disabled'`.
- Parent portal service and middleware/access checks must deny portal access for disabled parents.
- Do not delete the parent record.
- Do not delete historical invoices, payments or documents.

### Account Status Display

Parent list and detail pages should display a clear portal account badge:

- No Account
  - No linked `parents.user_id`.
  - `portal_status` may be `not_invited`.
- Invited
  - Parent has been invited but not yet active.
- Active
  - Parent has portal access.
- Disabled
  - Parent is blocked from portal access.

## 5. Required Parent Portal Document Workflows

Parent users should be able to download only their own family documents:

- Registration Form PDF
- Invoice PDF
- Receipt PDF

Parent workflow should be read-only:

- View parent portal page.
- See document download action where relevant.
- Click download.
- Receive a PDF.

No parent-side generation form, editing flow, email sending, WhatsApp sending, archive system, upload flow or document management console is included.

### Registration Form PDF

Suggested placement:

- Parent Portal child profile page.

Parent action:

- Download Registration Form PDF.

Access rule:

- Parent can download only if the student is linked through an active `parent_student_relationships` row and the parent account is active.

### Invoice PDF

Suggested placement:

- Parent Portal Finance page.
- Invoice rows/cards.

Parent action:

- Download Invoice PDF.

Access rule:

- Parent can download only invoices where:
  - invoice belongs to the parent or to one of the parent's linked children,
  - invoice is not deleted/archived,
  - parent-student relationship is active.

### Receipt PDF

Suggested placement:

- Parent Portal Finance page.
- Payment rows/cards.

Parent action:

- Download Receipt PDF.

Access rule:

- Parent can download only payments where:
  - payment belongs to the parent or to one of the parent's linked children,
  - parent-student relationship is active,
  - payment is not hidden/deleted by future archive rules.

## 6. Security Model

Phase 13E security must use layered protection:

- Middleware/session authentication.
- User profile role check.
- Parent portal account status check.
- Parent ownership verification.
- Supabase RLS and/or parent-safe views.
- Server-side route checks before PDF generation.

Parent PDF download routes must not call management-only route handlers directly.

Recommended approach:

- Create parent-safe PDF data access functions.
- Reuse existing PDF generation functions/templates after parent-safe data has been loaded.
- Create new parent portal PDF routes under `/portal`, for example:
  - `/portal/children/[studentId]/registration-form`
  - `/portal/finance/invoices/[invoiceId]/invoice-pdf`
  - `/portal/finance/payments/[paymentId]/receipt-pdf`

These routes should verify parent ownership before returning a PDF.

## 7. Parent-Safe Document Access Rules

Parent access must require all of the following:

- Authenticated session.
- User profile role is `parent`.
- Active parent record exists where `parents.user_id` matches the current user/profile.
- Parent record is not deleted.
- Parent portal status is `active`.
- Student is linked to that parent through active `parent_student_relationships`.
- Relationship is not deleted.
- Requested document belongs to that parent/family scope.

Rules by document:

- Registration Form:
  - Student must be the parent's own linked child.
  - PDF must remain parent-safe.
  - No internal notes, audit fields, database IDs, raw auth IDs or management-only fields.

- Invoice:
  - Invoice `parent_id` and `student_id` must match the authenticated family scope.
  - Invoice must not be deleted.
  - Use parent-safe invoice fields only.

- Receipt:
  - Payment `parent_id` and `student_id` must match the authenticated family scope.
  - Linked invoice allocation data must be parent-safe.
  - No raw allocation IDs or internal finance notes.

## 8. Routes/Pages Needed

### Admin Parent Management

Likely additions:

- Parent detail page account status panel.
- Parent list portal status badge improvements if needed.
- Parent portal account action forms/actions:
  - Create portal account
  - Send invitation
  - Send reset password link
  - Enable portal access
  - Disable portal access

Potential existing page integration:

- `/parents`
- `/parents/[parentId]`
- `/parents/[parentId]/edit` only if status editing remains part of the existing form.

### Parent Portal Documents

Likely additions:

- Child detail document action:
  - `/portal/children/[studentId]`
- Finance invoice document action:
  - `/portal/finance`
- Finance payment document action:
  - `/portal/finance`

New parent-safe PDF routes should be added under `/portal`, not under management routes:

- `/portal/children/[studentId]/registration-form`
- `/portal/finance/invoices/[invoiceId]/invoice-pdf`
- `/portal/finance/payments/[paymentId]/receipt-pdf`

## 9. Components Needed

Admin components:

- `ParentPortalAccountStatusCard`
- `ParentPortalAccountActions`
- `ParentPortalStatusBadge`
- `PortalAccountActionButton` or small form components for each action

Parent Portal components:

- `ParentPortalDocumentActions`
- `ParentPortalRegistrationDocumentButton`
- `ParentPortalInvoiceDocumentButton`
- `ParentPortalReceiptDocumentButton`
- Optional finance document badges for downloadable invoices/receipts

Reusable Business Documents components:

- Existing `BusinessDocumentActions` remains for management workflows.
- Parent portal downloads should likely use a simpler parent-safe action button, not the full management action panel, because parents should not prepare email/WhatsApp workflows in this phase unless explicitly approved.

## 10. Database/Auth Considerations

No new database schema is planned for Phase 13E unless implementation discovers a real missing field.

Existing expected fields:

- `parents.user_id`
- `parents.portal_status`
- `user_profiles.role`
- `parent_student_relationships.status`
- `parent_student_relationships.deleted_at`

Auth considerations:

- Supabase Auth invitation/reset flows require secure server-side use.
- Secrets must not be exposed to client components.
- Passwords must never be generated visibly in the UI.
- Admins should send setup/reset links, not manually set parent passwords.
- Disable portal access should block application access even if Supabase Auth still allows a session.

Potential service helpers:

- `getParentPortalAccountStatus(parent)`
- `createParentPortalAccount(profile, parentId)`
- `sendParentPortalInvitation(profile, parentId)`
- `sendParentPasswordReset(profile, parentId)`
- `enableParentPortalAccess(profile, parentId)`
- `disableParentPortalAccess(profile, parentId)`
- `getParentOwnedStudentForDocument(profile, studentId)`
- `getParentOwnedInvoiceForDocument(profile, invoiceId)`
- `getParentOwnedPaymentForDocument(profile, paymentId)`

## 11. Email/Invitation Considerations

Phase 13E should use the existing Supabase auth email mechanism where possible.

Invitation email:

- Purpose: parent sets up password and logs into the portal.
- Triggered by admin.
- Uses parent email.
- Should mention Little London Parent Portal.

Password reset email:

- Purpose: existing parent user resets password.
- Triggered by admin or future parent self-service.
- Uses Supabase reset flow.

Not included:

- Custom email template engine.
- Email delivery dashboard.
- WhatsApp invitation sending.
- Manual password sharing.

## 12. What Is NOT Included

Phase 13E does not include:

- Parent editing workflows.
- Parent document generation forms.
- Parent uploads.
- Full document archive system.
- Storage buckets.
- New document database tables.
- Email sending beyond Supabase auth invitation/reset flows.
- WhatsApp API integration.
- Online payments.
- Parent portal invoice payment.
- Parent portal receipt generation requests.
- Reports or certificate PDFs.
- Teacher document access.
- Exposing management routes to parents.

## 13. Implementation Order

Recommended safe order:

1. Add parent portal account status helpers.
2. Add admin account lifecycle actions with strict `canManageParents` checks.
3. Add parent detail account status panel and actions.
4. Add parent portal account status enforcement to portal service/middleware if disabled status is not already enforced.
5. Add parent-safe document ownership helpers.
6. Add parent-safe PDF data loaders that reuse existing Business Documents templates.
7. Add new parent portal PDF routes under `/portal`.
8. Add parent portal document download buttons.
9. Verify admin PDF routes remain management-only.
10. Verify parent routes cannot access unrelated family documents.
11. Run lint, type-check and build.
12. Create Phase 13E completion report.

## 14. Risks

Primary risks:

- Accidentally exposing management PDF routes to parents.
- Allowing a parent to download another family's invoice or receipt.
- Reusing management data loaders that include parent-inappropriate fields.
- Treating `portal_status = invited` as fully active.
- Disabling only UI access while leaving server routes accessible.
- Creating Supabase Auth users without correctly linking `parents.user_id`.
- Sending invitation/reset email to the wrong address.
- Adding parent document actions that look like generation/edit workflows instead of read-only downloads.

Mitigations:

- Use separate parent-safe routes under `/portal`.
- Verify ownership in server-side code before generating PDFs.
- Reuse PDF rendering, not management route handlers.
- Gate parent portal access by active parent account status.
- Keep admin account actions server-side.
- Add clear user-facing account status labels.
- Test with at least two parent accounts from different families.

## 15. Success Criteria

Phase 13E is successful when:

- Admin can see parent portal account status.
- Admin can create/invite a parent portal account.
- Admin can send a password reset link.
- Admin can enable portal access.
- Admin can disable portal access.
- Disabled parents cannot access the Parent Portal.
- Parent users can download their own child's Registration Form PDF.
- Parent users can download their own family Invoice PDFs.
- Parent users can download their own family Receipt PDFs.
- Parents cannot download documents for unrelated students, invoices or payments.
- Admin PDF routes remain management-only.
- Parent portal document routes are read-only.
- Existing Phase 13A-13D PDF generation code is reused.
- No duplicate PDF generation templates are created.
- No database schema changes are required unless explicitly approved later.
- Lint passes.
- Type-check passes.
- Build passes.
