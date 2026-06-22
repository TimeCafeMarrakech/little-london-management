import { Bell } from "lucide-react";

type NotificationAreaProps = {
  items: string[];
};

export function NotificationArea({ items }: NotificationAreaProps) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/10 p-4 text-primary-foreground shadow-inner-soft backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <p className="text-xs text-primary-foreground/65">Quiet operational reminders.</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-primary-foreground/75">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
