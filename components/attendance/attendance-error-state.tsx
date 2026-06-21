type AttendanceErrorStateProps = {
  message: string;
};

export function AttendanceErrorState({ message }: AttendanceErrorStateProps) {
  return (
    <section className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-destructive">Attendance could not load</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{message}</p>
    </section>
  );
}
