export default function TeachersLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="h-4 w-36 rounded bg-muted" />
        <div className="mt-4 h-9 w-64 rounded bg-muted" />
        <div className="mt-3 h-4 max-w-xl rounded bg-muted" />
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["total", "active", "part-time", "archived"].map((item) => (
          <div className="rounded-lg border bg-card p-5 shadow-soft" key={item}>
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-16 rounded bg-muted" />
            <div className="mt-4 h-4 w-32 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["one", "two", "three"].map((item) => (
          <div className="h-64 rounded-lg border bg-card shadow-soft" key={item} />
        ))}
      </div>
    </div>
  );
}
