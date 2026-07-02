# Phase 13D Architecture Review

## 1. Summary

Phase 13A, Phase 13B and Phase 13C successfully established the Business Documents foundation:

- PDF Engine Foundation
- Student Registration Form PDF
- Premium Invoice PDF
- Premium Receipt PDF
- Document action panels for preview, download, print, email preparation and WhatsApp message copy
- Email and WhatsApp message helpers

The implementation is stable and production checks pass, but the document layer now contains clear duplication across PDF layout code, route response handling, action components, formatting helpers and message construction. Phase 13D should consolidate these repeated patterns into shared reusable helpers/components while preserving the approved document designs and security boundaries.

This review is documentation-only. No code, routes, services, PDFs, database files, migrations, authentication, RBAC or business logic were modified.

## 2. Files Reviewed

PDF engine and templates:

- `lib/pdf/simple-pdf.ts`
- `services/business-documents/registration-form-pdf.ts`
- `services/business-documents/invoice-pdf.ts`
- `services/business-documents/receipt-pdf.ts`

Business document messages:

- `services/business-documents/messages.ts`

Business document action components:

- `components/business-documents/registration-form-actions.tsx`
- `components/business-documents/invoice-pdf-actions.tsx`
- `components/business-documents/receipt-pdf-actions.tsx`

PDF routes:

- `app/(dashboard)/students/[studentId]/registration-form/route.ts`
- `app/(dashboard)/invoices/[invoiceId]/invoice-pdf/route.ts`
- `app/(dashboard)/payments/[paymentId]/receipt-pdf/route.ts`

## 3. Duplicated PDF Layout Patterns

The three document templates repeat the same low-level PDF layout approach:

- Local `COLORS` constants for coral, navy, sage, cream, gold, muted, border and white.
- Local `PdfContext` types containing the document instance, current page, vertical position and page number.
- Repeated document initialization using `new SimplePdfDocument`.
- Repeated `ensureSpace` page-break logic.
- Repeated use of `doc.rect`, `doc.text`, `doc.line`, `doc.circle` and `wrapText`.
- Repeated page coordinate conventions:
  - A4 portrait canvas.
  - Top cream header area.
  - Coral divider.
  - Left/right content margin around `42`.
  - Footer baseline around `44`.
- Repeated section title styling:
  - Coral heading.
  - Bold text.
  - Similar y-position adjustment after each heading.

The main opportunity is to keep `SimplePdfDocument` as the low-level engine and add a Business Documents layout layer above it.

## 4. Duplicated Header/Footer Patterns

The Registration Form, Invoice and Receipt PDFs repeat the same Little London Play & Learn branded header:

- Warm cream header background.
- Coral circular bus icon.
- `LITTLE LONDON` in coral.
- `PLAY & LEARN` in sage.
- `Where Little Minds Grow` subtitle.
- Right-side document title and document metadata.
- Coral divider below the header.

The Invoice and Receipt PDFs also share an almost identical footer:

- Divider line.
- `Thank you for choosing Little London | Where Little Minds Grow | Mohammedia`.
- Page number.

The Registration Form footer is similar but document-specific:

- `Little London Play & Learn | Student Registration Form`.
- Page number.

Recommended shared helpers:

- `addBusinessDocumentHeader(ctx, options)`
- `addBusinessDocumentFooter(ctx, options)`
- `addLittleLondonBusLogo(ctx, x, y, options)`
- `addCoralDivider(ctx, y)`

The helper should allow document-specific title, subtitle/metadata and status badge options without forcing every document to use the same right-side layout.

## 5. Duplicated Status Badge Patterns

Invoice and Receipt templates duplicate badge-like rendering:

- Invoice status badge in the header.
- Receipt `Received` badge in the header.
- Status/payment colours mapped from document state.

The colour rules are similar but not identical:

- Invoice:
  - Paid = sage
  - Partially paid = warm yellow
  - Issued/unpaid/overdue/cancelled-style states = coral or neutral document-specific treatment
- Receipt:
  - Received = sage
  - Payment method accents vary by Cash, Bank Transfer and Cheque

Recommended shared helper:

- `drawStatusBadge(ctx, { x, y, label, tone, width })`

