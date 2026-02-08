"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Gift, Share2, Trash2, Pencil, Check, Calendar } from "lucide-react";
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
  ownerVisibility: string;
  totalCount: number;
  claimedCount: number;
}

interface SharedWishlist {
  id: string;
  title: string;
  shareToken: string;
  ownerName: string | null;
  eventDate: string | null;
  myReservedCount: number;
  myBoughtCount: number;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const [sharedWishlists, setSharedWishlists] = useState<SharedWishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchWishlists() {
      try {
        const [ownRes, sharedRes] = await Promise.all([
          fetch("/api/wishlists"),
          fetch("/api/wishlists/shared"),
        ]);
        if (ownRes.ok) {
          setWishlists(await ownRes.json());
        }
        if (sharedRes.ok) {
          setSharedWishlists(await sharedRes.json());
        }
      } catch {
        toast.error("Fehler beim Laden der Wunschkisten");
      } finally {
        setLoading(false);
      }
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
                className="group relative flex items-center justify-between rounded-xl border-2 border-border bg-card px-6 py-5 transition-colors hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  {themeEmojis[wishlist.theme] && (
                    <span className="text-xl">{themeEmojis[wishlist.theme]}</span>
                  )}
                  <div>
                    <h3 className="font-medium">{wishlist.title}</h3>
                    {(wishlist.claimedCount > 0 || wishlist.description) && (
                      <p className="mt-0.5 text-sm text-foreground/50">
                        {wishlist.claimedCount > 0 && wishlist.ownerVisibility === "surprise"
                          ? "Es wurden Wünsche vergeben"
                          : wishlist.claimedCount > 0
                            ? `${wishlist.claimedCount} von ${wishlist.totalCount} vergeben`
                            : ""}
                        {wishlist.claimedCount > 0 && wishlist.description ? " · " : ""}
                        {wishlist.description ?? ""}
                      </p>
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
        {sharedWishlists.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl md:text-3xl">Wunschkisten von Freunden</h2>
            <p className="mt-2 mb-6 text-foreground/50">
              Wunschkisten, bei denen du Geschenke reserviert oder gekauft hast
            </p>
            <div className="space-y-3">
              {sharedWishlists.map((sw) => (
                <Link
                  key={sw.id}
                  href={{ pathname: "/share/[token]", params: { token: sw.shareToken } }}
                  className="group flex items-center justify-between rounded-xl border-2 border-border bg-card px-6 py-5 transition-colors hover:border-primary/20"
                >
                  <div>
                    <h3 className="font-medium">{sw.title}</h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-foreground/50">
                      {sw.ownerName && <span>von {sw.ownerName}</span>}
                      {sw.eventDate && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" />
                          {formatEventDate(sw.eventDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sw.myReservedCount > 0 && (
                      <Badge variant="secondary">
                        {sw.myReservedCount} reserviert
                      </Badge>
                    )}
                    {sw.myBoughtCount > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="mr-1 size-3" />
                        {sw.myBoughtCount} gekauft
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
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
