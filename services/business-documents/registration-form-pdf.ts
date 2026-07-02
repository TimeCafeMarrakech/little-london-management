import type { StudentDetail } from "@/features/students/types";
import { SimplePdfDocument, wrapText } from "@/lib/pdf/simple-pdf";
import { formatBusinessDate as formatDate, displayValue as display, titleCase } from "@/services/business-documents/pdf-formatters";
import { addBusinessDocumentFooter, addBusinessDocumentHeader, drawSectionTitle, ensureDocumentSpace, type PdfContext } from "@/services/business-documents/pdf-layout";
import { BUSINESS_DOCUMENT_COLORS as COLORS } from "@/services/business-documents/pdf-theme";

function addFooter(ctx: PdfContext): void {
  addBusinessDocumentFooter(ctx, {
    text: "Little London Play & Learn | Student Registration Form",
    textY: 28,
    pageNumberY: 28,
  });
}

function addHeader(ctx: PdfContext, student: StudentDetail): void {
  addBusinessDocumentHeader(ctx, {
    title: "Student Registration Form",
    metaLines: [`Registration Date: ${formatDate(student.createdAt)}`],
    titleX: 332,
    titleY: 799,
    metaStartY: 778,
    metaSize: 9.5,
    afterY: 676,
  });
}

function ensureSpace(ctx: PdfContext, needed: number, student: StudentDetail): void {
  ensureDocumentSpace(ctx, needed, () => {
    addFooter(ctx);
    ctx.page = ctx.doc.addPage();
    ctx.pageNumber += 1;
    addHeader(ctx, student);
  });
}

function sectionTitle(ctx: PdfContext, title: string): void {
  drawSectionTitle(ctx, title, 15);
}

function keyValueGrid(ctx: PdfContext, items: Array<[string, string]>, columns = 2): void {
  const colWidth = columns === 2 ? 244 : 160;
  const rowHeight = 36;
  const startX = 46;

  items.forEach(([label, value], index) => {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = startX + col * (colWidth + 12);
    const y = ctx.y - row * rowHeight;

    ctx.doc.rect(ctx.page, x, y - 26, colWidth, 30, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, label, x + 10, y - 7, 7.5, COLORS.muted, "bold");
    wrapText(value, colWidth - 20, 9.5).slice(0, 2).forEach((line, lineIndex) => {
      ctx.doc.text(ctx.page, line, x + 10, y - 20 - lineIndex * 10, 9.5, COLORS.navy);
    });
  });

  ctx.y -= Math.ceil(items.length / columns) * rowHeight + 10;
}

function card(ctx: PdfContext, height: number): void {
  ctx.doc.rect(ctx.page, 42, ctx.y - height + 8, 511, height, COLORS.cream, COLORS.border);
}

function paragraph(ctx: PdfContext, text: string, x: number, width: number, color: string = COLORS.navy, size = 9.5): number {
  const lines = wrapText(text, width, size);

  lines.forEach((line, index) => {
    ctx.doc.text(ctx.page, line, x, ctx.y - index * (size + 3), size, color);
  });

  const used = lines.length * (size + 3);
  ctx.y -= used;
  return used;
}

function addStudentDetails(ctx: PdfContext, student: StudentDetail): void {
  ensureSpace(ctx, 190, student);
  card(ctx, 180);
  ctx.y -= 10;
  sectionTitle(ctx, "Student Details");
  keyValueGrid(ctx, [
    ["Full Name", student.fullName],
    ["Student Number", student.studentNumber],
    ["Date of Birth", formatDate(student.dateOfBirth)],
    ["Age", `${student.age} years old`],
    ["Gender", display(student.gender)],
    ["Primary Language", display(student.primaryLanguage)],
    ["School", display(student.schoolName)],
    ["Status", titleCase(student.status)],
  ]);
  ctx.y -= 8;
}

