# Phase 13 Documents & File Management Plan

## 1. Purpose

Phase 13 introduces a secure, role-aware Documents & File Management module for the Little London Management System.

The purpose is to allow authorized users to upload, organize, preview, download, archive, and manage files connected to existing Phase 1-12 records without changing business workflows.

This phase focuses on uploaded and stored files, not generated business documents.

Generated invoice PDFs, receipt PDFs, report PDFs, and formal document rendering should be planned as a future PDF Engine phase unless explicitly approved later.

## 2. User Experience Goals

The Documents module must follow the Premium Boutique Dashboard v3 design system.

The experience should be:

- Calm and easy to understand
- Premium and visually consistent with the dashboard
- Secure without feeling heavy
- Clear about who can see each document
- Useful from inside existing profiles and modules
- Mobile-friendly for quick upload and viewing
- Transparent about file type, size, owner, visibility, and status

Users should always understand:

- What the file belongs to
- Whether it is internal, teacher-visible, parent-visible, or shared
- Who uploaded it
- Whether it is active or archived
- Whether they can preview, download, archive, restore, or manage it

## 3. Document Categories

### Student Documents

Student documents are files attached to a student record.

Examples:

- Student profile photo
- Birth certificate
- Medical report
- Allergy documentation
- Emergency authorization form
- School transfer document
- Parent-provided child documents

Sensitivity:

- Medical and emergency documents are sensitive.
- Parent visibility must be explicit.
- Teacher visibility must be assignment-based and explicit.

### Parent Documents

Parent documents are files attached to a parent or guardian profile.

Examples:

- Parent identification document
- Guardian authorization document
- Custody or pickup permission document
- Signed registration paperwork
- Parent-provided administrative files

Sensitivity:

- Parent documents are management-only by default.
- Parent users may see or upload only their own parent-visible files where allowed.
- Teachers should not access parent documents unless explicitly connected to a child safety workflow and approved.

### Teacher Documents

Teacher documents are files attached to a teacher profile.

Examples:

- Teacher profile photo
- Qualification certificates
- Training certificates
- Employment documents
- Availability-related attachments

Sensitivity:

- Employment documents are management-only.
- Teacher profile photos may be visible to linked families where appropriate.
- Teacher users may view selected own-profile documents if allowed.

### Centre Documents

Centre documents are general documents for the Little London centre.

Examples:

- Policies
- Parent handbooks
- Safety procedures
- Programme documents
- Internal operating documents
- Public forms or guidance files

Sensitivity:

- Some centre documents may be shared with all roles.
- Internal operating documents remain management-only.

### Finance Documents

Finance documents are files attached to invoices, payments, parent finance records, or future receipts.

Examples:

- Bank transfer confirmation
- Cheque image or reference attachment
- Manual payment proof
- Finance correspondence attachment
- Admin-uploaded invoice support document

Important:

- Generated invoice PDFs and generated receipt PDFs are not part of Phase 13.
- Finance document uploads should support attachments only.

Sensitivity:

- Teachers have no access.
- Parents may view only own-family finance documents explicitly marked parent-visible.
- Admin and Super Admin manage finance attachments.

### Event Documents

Event documents are files attached to workshops, holiday camps, birthday events, or event bookings.

Examples:

- Event information sheet
- Birthday package document
- Camp schedule
- Activity permission form
- Event booking attachment
- Staff preparation document

Sensitivity:

- Event documents may be public-to-participants, parent-visible, teacher-visible, or internal.
- Parent visibility must be limited to own child bookings.
- Teacher visibility must be limited to assigned events.

## 4. Supported File Types

Phase 13 should support:

- PDF
- Images
- Word
- Excel

Recommended MIME types:

| File Type | Extensions | MIME Types |
| --- | --- | --- |
| PDF | `.pdf` | `application/pdf` |
| Images | `.jpg`, `.jpeg`, `.png`, `.webp` | `image/jpeg`, `image/png`, `image/webp` |
| Word | `.doc`, `.docx` | `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` |
| Excel | `.xls`, `.xlsx`, `.csv` | `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/csv` |

Security rules:

- Validate extension and MIME type.
- Do not trust browser-provided file names.
- Block executable files, scripts, archives, and unknown MIME types.
- Use server-side validation before confirming metadata.

## 5. Supabase Storage Strategy

All document files should be stored in private Supabase Storage buckets.

Recommended buckets:

