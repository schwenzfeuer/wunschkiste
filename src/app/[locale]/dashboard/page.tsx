import type { Metadata } from "next";
import DashboardContent from "./dashboard-content";

export const metadata: Metadata = {
  title: "Meine Wunschkisten",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardContent />;
}
