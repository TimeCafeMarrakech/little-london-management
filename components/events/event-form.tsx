"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { createEventAction, updateEventAction } from "@/features/events/actions";
import type { EventActionState, EventDetail, EventTypeOption } from "@/features/events/types";

type EventFormProps = {
  eventTypes: EventTypeOption[];
  event?: EventDetail;
};

const initialState: EventActionState = { success: false, message: "" };

function SubmitButton() {
  const { pending } = useFormStatus();

  return <Button disabled={pending} type="submit">{pending ? "Saving..." : "Save event"}</Button>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function EventForm({ eventTypes, event }: EventFormProps) {
  const action = event ? updateEventAction.bind(null, event.id) : createEventAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <section className="rounded-lg border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Event details</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium">Event type</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.eventTypeId ?? ""} name="eventTypeId" required>
              <option value="">Choose event type</option>
              {eventTypes.map((eventType) => (
                <option key={eventType.id} value={eventType.id}>
                  {eventType.name} ({eventType.category.replace("_", " ")})
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Event code</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.eventCode} name="eventCode" required />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Title</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.title} name="title" required />
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-medium">Description</span>
            <textarea className="mt-2 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.description ?? ""} name="description" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Start date</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.startDate ?? today()} name="startDate" required type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">End date</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.endDate ?? today()} name="endDate" required type="date" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Start time</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.startTime?.slice(0, 5) ?? ""} name="startTime" type="time" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">End time</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.endTime?.slice(0, 5) ?? ""} name="endTime" type="time" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Capacity</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.capacity ?? 12} min="1" name="capacity" required type="number" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Price</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.price ?? 0} min="0" name="price" step="0.01" type="number" />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Status</span>
            <select className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.status ?? "draft"} name="status">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Location</span>
            <input className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.location ?? ""} name="location" />
          </label>
        </div>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Notes</span>
          <textarea className="mt-2 min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue={event?.notes ?? ""} name="notes" />
        </label>
      </section>

      {state.message ? (
        <p className={state.success ? "rounded-md bg-secondary/25 px-4 py-3 text-sm text-primary" : "rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"}>{state.message}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
