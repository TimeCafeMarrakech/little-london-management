export default function ParentsLoading() {
  return (
    <div className="space-y-5">
      <div className="h-36 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
