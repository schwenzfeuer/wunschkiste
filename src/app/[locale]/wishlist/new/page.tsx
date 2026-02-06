"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";

const themes = [
  { value: "standard", label: "Standard", emoji: "🎁", description: "Für jeden Anlass" },
  { value: "birthday", label: "Geburtstag", emoji: "🎂", description: "Party-Vibes!" },
  { value: "christmas", label: "Weihnachten", emoji: "🎄", description: "Festlich & gemütlich" },
  { value: "wedding", label: "Hochzeit", emoji: "💒", description: "Elegant & romantisch" },
  { value: "baby", label: "Baby", emoji: "👶", description: "Sanft & süß" },
];

export default function NewWishlistPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("standard");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/wishlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: description || undefined, theme }),
    });

    if (!response.ok) {
      setError("Fehler beim Erstellen der Wunschliste");
      setLoading(false);
      return;
    }

    const wishlist = await response.json();
    router.push(`/wishlist/${wishlist.id}`);
  }

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/40">Laden...</p>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-xl px-6 py-8">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 size-4" />
          Zurück zum Dashboard
        </Link>

        <h1 className="font-serif text-3xl md:text-4xl">Neue Wunschliste</h1>
        <p className="mt-2 text-foreground/50">
          Erstelle eine Wunschliste für deinen besonderen Anlass
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Theme Selection */}
          <div className="space-y-3">
            <Label>Wähle ein Theme</Label>
            <div className="grid grid-cols-5 gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center rounded-xl border-2 p-3 transition-all ${
                    theme === t.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="mt-1 text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-foreground/50">
              {themes.find((t) => t.value === theme)?.description}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titel *</Label>
            <Input
              id="title"
              placeholder="z.B. Meine Geburtstagswünsche"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="h-11 rounded-lg border-2 bg-card"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung (optional)</Label>
            <Textarea
              id="description"
              placeholder="Eine kurze Nachricht für deine Gäste..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="rounded-lg border-2 bg-card"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/dashboard">
              <Button type="button" variant="ghost">
                Abbrechen
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || !title}
            >
              {loading ? "Erstellen..." : "Wunschliste erstellen"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
