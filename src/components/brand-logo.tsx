import Image from "next/image";
import { WunschkisteLogo } from "@/components/wunschkiste-logo";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  size?: "sm" | "md";
  className?: string;
  hideIcon?: boolean;
}

const wordmarkSizes = {
  sm: "h-8 w-auto",
  md: "h-10 w-auto",
};

const iconSizes = {
  sm: "size-10",
  md: "size-20",
};

export function BrandLogo({ size = "sm", className, hideIcon }: BrandLogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      {!hideIcon && <WunschkisteLogo className={iconSizes[size]} />}
      <Image src="/wunschkiste-wordmark.svg" alt="Wunschkiste" width={200} height={40} className={cn(wordmarkSizes[size], "logo-light")} />
      <Image src="/wunschkiste-wordmark-dark.svg" alt="Wunschkiste" width={200} height={40} className={cn(wordmarkSizes[size], "logo-dark")} />
    </span>
  );
}
