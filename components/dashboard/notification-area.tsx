import { Bell } from "lucide-react";

type NotificationAreaProps = {
  items: string[];
};

export function NotificationArea({ items }: NotificationAreaProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-primary">
          <Bell className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Notifications</h2>
          <p className="text-xs text-muted-foreground">Placeholder alerts for Phase 3.</p>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div key={item} className="rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
