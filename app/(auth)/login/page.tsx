import Link from "next/link";

import {
  DisabledSocialButtons,
  PlayLearnActionLink,
  PlayLearnAuthCard,
  PlayLearnAuthShell,
  PlayLearnButton,
  PlayLearnInput,
  SupportFooter,
} from "@/components/auth/play-learn-auth";
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
    <PlayLearnAuthShell>
      <PlayLearnAuthCard
        title={
          <>
            Welcome{" "}
            <span className="relative inline-block text-[#F24A3A]">
              Back!
              <span className="absolute -bottom-1 left-1 right-1 h-1 rounded-full bg-[#F24A3A]" aria-hidden="true" />
            </span>
          </>
        }
        subtitle="Sign in to your account to continue"
        centered
      >
        <div className="mb-4">
          <AuthMessage message={loginMessage(params.message, params.reason)} />
        </div>
        <form action={loginAction} className="mx-auto max-w-[470px] space-y-4 text-left">
          <PlayLearnInput id="email" name="email" label="Email Address" type="email" autoComplete="email" placeholder="Enter your email" icon="mail" />
          <PlayLearnInput id="password" name="password" label="Password" type="password" autoComplete="current-password" placeholder="Enter your password" icon="lock" />
          <div className="flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 font-medium text-[#36546B]" htmlFor="remember">
              <input
                className="h-4 w-4 rounded border-[#C8D4DE] text-[#F24A3A] focus:ring-[#F24A3A]"
                id="remember"
                name="remember"
                type="checkbox"
              />
              Remember me
            </label>
            <PlayLearnActionLink href="/forgot-password">Forgot password?</PlayLearnActionLink>
          </div>
          <PlayLearnButton>Sign In</PlayLearnButton>
        </form>
        <div className="mt-5">
          <DisabledSocialButtons />
        </div>
        <SupportFooter />
        <p className="sr-only">
          <Link href="/forgot-password">Forgot password?</Link>
        </p>
      </PlayLearnAuthCard>
    </PlayLearnAuthShell>
  );
}
