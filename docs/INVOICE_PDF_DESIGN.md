# Invoice PDF Design

## 1. Purpose

The Invoice PDF is a premium branded A4 business document generated from existing Little London invoice, parent, student, invoice item, payment, and allocation data.

The document should be suitable for:

- Preview
- Download
- Print
- Manual email attachment
- Manual WhatsApp sharing

The design must follow:

- Premium Boutique Dashboard v3
- `UI_DESIGN_SYSTEM.md`
- `BUSINESS_DOCUMENTS_USER_EXPERIENCE.md`
- The approved Phase 13A Registration Form PDF styling
- Little London Play & Learn branding

The invoice should feel like a polished boutique school document, not a generic accounting template.

## 2. User Workflow

### Invoice Detail Page

An authorized Super Admin or Admin opens an invoice detail page.

The invoice page should include a Business Documents action area consistent with Phase 13A.

### Generate Invoice PDF

The user selects `Generate Invoice PDF` or an equivalent document action.

The system generates the invoice PDF from existing invoice data.

### Preview

The user previews the PDF before sharing.

Preview should show:

- Little London branding
- Invoice identity
- Parent and student details
- Invoice item table
- Totals and balance
- Status badge
- Footer

### Download PDF

The user downloads the generated PDF.

Recommended file name:

```text
little-london-invoice-{invoice_number}-{student_name}.pdf
```

### Print

The user prints the invoice using the browser or operating system print flow.

The PDF must remain readable, correctly spaced, and complete on A4.

### Prepare Email

The user can prepare or copy an email subject and body.

The MVP workflow is manual:

1. Download the PDF.
2. Copy the prepared email text.
3. Attach the PDF manually.
4. Send through the user's email client.

### Copy WhatsApp Message

The user can copy a WhatsApp-ready message.

The MVP workflow is manual:

1. Download the PDF.
2. Copy the WhatsApp message.
3. Open WhatsApp manually.
4. Paste the message and attach the PDF manually.

No WhatsApp API integration is included.

## 3. PDF Layout Structure

### Header

Use the same approved header style as the Registration Form PDF.

Left branding block:

- Coral circular Little London bus mark
- `LITTLE LONDON`
- `PLAY & LEARN`
- `Where Little Minds Grow`

Right document block:

- `Invoice`
- Invoice number
- Issue date
- Due date
- Status badge

Header styling:

- Warm cream background
- Coral divider
- Navy title
- Sage subtitle accents
- Clean two-column alignment

### Invoice Information

Show invoice-level details in a clean summary area.

Include:

- Invoice number
- Issue date
- Due date
- Status
- Payment status if separate from invoice status

### Bill To / Parent Details

Show the parent or guardian who is responsible for the invoice.

Include:

- Parent name
- Parent phone
- Parent email

If any field is missing, show a parent-safe empty state such as:

```text
Not recorded
```

### Student Details

Show the student connected to the invoice.

Include:

- Student name
- Student number if available

Optional, if already present and useful:

- Class or course summary where invoice context requires it

### Invoice Items Table

The invoice items table is the main financial section.

Columns:

- Description
- Quantity
- Unit price
- Line total

Design:

- Clear table header
- Soft borders
- Navy values
- Muted labels
- Alternating warm cream or white rows if helpful
- No dense ERP grid styling

Long descriptions should wrap cleanly without overlapping totals or later rows.

### Payment Summary

Show a clear financial summary near the bottom of the invoice.

Include:

- Subtotal
- Total
- Amount paid
- Balance due

The balance due should receive the strongest visual emphasis.

Use:

- Navy for primary totals
- Sage for paid amounts
- Warm yellow for partial balances
- Coral for unpaid or overdue balances

### Payment Methods

Include the accepted Little London payment methods:

- Cash
- Bank Transfer
- Cheque

This section should be concise and parent-facing.

Do not include internal banking configuration unless explicitly approved later.

### Notes / Footer

Footer should be subtle and consistent with the Registration Form PDF.

Include:

- `Little London Play & Learn`
- Invoice document label
- Page number
- Optional parent-safe payment note

Do not include internal invoice notes unless they are explicitly marked parent-safe.

### Status Badge

Show the invoice status prominently near the invoice title or summary.

The badge should be readable in colour and black-and-white.

## 4. Exact Fields To Include

### Invoice Fields

- Invoice number
- Issue date
- Due date
- Status

### Parent Fields

- Parent name
- Parent phone
- Parent email

### Student Fields

