"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Plus, Gift, Share2, Trash2, Pencil } from "lucide-react";
import { MainNav } from "@/components/main-nav";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { toast } from "sonner";

interface Wishlist {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  shareToken: string;
  isPublic: boolean;
  createdAt: string;
}

const themeEmojis: Record<string, string> = {
  standard: "",
  birthday: "🎂",
  christmas: "🎄",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  async function handleDelete() {
    if (!deleteId) return;
    const response = await fetch(`/api/wishlists/${deleteId}`, { method: "DELETE" });
    if (response.ok) {
      setWishlists(wishlists.filter((w) => w.id !== deleteId));
      toast.success("Wunschkiste gelöscht!");
    }
    setDeleteId(null);
  }

  if (isPending || loading) {
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
      <MainNav />

      <div className="mx-auto max-w-3xl px-6 pt-36 pb-12">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">Meine Wunschkisten</h1>
            <p className="mt-2 text-foreground/50">
              Verwalte deine Wunschkisten und teile sie mit anderen
            </p>
          </div>
          {wishlists.length > 0 && (
            <Link href="/wishlist/new">
              <Button variant="accent">
                <Plus className="size-4" />
                Neue Kiste
              </Button>
            </Link>
          )}
        </div>

        {wishlists.length === 0 ? (
          <div className="py-20 text-center">
            <Gift className="mx-auto size-12 text-foreground/20" />
            <h3 className="mt-6 font-serif text-xl">
              Noch keine Wunschkisten
            </h3>
            <p className="mt-2 text-foreground/50">
              Erstelle deine erste Wunschkiste und teile sie mit Freunden und Familie.
            </p>
            <Link href="/wishlist/new">
              <Button variant="accent" className="mt-6">
                <Plus className="size-4" />
                Erste Wunschkiste erstellen
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlists.map((wishlist) => (
              <Link
                key={wishlist.id}
                href={{ pathname: "/wishlist/[id]", params: { id: wishlist.id } }}
                className="group relative flex items-center justify-between rounded-xl border-2 border-border bg-background px-6 py-5 transition-colors hover:border-primary"
              >
                <div className="flex items-center gap-3">
                  {themeEmojis[wishlist.theme] && (
                    <span className="text-xl">{themeEmojis[wishlist.theme]}</span>
                  )}
                  <div>
                    <h3 className="font-medium">{wishlist.title}</h3>
                    {wishlist.description && (
                      <p className="mt-0.5 text-sm text-foreground/50">{wishlist.description}</p>
                    )}
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100">
                  <Button variant="ghost" size="icon-sm">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText(
                        `${window.location.origin}/share/${wishlist.shareToken}`
                      );
                      toast.success("Link kopiert!");
                    }}
                  >
                    <Share2 className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => { e.preventDefault(); setDeleteId(wishlist.id); }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Wunschkiste löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden. Alle Wünsche und Reservierungen gehen verloren."
        confirmLabel="Löschen"
        cancelLabel="Abbrechen"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </main>
  );
}
