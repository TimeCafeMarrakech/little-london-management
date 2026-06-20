import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-center text-card-foreground shadow-soft">
        <h1 className="text-3xl font-semibold tracking-normal">Session expired</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Your session or password reset link is no longer valid. Please log in again or request a new reset link.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/login">Back to login</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/forgot-password">Reset password</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
