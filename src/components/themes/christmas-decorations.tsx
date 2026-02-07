import Image from "next/image";

function Snowflake({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        {/* Main axes */}
        <line x1="20" y1="2" x2="20" y2="38" />
        <line x1="4.4" y1="11" x2="35.6" y2="29" />
        <line x1="4.4" y1="29" x2="35.6" y2="11" />
        {/* Branches on vertical axis */}
        <line x1="20" y1="7" x2="16" y2="11" />
        <line x1="20" y1="7" x2="24" y2="11" />
        <line x1="20" y1="33" x2="16" y2="29" />
        <line x1="20" y1="33" x2="24" y2="29" />
        {/* Branches on diagonal axes */}
        <line x1="9" y1="13.5" x2="8" y2="18" />
        <line x1="9" y1="13.5" x2="13.5" y2="13" />
        <line x1="31" y1="26.5" x2="32" y2="22" />
        <line x1="31" y1="26.5" x2="26.5" y2="27" />
        <line x1="9" y1="26.5" x2="8" y2="22" />
        <line x1="9" y1="26.5" x2="13.5" y2="27" />
        <line x1="31" y1="13.5" x2="32" y2="18" />
        <line x1="31" y1="13.5" x2="26.5" y2="13" />
      </g>
    </svg>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z" />
    </svg>
  );
}

function Tree({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 80"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Three stacked triangles */}
      <polygon points="30,2 10,28 50,28" fill="currentColor" opacity="0.9" />
      <polygon points="30,14 6,44 54,44" fill="currentColor" opacity="0.8" />
      <polygon points="30,28 2,62 58,62" fill="currentColor" opacity="0.7" />
      {/* Trunk */}
      <rect x="24" y="62" width="12" height="16" rx="2" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

export function ChristmasDecorations() {
  return (
    <div className="christmas-decorations pointer-events-none" aria-hidden="true">
      {/* Floating snowflakes */}
      <Snowflake className="christmas-deco-snowflake christmas-float-gentle size-6 text-white/25 absolute top-[8%] left-[10%]" />
      <Snowflake className="christmas-deco-snowflake christmas-float-gentle-delayed size-8 text-white/15 absolute top-[15%] right-[12%]" />
      <Snowflake className="christmas-deco-snowflake christmas-float-gentle size-5 text-white/20 absolute top-[35%] left-[5%]" />
      <Snowflake className="christmas-deco-snowflake christmas-float-gentle-delayed size-7 text-white/15 absolute top-[55%] right-[7%]" />
      <Snowflake className="christmas-deco-snowflake christmas-float-gentle size-4 text-white/20 absolute top-[70%] left-[15%]" />

      {/* Twinkling stars */}
      <Star className="christmas-deco-star christmas-twinkle size-4 text-accent/40 absolute top-[5%] left-[30%]" />
      <Star className="christmas-deco-star christmas-twinkle-delayed size-3 text-accent/30 absolute top-[12%] right-[25%]" />
      <Star className="christmas-deco-star christmas-twinkle size-3 text-accent/35 absolute top-[25%] right-[18%]" />
      <Star className="christmas-deco-star christmas-twinkle-delayed size-5 text-accent/25 absolute top-[45%] left-[8%]" />
      <Star className="christmas-deco-star christmas-twinkle size-3 text-accent/30 absolute top-[65%] right-[10%]" />

      {/* Trees at bottom left */}
      <Tree className="christmas-deco-tree christmas-sway size-20 text-green-300/20 absolute bottom-4 left-4" />
      <Tree className="christmas-deco-tree christmas-sway-delayed size-14 text-green-300/15 absolute bottom-4 left-20" />

      {/* Gift illustration — large, clipped at bottom right */}
      <Image
        src="/wunschkiste-geschenk.svg"
        alt=""
        width={380}
        height={380}
        className="absolute -bottom-16 -right-12"
      />
    </div>
  );
}

export function ChristmasHeaderStar() {
  return (
    <div className="christmas-twinkle pointer-events-none" aria-hidden="true">
      <Star className="mx-auto size-8 text-accent/60" />
    </div>
  );
}

export function ChristmasEmptyState() {
  return (
    <div className="christmas-float-gentle pointer-events-none" aria-hidden="true">
      <Image
        src="/wunschkiste-geschenk.svg"
        alt=""
        width={120}
        height={120}
        className="mx-auto opacity-50"
      />
    </div>
  );
}