| Bucket | Purpose | Visibility |
| --- | --- | --- |
| `student-documents` | Student files, birth certificates, medical documents | Private |
| `parent-documents` | Parent/guardian administrative documents | Private |
| `teacher-documents` | Teacher qualifications and employment attachments | Private |
| `centre-documents` | Centre policies, handbooks, internal files | Private |
| `finance-documents` | Payment proof and finance attachments | Private |
| `event-documents` | Event documents and booking attachments | Private |

Existing or previously planned buckets such as `student-photos`, `teacher-photos`, `invoices`, `receipts`, and `reports` should remain aligned with the wider schema, but Phase 13 should not implement generated PDF workflows.

Storage access principles:

- Buckets should not be public.
- Client users should not receive permanent public URLs.
- Uploads should use signed upload URLs or controlled server upload flows.
- Downloads and previews should use short-lived signed URLs after permission checks.
- Storage object paths must include branch and owner context.
- Every stored object must have a database metadata row.
- Archived metadata should hide files from normal lists.
- Physical deletion must be highly restricted.

Example storage path:

```text
{branch_id}/{owner_type}/{owner_id}/{document_id}/{safe_file_name}
```

Example:

```text
main-branch/students/student-id/document-id/birth-certificate.pdf
```

## 6. Database Tables Needed

Phase 13 should introduce or finalize document metadata tables only when implementation begins.

Recommended core table:

### `documents`

Purpose: Stores metadata for each file stored in Supabase Storage.

Recommended fields:

| Column | Purpose |
| --- | --- |
| `id` | Primary UUID |
| `branch_id` | Future branch scope |
| `bucket_name` | Supabase Storage bucket |
| `storage_path` | Storage object path |
| `original_file_name` | Uploaded file name before normalization |
| `display_name` | User-facing document title |
| `safe_file_name` | Sanitized storage file name |
| `mime_type` | Validated MIME type |
| `file_extension` | Normalized extension |
| `file_size_bytes` | File size |
| `checksum` | Optional future integrity/hash value |
| `document_category` | Student, parent, teacher, centre, finance, event |
| `document_type` | More specific type such as birth certificate or payment proof |
| `owner_type` | Student, parent, teacher, centre, invoice, payment, event, event booking |
| `owner_id` | Related record ID |
| `visibility` | Internal, management, teacher, parent, shared |
| `description` | Optional user-facing description |
| `status` | Active, archived, deleted |
| `uploaded_by` | User who uploaded |
| `reviewed_by` | Optional management reviewer |
| `reviewed_at` | Optional review timestamp |
| `created_at` | Audit timestamp |
| `updated_at` | Audit timestamp |
| `deleted_at` | Soft delete timestamp |
| `deleted_by` | User who archived/deleted |

Recommended supporting table:

### `document_access_logs`

Purpose: Tracks sensitive downloads and previews.

Recommended fields:

| Column | Purpose |
| --- | --- |
| `id` | Primary UUID |
| `document_id` | Linked document |
| `actor_user_id` | User accessing file |
| `actor_role` | Role at access time |
| `action` | Preview, download, signed URL requested |
| `owner_type` | Copied for reporting |
| `owner_id` | Copied for reporting |
| `ip_address` | Optional request metadata |
| `user_agent` | Optional request metadata |
| `created_at` | Access timestamp |

Optional future supporting table:

### `document_review_requests`

Purpose: Supports future workflows where parent or teacher uploads require admin review before visibility changes.

This should not be required for the first Phase 13 MVP unless approved.

## 7. Permissions & RBAC

Phase 13 should align with the existing permissions model.

Recommended permission keys:

### Super Admin

- `documents.manage.all`
- `documents.view.all`
- `documents.upload.all`
- `documents.download.all`
- `documents.archive.all`
- `documents.restore.all`
- `documents.delete.all`

### Admin

- `documents.manage.all`
- `documents.view.all`
- `documents.upload.all`
- `documents.download.all`
- `documents.archive.all`
- `documents.restore.all`

Admin should not physically delete files unless the project explicitly approves that workflow.

### Teacher

- `documents.view.assigned_students_teacher_visible`
- `documents.download.assigned_students_teacher_visible`
- `documents.upload.assigned_students_teacher_visible` where classroom upload workflows are approved
- `documents.view.assigned_events_teacher_visible`

Teacher access must be assignment-based.

### Parent

- `documents.view.own_child_parent_visible`
- `documents.download.own_child_parent_visible`
- `documents.upload.own_child_parent_visible` where parent upload workflows are approved
- `documents.view.own_family_finance_parent_visible`

