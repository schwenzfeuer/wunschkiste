import { cn } from "@/lib/utils";
import Image from "next/image";

interface PhoneMockupProps {
  src: string;
  alt: string;
  className?: string;
  dark?: boolean;
}

export function PhoneMockup({ src, alt, className, dark }: PhoneMockupProps) {
  return (
    <div
      className={cn(
        "relative w-[240px] rounded-[40px] border-[6px] p-1.5 shadow-xl sm:w-[280px]",
        dark
          ? "border-[#0042AF]/90 bg-[#0042AF]/90"
          : "border-foreground/90 bg-foreground/90",
        className
      )}
    >
      {/* Dynamic Island */}
      <div className={cn(
        "absolute left-1/2 top-2 z-10 h-[22px] w-[80px] -translate-x-1/2 rounded-full",
        dark ? "bg-[#0042AF]/90" : "bg-foreground/90"
      )} />

      {/* Screen */}
      <div className="relative overflow-hidden rounded-[32px]">
        <Image
          src={src}
          alt={alt}
          width={268}
          height={580}
          className="block h-auto w-full"
          quality={90}
        />
      </div>

      {/* Bottom bar */}
      <div className={cn(
        "absolute bottom-2 left-1/2 h-[4px] w-[100px] -translate-x-1/2 rounded-full",
        dark ? "bg-[#FEF1D0]/40" : "bg-background/40"
      )} />
    </div>
  );
}

interface PhonePairProps {
  frontSrc: string;
  backSrc: string;
  frontAlt: string;
  backAlt: string;
  backDark?: boolean;
  className?: string;
}

export function PhonePair({ frontSrc, backSrc, frontAlt, backAlt, backDark, className }: PhonePairProps) {
  return (
    <div className={cn("relative flex items-center justify-center py-8", className)}>
      {/* Back phone - offset */}
      <div className="absolute -right-2 top-12 z-0 opacity-80 sm:-right-4 sm:top-14">
        <PhoneMockup
          src={backSrc}
          alt={backAlt}
          dark={backDark}
          className="scale-[0.85] sm:scale-90"
        />
      </div>

      {/* Front phone */}
      <div className="relative z-10">
        <PhoneMockup src={frontSrc} alt={frontAlt} />
      </div>
    </div>
  );
}
