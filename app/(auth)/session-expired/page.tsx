import Link from "next/link";

import { PlayLearnAuthCard, PlayLearnAuthShell, SupportFooter } from "@/components/auth/play-learn-auth";
import { Button } from "@/components/ui/button";

export default function SessionExpiredPage() {
  return (
    <PlayLearnAuthShell compact>
      <PlayLearnAuthCard
        eyebrow="Session notice"
        title="Session expired"
        subtitle="Your session or password reset link is no longer valid. Please log in again or request a new reset link."
        centered
      >
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild className="bg-[#EF4B37] text-white shadow-[0_18px_35px_rgba(239,75,55,0.24)] hover:bg-[#DC3F2F]">
            <Link href="/login">Back to login</Link>
          </Button>
          <Button asChild className="border-[#D9E1E8] bg-white/75 text-[#17324A] hover:bg-[#FFF8EB]" variant="outline">
            <Link href="/forgot-password">Reset password</Link>
          </Button>
        </div>
        <SupportFooter />
      </PlayLearnAuthCard>
    </PlayLearnAuthShell>
  );
}
