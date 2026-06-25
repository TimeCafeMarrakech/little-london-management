import Link from "next/link";

import { PlayLearnAuthCard, PlayLearnAuthShell, SupportFooter } from "@/components/auth/play-learn-auth";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  return (
    <PlayLearnAuthShell compact>
      <PlayLearnAuthCard
        eyebrow="Permission notice"
        title="Access denied"
        subtitle="Your account is authenticated, but it does not have an active role profile with permission to continue."
        centered
      >
        <div className="mt-8">
          <Button asChild className="bg-[#EF4B37] text-white shadow-[0_18px_35px_rgba(239,75,55,0.24)] hover:bg-[#DC3F2F]">
            <Link href="/login">Return to login</Link>
          </Button>
        </div>
        <SupportFooter />
      </PlayLearnAuthCard>
    </PlayLearnAuthShell>
  );
}
