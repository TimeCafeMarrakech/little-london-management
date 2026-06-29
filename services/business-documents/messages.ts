import type { StudentDetail } from "@/features/students/types";

function primaryParent(student: StudentDetail) {
  return student.parents.find((parent) => parent.isPrimaryContact) ?? student.parents[0] ?? null;
}

export function getRegistrationFormEmail(student: StudentDetail) {
  const parent = primaryParent(student);
  const parentName = parent?.parentFullName ?? "Parent";

  return {
    subject: `Little London Registration Form - ${student.fullName}`,
    body: `Bonjour ${parentName},\nVeuillez trouver ci-joint le formulaire d'inscription de ${student.fullName}.\nMerci,\nLittle London`,
  };
}

export function getRegistrationFormWhatsAppMessage(student: StudentDetail): string {
  const parent = primaryParent(student);
  const parentName = parent?.parentFullName ?? "Parent";

  return `Bonjour ${parentName}, veuillez trouver le formulaire d'inscription de ${student.fullName}. Merci, Little London.`;
}

