import Link from "next/link";

import {
  PlayLearnActionLink,
  PlayLearnAuthCard,
  PlayLearnAuthShell,
  PlayLearnButton,
  PlayLearnInput,
  SupportFooter,
} from "@/components/auth/play-learn-auth";
import { resetPasswordAction } from "@/features/auth/actions/auth-actions";
import { AuthMessage } from "@/features/auth/components/auth-message";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <PlayLearnAuthShell compact>
      <PlayLearnAuthCard
        eyebrow="Secure reset"
        title="Create a new password"
        subtitle="Use a password with at least 8 characters, uppercase, lowercase, and one number."
        centered
      >
        <div className="my-6">
          <AuthMessage message={params.message} />
        </div>
        <form action={resetPasswordAction} className="space-y-5 text-left">
          <PlayLearnInput id="password" name="password" label="New password" type="password" autoComplete="new-password" placeholder="Enter your new password" icon="lock" />
          <PlayLearnInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Confirm your new password"
            icon="lock"
          />
          <PlayLearnButton>Update password</PlayLearnButton>
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
