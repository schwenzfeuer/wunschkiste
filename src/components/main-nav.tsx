"use client";

import { useRef } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { LogOut, ImagePlus, Moon, Sun, List } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function MainNav() {
  const t = useTranslations("nav");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, isPending } = useSession();
  const isGoogleAccount = session?.user.image?.includes("googleusercontent.com");
  const { resolvedTheme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLogout() {
    await signOut();
    queryClient.clear();
    router.push("/");
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const response = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      window.location.reload();
    }
  }

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
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-primary">
                    <UserAvatar
                      name={session.user.name}
                      imageUrl={session.user.image}
                      size="sm"
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-foreground/50">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="sm:hidden" onClick={() => router.push("/dashboard" as const)}>
                    <List className="mr-2 size-4" />
                    {t("myWishlists")}
                  </DropdownMenuItem>
                  {!isGoogleAccount && (
                    <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus className="mr-2 size-4" />
                      {t("changeImage")}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                    {resolvedTheme === "dark" ? <Sun className="mr-2 size-4" /> : <Moon className="mr-2 size-4" />}
                    {resolvedTheme === "dark" ? t("lightMode") : t("darkMode")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 size-4" />
                    {t("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
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