Parent access must be own-child or own-family only.

## 8. RLS Policies

RLS must be enabled for `documents` and any document access log tables.

RLS policy requirements:

- Super Admin can access all documents.
- Admin can manage documents within allowed branch scope.
- Teacher can access only assigned-student or assigned-event documents where visibility is `teacher` or `shared`.
- Parent can access only own-child or own-family documents where visibility is `parent` or `shared`.
- Teachers cannot access finance documents.
- Parents cannot access internal, management-only, teacher-only, medical-internal, or unrelated family documents.
- Archived documents should be hidden from normal role queries unless the user has restore/manage permissions.
- Physical file deletion should be service-role only and should not be exposed through broad RLS.

Recommended helper functions:

- `current_user_role()`
- `is_super_admin()`
- `is_admin()`
- `is_teacher()`
- `is_parent()`
- `has_permission(permission_key text)`
- `parent_can_access_student(student_id uuid)`
- `teacher_can_access_student(student_id uuid)`
- `teacher_can_access_event(event_id uuid)`
- `parent_can_access_event_booking(event_booking_id uuid)`
- `parent_can_access_invoice(invoice_id uuid)`
- `parent_can_access_payment(payment_id uuid)`
- `user_can_access_document(document_id uuid)`

Storage policies must mirror metadata permissions.

Important:

- Do not rely on Storage policies alone.
- Always authorize through `documents` metadata before generating signed URLs.

## 9. Upload Workflow

Recommended upload flow:

1. User opens an authorized module document area.
2. User selects owner type, owner record, document category, document type, visibility, and file.
3. UI validates obvious file size/type restrictions.
4. Server validates role, permission, owner access, file type, size, and visibility.
5. Server creates a pending metadata intent or returns a signed upload URL.
6. Client uploads file to Supabase Storage.
7. Client confirms upload with storage path and metadata.
8. Server verifies the object path, creates the `documents` row, and marks status active.
9. Sensitive uploads create an audit log or access log where applicable.
10. UI shows the new document in the relevant document list.

Validation:

- File required.
- File type must be supported.
- File size must be within limits.
- Owner record must exist.
- User must be allowed to attach documents to owner record.
- Visibility must be allowed for role.
- Bucket must match document category.
- Storage path must match generated path pattern.

Friendly errors:

- File type is not supported.
- File is too large.
- You do not have permission to upload documents here.
- The selected record could not be found.
- This document visibility is not allowed for your role.
- Upload failed. Please try again.

## 10. Download Workflow

Recommended download flow:

1. User clicks download.
2. Server validates authentication, active profile, role, permission, visibility, owner scope, branch scope, and document status.
3. Server creates a short-lived signed URL.
4. Sensitive downloads are logged.
5. User downloads the file directly from Supabase Storage using the signed URL.

Rules:

- Never expose permanent URLs for private documents.
- Signed URLs should expire quickly.
- Parent and teacher downloads must be scoped.
- Medical, finance, and identity document downloads must be logged.
- Archived documents require management permissions to download.

## 11. Preview Workflow

Preview should be supported where practical:

- PDF preview in a browser-safe viewer.
- Image preview with controlled signed URL.
- Word and Excel preview may show metadata only in Phase 13 unless safe preview is approved.

Preview rules:

- Preview uses the same authorization path as download.
- Preview URLs should be signed and short-lived.
- Preview should not expose internal storage paths.
- Unsupported preview types should show a clear download option if the user has permission.

UX:

- Use a Premium Dashboard v3 modal or detail panel.
- Show file name, type, size, owner, visibility, uploaded by, and uploaded date.
- Avoid opening sensitive files automatically.

## 12. Archive/Delete Workflow

Phase 13 should use soft archive as the default removal behavior.

Archive workflow:

1. Authorized user chooses archive.
2. Server validates `documents.archive.*` permission.
3. Server sets `status = 'archived'`, `deleted_at`, and `deleted_by`.
4. Document disappears from active lists.
5. Management users can view archived documents through an Archived filter.
6. Archive is audited.

Restore workflow:

1. Authorized Admin or Super Admin chooses restore.
2. Server validates restore permission.
3. Server sets `status = 'active'`, `deleted_at = null`, and `deleted_by = null`.
4. Restore is audited.

Physical delete:

