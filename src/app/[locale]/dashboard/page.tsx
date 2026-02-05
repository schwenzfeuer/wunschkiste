"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Gift, Share2, LogOut, Trash2 } from "lucide-react";

interface Wishlist {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  shareToken: string;
  isPublic: boolean;
  createdAt: string;
}

const themeLabels: Record<string, string> = {
  standard: "Standard",
  birthday: "Geburtstag",
  christmas: "Weihnachten",
  wedding: "Hochzeit",
  baby: "Baby",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchWishlists() {
      const response = await fetch("/api/wishlists");
      if (response.ok) {
        const data = await response.json();
        setWishlists(data);
      }
      setLoading(false);
    }

    if (session) {
      fetchWishlists();
    }
  }, [session]);

  async function handleDelete(id: string) {
    if (!confirm("Wunschliste wirklich löschen?")) return;

    const response = await fetch(`/api/wishlists/${id}`, { method: "DELETE" });
    if (response.ok) {
      setWishlists(wishlists.filter((w) => w.id !== id));
    }
  }

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  if (isPending || loading) {
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
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Wunschkiste
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.name || session.user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meine Wunschlisten</h1>
            <p className="mt-1 text-muted-foreground">
              Verwalte deine Wunschlisten und teile sie mit anderen
            </p>
          </div>
          <Link href="/wishlist/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Neue Wunschliste
            </Button>
          </Link>
        </div>

        {wishlists.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                Noch keine Wunschlisten
              </h3>
              <p className="mt-2 text-muted-foreground">
                Erstelle deine erste Wunschliste und teile sie mit Freunden und Familie.
              </p>
              <Link href="/wishlist/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Erste Wunschliste erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlists.map((wishlist) => (
              <Card key={wishlist.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{wishlist.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {wishlist.description || "Keine Beschreibung"}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{themeLabels[wishlist.theme]}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Link href={`/wishlist/${wishlist.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Bearbeiten
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/share/${wishlist.shareToken}`
                        );
                        alert("Link kopiert!");
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(wishlist.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
