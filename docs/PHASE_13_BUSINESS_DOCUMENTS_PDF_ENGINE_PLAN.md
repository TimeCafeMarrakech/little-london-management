# Phase 13 Business Documents & PDF Engine Plan

## Purpose

Phase 13 should focus on generated business documents for the Little London Management System.

This replaces the broad Documents & File Management direction with a practical PDF Engine phase aligned with the real Little London workflow.

The goal is to generate branded, print-ready, downloadable, and share-ready PDFs from existing system data.

Primary Phase 13 outputs:

- Student Registration Form PDF
- Invoice PDF
- Receipt PDF
- Optional student photo support
- Email-ready and WhatsApp-ready sharing workflows

Phase 13 should not become a full document management or file archive system.

## Real Little London Workflow

Little London does not collect many uploaded documents during registration.

The usual workflow is:

1. Admin creates or updates student and parent records.
2. Admin may optionally add a student photo.
3. Admin needs a clean branded registration form generated from the existing student and parent data.
4. Admin creates invoices from existing parent/student billing data.
5. Admin records payments by Cash, Bank Transfer, or Cheque.
6. Admin needs branded invoice and receipt PDFs for printing, downloading, emailing, or manually sharing by WhatsApp.

The document workflow is therefore mostly generated documents, not uploaded files.

## PDF Types

### 1. Student Registration Form PDF

Purpose:

- Generate a branded student registration form from existing student and parent records.
- Provide a print-ready record for internal use, parent confirmation, or manual filing.

Data source:

- `students`
- `parents`
- `parent_student_relationships`
- emergency contacts
- medical profile/allergies where appropriate
- class/enrolment summary where available

PDF contents:

- Little London branding
- Student full name
- Student number
- Date of birth
- Age
- Primary language
- School name
- Parent/guardian names
- Relationship type
- Parent phone and email
- Emergency contact details
- Medical/allergy summary where authorized
- Registration/enrolment summary
- Signature area if needed
- Generated date

Required capabilities:

- Download PDF
- Print PDF
- Email-ready attachment workflow
- WhatsApp-ready message copy

### 2. Invoice PDF

Purpose:

- Generate branded invoice PDFs from existing invoice records.
- Provide professional parent-facing billing documents.

Data source:

- `invoices`
- `invoice_items`
- `parents`
- `students`
- payment allocation or balance views where available

PDF contents:

- Little London branding
- Invoice number
- Issue date
- Due date
- Invoice status
- Parent details
- Student details
- Invoice item descriptions
- Quantity
- Unit price
- Line total
- Subtotal
- Total amount
- Amount paid
- Balance due
- Payment method information where relevant
- Notes that are explicitly parent-safe
- Footer with contact/payment instructions

Required capabilities:

- Download PDF
- Print PDF
- Email-ready attachment workflow
- WhatsApp-ready message copy

### 3. Receipt PDF

Purpose:

- Generate branded receipt PDFs from existing payment records.
- Provide parent-facing payment confirmation.

Data source:

- `payments`
- `payment_allocations`
- linked `invoices`
- `parents`
- `students`

PDF contents:

- Little London branding
- Receipt number or payment number
- Payment date
- Parent details
- Student details
- Payment amount
- Payment method:
  - Cash
  - Bank Transfer
  - Cheque
- Reference number where available
- Linked invoice number or invoice allocation details
- Amount allocated
- Remaining invoice balance where relevant
- Generated date
- Footer with Little London contact information

Required capabilities:

- Download PDF
- Print PDF
- Email-ready attachment workflow
- WhatsApp-ready message copy

### 4. Optional Student Photo

Purpose:

- Support an optional student profile photo only if needed for registration forms or student records.

Scope:

- Optional upload/update of student photo.
- Display student photo on registration PDF if present.
- Do not build full uploaded document management.
- Do not add multiple document categories.
- Do not build document archive workflows.

## UI Pages And Buttons Needed

Phase 13 should add document generation actions to existing pages rather than creating a heavy new document module.

### Student Pages

Add actions where permitted:

- Generate Registration PDF
- Download Registration PDF
- Print Registration PDF
- Copy WhatsApp Message
- Prepare Email
- Optional Upload/Update Student Photo

Likely locations:

- Student detail page
- Student profile action area
- Student create/edit success flow if appropriate

### Invoice Pages

Add actions where permitted:

- Generate Invoice PDF
- Download Invoice PDF
- Print Invoice PDF
- Copy WhatsApp Message
- Prepare Email

Likely locations:

- Invoice detail page
- Invoice list card actions
- Parent finance summary where appropriate for Admin

