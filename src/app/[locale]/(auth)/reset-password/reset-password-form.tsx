"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { resetPassword } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { Check } from "lucide-react";

export default function ResetPasswordForm() {
  return (
    <Suspense>
      <ResetPasswordFormInner />
    </Suspense>
  );
}

function ResetPasswordFormInner() {
  const t = useTranslations("resetPassword");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "INVALID_TOKEN" ? t("invalidToken") : null
  );
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(tAuth("passwordMinLength"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    if (!token) {
      setError(t("noToken"));
      return;
    }

    setLoading(true);

    const result = await resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      setError(t("error"));
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (!token && !errorParam) {
    return (
      <main className="flex min-h-screen items-start justify-center px-4 pt-16 sm:items-center sm:px-6 sm:pt-0">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-2xl">{t("invalidLink")}</h1>
          <p className="mt-2 text-sm text-foreground/60">
            {t("invalidLinkText")}
          </p>
          <Link href="/forgot-password">
            <Button className="mt-6">{t("requestNewLink")}</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-start justify-center px-4 pt-16 sm:items-center sm:px-6 sm:pt-0">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Link href="/">
            <BrandLogo size="md" />
          </Link>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100">
              <Check className="size-6 text-green-600" />
            </div>
            <h1 className="mt-4 font-serif text-2xl">{t("success")}</h1>
            <p className="mt-2 text-sm text-foreground/60">
              {t("successText")}
            </p>
            <Link href="/login">
              <Button className="mt-6">{t("goToLogin")}</Button>
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
                <Label htmlFor="password">{t("newPassword")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={tAuth("passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("confirmPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? t("saving") : t("save")}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