- Student name
- Student number if available

### Invoice Item Fields

- Invoice item description
- Quantity
- Unit price
- Line total

### Totals

- Subtotal
- Total
- Amount paid
- Balance due

### Payment Method Information

Include payment method information where relevant and already available:

- Cash
- Bank Transfer
- Cheque

If no payment has been recorded, show:

```text
No payment recorded.
```

## 5. Fields To Exclude

The Invoice PDF must exclude:

- Internal notes
- Audit fields
- Database IDs
- Deleted metadata
- Archived metadata
- Raw auth IDs
- Management-only comments
- RLS helper data
- Raw payment allocation IDs
- Raw parent/student relationship IDs
- Technical metadata
- System-only timestamps except invoice dates needed by the document

## 6. Visual Design

### Overall Style

The invoice should use the same visual language as the approved Registration Form PDF.

Use:

- Warm cream background sections
- White content cards
- Coral accents
- Navy headings
- Sage secondary accents
- Warm yellow balance highlights
- Soft borders
- Clean spacing
- Professional A4 structure

Avoid:

- Generic accounting template styling
- Dark navy hero blocks
- Dense grey tables
- Overly technical labels
- Unnecessary metadata

### Header

Use the approved two-column PDF header style.

Left:

- Branding block

Right:

- Invoice title and invoice identity

### Typography

Recommended hierarchy:

- Document title: navy, bold
- Invoice number: navy, semibold
- Section headings: coral, bold
- Table headers: muted navy, semibold
- Totals: navy, bold
- Balance due: coral or warm yellow depending status

### Spacing

Use generous vertical spacing.

Rules:

- Keep the header separate from invoice body.
- Do not crowd the invoice items table.
- Keep totals grouped visually.
- Do not split a totals block across pages.

## 7. Status Badge Rules

### Paid

Style:

- Sage background
- Navy text

Meaning:

- Invoice total has been fully paid.

### Partially Paid

Style:

- Warm yellow background
- Navy text

Meaning:

- Some payment has been recorded, but a balance remains.

### Unpaid / Overdue

Style:

- Coral background or coral border
- Navy or white text depending contrast

Meaning:

- No payment has been recorded, or the due date has passed with a remaining balance.

The badge must not rely on colour alone. It should include clear text.

## 8. Payment Methods

Accepted current payment methods:

- Cash
- Bank Transfer
- Cheque

The invoice may show payment methods as a small parent-facing section:

```text
Accepted payment methods: Cash, Bank Transfer, Cheque
```

Online payments are deferred and must not be shown as available unless explicitly implemented later.

## 9. A4 Print Rules

### Page Size

- A4 portrait

### Margins

Recommended:

- Top: 16-20 mm
- Bottom: 16-20 mm
- Left: 14-18 mm
- Right: 14-18 mm

### Page Breaks

Rules:

- Do not split the header.
- Keep invoice table headers with rows.
- Do not split a single invoice item row across pages if avoidable.
- Keep subtotal, total, amount paid, and balance due together.
- Keep status badge visible on page one.
- Footer must remain visible.

### Table Readability

Rules:

- Descriptions wrap cleanly.
- Quantity, unit price, and line total align consistently.
- Totals align to the right.
- Long item descriptions must not collide with amount columns.

### Black-And-White Readability

The invoice must remain readable when printed in black and white.

Rules:

- Do not rely on colour alone.
- Use clear labels and borders.
- Ensure strong text contrast.
- Keep totals visually grouped.

## 10. Email-Ready Text

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

## 11. WhatsApp-Ready Text

```text
Bonjour {parent_name}, veuillez trouver la facture {invoice_number} pour {student_name}. Total: {total}. Solde restant: {balance}. Merci, Little London.
```

## 12. Success Criteria

The Invoice PDF design is successful when:

- It follows Premium Boutique Dashboard v3 and Little London Play & Learn branding.
- It uses the same approved PDF document language as the Registration Form PDF.
- It is A4 print-ready.
- It clearly shows invoice number, issue date, due date, status, parent, student, invoice items, totals, paid amount, and balance due.
- It supports Cash, Bank Transfer, and Cheque payment method reporting.
- It excludes internal notes, audit fields, database IDs, deleted/archived metadata, raw auth IDs, and management-only comments.
- It provides parent-safe email-ready and WhatsApp-ready text.
- It remains readable in black and white.
- It avoids a generic accounting-template feel.
- It is ready to guide Phase 13B implementation.
