"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  assignTeacherToClassAction,
  enrolStudentInClassAction,
  removeStudentFromClassAction,
  removeTeacherFromClassAction,
} from "@/features/academic/actions";
import type { AcademicActionState, ClassDetail } from "@/features/academic/types";

type ClassManagementPanelProps = {
  classItem: ClassDetail;
  canManage: boolean;
};

const initialState: AcademicActionState = { success: false, message: "" };

function SubmitButton({ children, variant = "default" }: { children: string; variant?: "default" | "outline" | "destructive" }) {
  const { pending } = useFormStatus();

  return <Button disabled={pending} size="sm" type="submit" variant={variant}>{pending ? "Saving..." : children}</Button>;
}

function ActionMessage({ state }: { state: AcademicActionState }) {
  if (!state.message) {
    return null;
  }

  return <p className={state.success ? "rounded-md bg-secondary/25 px-3 py-2 text-sm text-primary" : "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"}>{state.message}</p>;
}

export function ClassManagementPanel({ classItem, canManage }: ClassManagementPanelProps) {
  const [teacherState, teacherAction] = useActionState(assignTeacherToClassAction, initialState);
  const [removeTeacherState, removeTeacherAction] = useActionState(removeTeacherFromClassAction, initialState);
  const [enrolState, enrolAction] = useActionState(enrolStudentInClassAction, initialState);
  const [removeEnrolState, removeEnrolAction] = useActionState(removeStudentFromClassAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Assigned teachers</h2>
        {canManage ? (
          <form action={teacherAction} className="mt-4 rounded-md border bg-background p-4">
            <input name="classId" type="hidden" value={classItem.id} />
            <div className="grid gap-3 md:grid-cols-[1fr_150px_auto] md:items-end">
              <label className="block">
                <span className="text-sm font-medium">Teacher</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="teacherId" required>
                  <option value="">Choose a teacher</option>
                  {classItem.availableTeachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.label} ({teacher.helper})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Role</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="role" required>
                  <option value="lead">Lead</option>
                  <option value="assistant">Assistant</option>
                  <option value="substitute">Substitute</option>
                </select>
              </label>
              <SubmitButton>Assign</SubmitButton>
            </div>
            <div className="mt-3"><ActionMessage state={teacherState} /></div>
          </form>
        ) : null}
        <div className="mt-4 space-y-3">
          {classItem.teachers.length > 0 ? classItem.teachers.map((teacher) => (
            <article className="rounded-md bg-muted/45 p-4" key={teacher.assignmentId}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{teacher.fullName}</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">{teacher.teacherNumber} - {teacher.role}</p>
                </div>
                {canManage ? (
                  <form action={removeTeacherAction}>
                    <input name="classId" type="hidden" value={classItem.id} />
                    <input name="assignmentId" type="hidden" value={teacher.assignmentId} />
                    <SubmitButton variant="destructive">Remove</SubmitButton>
                  </form>
                ) : null}
              </div>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">No teachers assigned yet.</p>}
        </div>
        <div className="mt-3"><ActionMessage state={removeTeacherState} /></div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Class roster</h2>
        {canManage ? (
          <form action={enrolAction} className="mt-4 rounded-md border bg-background p-4">
            <input name="classId" type="hidden" value={classItem.id} />
            <div className="grid gap-3 md:grid-cols-[1fr_160px_auto] md:items-end">
              <label className="block">
                <span className="text-sm font-medium">Student</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="studentId" required>
                  <option value="">Choose a student</option>
                  {classItem.availableStudents.map((student) => (
                    <option key={student.id} value={student.id}>{student.label} ({student.helper})</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Date</span>
                <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={today} name="enrolmentDate" type="date" />
              </label>
              <SubmitButton>Enrol</SubmitButton>
            </div>
            <div className="mt-3"><ActionMessage state={enrolState} /></div>
          </form>
        ) : null}
        <div className="mt-4 space-y-3">
          {classItem.roster.length > 0 ? classItem.roster.map((student) => (
            <article className="rounded-md bg-muted/45 p-4" key={student.enrolmentId}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{student.fullName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{student.studentNumber} - enrolled {student.enrolmentDate}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline"><Link href={`/students/${student.studentId}`}>View student</Link></Button>
                  {canManage ? (
                    <form action={removeEnrolAction}>
                      <input name="classId" type="hidden" value={classItem.id} />
                      <input name="enrolmentId" type="hidden" value={student.enrolmentId} />
                      <SubmitButton variant="destructive">Remove</SubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">No students enrolled yet.</p>}
        </div>
        <div className="mt-3"><ActionMessage state={removeEnrolState} /></div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft lg:col-span-2">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Attendance history</h2>
            <p className="mt-1 text-sm text-muted-foreground">Recent attendance sessions for this class.</p>
          </div>
          <Button asChild size="sm" variant="outline"><Link href={`/attendance?classId=${classItem.id}`}>View all attendance</Link></Button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {classItem.attendanceSessions.length > 0 ? classItem.attendanceSessions.map((session) => (
            <article className="rounded-md bg-muted/45 p-4" key={session.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{session.sessionDate}</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">{session.status}</p>
                </div>
                <Button asChild size="sm" variant="outline"><Link href={`/attendance/${session.id}`}>Open</Link></Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {session.presentCount} present - {session.absentCount} absent - {session.lateCount} late
              </p>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">No attendance sessions recorded yet.</p>}
        </div>
      </section>
    </div>
  );
}
