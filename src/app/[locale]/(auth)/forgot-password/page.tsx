"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { requestPasswordReset } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const tAuth = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });

    if (result.error) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-4 pt-16 sm:items-center sm:px-6 sm:pt-0">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Link href="/">
            <BrandLogo size="md" />
          </Link>
        </div>

        {sent ? (
          <div className="text-center">
            <Mail className="mx-auto size-12 text-primary" />
            <h1 className="mt-4 font-serif text-2xl">{t("emailSent")}</h1>
            <p className="mt-2 text-sm text-foreground/60">
              {t("emailSentText")}
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="size-4" />
                {t("backToLogin")}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl">{t("title")}</h1>
            <p className="mt-2 text-sm text-foreground/60">
              {t("subtitle")}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{tAuth("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={tAuth("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t("sending") : t("sendLink")}
              </Button>

              <p className="text-center text-sm text-foreground/60">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  <ArrowLeft className="mr-1 inline size-3" />
                  {t("backToLogin")}
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
