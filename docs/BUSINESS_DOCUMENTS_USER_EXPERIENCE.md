# Business Documents User Experience

## Purpose

This document defines the official user experience reference for Business Documents in the Little London Management System.

It covers generated business documents only:

- Student Registration Form PDF
- Invoice PDF
- Receipt PDF

The experience must follow:

- Premium Boutique Dashboard v3
- `UI_DESIGN_SYSTEM.md`
- `REGISTRATION_FORM_PDF_DESIGN.md`
- `PHASE_13_BUSINESS_DOCUMENTS_PDF_ENGINE_PLAN.md`

This document is UX-only and does not define implementation code.

## 1. Standard Document Workflow

All business documents should follow the same workflow:

```text
Generate → Preview → Download → Print → Prepare Email → Copy WhatsApp Message
```

### Generate

The user starts from the relevant existing record:

- Student profile for registration form
- Invoice detail for invoice PDF
- Payment detail for receipt PDF

The system generates the document from existing approved data.

### Preview

The user reviews the document before sharing.

Preview should show:

- PDF layout
- Branding
- Key values
- Totals where relevant
- Parent-safe information only where required

### Download

The user downloads the generated PDF.

The file name should be clear, readable, and safe.

### Print

The user can print the PDF from the preview screen or downloaded file.

### Prepare Email

The user can open a prepared email panel with:

- Suggested recipient
- Subject
- Message body
- Reminder to attach the downloaded PDF unless automated email is added later

### Copy WhatsApp Message

The user can copy a short WhatsApp-ready message.

WhatsApp sharing is manual in this phase. The system does not send WhatsApp messages or attach files automatically.

## 2. Standard Document Action Bar

Every business document preview should include a consistent action bar.

Actions:

- Preview
- Download PDF
- Print
- Prepare Email
- Copy WhatsApp Message

### Visual Style

The action bar should use Premium Boutique Dashboard v3 styling:

- Warm cream or white surface
- Soft border
- Rounded corners
- Navy labels
- Coral primary action
- Sage secondary accents
- Clear icons
- Accessible focus states

### Recommended Action Priority

Primary:

- Download PDF

Secondary:

- Preview
- Print
- Prepare Email
- Copy WhatsApp Message

### Button Behaviour

Buttons should be:

- Clearly labelled
- Keyboard accessible
- Mobile-friendly
- Disabled while generating
- Supported by friendly loading states

## 3. Student Registration Form Workflow

### Entry Point

The Student Registration Form workflow starts from:

- Student detail page
- Student profile action area

### User Flow

1. Admin opens a student profile.
2. Admin selects `Generate Registration Form`.
3. System generates the latest PDF from student, parent, emergency contact, enrolment, and approved medical/allergy data.
4. Preview opens.
5. Admin checks the document.
6. Admin downloads or prints the form.
7. Admin can prepare the email text.
8. Admin can copy the WhatsApp message for manual sharing.

### UX Requirements

The workflow should make clear:

- Which student the form belongs to
- Which parent or guardian is being addressed
- Whether the form is parent-safe or Admin version
- When the form was generated

### Empty/Missing Data States

If data is missing, show friendly messages such as:

- `No emergency contact recorded.`
- `No active enrolment recorded.`
- `No medical or allergy information recorded.`

Missing optional data should not block generation unless required by business policy.

## 4. Invoice Workflow

### Entry Point

The Invoice PDF workflow starts from:

- Invoice detail page
- Invoice list card or action menu
- Parent finance area for management users

### User Flow

1. Admin opens an invoice.
2. Admin selects `Generate Invoice PDF`.
3. System generates the PDF from existing invoice, invoice item, parent, student, and payment balance data.
4. Preview opens.
5. Admin verifies invoice items, total, paid amount, balance, due date, and status.
6. Admin downloads or prints the invoice.
7. Admin can prepare an email.
8. Admin can copy a WhatsApp-ready message.

### UX Requirements

The invoice experience should clearly display:

- Invoice number
- Parent name
- Student name
- Total amount
- Amount paid
- Balance due
- Due date
- Status

### Parent Portal

If parent download is enabled, parent users may download only their own family invoices.

Parent users must not see:

- Internal notes
- Management comments
- Audit fields
- Other family data

## 5. Receipt Workflow

### Entry Point

The Receipt PDF workflow starts from:

- Payment detail page
- Payment list card or action menu
- Invoice detail payment allocation area

### User Flow

1. Admin opens a payment record.
2. Admin selects `Generate Receipt PDF`.
3. System generates the PDF from payment, allocation, invoice, parent, and student data.
4. Preview opens.
5. Admin verifies payment amount, method, reference, and linked invoice allocation.
6. Admin downloads or prints the receipt.
7. Admin can prepare an email.
8. Admin can copy a WhatsApp-ready message.

### Payment Method Display

Receipt PDFs must clearly show the payment method:

- Cash
- Bank Transfer
- Cheque

### Parent Portal

If parent download is enabled, parent users may download only their own family receipts.

Teachers must not access receipt workflows.

## 6. Preview Screen Experience

The preview screen should feel calm, premium, and practical.

### Layout

Recommended desktop layout:

- Left or main area: document preview
- Right side panel: document summary and actions

Recommended mobile layout:

- Document summary first
- Action bar
- Preview area below

### Preview Content

The preview should show:

- Document type
- Owner record
- Generated date
- PDF page preview
- Status badge
- Action bar

### Summary Panel

The summary panel should include:

- Document name
- Student or parent name
- Related invoice or payment number where relevant
- Generated date
- Version type: Parent-safe or Admin
- Key totals for invoice/receipt documents

### Loading State

While generating:

