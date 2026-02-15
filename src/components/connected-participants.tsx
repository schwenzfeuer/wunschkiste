import Image from "next/image";

const participants = [
  {
    name: "Oma Helga",
    initials: "OH",
    color: "border-amber-500",
    colorBg: "bg-amber-500",
    // top-right, slightly cut off at edge
    top: "8%",
    left: "62%",
    delay: "0s",
    duration: "5s",
  },
  {
    name: "Papa",
    initials: "PA",
    color: "border-blue-500",
    colorBg: "bg-blue-500",
    // fully visible
    top: "28%",
    left: "52%",
    delay: "0.8s",
    duration: "6s",
  },
  {
    name: "Tante Inge",
    initials: "TI",
    color: "border-emerald-500",
    colorBg: "bg-emerald-500",
    // fully visible
    top: "50%",
    left: "58%",
    delay: "1.6s",
    duration: "7s",
  },
  {
    name: "Mia",
    initials: "MI",
    color: "border-pink-500",
    colorBg: "bg-pink-500",
    // fully visible
    top: "72%",
    left: "50%",
    delay: "0.4s",
    duration: "5.5s",
  },
  {
    name: "Onkel Peter",
    initials: "OP",
    color: "border-violet-500",
    colorBg: "bg-violet-500",
    // bottom, slightly cut off
    top: "92%",
    left: "56%",
    delay: "1.2s",
    duration: "6.5s",
  },
] as const;

export function ConnectedParticipants() {
  const svgW = 600;
  const svgH = 500;
  // Center circle -- left-of-center like pomegranate
  const cx = 130;
  const cy = 250;
  const circleR = 80;

  return (
    <div className="relative mx-auto w-full max-w-[580px]" style={{ aspectRatio: "6 / 5" }}>
      {/* SVG connection lines -- solid, thin, like pomegranate */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${svgW} ${svgH}`}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {participants.map((p) => {
          // Pill left edge in SVG coords; offset right to hit avatar center
          const pillX = (parseFloat(p.left) / 100) * svgW + 20;
          // Pill vertical center (translateY(-50%) makes top% the center)
          const pillY = (parseFloat(p.top) / 100) * svgH;
          // Start line at edge of center circle
          const dx = pillX - cx;
          const dy = pillY - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const startX = dist > 0 ? cx + (dx / dist) * circleR : cx;
          const startY = dist > 0 ? cy + (dy / dist) * circleR : cy;
          return (
            <line
              key={p.initials}
              x1={startX}
              y1={startY}
              x2={pillX}
              y2={pillY}
              stroke="var(--foreground)"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
          );
        })}
      </svg>

      {/* Central gift box with accent circle background */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          width: `${(circleR * 2 / svgW) * 100}%`,
          height: `${(circleR * 2 / svgH) * 100}%`,
          left: `${((cx - circleR) / svgW) * 100}%`,
          top: `${((cy - circleR) / svgH) * 100}%`,
        }}
      >
        <div className="flex size-full items-center justify-center rounded-full border-2 border-black bg-[#FEF1D0] shadow-[0_6px_0_0_black] participants-pulse-scale">
          <Image
            src="/wunschkiste-box.svg"
            alt=""
            width={96}
            height={96}
            className="size-14 sm:size-20"
          />
        </div>
      </div>

      {/* Participant pills */}
      {participants.map((p) => (
        <div
          key={p.initials}
          className="absolute -translate-y-1/2 participants-float"
          style={{
            top: p.top,
            left: p.left,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        >
          <div className="flex items-center gap-2 rounded-full border-2 border-black bg-card py-1 pl-1 pr-3.5 shadow-[0_3px_0_0_black] sm:py-1.5 sm:pl-1.5 sm:pr-4">
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full border-[2.5px] text-[11px] font-bold text-white sm:size-9 ${p.color} ${p.colorBg}`}
            >
              {p.initials}
            </div>
            <span className="whitespace-nowrap text-xs font-bold text-card-foreground sm:text-sm">
              {p.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
