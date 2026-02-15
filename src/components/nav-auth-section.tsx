"use client";

import { Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";

interface NavAuthSectionProps {
  loginLabel: string;
  getStartedLabel: string;
  myWishlistsLabel: string;
}

export function NavAuthSection({
  loginLabel,
  getStartedLabel,
  myWishlistsLabel,
}: NavAuthSectionProps) {
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="h-9 w-20" />;

  if (session) {
    return (
      <div className="hidden sm:flex items-center gap-2 sm:gap-4">
        <Link href="/dashboard">
          <Button size="sm">{myWishlistsLabel}</Button>
        </Link>
        <ProfileMenu session={session} />
      </div>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-4">
      <Link
        href="/login"
        className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
      >
        {loginLabel}
      </Link>
      <Link href="/register">
        <Button size="sm">{getStartedLabel}</Button>
      </Link>
    </div>
  );
}
