"use client";

import { Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

interface HeroCtaUpgradeProps {
  ctaExisting: string;
  children: React.ReactNode;
}

export function HeroCtaUpgrade({ ctaExisting, children }: HeroCtaUpgradeProps) {
  const { data: session } = useSession();

  if (session) {
    return (
      <Link href="/dashboard">
        <Button variant="accent" size="xl">
          {ctaExisting}
        </Button>
      </Link>
    );
  }

  return <>{children}</>;
}
