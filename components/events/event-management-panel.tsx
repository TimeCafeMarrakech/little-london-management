"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import {
  assignStaffToEventAction,
  bookStudentIntoEventAction,
  cancelEventBookingAction,
  removeStaffFromEventAction,
} from "@/features/events/actions";
import type { EventActionState, EventDetail } from "@/features/events/types";

type EventManagementPanelProps = {
  event: EventDetail;
  canManage: boolean;
};

const initialState: EventActionState = { success: false, message: "" };

function SubmitButton({ children, variant = "default" }: { children: string; variant?: "default" | "outline" | "destructive" }) {
  const { pending } = useFormStatus();

  return <Button disabled={pending} size="sm" type="submit" variant={variant}>{pending ? "Saving..." : children}</Button>;
}

function ActionMessage({ state }: { state: EventActionState }) {
  if (!state.message) {
    return null;
  }

  return <p className={state.success ? "rounded-md bg-secondary/25 px-3 py-2 text-sm text-primary" : "rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"}>{state.message}</p>;
}

export function EventManagementPanel({ event, canManage }: EventManagementPanelProps) {
  const [bookingState, bookingAction] = useActionState(bookStudentIntoEventAction, initialState);
  const [cancelState, cancelAction] = useActionState(cancelEventBookingAction, initialState);
  const [staffState, staffAction] = useActionState(assignStaffToEventAction, initialState);
  const [removeStaffState, removeStaffAction] = useActionState(removeStaffFromEventAction, initialState);
  const paidBookings = event.bookings.filter((booking) => booking.paymentStatus === "paid").length;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Event bookings</h2>
        <div className="mt-2 text-sm text-muted-foreground">
          {event.bookingCount} of {event.capacity} places booked. {paidBookings} paid bookings.
        </div>
        {canManage ? (
          <form action={bookingAction} className="mt-4 rounded-md border bg-background p-4">
            <input name="eventId" type="hidden" value={event.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Student</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="studentId" required>
                  <option value="">Choose student</option>
                  {event.availableStudents.map((student) => <option key={student.id} value={student.id}>{student.label} ({student.helper})</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Parent</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="parentId" required>
                  <option value="">Choose linked parent</option>
                  {event.availableParents.map((parent) => <option key={parent.id} value={parent.id}>{parent.label} ({parent.helper})</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Booking status</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="bookingStatus">
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Payment status</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="paymentStatus">
                  <option value="unpaid">Unpaid</option>
                  <option value="invoiced">Invoiced</option>
                  <option value="partially_paid">Partially paid</option>
                  <option value="paid">Paid</option>
                  <option value="waived">Waived</option>
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Invoice ID</span>
                <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="invoiceId" placeholder="Optional existing invoice UUID" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Notes</span>
                <textarea className="mt-2 min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" name="notes" />
              </label>
            </div>
            <div className="mt-3 flex justify-end"><SubmitButton>Book student</SubmitButton></div>
            <div className="mt-3"><ActionMessage state={bookingState} /></div>
          </form>
        ) : null}

        <div className="mt-4 space-y-3">
          {event.bookings.length > 0 ? event.bookings.map((booking) => (
            <article className="rounded-md bg-muted/45 p-4" key={booking.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{booking.studentName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{booking.studentNumber} - {booking.parentName}</p>
                  <p className="mt-2 text-sm capitalize text-muted-foreground">{booking.bookingStatus} - {booking.paymentStatus.replace("_", " ")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {booking.invoiceId ? <Button asChild size="sm" variant="outline"><Link href={`/invoices/${booking.invoiceId}`}>Invoice</Link></Button> : null}
                  {canManage ? (
                    <form action={cancelAction}>
                      <input name="eventId" type="hidden" value={event.id} />
                      <input name="bookingId" type="hidden" value={booking.id} />
                      <SubmitButton variant="destructive">Cancel</SubmitButton>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">No event bookings yet.</p>}
        </div>
        <div className="mt-3"><ActionMessage state={cancelState} /></div>
      </section>

      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Staff assignments</h2>
        {canManage ? (
          <form action={staffAction} className="mt-4 rounded-md border bg-background p-4">
            <input name="eventId" type="hidden" value={event.id} />
            <div className="grid gap-3 md:grid-cols-[1fr_150px_auto] md:items-end">
              <label className="block">
                <span className="text-sm font-medium">Teacher</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="teacherId" required>
                  <option value="">Choose teacher</option>
                  {event.availableTeachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.label} ({teacher.helper})</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Role</span>
                <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" name="role">
                  <option value="lead">Lead</option>
                  <option value="assistant">Assistant</option>
                  <option value="support">Support</option>
                  <option value="host">Host</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </label>
              <SubmitButton>Assign</SubmitButton>
            </div>
            <div className="mt-3"><ActionMessage state={staffState} /></div>
          </form>
        ) : null}

        <div className="mt-4 space-y-3">
          {event.staffAssignments.length > 0 ? event.staffAssignments.map((assignment) => (
            <article className="rounded-md bg-muted/45 p-4" key={assignment.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{assignment.teacherName ?? assignment.userName ?? "Staff member"}</p>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">{assignment.teacherNumber ?? "User"} - {assignment.role}</p>
                </div>
                {canManage ? (
                  <form action={removeStaffAction}>
                    <input name="eventId" type="hidden" value={event.id} />
                    <input name="assignmentId" type="hidden" value={assignment.id} />
                    <SubmitButton variant="destructive">Remove</SubmitButton>
                  </form>
                ) : null}
              </div>
            </article>
          )) : <p className="rounded-md bg-muted/45 px-4 py-3 text-sm text-muted-foreground">No staff assigned yet.</p>}
        </div>
        <div className="mt-3"><ActionMessage state={removeStaffState} /></div>
      </section>
    </div>
  );
}
