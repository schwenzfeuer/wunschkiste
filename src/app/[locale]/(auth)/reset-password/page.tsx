"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { resetPassword } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { WunschkisteLogo } from "@/components/wunschkiste-logo";
import { Check } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const errorParam = searchParams.get("error");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "INVALID_TOKEN" ? "Der Link ist ungültig oder abgelaufen." : null
  );
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      return;
    }

    if (!token) {
      setError("Kein Token gefunden. Bitte fordere einen neuen Link an.");
      return;
    }

    setLoading(true);

    const result = await resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      setError("Fehler beim Zurücksetzen. Der Link ist möglicherweise abgelaufen.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (!token && !errorParam) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-serif text-2xl">Ungültiger Link</h1>
          <p className="mt-2 text-sm text-foreground/60">
            Bitte fordere einen neuen Link zum Zurücksetzen an.
          </p>
          <Link href="/forgot-password">
            <Button className="mt-6">Neuen Link anfordern</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <WunschkisteLogo className="size-20" />
            <Image src="/wunschkiste-wordmark.svg" alt="Wunschkiste" width={200} height={40} className="h-10 w-auto" />
          </Link>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100">
              <Check className="size-6 text-green-600" />
            </div>
            <h1 className="mt-4 font-serif text-2xl">Passwort geändert</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt anmelden.
            </p>
            <Link href="/login">
              <Button className="mt-6">Zum Login</Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl">Neues Passwort</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Vergib ein neues Passwort für dein Konto.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Neues Passwort</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mindestens 8 Zeichen"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Passwort wiederholen"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Speichern..." : "Passwort speichern"}
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
