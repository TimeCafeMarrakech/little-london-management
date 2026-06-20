import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center text-card-foreground shadow-soft">
        <h1 className="text-3xl font-semibold tracking-normal">Access denied</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Your account is authenticated, but it does not have an active role profile with permission to continue.
        </p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/login">Return to login</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
