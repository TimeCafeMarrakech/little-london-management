import Link from "next/link";

import { Button } from "@/components/ui/button";
import { loginAction } from "@/features/auth/actions/auth-actions";
import { AuthMessage } from "@/features/auth/components/auth-message";
import { redirectAuthenticatedUser } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
    reason?: string;
  }>;
};

function loginMessage(message?: string, reason?: string): string | undefined {
  if (message) {
    return message;
  }

  if (reason === "session-required") {
    return "Please log in to continue.";
  }

  return undefined;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectAuthenticatedUser();
  const params = await searchParams;

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 text-card-foreground shadow-soft">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Little London</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">Login</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Access your role-based management portal.</p>
        </div>
        <div className="mb-6">
          <AuthMessage message={loginMessage(params.message, params.reason)} />
        </div>
        <form action={loginAction} className="space-y-5">
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
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>
          <Button className="w-full" type="submit">
            Login
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link className="font-medium text-primary hover:underline" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
      </div>
    </section>
  );
}
