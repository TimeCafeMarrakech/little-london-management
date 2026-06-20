export default function CoursesLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-card p-6 shadow-soft">
        <div className="h-4 w-36 rounded bg-muted" />
        <div className="mt-4 h-9 w-64 rounded bg-muted" />
        <div className="mt-3 h-4 max-w-xl rounded bg-muted" />
      </section>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["one", "two", "three", "four"].map((item) => <div className="h-32 rounded-lg border bg-card shadow-soft" key={item} />)}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {["a", "b", "c"].map((item) => <div className="h-64 rounded-lg border bg-card shadow-soft" key={item} />)}
      </div>
    </div>
  );
}
