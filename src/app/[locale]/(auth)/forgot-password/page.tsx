"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { requestPasswordReset } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { WunschkisteLogo } from "@/components/wunschkiste-logo";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
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
      setError("Fehler beim Senden der E-Mail. Bitte versuche es erneut.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
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

        {sent ? (
          <div className="text-center">
            <Mail className="mx-auto size-12 text-primary" />
            <h1 className="mt-4 font-serif text-2xl">E-Mail gesendet</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Falls ein Konto mit dieser E-Mail existiert, haben wir dir einen Link zum Zurücksetzen des Passworts geschickt.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="size-4" />
                Zurück zum Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="font-serif text-3xl">Passwort vergessen?</h1>
            <p className="mt-2 text-sm text-foreground/60">
              Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen deines Passworts.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Senden..." : "Link senden"}
              </Button>

              <p className="text-center text-sm text-foreground/60">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  <ArrowLeft className="mr-1 inline size-3" />
                  Zurück zum Login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
