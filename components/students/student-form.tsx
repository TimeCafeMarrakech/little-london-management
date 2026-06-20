"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import type { StudentActionState, StudentDetail } from "@/features/students/types";

type StudentFormProps = {
  action: (previousState: StudentActionState, formData: FormData) => Promise<StudentActionState>;
  mode: "create" | "edit";
  student?: StudentDetail;
};

const initialState: StudentActionState = {
  success: false,
  message: "",
};

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Saving..." : mode === "create" ? "Create student" : "Save changes"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-1 text-sm text-destructive">{errors[0]}</p>;
}

export function StudentForm({ action, mode, student }: StudentFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const medicalProfile = student?.medicalProfile;
  const firstParent = student?.parents[0];
  const firstEmergencyContact = student?.emergencyContacts[0];
  const firstAllergy = student?.allergies[0];

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {state.message}
        </div>
      ) : null}

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Student profile</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Student number</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.studentNumber} name="studentNumber" required />
            <FieldError errors={state.fieldErrors?.studentNumber} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.status ?? "active"} name="status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">First name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.firstName} name="firstName" required />
            <FieldError errors={state.fieldErrors?.firstName} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Last name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.lastName} name="lastName" required />
            <FieldError errors={state.fieldErrors?.lastName} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Date of birth</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.dateOfBirth} name="dateOfBirth" required type="date" />
            <FieldError errors={state.fieldErrors?.dateOfBirth} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Gender</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.gender ?? ""} name="gender">
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Primary language</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.primaryLanguage ?? ""} name="primaryLanguage" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">External school</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.schoolName ?? ""} name="schoolName" />
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Parent relationship display</h2>
        <p className="mt-1 text-sm text-muted-foreground">This captures a Phase 4 relationship snapshot. Full Parent Management arrives later.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Parent or guardian name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstParent?.parentFullName ?? ""} name="parentName" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Relationship</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstParent?.relationshipType ?? "guardian"} name="parentRelationshipType">
              <option value="mother">Mother</option>
              <option value="father">Father</option>
              <option value="guardian">Guardian</option>
              <option value="grandparent">Grandparent</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Parent email</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstParent?.parentEmail ?? ""} name="parentEmail" type="email" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Parent phone</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstParent?.parentPhone ?? ""} name="parentPhone" />
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Medical information</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Medical notes</span>
            <textarea className="mt-2 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.medicalNotes ?? ""} name="medicalNotes" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Doctor name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={medicalProfile?.doctorName ?? ""} name="doctorName" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Doctor phone</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={medicalProfile?.doctorPhone ?? ""} name="doctorPhone" />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Medical conditions</span>
            <textarea className="mt-2 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={medicalProfile?.medicalConditions ?? ""} name="medicalConditions" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Medication notes</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={medicalProfile?.medicationNotes ?? ""} name="medicationNotes" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Dietary requirements</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={medicalProfile?.dietaryRequirements ?? ""} name="dietaryRequirements" />
          </label>
          <label className="flex items-center gap-3 rounded-md bg-muted/45 p-3 text-sm font-medium md:col-span-2">
            <input defaultChecked={medicalProfile?.emergencyMedicalConsent ?? false} name="emergencyMedicalConsent" type="checkbox" value="true" />
            Emergency medical consent recorded
          </label>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Emergency and allergy notes</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Emergency notes</span>
            <textarea className="mt-2 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={student?.emergencyNotes ?? ""} name="emergencyNotes" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Emergency contact name</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstEmergencyContact?.fullName ?? ""} name="emergencyContactName" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Emergency contact phone</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstEmergencyContact?.phone ?? ""} name="emergencyContactPhone" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Emergency contact relationship</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstEmergencyContact?.relationship ?? ""} name="emergencyContactRelationship" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Allergy</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstAllergy?.allergen ?? ""} name="allergyName" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Allergy severity</span>
            <select className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstAllergy?.severity ?? ""} name="allergySeverity">
              <option value="">Not specified</option>
              <option value="unknown">Unknown</option>
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Allergy reaction</span>
            <input className="mt-2 h-11 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={firstAllergy?.reaction ?? ""} name="allergyReaction" />
          </label>
        </div>
      </section>

      <div className="flex justify-end">
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}
