import Link from "next/link";
import { notFound } from "next/navigation";

import { TeacherForm } from "@/components/teachers/teacher-form";
import { Button } from "@/components/ui/button";
import { updateTeacherAction } from "@/features/teachers/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageTeachers, getTeacherDetail } from "@/services/teachers/teacher-service";

export const dynamic = "force-dynamic";

type EditTeacherPageProps = {
  params: Promise<{
    teacherId: string;
  }>;
};

export default async function EditTeacherPage({ params }: EditTeacherPageProps) {
  const profile = await requireUserProfile();
  const { teacherId } = await params;

  if (!canManageTeachers(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">Only Super Admins and Admins can edit teacher profiles.</p>
        <Button asChild className="mt-6" variant="outline">
          <Link href={`/teachers/${teacherId}`}>Back to profile</Link>
        </Button>
      </section>
    );
  }

  const teacher = await getTeacherDetail(profile, teacherId);

  if (!teacher) {
    notFound();
  }

  const action = updateTeacherAction.bind(null, teacher.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <p className="text-sm font-semibold text-accent">Edit teacher</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">{teacher.fullName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Update profile, availability, qualifications, and employment information.
        </p>
      </section>
      <TeacherForm action={action} mode="edit" teacher={teacher} />
    </div>
  );
}