### Payment Pages

Add actions where permitted:

- Generate Receipt PDF
- Download Receipt PDF
- Print Receipt PDF
- Copy WhatsApp Message
- Prepare Email

Likely locations:

- Payment detail page
- Payment list card actions
- Invoice detail payment allocation area

### Parent Portal

Parent Portal remains read-only.

Possible parent-facing actions:

- Download own-family invoice PDF
- Download own-family receipt PDF

Email and WhatsApp sending actions should remain management-only in MVP unless explicitly approved.

## Data Sources From Existing Modules

Phase 13 should reuse Phase 1-12 data.

No major new business data model should be introduced.

Data sources:

- Authentication and user profiles for role checks
- Students
- Parents
- Parent-student relationships
- Emergency contacts
- Medical/allergy summaries where authorized
- Enrolments/classes where useful for registration form context
- Invoices
- Invoice items
- Payments
- Payment allocations
- Parent Portal secure views where parent-safe document downloads are exposed

Generated PDFs should not duplicate business data. They should be generated from the current source records.

If PDF generation history is required, a small future metadata table may be planned, but the MVP can generate on demand.

## PDF Design Standards

All PDFs must follow Little London Premium Boutique Dashboard v3 branding.

Visual direction:

- Little London Play & Learn branding
- Coral accents
- Sage green accents
- Warm cream sections
- Navy text
- Warm yellow highlights where useful
- Clean A4 layout
- Professional spacing
- Clear parent-facing language
- No dense ERP styling
- No generic invoice template feel

Technical PDF standards:

- A4 print-ready layout
- Clear margins
- Header with Little London branding
- Footer with contact details
- Page number if multi-page
- Consistent typography
- Parent-safe field selection
- Printable in black and white if needed
- High contrast for readability

PDF output should be suitable for:

- Download
- Print
- Email attachment
- Manual WhatsApp sharing

## Download Workflow

Recommended workflow:

1. User clicks Download PDF.
2. Server verifies authentication, active profile, role, permission, and ownership scope.
3. Server fetches source data.
4. Server shapes parent-safe or management-safe data.
5. Server generates PDF.
6. Server returns file response or short-lived signed URL if stored temporarily.
7. Sensitive download is audited where audit logging exists.

Download rules:

- Admin/Super Admin can download authorized management PDFs.
- Parent can download only own-family invoice/receipt PDFs if parent-facing downloads are enabled.
- Teacher cannot download finance PDFs.
- Internal notes must not appear on parent-facing PDFs.
- Raw database errors must not be exposed.

## Print Workflow

Recommended workflow:

1. User opens PDF preview or downloads PDF.
2. User uses browser print or print button.
3. PDF renders as A4.
4. Print output preserves layout, logo, totals, and page breaks.

Print requirements:

- A4 layout
- No clipped content
- Proper page breaks
- Totals and signature areas remain visible
- Parent/student identity information is readable
- Finance totals are easy to verify

## Email Workflow

Phase 13 should plan email readiness, but actual automated email sending may be deferred unless explicitly approved.

MVP email-ready workflow:

1. Generate PDF.
2. Download PDF.
3. Provide suggested email subject and body text.
4. Admin manually attaches PDF in email client.

Possible future workflow:

1. Generate PDF.
2. Attach PDF automatically.
3. Send through approved email provider.
4. Log delivery status.

Suggested email subjects:

- Registration Form: `Little London Registration Form - {student_name}`
- Invoice: `Little London Invoice {invoice_number} - {student_name}`
- Receipt: `Little London Receipt {payment_number} - {student_name}`

Email body should be parent-safe, polite, and concise.

## WhatsApp-Ready Workflow

Phase 13 should not integrate the WhatsApp API.

MVP WhatsApp-ready workflow:

1. Generate/download PDF.
2. Admin clicks Copy WhatsApp Message.
3. System copies a prepared message to clipboard.
4. Admin manually sends message and attaches PDF through WhatsApp.

Suggested WhatsApp message for registration form:

```text
Hello {parent_name}, please find the Little London registration form for {student_name}. Thank you.
```

Suggested WhatsApp message for invoice:

```text
Hello {parent_name}, please find invoice {invoice_number} for {student_name}. Total: {total}. Balance due: {balance}. Thank you.
```

Suggested WhatsApp message for receipt:

```text
Hello {parent_name}, we confirm receipt of your payment of {amount} for {student_name}. Payment method: {payment_method}. Thank you.
```

Rules:

