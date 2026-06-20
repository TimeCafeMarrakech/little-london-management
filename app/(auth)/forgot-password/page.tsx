import Link from "next/link";

import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "@/features/auth/actions/auth-actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { redirectAuthenticatedUser } from "@/lib/auth/session";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  await redirectAuthenticatedUser();
  const params = await searchParams;

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-card-foreground shadow-soft">
        <h1 className="text-3xl font-semibold tracking-normal">Reset your password</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Enter your account email and Little London will send a secure reset link.
        </p>
        <div className="my-6">
          <AuthMessage message={params.message} />
        </div>
        <form action={forgotPasswordAction} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="email">
              Email address
            </label>
            <input
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          <Button className="w-full" type="submit">
            Send reset link
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link className="font-medium text-primary hover:underline" href="/login">
            Back to login
          </Link>
        </div>
      </div>
    </section>
  );
}
