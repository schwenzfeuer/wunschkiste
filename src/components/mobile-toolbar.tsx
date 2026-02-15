"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { ProfileMenu } from "@/components/profile-menu";
import { AuthDialog } from "@/components/auth-dialog";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Gift, Users, Plus, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type PageType = "landing" | "dashboard" | "editor" | "share" | "default";

const HAND_PREFERENCE_KEY = "hand-preference";

function getPageType(pathname: string): PageType {
  if (pathname === "/") return "landing";
  if (pathname === "/dashboard") return "dashboard";
  if (pathname.startsWith("/wishlist/") && pathname !== "/wishlist/new") return "editor";
  if (pathname.startsWith("/share/")) return "share";
  return "default";
}

function ToolbarButton({ icon: Icon, label, onClick, active }: {
  icon: typeof Gift;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors whitespace-nowrap",
        active ? "text-accent" : "text-foreground/60 hover:text-foreground"
      )}
    >
      <Icon className="size-5" />
      <span className="text-[10px] leading-tight">{label}</span>
    </button>
  );
}

export function MobileToolbar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("toolbar");
  const tDashboard = useTranslations("dashboard");
  const tCommon = useTranslations("common");
  const { data: session, isPending } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [leftHanded, setLeftHanded] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"mine" | "friends">("mine");
  const [shareWishlistId, setShareWishlistId] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);

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

  useEffect(() => {
    if (getPageType(pathname) === "dashboard") {
      setDashboardTab("mine");
    }
    if (getPageType(pathname) !== "share") {
      setShareWishlistId(null);
    }
  }, [pathname]);

  useEffect(() => {
    function handleShareWishlistId(e: Event) {
      setShareWishlistId((e as CustomEvent<string>).detail);
    }
    window.addEventListener("share:wishlist-id", handleShareWishlistId);
    return () => window.removeEventListener("share:wishlist-id", handleShareWishlistId);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setAuthOpen(false);
    window.location.reload();
  }, []);

  if (isPending) return null;

  const pageType = getPageType(pathname);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!session) {
    if (pageType === "landing" || isAuthPage) return null;
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

  if (pageType === "landing" || isAuthPage) return null;

  async function handleLeaveWishlist() {
    if (!shareWishlistId) return;
    const response = await fetch("/api/wishlists/shared/leave", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wishlistId: shareWishlistId }),
    });
    if (response.ok) {
      toast.success(tDashboard("leftSuccess"));
      router.push("/dashboard");
    }
    setLeaveOpen(false);
  }

  function handleDashboardTab(tab: "mine" | "friends") {
    setDashboardTab(tab);
    window.dispatchEvent(new CustomEvent("toolbar:dashboard-tab", { detail: tab }));
  }

  const navButtons: React.ReactNode[] = [];
  let actionButton: React.ReactNode = null;

  switch (pageType) {
    case "dashboard":
      navButtons.push(
        <ToolbarButton key="mine" icon={Gift} label={t("myWishlists")} onClick={() => handleDashboardTab("mine")} active={dashboardTab === "mine"} />,
        <ToolbarButton key="friends" icon={Users} label={t("friends")} onClick={() => handleDashboardTab("friends")} active={dashboardTab === "friends"} />
      );
      actionButton = (
        <Button
          key="new"
          variant="accent"
          size="xs"
          onClick={() => router.push("/wishlist/new")}
        >
          <Plus className="size-3.5" />
          {t("newWishlist")}
        </Button>
      );
      break;

    case "editor":
      navButtons.push(
        <ToolbarButton key="my-wishlists" icon={Gift} label={t("myWishlists")} onClick={() => router.push("/dashboard")} />
      );
      actionButton = (
        <Button
          key="add-wish"
          variant="accent"
          size="xs"
          onClick={() => window.dispatchEvent(new Event("toolbar:add-product"))}
        >
          <Plus className="size-3.5" />
          {t("addWish")}
        </Button>
      );
      break;

    case "share":
      navButtons.push(
        <ToolbarButton key="my-wishlists" icon={Gift} label={t("myWishlists")} onClick={() => router.push("/dashboard")} />,
        <ToolbarButton key="leave" icon={LogOut} label={t("leave")} onClick={() => shareWishlistId ? setLeaveOpen(true) : router.push("/dashboard")} />
      );
      break;

    default:
      navButtons.push(
        <ToolbarButton key="my-wishlists" icon={Gift} label={t("myWishlists")} onClick={() => router.push("/dashboard")} />
      );
      break;
  }

  const avatar = (
    <div key="avatar" className="flex items-center px-2">
      <ProfileMenu session={session} size="sm" />
    </div>
  );

  const items = leftHanded
    ? [actionButton, ...navButtons, avatar].filter(Boolean)
    : [avatar, ...navButtons, actionButton].filter(Boolean);

  return (
    <div className="sm:hidden">
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="flex items-center gap-1 whitespace-nowrap rounded-full border border-border bg-card/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
          {items}
        </div>
      </div>
      <ConfirmationDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title={tDashboard("leaveTitle")}
        description={tDashboard("leaveDescription")}
        confirmLabel={tDashboard("leave")}
        cancelLabel={tCommon("cancel")}
        variant="destructive"
        onConfirm={handleLeaveWishlist}
      />
    </div>
  );
}
