"use client";

interface ThemeCardProps {
  value: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

export function ThemeCard({ value, label, active, onClick }: ThemeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="theme-preview group relative flex flex-col items-center gap-1.5"
    >
      <div
        data-theme={value !== "standard" ? value : undefined}
        className={`relative h-16 w-24 overflow-hidden rounded-xl border-2 bg-background transition-all ${
          active
            ? "border-primary ring-2 ring-primary/30 scale-105"
            : "border-border/50 group-hover:border-primary/40 group-hover:scale-105"
        }`}
      >
        <div className="theme-preview-animation" />
      </div>
      <span className={`text-[11px] font-medium transition-colors ${
        active ? "text-primary" : "text-foreground/40 group-hover:text-foreground/60"
      }`}>
        {label}
      </span>
    </button>
  );
}
