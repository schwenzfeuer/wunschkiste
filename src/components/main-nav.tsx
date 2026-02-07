"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Image from "next/image";
import { WunschkisteLogo } from "@/components/wunschkiste-logo";

export function MainNav() {
  const t = useTranslations("nav");
  const router = useRouter();
  const { data: session, isPending } = useSession();

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <WunschkisteLogo className="size-20" />
          <Image src="/wunschkiste-wordmark.svg" alt="Wunschkiste" width={200} height={40} className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-4">
          {isPending ? (
            <div className="h-9 w-20" />
          ) : session ? (
            <>
              <Link href="/dashboard">
                <Button size="sm">{t("myWishlists")}</Button>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-sm text-foreground/50 hover:text-foreground transition-colors"
              >
                <LogOut className="size-3.5" />
                {t("logout")}
              </button>
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
