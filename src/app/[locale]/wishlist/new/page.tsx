"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
        <p className="text-muted-foreground">Laden...</p>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Link>

        <Card className="overflow-hidden rounded-3xl">
          <CardHeader className="bg-gradient-to-br from-primary/5 to-secondary/10 pb-8">
            <div className="mb-2 text-4xl">✨</div>
            <CardTitle className="text-2xl">Neue Wunschliste</CardTitle>
            <CardDescription>
              Erstelle eine Wunschliste für deinen besonderen Anlass
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-6">
              {error && (
                <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label>Wähle ein Theme</Label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setTheme(t.value)}
                      className={`flex flex-col items-center rounded-2xl border-2 p-4 transition-all hover:scale-105 ${
                        theme === t.value
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-transparent bg-muted/50 hover:border-muted-foreground/20"
                      }`}
                    >
                      <span className="mb-1 text-3xl">{t.emoji}</span>
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-muted-foreground">
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
                  className="rounded-xl"
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
                  className="rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 border-t bg-muted/30 px-6 py-4">
              <Link href="/dashboard">
                <Button type="button" variant="ghost">
                  Abbrechen
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading || !title}
                className="rounded-full px-6"
              >
                {loading ? "Erstellen..." : "Wunschliste erstellen"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