Document-specific logic should still decide the badge label and tone.

## 6. Duplicated Info Card/Table/Summary Patterns

The templates repeat several card/table patterns:

- Two-column information cards:
  - Registration student details grid.
  - Invoice Bill To / Student cards.
  - Receipt Received From / Student cards.
- Summary cards:
  - Invoice payment summary.
  - Receipt payment summary.
- Tables:
  - Invoice items table.
  - Receipt linked invoice allocation table.
- Empty-state rows:
  - No invoice items recorded.
  - No allocation recorded.
  - No emergency contact recorded.
  - No active enrolment recorded.
- Text wrapping with `wrapText(...).slice(...)`.

Recommended shared helpers:

- `drawSectionTitle(ctx, title)`
- `drawInfoCard(ctx, options)`
- `drawKeyValueGrid(ctx, options)`
- `drawSummaryCard(ctx, options)`
- `drawTableHeader(ctx, columns)`
- `drawTableRow(ctx, columns, row)`
- `drawEmptyStateBox(ctx, message)`
- `drawConsentRow(ctx, label)` for registration-specific consent rows if reused later.

The shared helpers should support row height, wrapped text and page-break protection.

## 7. Duplicated Action Component Patterns

The three action components are structurally almost identical:

- Build `previewUrl`.
- Build `downloadUrl`.
- Use `useMemo` to create a `mailto:` URL.
- Track `showEmail`.
- Track copied state for `email` and `whatsapp`.
- `copyText()` writes to `navigator.clipboard`.
- `printPdf()` opens the preview route in a new tab.
- Render the same action button grid:
  - Preview
  - Download PDF
  - Print
  - Prepare Email
  - Copy WhatsApp
- Render the same confirmation message when copied.
- Render the same email preparation panel:
  - Subject
  - Body
  - Copy email text
  - Open email
- Render the same `Business Documents` label and `Admin Version` pill.

The only meaningful differences are:

- Entity IDs and labels:
  - `studentId`, `studentName`
  - `invoiceId`, `invoiceNumber`
  - `paymentId`, `paymentNumber`
- Route path:
  - `/students/{id}/registration-form`
  - `/invoices/{id}/invoice-pdf`
  - `/payments/{id}/receipt-pdf`
- Intro copy.

Recommended shared component:

- `BusinessDocumentActions`

Suggested props:

- `title`
- `description`
- `previewUrl`
- `downloadUrl`
- `emailSubject`
- `emailBody`
- `whatsAppMessage`
- `versionLabel`
- `documentLabel`

The existing document-specific components can become thin wrappers around the shared component to avoid broad page changes.

## 8. What Should Become Reusable

Recommended reusable PDF helpers:

- Shared Business Documents colour palette.
- Shared PDF context type.
- Shared date, money, display and title-case formatters.
- Shared page-break helper.
- Shared Little London bus logo renderer.
- Shared branded header renderer.
- Shared branded footer renderer.
- Shared section title renderer.
- Shared info card and summary card renderers.
- Shared table header and row renderers.
- Shared status badge renderer.
- Shared safe filename helper.
- Shared PDF response helper for Next.js route handlers.

Recommended reusable UI helpers:

- Shared Business Documents action card.
- Shared email preparation panel.
- Shared clipboard copied-state handling.
- Shared `mailto:` encoding helper.

Recommended reusable message helpers:

- Shared money formatter.
- Shared payment method formatter.
- Shared email payload shape.
- Shared WhatsApp message builder pattern.

## 9. What Should Remain Document-Specific

The following should not be over-abstracted:

- Registration Form field selection and parent-safe data exclusions.
- Registration consent and signature sections.
- Invoice item table content and invoice payment calculations.
- Invoice status tone mapping where finance states need precise handling.
- Receipt allocation and remaining balance presentation.
- Receipt payment method wording and tone mapping.
- Document-specific email subject/body wording.
- Document-specific WhatsApp message wording.
- Data fetching and permission-aware document data shaping.
- Route-level error messages for missing student, invoice or payment records.

The refactor should avoid creating one large generic document renderer. The safer model is shared primitives plus document-specific composition.

## 10. Recommended Shared Components/Helpers

Recommended file additions for Phase 13D implementation:

