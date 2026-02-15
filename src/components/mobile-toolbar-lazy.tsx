"use client";

import dynamic from "next/dynamic";

const MobileToolbar = dynamic(
  () =>
    import("@/components/mobile-toolbar").then((m) => ({
      default: m.MobileToolbar,
    })),
  { ssr: false }
);

export function MobileToolbarLazy() {
  return <MobileToolbar />;
}
