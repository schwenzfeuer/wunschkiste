"use client";

import { useState, useEffect } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Gift, Share2, Trash2, Eye, Check, Calendar, Users } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { MainNav } from "@/components/main-nav";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Participant {
  id: string;
  name: string | null;
  image: string | null;
}

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
  participants: Participant[];
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
  birthday: "\u{1F382}",
  christmas: "\u{1F384}",
};

export default function DashboardContent() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");
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
        toast.error(t("loadError"));
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
      toast.success(t("deleted"));
    }
    setDeleteId(null);
  }

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/40">{tCommon("loading")}</p>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <main className="min-h-screen">
      <MainNav />

      <div className="mx-auto max-w-3xl px-4 pt-28 pb-12 sm:px-6 sm:pt-36">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">{t("title")}</h1>
            <p className="mt-2 text-foreground/50">
              {t("subtitle")}
            </p>
          </div>
          {wishlists.length > 0 && (
            <Link href="/wishlist/new" className="shrink-0">
              <Button variant="accent">
                <Plus className="size-4" />
                {t("newBox")}
              </Button>
            </Link>
          )}
        </div>

        {wishlists.length === 0 ? (
          <div className="py-20 text-center">
            <Gift className="mx-auto size-12 text-foreground/20" />
            <h3 className="mt-6 font-serif text-xl">
              {t("empty")}
            </h3>
            <p className="mt-2 text-foreground/50">
              {t("emptyText")}
            </p>
            <Link href="/wishlist/new">
              <Button variant="accent" className="mt-6">
                <Plus className="size-4" />
                {t("createFirst")}
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlists.map((wishlist) => (
              <Link
                key={wishlist.id}
                href={{ pathname: "/wishlist/[id]", params: { id: wishlist.id } }}
                className="group relative flex flex-col gap-3 rounded-xl border-2 border-border bg-card px-4 py-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {themeEmojis[wishlist.theme] && (
                    <span className="text-xl shrink-0">{themeEmojis[wishlist.theme]}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium truncate">{wishlist.title}</h3>
                      {wishlist.participants.length > 0 && (
                        <div className="flex shrink-0 -space-x-1.5">
                          {wishlist.participants.slice(0, 3).map((p) => (
                            <UserAvatar
                              key={p.id}
                              name={p.name}
                              imageUrl={p.image}
                              size="xs"
                              className="ring-2 ring-card"
                            />
                          ))}
                          {wishlist.participants.length > 3 && (
                            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium ring-2 ring-card">
                              +{wishlist.participants.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {(wishlist.claimedCount > 0 || wishlist.description) && (
                      <p className="mt-0.5 text-sm text-foreground/50 truncate">
                        {wishlist.claimedCount > 0 && wishlist.ownerVisibility === "surprise"
                          ? t("wishesAssigned")
                          : wishlist.claimedCount > 0
                            ? t("claimedOf", { claimed: wishlist.claimedCount, total: wishlist.totalCount })
                            : ""}
                        {wishlist.claimedCount > 0 && wishlist.description ? " · " : ""}
                        {wishlist.description ?? ""}
                      </p>
                    )}
                  </div>
                </div>
                <div className="relative z-10 flex items-center gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                  <Button variant="ghost" size="icon-sm">
                    <Eye className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      if (wishlist.totalCount === 0) {
                        toast.error(t("shareEmpty"));
                        return;
                      }
                      navigator.clipboard.writeText(
                        `${window.location.origin}/share/${wishlist.shareToken}`
                      );
                      toast.success(t("linkCopied"));
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
            <h2 className="font-serif text-2xl md:text-3xl">{t("friendsTitle")}</h2>
            <p className="mt-2 mb-6 text-foreground/50">
              {t("friendsSubtitle")}
            </p>
            <div className="space-y-3">
              {sharedWishlists.map((sw) => (
                <Link
                  key={sw.id}
                  href={{ pathname: "/share/[token]", params: { token: sw.shareToken } }}
                  className="group flex flex-col gap-3 rounded-xl border-2 border-border bg-card px-4 py-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
                >
                  <div>
                    <h3 className="font-medium">{sw.title}</h3>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-foreground/50">
                      {sw.ownerName && <span>{tCommon("from", { name: sw.ownerName })}</span>}
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
                        {t("reserved", { count: sw.myReservedCount })}
                      </Badge>
                    )}
                    {sw.myBoughtCount > 0 && (
                      <Badge variant="default" className="bg-green-600">
                        <Check className="mr-1 size-3" />
                        {t("bought", { count: sw.myBoughtCount })}
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
        title={t("deleteTitle")}
        description={t("deleteText")}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </main>
  );
}
