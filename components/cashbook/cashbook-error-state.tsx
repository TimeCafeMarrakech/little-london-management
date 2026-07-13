type CashbookErrorStateProps = {
  title?: string;
  message: string;
};

export function CashbookErrorState({ title = "Cashbook could not be loaded", message }: CashbookErrorStateProps) {
  return (
    <section className="rounded-[1.5rem] border border-[#f24a3a]/20 bg-[#fff8ee] p-8 shadow-[0_18px_45px_rgba(15,45,71,0.08)]">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f24a3a]">Cashbook</p>
      <h1 className="mt-3 text-2xl font-bold text-[#0f2d47]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5b6f82]">{message}</p>
    </section>
  );
}
