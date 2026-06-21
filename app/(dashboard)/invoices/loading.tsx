export default function InvoicesLoading() {
  return (
    <div className="space-y-4">
      <div className="h-36 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div className="h-28 animate-pulse rounded-lg bg-muted" key={index} />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <div className="h-64 animate-pulse rounded-lg bg-muted" key={index} />)}
      </div>
    </div>
  );
}