- Not part of normal Phase 13 user workflow.
- Reserved for Super Admin/service role maintenance.
- Must be audited.
- Should not be available to Teacher or Parent.

## 13. Parent Portal Visibility

Parent Portal document visibility must be read-only in Phase 13 unless parent upload is explicitly approved.

Parents may view/download:

- Own-child documents with visibility `parent` or `shared`.
- Own-family finance attachments explicitly marked parent-visible.
- Event booking documents for their own child if visibility is `parent` or `shared`.
- Centre documents targeted at parents if shared.

Parents must not see:

- Internal notes
- Management-only files
- Teacher-only files
- Employment files
- Other family files
- Sensitive medical files unless explicitly parent-visible
- Storage paths, audit fields, or management metadata

Recommended Parent Portal areas:

- Documents overview
- Child documents
- Finance documents
- Event booking documents
- Centre documents shared with parents

## 14. Teacher Visibility

Teachers may view/download:

- Assigned-student documents with visibility `teacher` or `shared`.
- Assigned-event documents with visibility `teacher` or `shared`.
- Centre documents targeted at teachers or shared.
- Their own teacher profile documents where allowed.

Teachers must not see:

- Finance documents
- Parent identity or custody documents unless specifically approved for child safety and assigned scope
- Management-only files
- Other teachers' employment documents
- Unassigned student documents
- Parent Portal-only files

Teacher access must always be assignment-based and must not rely only on role.

## 15. Admin Management

Admin and Super Admin document management should include:

- Document dashboard
- Search and filters
- Upload document
- View document metadata
- Preview where supported
- Download
- Edit display name, type, category, and visibility
- Archive
- Restore
- View access/download history for sensitive documents

Recommended filters:

- Search
- Category
- Document type
- Owner type
- Visibility
- Status
- Uploaded by
- Date range
- File type

Admin should be able to manage documents from:

- Global Documents page
- Student profile
- Parent profile
- Teacher profile
- Invoice/payment detail
- Event detail
- Parent Portal-safe document areas

## 16. Security Considerations

Security is central to Phase 13.

Rules:

- No sensitive bucket should be public.
- All downloads/previews must be signed URL based.
- Storage object paths must not grant authorization by themselves.
- Metadata authorization must happen before signed URL creation.
- Parent access must be own-child or own-family only.
- Teacher access must be assigned-student or assigned-event only.
- Finance files must never be visible to Teachers.
- Internal files must never be visible to Parents.
- Medical files require explicit visibility and careful logging.
- File type and file size must be validated server-side.
- Uploaded file names must be sanitized.
- Audit sensitive downloads and management changes.
- Avoid exposing raw Supabase errors to users.
- Do not store secrets or credentials in file metadata.
- Do not allow executable or script file uploads.
- Do not allow users to choose arbitrary bucket paths.

Sensitive metadata should be redacted from Parent and Teacher views.

## 17. File Size Limits

Recommended Phase 13 limits:

| File Type | Limit |
| --- | --- |
| Images | 5 MB |
| PDF | 10 MB |
| Word | 10 MB |
| Excel | 10 MB |

Optional future limits:

- Super Admin configurable limits.
- Higher limits for centre policy documents.
- Image compression for profile photos.
- Virus scanning or malware scanning integration.

If a file exceeds the limit, show:

```text
This file is too large. Please upload a smaller file.
```

## 18. Naming Convention

User-facing display names may remain friendly, but storage file names must be safe and structured.

Storage naming convention:

```text
{branch_id}/{owner_type}/{owner_id}/{document_id}/{slugified_original_name}
```

Recommended safe file rules:

- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Preserve extension
- Prefix or group by document ID
- Do not trust user-provided paths

Metadata naming:

- `original_file_name`: original uploaded name
- `display_name`: editable title shown to users
- `safe_file_name`: sanitized stored name

Examples:

```text
students/student-id/document-id/birth-certificate.pdf
finance/payment-id/document-id/bank-transfer-proof.png
events/event-id/document-id/holiday-camp-pack.pdf
```

## 19. UI Pages Needed

Recommended management pages:

- `/documents`
- `/documents/new`
- `/documents/[documentId]`
- `/documents/[documentId]/edit`

Recommended integrated document sections:

- `/students/[studentId]` documents section
- `/parents/[parentId]` documents section
- `/teachers/[teacherId]` documents section
- `/events/[eventId]` documents section
- `/invoices/[invoiceId]` finance attachments section
- `/payments/[paymentId]` payment attachments section
- `/portal/children/[studentId]` parent-visible documents section
- `/portal/finance` parent-visible finance documents section
- `/portal/events` parent-visible event documents section

