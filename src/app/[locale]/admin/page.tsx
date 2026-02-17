import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import AdminDashboard from "./admin-dashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user) {
    redirect({ href: "/login", locale: "de" });
    return null;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) {
    redirect({ href: "/dashboard", locale: "de" });
    return null;
  }

  return <AdminDashboard />;
}
