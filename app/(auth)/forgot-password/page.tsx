import Link from "next/link";

import {
  PlayLearnActionLink,
  PlayLearnAuthCard,
  PlayLearnAuthShell,
  PlayLearnButton,
  PlayLearnInput,
  SupportFooter,
} from "@/components/auth/play-learn-auth";
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
    <PlayLearnAuthShell compact>
      <PlayLearnAuthCard eyebrow="Account recovery" title="Reset your password" subtitle="Enter your account email and Little London will send a secure reset link." centered>
        <div className="my-6">
          <AuthMessage message={params.message} />
        </div>
        <form action={forgotPasswordAction} className="space-y-5 text-left">
          <PlayLearnInput id="email" name="email" label="Email Address" type="email" autoComplete="email" placeholder="Enter your email" icon="mail" />
          <PlayLearnButton>Send reset link</PlayLearnButton>
        </form>
        <div className="mt-6 text-center text-sm">
          <PlayLearnActionLink href="/login">Back to login</PlayLearnActionLink>
        </div>
        <SupportFooter />
        <p className="sr-only">
          <Link href="/login">Back to login</Link>
        </p>
      </PlayLearnAuthCard>
    </PlayLearnAuthShell>
  );
}