- Show a soft skeleton panel
- Display `Preparing document...`
- Disable document action buttons

### Error State

If generation fails:

- Use a friendly error card
- Explain the issue without raw technical errors
- Provide a retry action

Example:

```text
We could not prepare this document. Please check the record details and try again.
```

## 7. Email Preparation Experience

Email preparation is manual in the MVP.

### Email Panel

The `Prepare Email` action should open a panel or modal showing:

- Suggested recipient
- Subject
- Body
- Reminder to attach the downloaded PDF
- Copy subject button
- Copy body button
- Copy all button

### Registration Form Email

Subject:

```text
Little London Registration Form - {student_name}
```

Body:

```text
Bonjour {parent_name},
Veuillez trouver ci-joint le formulaire d’inscription de {student_name}.
Merci,
Little London
```

### Invoice Email

Subject:

```text
Little London Invoice {invoice_number} - {student_name}
```

Body:

```text
Bonjour {parent_name},
Veuillez trouver ci-joint la facture {invoice_number} pour {student_name}.
Montant total: {total}.
Solde restant: {balance}.
Merci,
Little London
```

### Receipt Email

Subject:

```text
Little London Receipt {payment_number} - {student_name}
```

Body:

```text
Bonjour {parent_name},
Nous confirmons la réception de votre paiement de {amount} pour {student_name}.
Mode de paiement: {payment_method}.
Merci,
Little London
```

## 8. WhatsApp Sharing Experience

WhatsApp sharing is manual attachment only.

The system should not:

- Send WhatsApp messages automatically
- Integrate with WhatsApp API
- Attach files automatically
- Store WhatsApp delivery status

### User Flow

1. User downloads the PDF.
2. User clicks `Copy WhatsApp Message`.
3. System copies the prepared message.
4. User opens WhatsApp manually.
5. User pastes the message and attaches the PDF manually.

### WhatsApp Message Examples

Registration form:

```text
Bonjour {parent_name}, veuillez trouver le formulaire d’inscription de {student_name}. Merci, Little London.
```

Invoice:

```text
Bonjour {parent_name}, veuillez trouver la facture {invoice_number} pour {student_name}. Total: {total}. Solde restant: {balance}. Merci, Little London.
```

Receipt:

```text
Bonjour {parent_name}, nous confirmons la réception de votre paiement de {amount} pour {student_name}. Mode de paiement: {payment_method}. Merci, Little London.
```

### UX Notes

After copying, show a short confirmation:

```text
WhatsApp message copied.
```

## 9. Document Status Badges

Business document screens should use clear status badges.

Recommended badges:

| Badge | Meaning | Suggested Style |
| --- | --- | --- |
| `Ready` | Document generated and ready | Sage background, navy text |
| `Generating` | PDF is being prepared | Warm cream background, navy text |
| `Downloaded` | User downloaded PDF in current session | Sage accent |
| `Printed` | User triggered print in current session | Warm yellow accent |
| `Email Prepared` | Email text was copied/prepared | Sage accent |
| `WhatsApp Copied` | WhatsApp message copied | Coral accent |
| `Parent-Safe` | Excludes management-only fields | Sage/mint badge |
| `Admin Version` | Includes management-safe operational fields | Warm yellow badge |
| `Error` | Generation failed | Coral/destructive styling |

Badges should not imply delivery unless a future delivery system is implemented.

## 10. Mobile Experience

Business document workflows must be usable on mobile.

Mobile requirements:

- Action buttons stack cleanly.
- Preview can scroll vertically.
- No horizontal overflow.
- Summary information appears before long preview content.
- Copy actions remain easy to tap.
- Download and print buttons are large enough for touch.
- Email and WhatsApp text panels fit within the viewport.

Mobile action order:

1. Download PDF
2. Preview
3. Copy WhatsApp Message
4. Prepare Email
5. Print

Mobile should prioritize quick sharing while preserving security.

## 11. Accessibility

Accessibility requirements:

- All icon buttons must have text labels or accessible labels.
- Buttons must be keyboard accessible.
- Focus states must be visible.
- Status badges must not rely on colour alone.
- PDF preview controls must be reachable by keyboard.
- Copy actions must announce success where possible.
- Formatted totals and dates must be readable by assistive technology.
- Colour contrast must remain WCAG-friendly.
- Loading and error states must be announced clearly.

Recommended accessible labels:

- `Preview registration form PDF`
- `Download invoice PDF`
- `Print receipt PDF`
- `Prepare email for invoice`
- `Copy WhatsApp message for receipt`

## 12. Future Expansion For Certificates And Reports

The Business Documents UX should be reusable for future generated documents.

Future document types may include:

- Student certificates
- Attendance certificates
- Payment statements
- Account statements
- Progress reports
- Event booking confirmations
- Holiday camp confirmation letters
- Teacher reports
- Management report PDFs

Future workflows should reuse:

- Standard document action bar
- Preview screen
- Download workflow
- Print workflow
- Email preparation panel
- WhatsApp-ready copy panel
- Status badge system
- Parent-safe/Admin version distinction where needed

Future expansion must continue to follow:

- Premium Boutique Dashboard v3
- Parent-safe field rules
- Teacher finance restrictions
- Server-side generation
- Role-aware access
- Manual WhatsApp sharing unless API integration is explicitly approved

## Approval Standard

Before implementation, the Business Documents UX should be reviewed against:

- `UI_DESIGN_SYSTEM.md`
- `REGISTRATION_FORM_PDF_DESIGN.md`
- `PHASE_13_BUSINESS_DOCUMENTS_PDF_ENGINE_PLAN.md`
- Current RBAC and Parent Portal security rules

This document is the official UX reference for Phase 13 Business Documents implementation.
