type AcademicErrorStateProps = {
  message: string;
};

export function AcademicErrorState({ message }: AcademicErrorStateProps) {
  return (
    <section className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 shadow-soft">
      <h2 className="text-lg font-semibold text-destructive">Academic records could not be loaded</h2>
      <p className="mt-2 text-sm leading-6 text-destructive/85">{message}</p>
    </section>
  );
}
