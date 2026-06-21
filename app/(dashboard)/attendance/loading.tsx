export default function AttendanceLoading() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
