import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { TeacherDetailSections } from "@/components/teachers/teacher-detail-sections";
import { TeacherStatusForm } from "@/components/teachers/teacher-status-form";
import { Button } from "@/components/ui/button";
import { updateTeacherStatusAction } from "@/features/teachers/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageTeachers, canReadTeacherModule, getTeacherDetail } from "@/services/teachers/teacher-service";

export const dynamic = "force-dynamic";

type TeacherDetailPageProps = {
  params: Promise<{
    teacherId: string;
  }>;
};

function formatEmploymentType(value: string): string {
  return value.replaceAll("_", " ");
}

export default async function TeacherDetailPage({ params }: TeacherDetailPageProps) {
  const profile = await requireUserProfile();
  const { teacherId } = await params;

  if (!canReadTeacherModule(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to teacher profiles.</p>
      </section>
    );
  }

  const teacher = await getTeacherDetail(profile, teacherId);

  if (!teacher) {
    notFound();
  }

  const canManage = canManageTeachers(profile);
  const statusAction = updateTeacherStatusAction.bind(null, teacher.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">Teacher profile</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{teacher.fullName}</h1>
            <p className="mt-2 text-sm capitalize text-muted-foreground">
              {teacher.teacherNumber} - {formatEmploymentType(teacher.employmentType)} - {teacher.status}
            </p>
          </div>
          {canManage ? (
            <Button asChild variant="outline">
              <Link href={`/teachers/${teacher.id}/edit`}>
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit profile
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      {canManage ? <TeacherStatusForm action={statusAction} teacher={teacher} /> : null}
      <TeacherDetailSections teacher={teacher} />
    </div>
  );
}
