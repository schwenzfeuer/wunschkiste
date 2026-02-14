"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";
import { AuthDialog } from "@/components/auth-dialog";
import { Gift, Users, Plus, House } from "lucide-react";
import { cn } from "@/lib/utils";

type PageType = "landing" | "dashboard" | "editor" | "share" | "default";

const HAND_PREFERENCE_KEY = "hand-preference";

function getPageType(pathname: string): PageType {
  if (pathname === "/") return "landing";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/wishlist/") && pathname !== "/wishlist/new") return "editor";
  if (pathname.startsWith("/share/")) return "share";
  return "default";
}

export function MobileToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("toolbar");
  const { data: session, isPending } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [leftHanded, setLeftHanded] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"mine" | "friends">("mine");

  useEffect(() => {
    setLeftHanded(localStorage.getItem(HAND_PREFERENCE_KEY) === "left");

    function handleHandChange() {
      setLeftHanded(localStorage.getItem(HAND_PREFERENCE_KEY) === "left");
    }
    window.addEventListener("hand-preference-change", handleHandChange);
    return () => window.removeEventListener("hand-preference-change", handleHandChange);
  }, []);

  useEffect(() => {
    function handleTabEvent(e: Event) {
      const detail = (e as CustomEvent<"mine" | "friends">).detail;
      setDashboardTab(detail);
    }
    window.addEventListener("toolbar:dashboard-tab-changed", handleTabEvent);
    return () => window.removeEventListener("toolbar:dashboard-tab-changed", handleTabEvent);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setAuthOpen(false);
    window.location.reload();
  }, []);

  if (isPending) return null;

  const pageType = getPageType(pathname);

  // Not authenticated: floating "Loslegen" button
  if (!session) {
    return (
      <div className="sm:hidden">
        <div className={cn(
          "fixed bottom-6 z-50",
          leftHanded ? "left-6" : "right-6"
        )}>
          <Button
            variant="accent"
            size="lg"
            onClick={() => setAuthOpen(true)}
            className="shadow-[0_6px_0_0_black]"
          >
            {t("getStarted")}
          </Button>
        </div>
        <AuthDialog
          open={authOpen}
          onOpenChange={setAuthOpen}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  function handleDashboardTab(tab: "mine" | "friends") {
    setDashboardTab(tab);
    window.dispatchEvent(new CustomEvent("toolbar:dashboard-tab", { detail: tab }));
  }

  const buttons: React.ReactNode[] = [];

  switch (pageType) {
    case "landing":
      buttons.push(
        <button
          key="my-wishlists"
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("myWishlists")}
        >
          <Gift className="size-5" />
          <span className="text-[10px] leading-tight">{t("myWishlists")}</span>
        </button>
      );
      break;

    case "dashboard":
      buttons.push(
        <button
          key="mine"
          onClick={() => handleDashboardTab("mine")}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
            dashboardTab === "mine" ? "text-accent" : "text-foreground/60 hover:text-foreground"
          )}
          title={t("myWishlists")}
        >
          <Gift className="size-5" />
          <span className="text-[10px] leading-tight">{t("myWishlists")}</span>
        </button>,
        <button
          key="friends"
          onClick={() => handleDashboardTab("friends")}
          className={cn(
            "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
            dashboardTab === "friends" ? "text-accent" : "text-foreground/60 hover:text-foreground"
          )}
          title={t("friends")}
        >
          <Users className="size-5" />
          <span className="text-[10px] leading-tight">{t("friends")}</span>
        </button>,
        <button
          key="new"
          onClick={() => router.push("/wishlist/new")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("newWishlist")}
        >
          <Plus className="size-5" />
          <span className="text-[10px] leading-tight">{t("newWishlist")}</span>
        </button>
      );
      break;

    case "editor":
      buttons.push(
        <button
          key="my-wishlists"
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("myWishlists")}
        >
          <Gift className="size-5" />
          <span className="text-[10px] leading-tight">{t("myWishlists")}</span>
        </button>,
        <button
          key="add-wish"
          onClick={() => window.dispatchEvent(new Event("toolbar:add-product"))}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("addWish")}
        >
          <Plus className="size-5" />
          <span className="text-[10px] leading-tight">{t("addWish")}</span>
        </button>
      );
      break;

    case "share":
      buttons.push(
        <button
          key="home"
          onClick={() => router.push("/")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("home")}
        >
          <House className="size-5" />
          <span className="text-[10px] leading-tight">{t("home")}</span>
        </button>,
        <button
          key="my-wishlists"
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("myWishlists")}
        >
          <Gift className="size-5" />
          <span className="text-[10px] leading-tight">{t("myWishlists")}</span>
        </button>
      );
      break;

    default:
      buttons.push(
        <button
          key="home"
          onClick={() => router.push("/")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("home")}
        >
          <House className="size-5" />
          <span className="text-[10px] leading-tight">{t("home")}</span>
        </button>,
        <button
          key="my-wishlists"
          onClick={() => router.push("/dashboard")}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-foreground/60 hover:text-foreground transition-colors"
          title={t("myWishlists")}
        >
          <Gift className="size-5" />
          <span className="text-[10px] leading-tight">{t("myWishlists")}</span>
        </button>
      );
      break;
  }

  const avatar = (
    <div key="avatar" className="flex items-center px-2">
      <ProfileMenu session={session} size="xs" />
    </div>
  );

  const items = leftHanded ? [avatar, ...buttons] : [...buttons, avatar];

  return (
    <div className="sm:hidden">
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/95 px-2 py-1 shadow-lg backdrop-blur-sm">
          {items}
        </div>
      </div>
    </div>
  );
}
