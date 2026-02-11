"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Gift, Share2, Trash2, Eye, PencilLine, Check, Calendar, Users, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  role: "participant" | "editor";
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
  const queryClient = useQueryClient();

  const { data: wishlists = [], isLoading: wishlistsLoading } = useQuery<Wishlist[]>({
    queryKey: ["wishlists"],
    queryFn: async () => {
      const response = await fetch("/api/wishlists");
      if (!response.ok) throw new Error("Failed to load wishlists");
      return response.json();
    },
    enabled: !!session,
    refetchOnWindowFocus: true,
  });

  const { data: sharedWishlists = [], isLoading: sharedLoading } = useQuery<SharedWishlist[]>({
    queryKey: ["wishlists", "shared"],
    queryFn: async () => {
      const response = await fetch("/api/wishlists/shared");
      if (!response.ok) throw new Error("Failed to load shared wishlists");
      return response.json();
    },
    enabled: !!session,
    refetchOnWindowFocus: true,
  });

  const loading = wishlistsLoading || sharedLoading;

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editWishlist, setEditWishlist] = useState<Wishlist | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  async function handleDelete() {
    if (!deleteId) return;
    const response = await fetch(`/api/wishlists/${deleteId}`, { method: "DELETE" });
    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["wishlists"] });
      toast.success(t("deleted"));
    }
    setDeleteId(null);
  }

  function openEditWishlist(wishlist: Wishlist) {
    setEditWishlist(wishlist);
    setEditTitle(wishlist.title);
    setEditDescription(wishlist.description || "");
  }

  async function handleEditWishlist() {
    if (!editWishlist || !editTitle.trim()) return;
    setEditSaving(true);
    const response = await fetch(`/api/wishlists/${editWishlist.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      }),
    });
    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["wishlists"] });
      setEditWishlist(null);
    }
    setEditSaving(false);
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
                    onClick={(e) => { e.preventDefault(); openEditWishlist(wishlist); }}
                  >
                    <PencilLine className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={async (e) => {
                      e.preventDefault();
                      if (wishlist.totalCount === 0) {
                        toast.error(t("shareEmpty"));
                        return;
                      }
                      const shareUrl = `${window.location.origin}/share/${wishlist.shareToken}`;
                      if (navigator.share) {
                        try {
                          await navigator.share({ title: wishlist.title, url: shareUrl });
                        } catch {
                          // User cancelled share dialog
                        }
                      } else {
                        navigator.clipboard.writeText(shareUrl);
                        toast.success(t("linkCopied"));
                      }
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
                  href={sw.role === "editor"
                    ? { pathname: "/wishlist/[id]", params: { id: sw.id } }
                    : { pathname: "/share/[token]", params: { token: sw.shareToken } }
                  }
                  className="group flex flex-col gap-3 rounded-xl border-2 border-border bg-card px-4 py-4 transition-colors hover:border-primary/20 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{sw.title}</h3>
                      {sw.role === "editor" && (
                        <Badge variant="secondary" className="text-xs">
                          <ShieldCheck className="mr-1 size-3" />
                          {t("coEditor")}
                        </Badge>
                      )}
                    </div>
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

      <Dialog open={!!editWishlist} onOpenChange={(open) => { if (!open) setEditWishlist(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{tCommon("edit")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-wl-title">{t("editTitleLabel")}</Label>
              <Input
                id="edit-wl-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="h-11 rounded-lg border-2 bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-wl-description">{t("editDescriptionLabel")}</Label>
              <Textarea
                id="edit-wl-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="rounded-lg border-2 bg-card"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditWishlist(null)}>
              {tCommon("cancel")}
            </Button>
            <Button onClick={handleEditWishlist} disabled={!editTitle.trim() || editSaving}>
              {editSaving ? tCommon("saving") : tCommon("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
