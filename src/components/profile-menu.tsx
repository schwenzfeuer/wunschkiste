"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { signOut } from "@/lib/auth/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { LogOut, ImagePlus, Moon, Sun, Hand } from "lucide-react";

interface ProfileMenuProps {
  session: {
    user: {
      name: string;
      email: string;
      image?: string | null;
    };
  };
  size?: "sm" | "xs";
}

const HAND_PREFERENCE_KEY = "hand-preference";

export function ProfileMenu({ session, size = "sm" }: ProfileMenuProps) {
  const t = useTranslations("nav");
  const router = useRouter();
  const queryClient = useQueryClient();
  const isGoogleAccount = session.user.image?.includes("googleusercontent.com");
  const { resolvedTheme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [leftHanded, setLeftHanded] = useState(false);

  useEffect(() => {
    setLeftHanded(localStorage.getItem(HAND_PREFERENCE_KEY) === "left");
  }, []);

  function toggleHandPreference() {
    const newValue = leftHanded ? "right" : "left";
    localStorage.setItem(HAND_PREFERENCE_KEY, newValue);
    setLeftHanded(!leftHanded);
    window.dispatchEvent(new Event("hand-preference-change"));
  }

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
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full ring-2 ring-transparent transition-all hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-primary">
            <UserAvatar
              name={session.user.name}
              imageUrl={session.user.image}
              size={size}
            />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-foreground/50">{session.user.email}</p>
          </div>
          <DropdownMenuSeparator />
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
          <DropdownMenuItem onClick={toggleHandPreference}>
            <Hand className="mr-2 size-4" />
            {t("leftHanded")}
            {leftHanded && <span className="ml-auto text-xs text-accent">An</span>}
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
  );
}