- `services/business-documents/pdf-theme.ts`
  - Shared colours and typography constants.

- `services/business-documents/pdf-layout.ts`
  - `PdfContext`
  - `createPdfContext`
  - `ensureSpace`
  - `addBusinessDocumentHeader`
  - `addBusinessDocumentFooter`
  - `addLittleLondonBusLogo`
  - `drawSectionTitle`
  - `drawStatusBadge`
  - `drawInfoCard`
  - `drawSummaryCard`
  - `drawTableHeader`
  - `drawTableRow`
  - `drawEmptyStateBox`

- `services/business-documents/pdf-formatters.ts`
  - `formatDate`
  - `formatMoney`
  - `display`
  - `titleCase`
  - `formatPaymentMethod`
  - `safeFileName`

- `services/business-documents/pdf-route.ts`
  - `createPdfResponse`
  - Shared inline/download handling.
  - Shared `Content-Type`, `Content-Disposition` and `Cache-Control` headers.

- `components/business-documents/business-document-actions.tsx`
  - Shared action card for preview/download/print/email/WhatsApp workflows.

Thin wrappers can remain:

- `RegistrationFormActions`
- `InvoicePdfActions`
- `ReceiptPdfActions`

These wrappers preserve readable usage at each feature page while removing duplication.

## 11. Refactor Risks

Primary risks:

- Visual PDF regressions, especially spacing, page breaks and header alignment.
- Accidentally changing parent-safe field exclusions.
- Accidentally changing management-only access expectations.
- Altering route response headers or filenames.
- Introducing client/server boundary issues by moving browser-only clipboard logic into a server context.
- Making the PDF helpers too generic and harder to reason about.
- Reintroducing encoding problems in French email/WhatsApp text.
- Changing calculations in invoice or receipt summaries while extracting shared helpers.

Mitigation:

- Extract helpers incrementally.
- Keep document-specific data selection untouched.
- Keep existing routes and URLs unchanged.
- Compare generated PDFs before and after each extraction.
- Run lint, type-check and build after each implementation step.

## 12. Safe Implementation Order

Recommended Phase 13D implementation sequence:

1. Add shared constants and formatter helpers.
   - Move duplicated colour palette, `formatDate`, `formatMoney`, `display`, `titleCase`, `formatPaymentMethod` and `safeFileName`.
   - Keep output unchanged.

2. Extract PDF header/footer primitives.
   - Start with `addLittleLondonBusLogo`.
   - Then extract branded header and footer.
   - Apply to one document first, preferably Invoice PDF because it is already visually polished and compact.

3. Extract section/card/table primitives.
   - Move section title and summary card helpers.
   - Then table helpers.
   - Keep registration consent/signature document-specific.

4. Extract route response helper.
   - Preserve auth checks, RBAC checks and data fetching inside each route.
   - Only centralize PDF buffer response creation and filename handling.

5. Extract shared action component.
   - Create a generic `BusinessDocumentActions`.
   - Convert the three existing action components into wrappers.
   - Preserve route paths and user-facing copy.

6. Visual QA each document.
   - Registration Form PDF.
   - Invoice PDF.
   - Receipt PDF.
   - Preview, download and print workflows.

7. Final verification.
   - `npm.cmd run lint`
   - `npm.cmd run type-check`
   - `npm.cmd run build`

## 13. Success Criteria for Phase 13D

Phase 13D should be considered successful when:

- Registration Form, Invoice and Receipt PDFs remain visually consistent with the approved Premium Boutique Dashboard v3 document style.
- Existing document routes remain unchanged.
- Existing preview, download, print, email preparation and WhatsApp copy workflows still work.
- Super Admin/Admin-only access remains unchanged.
- Teacher and Parent access is not added.
- Internal notes, audit fields, database IDs, raw auth IDs and technical metadata remain excluded.
- PDF output remains parent-friendly and print-ready.
- Shared helpers reduce duplication without hiding document-specific business rules.
- Lint passes.
- Type-check passes.
- Build passes.

## Verification Results

Commands run:

- `npm.cmd run lint` - Passed
- `npm.cmd run type-check` - Passed
- `npm.cmd run build` - Passed

Build completed successfully with Next.js 15.5.19.
