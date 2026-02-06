"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

interface HeroCtaProps {
  ctaNew: string;
  ctaExisting: string;
}

export function HeroCta({ ctaNew, ctaExisting }: HeroCtaProps) {
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

  return (
    <Link href="/register">
      <Button variant="accent" size="xl">
        {ctaNew}
      </Button>
    </Link>
  );
}
