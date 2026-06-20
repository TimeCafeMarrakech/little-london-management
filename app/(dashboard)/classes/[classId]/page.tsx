import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { ClassManagementPanel } from "@/components/academic/class-management-panel";
import { AcademicStatusForm } from "@/components/academic/status-form";
import { Button } from "@/components/ui/button";
import { updateClassStatusAction } from "@/features/academic/actions";
import { requireUserProfile } from "@/lib/auth/session";
import { canManageClasses, canReadAcademic, getClassDetail } from "@/services/academic/academic-service";

export const dynamic = "force-dynamic";

type ClassDetailPageProps = {
  params: Promise<{ classId: string }>;
};

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const profile = await requireUserProfile();
  const { classId } = await params;

  if (!canReadAcademic(profile)) {
    return (
      <section className="rounded-lg border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">You do not have access to this class.</p>
      </section>
    );
  }

  const classItem = await getClassDetail(profile, classId);

  if (!classItem) {
    notFound();
  }

  const canManage = canManageClasses(profile);
  const statusAction = updateClassStatusAction.bind(null, classItem.id);

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">{classItem.classCode}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">{classItem.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {classItem.courseName} - {classItem.enrolmentCount} / {classItem.capacity} students - {classItem.status}
            </p>
          </div>
          {canManage ? <Button asChild variant="outline"><Link href={`/classes/${classItem.id}/edit`}><Pencil className="h-4 w-4" aria-hidden="true" />Edit class</Link></Button> : null}
        </div>
      </section>
      {canManage ? <AcademicStatusForm action={statusAction} currentStatus={classItem.status} description="Archiving hides the class from daily lists while preserving roster and assignment history." title="Archive / restore" /> : null}
      <ClassManagementPanel canManage={canManage} classItem={classItem} />
    </div>
  );
}
