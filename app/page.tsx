import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { hasSupabasePublicEnv } from "@/lib/env";

const foundationItems = [
  "Next.js 15 app router",
  "Strict TypeScript",
  "TailwindCSS and shadcn/ui foundation",
  "Supabase client helpers",
  "Theme system",
  "Documentation-driven folder structure",
];

export default function HomePage() {
  const supabaseReady = hasSupabasePublicEnv();

  return (
    <AppShell>
      <section className="flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-3xl rounded-lg border bg-card p-8 text-card-foreground shadow-soft">
          <div className="mb-8 inline-flex rounded-full bg-secondary/25 px-3 py-1 text-sm font-medium text-primary">
            Phase 1 Foundation
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-foreground">
            Little London Management System
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            The project foundation is ready for the next roadmap phase. This page intentionally avoids
            operational modules until their phases begin.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {foundationItems.map((item) => (
              <div key={item} className="rounded-md border bg-background px-4 py-3 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-md border bg-muted/45 p-4 text-sm text-muted-foreground">
            Supabase environment status:{" "}
            <span className="font-semibold text-foreground">
              {supabaseReady ? "configured" : "waiting for environment variables"}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button">Foundation Ready</Button>
            <Button type="button" variant="outline">
              Phase 2 Starts Next
            </Button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