Navigation:

- Admin/Super Admin should see Documents in management navigation.
- Teacher should not see a global documents management page unless assigned-document browsing is approved.
- Parent should see documents only through Parent Portal areas.

## 20. Components Needed

Recommended components:

- `DocumentList`
- `DocumentCard`
- `DocumentTable`
- `DocumentFilters`
- `DocumentUploadForm`
- `DocumentDropzone`
- `DocumentVisibilitySelector`
- `DocumentTypeSelector`
- `DocumentOwnerSelector`
- `DocumentPreviewPanel`
- `DocumentDetailPanel`
- `DocumentArchiveForm`
- `DocumentRestoreForm`
- `DocumentDownloadButton`
- `DocumentEmptyState`
- `DocumentLoadingState`
- `DocumentErrorState`
- `DocumentAccessLogList`

Design standards:

- Use Premium Dashboard v3 cards.
- Use coral for primary upload/action buttons.
- Use sage/mint for safe status and visible-to-parent/teacher accents.
- Use warm yellow for attention or pending review.
- Use navy for titles.
- Use muted navy for metadata.
- Avoid dense file-manager styling.

## 21. Integration With Existing Modules

### Students

Add student document sections for:

- Profile photo
- Birth certificate
- Medical documents
- Emergency/pickup authorization
- General child documents

### Parents

Add parent document sections for:

- Guardian documents
- Signed forms
- Parent identity or authorization documents

### Teachers

Add teacher document sections for:

- Profile photo
- Qualifications
- Training certificates
- Employment documents

### Finance

Add finance attachment support for:

- Payment proof
- Bank transfer evidence
- Cheque reference image
- Admin finance support files

Do not generate invoice PDFs or receipts in Phase 13.

### Events

Add event document support for:

- Event information packs
- Birthday package documents
- Holiday camp guides
- Staff-only event preparation documents
- Parent-visible event documents

### Parent Portal

Add read-only parent-visible documents:

- Own child documents
- Own family finance attachments
- Own child event booking documents
- Shared centre documents

### Reports

Phase 13 should not build report export generation. Report downloads and generated report PDFs remain future reporting/PDF Engine work.

## 22. What Is NOT Included

Phase 13 does not include:

- PDF invoice generation
- Receipt generation
- Email sending
- WhatsApp sending
- Online signing
- Generated report PDFs
- Accounting exports
- AI document processing
- OCR
- Automatic document classification
- Virus scanning integration unless separately approved
- Parent document approval workflow unless explicitly added
- Public document sharing links
- Bulk import/export of documents

Generated business documents such as invoice PDFs and receipts should be planned as a future PDF Engine phase.

## 23. Success Criteria

Phase 13 is successful when:

- Admin/Super Admin can upload, view, preview, download, archive, and restore documents.
- Documents can be attached to students, parents, teachers, finance records, events, and centre records.
- Supported file types are validated.
- File size limits are enforced.
- Private Supabase Storage is used.
- Signed URLs are generated only after authorization.
- Parent users can access only parent-visible own-child or own-family documents.
- Teacher users can access only teacher-visible assigned-student or assigned-event documents.
- Teachers cannot access finance documents.
- Parents cannot access internal or management-only documents.
- Archived documents are excluded from normal lists.
- Sensitive downloads and archive/restore actions are audited or ready for audit integration.
- UI follows Premium Boutique Dashboard v3.
- Mobile and tablet layouts are usable.
- Lint, type-check, and build pass when implemented.
- Manual smoke testing includes document upload, preview, download, archive, restore, parent restrictions, and teacher restrictions.

## 24. Future Enhancements

Future document-related enhancements may include:

- PDF Engine for generated invoice PDFs
- PDF Engine for generated receipt PDFs
- Report PDF generation
- Online signing
- Parent upload review workflow
- Teacher lesson material uploads
- Homework attachments
- Announcement attachments
- Document expiry dates
- Document renewal reminders
- Virus and malware scanning
- OCR and metadata extraction
- AI document classification
- Bulk upload
- Advanced document search
- Version history
- Document approval workflows
- Public website downloads for approved centre documents
- Multi-branch document policies
- Storage usage reporting
- Automated retention policies

Future enhancements should preserve the same RBAC, RLS, signed URL, and Premium Dashboard v3 design principles.
