"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";
import { BrandLogo } from "@/components/brand-logo";

export function MainNav() {
  const t = useTranslations("nav");
  const { data: session, isPending } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center">
          <BrandLogo size="sm" hideIcon className="sm:hidden" />
          <BrandLogo size="sm" className="hidden sm:flex" />
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          {isPending ? (
            <div className="h-9 w-20" />
          ) : session ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <Button size="sm">{t("myWishlists")}</Button>
              </Link>
              <div className="hidden sm:block">
                <ProfileMenu session={session} />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                {t("login")}
              </Link>
              <Link href="/register">
                <Button size="sm">{t("getStarted")}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