- WhatsApp messages must not include sensitive internal notes.
- The system should not send WhatsApp messages automatically in Phase 13.
- No WhatsApp API integration is included.

## Permissions

### Super Admin

Allowed:

- Generate, download, print, and share all registration PDFs.
- Generate, download, print, and share all invoice PDFs.
- Generate, download, print, and share all receipt PDFs.
- Manage optional student photos.

### Admin

Allowed:

- Generate, download, print, and share registration PDFs.
- Generate, download, print, and share invoice PDFs.
- Generate, download, print, and share receipt PDFs.
- Upload/update optional student photos.

### Teacher

Allowed:

- No finance PDF access.
- No receipt PDF access.
- No invoice PDF access.
- May view student photo where assigned-student visibility already allows it.
- Registration PDF access should be disabled unless explicitly approved for assigned-student workflows.

### Parent

Allowed:

- Read-only access only.
- May download own-family invoice PDFs if enabled.
- May download own-family receipt PDFs if enabled.
- May view own child student photo if already visible in Parent Portal.

Not allowed:

- Generate management registration PDFs.
- Generate or edit invoices.
- Generate or edit receipts.
- Upload files in Phase 13 unless optional parent photo upload is explicitly approved later.

Recommended permission keys:

- `business_documents.generate.registration.all`
- `business_documents.download.registration.all`
- `business_documents.generate.invoice.all`
- `business_documents.download.invoice.all`
- `business_documents.generate.receipt.all`
- `business_documents.download.receipt.all`
- `business_documents.download.invoice.own_child`
- `business_documents.download.receipt.own_child`
- `students.upload_photo.all`

## Security Considerations

Security requirements:

- Verify authentication for every PDF action.
- Verify active user profile.
- Verify role and permission.
- Verify parent/student relationship before parent-facing invoice or receipt downloads.
- Do not expose internal notes on parent-facing PDFs.
- Do not expose medical details unless intentionally included and authorized.
- Do not expose unrelated family data.
- Teachers must not access finance PDFs.
- PDF generation must happen server-side.
- Do not trust client-provided totals.
- Invoice totals, payment allocations, and balances must come from existing finance logic/data.
- Generated PDFs should avoid embedding secrets or internal IDs unless needed.
- WhatsApp-ready text must be parent-safe.
- Email-ready text must be parent-safe.
- Audit PDF generation/download where audit logging is available.

Sensitive fields to exclude from parent-facing PDFs:

- Internal notes
- Audit fields
- Management-only notes
- Deleted/archive metadata
- Database-only IDs unless needed as public document numbers
- Any unrelated family data

## Success Criteria

Phase 13 is successful when:

- Admin/Super Admin can generate a branded Student Registration Form PDF from existing student and parent data.
- Admin/Super Admin can download and print the registration PDF.
- Admin/Super Admin can generate branded Invoice PDFs from existing invoice data.
- Invoice PDFs show correct parent, student, invoice items, totals, paid amount, balance, due date, and status.
- Admin/Super Admin can generate branded Receipt PDFs from existing payment data.
- Receipt PDFs show correct payment method: Cash, Bank Transfer, or Cheque.
- Receipt PDFs show linked invoice/payment allocation details where available.
- PDFs are print-ready A4.
- PDFs follow Premium Boutique Dashboard v3 / Little London Play & Learn visual standards.
- Admin can copy a WhatsApp-ready message for manual sending.
- Admin can access email-ready subject/body text.
- Parent-facing PDF downloads, if enabled, are own-family only.
- Teachers cannot access finance PDFs.
- Optional student photo support is limited and does not become full document management.
- No full document archive system is introduced.
- Lint, type-check, and build pass when implemented.
- Smoke testing includes registration PDF, invoice PDF, receipt PDF, print, download, parent restrictions, and teacher restrictions.

## Future Enhancements

Future phases may add:

- Automated email sending
- Email delivery logs
- WhatsApp API integration
- Parent Portal invoice and receipt download history
- PDF generation history table
- Stored PDF snapshots
- Receipt numbering policy improvements
- Invoice PDF versioning
- Bulk invoice PDF generation
- Bulk receipt download
- Statement of account PDF
- Student progress report PDFs
- Attendance summary PDFs
- Event booking confirmation PDFs
- Online payment links
- Online payment reconciliation
- Digital signatures
- Public payment receipt verification
- Multi-language PDFs
- Advanced print templates

Future enhancements must preserve:

- Existing RBAC
- Existing parent ownership rules
- Existing teacher finance restrictions
- Premium Boutique Dashboard v3 design language
- Parent-safe field selection
- Server-side financial calculations
