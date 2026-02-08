import Image from "next/image";
import { WunschkisteLogo } from "@/components/wunschkiste-logo";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md";
  className?: string;
}

const wordmarkSizes = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
};

export function BrandLogo({ size = "sm", className }: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <WunschkisteLogo className="size-20" />
      <Image src="/wunschkiste-wordmark.svg" alt="Wunschkiste" width={200} height={40} className={cn(wordmarkSizes[size], "logo-light")} />
      <Image src="/wunschkiste-wordmark-dark.svg" alt="Wunschkiste" width={200} height={40} className={cn(wordmarkSizes[size], "logo-dark")} />
    </span>
  );
}
