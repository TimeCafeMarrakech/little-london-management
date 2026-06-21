type FinanceErrorStateProps = {
  message: string;
};

export function FinanceErrorState({ message }: FinanceErrorStateProps) {
  return (
    <section className="rounded-lg border border-destructive/30 bg-card p-8 shadow-soft">
      <h1 className="text-2xl font-semibold">Finance is not ready yet</h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
    </section>
  );
}
