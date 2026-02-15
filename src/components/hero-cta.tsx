"use client";

import { useState, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { AuthDialog } from "@/components/auth-dialog";

interface HeroCtaProps {
  ctaNew: string;
  ctaExisting: string;
}

export function HeroCta({ ctaNew, ctaExisting }: HeroCtaProps) {
  const { data: session } = useSession();
  const [authOpen, setAuthOpen] = useState(false);

  const handleAuthSuccess = useCallback(() => {
    setAuthOpen(false);
    window.location.reload();
  }, []);

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
    <>
      <Button variant="accent" size="xl" onClick={() => setAuthOpen(true)}>
        {ctaNew}
      </Button>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