function addParents(ctx: PdfContext, student: StudentDetail): void {
  ensureSpace(ctx, 130, student);
  sectionTitle(ctx, "Parent / Guardian Details");

  if (student.parents.length === 0) {
    paragraph(ctx, "No parent or guardian relationship has been added yet.", 46, 470, COLORS.muted);
    ctx.y -= 12;
    return;
  }

  student.parents.forEach((parent) => {
    ensureSpace(ctx, 78, student);
    ctx.doc.rect(ctx.page, 42, ctx.y - 65, 511, 70, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, parent.parentFullName, 56, ctx.y - 14, 11, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, titleCase(parent.relationshipType), 56, ctx.y - 30, 9, COLORS.muted);
    ctx.doc.text(ctx.page, `Phone: ${display(parent.parentPhone)}`, 250, ctx.y - 14, 9.5, COLORS.navy);
    ctx.doc.text(ctx.page, `Email: ${display(parent.parentEmail)}`, 250, ctx.y - 30, 9.5, COLORS.navy);
    ctx.doc.text(ctx.page, `Primary Contact: ${display(parent.isPrimaryContact)}`, 56, ctx.y - 48, 9, COLORS.muted);
    ctx.doc.text(ctx.page, `Can Pick Up: ${display(parent.canPickUp)}`, 250, ctx.y - 48, 9, COLORS.muted);
    ctx.y -= 82;
  });
}

function addEmergencyContacts(ctx: PdfContext, student: StudentDetail): void {
  ensureSpace(ctx, 110, student);
  sectionTitle(ctx, "Emergency Contact");

  if (student.emergencyContacts.length === 0) {
    paragraph(ctx, "No emergency contact recorded.", 46, 470, COLORS.muted);
    ctx.y -= 12;
    return;
  }

  student.emergencyContacts.slice(0, 3).forEach((contact) => {
    ensureSpace(ctx, 58, student);
    ctx.doc.rect(ctx.page, 42, ctx.y - 48, 511, 52, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, contact.fullName, 56, ctx.y - 14, 10.5, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, `${contact.relationship} | ${contact.phone}`, 56, ctx.y - 30, 9.5, COLORS.navy);
    ctx.doc.text(ctx.page, `Alternate: ${display(contact.alternatePhone)}`, 310, ctx.y - 30, 9, COLORS.muted);
    ctx.y -= 62;
  });
}

function addMedical(ctx: PdfContext, student: StudentDetail): void {
  ensureSpace(ctx, 150, student);
  sectionTitle(ctx, "Medical / Allergy Summary");
  const cardBottom = ctx.y - 108;
  ctx.doc.rect(ctx.page, 42, cardBottom, 511, 114, COLORS.cream, COLORS.border);
  ctx.y -= 14;
  const safeMedicalRows = [
    student.medicalProfile?.medicalConditions ? `Medical Conditions: ${student.medicalProfile.medicalConditions}` : null,
    student.medicalProfile?.dietaryRequirements ? `Dietary Requirements: ${student.medicalProfile.dietaryRequirements}` : null,
  ].filter((row): row is string => Boolean(row));
  if (student.allergies.length > 0) {
    const allergySummary = student.allergies.map((allergy) => `${allergy.allergen} (${titleCase(allergy.severity)})`).join(", ");
    safeMedicalRows.push(`Allergies: ${allergySummary}`);
  }

  if (safeMedicalRows.length === 0) {
    paragraph(ctx, "No medical or allergy information recorded.", 56, 470, COLORS.muted, 9.3);
  } else {
    safeMedicalRows.forEach((row) => {
      paragraph(ctx, row, 56, 470, COLORS.navy, 9.3);
    });

    ctx.doc.text(ctx.page, `Emergency Medical Consent: ${display(student.medicalProfile?.emergencyMedicalConsent ?? false)}`, 56, ctx.y, 9.3, COLORS.navy);
    ctx.y -= 18;
  }

  ctx.y = Math.min(ctx.y - 18, cardBottom - 18);
}

