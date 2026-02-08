"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const bgColors = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-pink-500",
];

function getColorForName(name: string | null | undefined): string {
  if (!name) return bgColors[0];
  const index = Math.abs(hashCode(name)) % bgColors.length;
  return bgColors[index];
}

interface UserAvatarProps {
  name: string | null | undefined;
  imageUrl: string | null | undefined;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "size-5 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
};

export function UserAvatar({ name, imageUrl, size = "md", className }: UserAvatarProps) {
  return (
    <Avatar className={cn(sizeMap[size], className)}>
      {imageUrl && <AvatarImage src={imageUrl} alt={name || ""} />}
      <AvatarFallback className={cn("text-white font-medium", getColorForName(name))}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
