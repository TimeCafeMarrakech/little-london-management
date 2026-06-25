import { ArrowRight, Bell, CalendarDays, CheckCircle2, Info } from "lucide-react";

type NotificationAreaProps = {
  items: string[];
};

export function NotificationArea({ items }: NotificationAreaProps) {
  const notificationRows = [
    { text: items[0] ?? "Phase 3 shell ready for review", meta: "10:30 AM", icon: CheckCircle2, tone: "bg-[#8cc9a8]/20 text-[#4ca36e]" },
    { text: items[1] ?? "Multi-branch remains future scope", meta: "Yesterday", icon: Info, tone: "bg-[#fff2cf] text-[#d6a02c]" },
    { text: "Holiday Camp registrations", meta: "12 new this week", icon: CalendarDays, tone: "bg-[#f24a3a]/10 text-[#f24a3a]" },
  ];

  return (
    <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/92 p-6 text-[#0f2d47] shadow-[0_24px_60px_rgba(15,45,71,0.08)] backdrop-blur">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f24a3a] text-white shadow-[0_16px_35px_rgba(242,74,58,0.24)]">
          <Bell className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-[#5b6f82]">Quiet operational reminders.</p>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {notificationRows.map((item) => {
          const Icon = item.icon;

          return (
          <div
            key={item.text}
            className="flex items-center justify-between gap-3 rounded-2xl border border-[#eadfce] bg-[#fff9f2] p-4 text-sm shadow-inner-soft"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#0f2d47]">{item.text}</p>
                <p className="text-xs text-[#7d8da0]">{item.meta}</p>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      <button className="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold text-[#f24a3a]" type="button">
        View all notifications
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