function addEnrolments(ctx: PdfContext, student: StudentDetail): void {
  ensureSpace(ctx, 110, student);
  sectionTitle(ctx, "Current Enrolment / Class Summary");

  if (student.enrolments.length === 0) {
    paragraph(ctx, "No active enrolment recorded.", 46, 470, COLORS.muted);
    ctx.y -= 12;
    return;
  }

  student.enrolments.slice(0, 4).forEach((enrolment) => {
    ensureSpace(ctx, 54, student);
    ctx.doc.rect(ctx.page, 42, ctx.y - 42, 511, 46, COLORS.white, COLORS.border);
    ctx.doc.text(ctx.page, enrolment.className, 56, ctx.y - 13, 10, COLORS.navy, "bold");
    ctx.doc.text(ctx.page, `${enrolment.courseName} | ${enrolment.classCode}`, 56, ctx.y - 28, 9, COLORS.muted);
    ctx.doc.text(ctx.page, `Enrolled: ${formatDate(enrolment.enrolmentDate)} | Status: ${titleCase(enrolment.status)}`, 300, ctx.y - 28, 9, COLORS.navy);
    ctx.y -= 56;
  });
}

function addConsent(ctx: PdfContext, student: StudentDetail): void {
  const rows = [
    "Emergency contact permission",
    "Authorized pickup confirmation",
    "Photo permission",
    "Medical information confirmation",
    "Parent communication consent",
    "Terms and policies acknowledgement",
  ];
  ensureSpace(ctx, 190, student);
  sectionTitle(ctx, "Permissions / Consent");

  rows.forEach((row) => {
    ensureSpace(ctx, 28, student);
    ctx.doc.rect(ctx.page, 42, ctx.y - 20, 511, 24, COLORS.white, COLORS.border);
    ctx.doc.rect(ctx.page, 55, ctx.y - 14, 10, 10, COLORS.white, COLORS.sage);
    ctx.doc.text(ctx.page, row, 76, ctx.y - 12, 9.5, COLORS.navy);
    ctx.y -= 28;
  });

  ctx.y -= 8;
}

function addSignatures(ctx: PdfContext, student: StudentDetail): void {
  ensureSpace(ctx, 132, student);
  sectionTitle(ctx, "Signature");
  ctx.doc.rect(ctx.page, 42, ctx.y - 94, 244, 100, COLORS.white, COLORS.border);
  ctx.doc.rect(ctx.page, 309, ctx.y - 94, 244, 100, COLORS.white, COLORS.border);
  ctx.doc.text(ctx.page, "Parent / Guardian Signature", 56, ctx.y - 14, 10, COLORS.navy, "bold");
  ctx.doc.text(ctx.page, "Printed Name:", 56, ctx.y - 58, 8.8, COLORS.muted);
  ctx.doc.line(ctx.page, 112, ctx.y - 58, 260, ctx.y - 58, COLORS.border);
  ctx.doc.text(ctx.page, "Date:", 56, ctx.y - 78, 8.8, COLORS.muted);
  ctx.doc.line(ctx.page, 84, ctx.y - 78, 260, ctx.y - 78, COLORS.border);
  ctx.doc.text(ctx.page, "Management Signature", 323, ctx.y - 14, 10, COLORS.navy, "bold");
  ctx.doc.text(ctx.page, "Printed Name:", 323, ctx.y - 58, 8.8, COLORS.muted);
  ctx.doc.line(ctx.page, 379, ctx.y - 58, 527, ctx.y - 58, COLORS.border);
  ctx.doc.text(ctx.page, "Date:", 323, ctx.y - 78, 8.8, COLORS.muted);
  ctx.doc.line(ctx.page, 351, ctx.y - 78, 527, ctx.y - 78, COLORS.border);
  ctx.y -= 118;
}

export function generateRegistrationFormPdf(student: StudentDetail): Buffer {
  const doc = new SimplePdfDocument({
    title: `Little London Registration Form - ${student.fullName}`,
    author: "Little London Play & Learn",
  });
  const ctx: PdfContext = {
    doc,
    page: doc.addPage(),
    y: 0,
    pageNumber: 1,
  };

  addHeader(ctx, student);
  addStudentDetails(ctx, student);
  addParents(ctx, student);
  addEmergencyContacts(ctx, student);
  addMedical(ctx, student);
  addEnrolments(ctx, student);
  addConsent(ctx, student);
  addSignatures(ctx, student);
  addFooter(ctx);

  return doc.build();
}
