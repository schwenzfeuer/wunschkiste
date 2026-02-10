"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ProductImage } from "@/components/product-image";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, ExternalLink, Share2, Loader2, PencilLine, Calendar as CalendarIcon, X, Check, Bookmark, Users, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChristmasDecorations } from "@/components/themes/christmas-decorations";
import { MainNav } from "@/components/main-nav";
import { UserAvatar } from "@/components/user-avatar";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { de } from "date-fns/locale";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatPrice, normalizePrice } from "@/lib/format";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import type { OwnerVisibility } from "@/lib/db/schema";

interface Product {
  id: string;
  title: string;
  originalUrl: string;
  affiliateUrl: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string;
  shopName: string | null;
  reservationStatus: "reserved" | "bought" | null;
  reservedByName: string | null;
}

interface Wishlist {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  shareToken: string;
  eventDate: string | null;
  ownerVisibility: OwnerVisibility;
}

interface ProductData {
  title: string | null;
  image: string | null;
  price: string | null;
  currency: string | null;
  shopName: string | null;
}

interface Participant {
  id: string;
  name: string | null;
  image: string | null;
}

export default function WishlistEditor({ id }: { id: string }) {
  const t = useTranslations("editor");
  const tVis = useTranslations("visibility");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading: wishlistLoading, isError: wishlistError } = useQuery<Wishlist>({
    queryKey: ["wishlist", id],
    queryFn: async () => {
      const response = await fetch(`/api/wishlists/${id}`);
      if (!response.ok) throw new Error("Not found");
      return response.json();
    },
    enabled: !!session,
    refetchOnWindowFocus: true,
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["products", id],
    queryFn: async () => {
      const response = await fetch(`/api/wishlists/${id}/products`);
      if (!response.ok) throw new Error("Failed to load products");
      return response.json();
    },
    enabled: !!session,
    refetchOnWindowFocus: true,
  });

  const { data: participants = [], isLoading: participantsLoading } = useQuery<Participant[]>({
    queryKey: ["participants", id],
    queryFn: async () => {
      const response = await fetch(`/api/wishlists/${id}/participants`);
      if (!response.ok) throw new Error("Failed to load participants");
      return response.json();
    },
    enabled: !!session,
    refetchOnWindowFocus: true,
  });

  const loading = wishlistLoading || productsLoading || participantsLoading;

  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ProductData | null>(null);
  const [productTitle, setProductTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [pendingVisibility, setPendingVisibility] = useState<OwnerVisibility | null>(null);
  const [surpriseSpoiled, setSurpriseSpoiled] = useState(false);
  const [eventDate, setEventDate] = useState<Date | undefined>();
  const [ownerVisibility, setOwnerVisibility] = useState<OwnerVisibility>("partial");
  const [editWlOpen, setEditWlOpen] = useState(false);
  const [editWlTitle, setEditWlTitle] = useState("");
  const [editWlDescription, setEditWlDescription] = useState("");
  const [editWlSaving, setEditWlSaving] = useState(false);

  const visibilityOptions: { value: OwnerVisibility; label: string; description: string }[] = [
    { value: "full", label: tVis("full"), description: tVis("fullDescription") },
    { value: "partial", label: tVis("partial"), description: tVis("partialDescription") },
    { value: "surprise", label: tVis("surprise"), description: tVis("surpriseDescription") },
  ];

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (wishlistError) {
      router.push("/dashboard");
    }
  }, [wishlistError, router]);

  useEffect(() => {
    if (wishlist) {
      setEventDate(wishlist.eventDate ? new Date(wishlist.eventDate) : undefined);
      setOwnerVisibility(wishlist.ownerVisibility || "partial");
    }
  }, [wishlist]);

  async function handleScrape() {
    if (!newUrl) return;
    setScraping(true);
    setScrapedData(null);

    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl }),
    });

    if (response.ok) {
      const data = await response.json();
      setScrapedData(data);
      setProductTitle(data.title || "");
    }
    setScraping(false);
  }

  async function handleAddProduct() {
    if (!productTitle || !newUrl) return;
    setAdding(true);

    const response = await fetch(`/api/wishlists/${id}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalUrl: newUrl,
        title: productTitle,
        imageUrl: scrapedData?.image,
        price: scrapedData?.price,
        currency: scrapedData?.currency || "EUR",
        shopName: scrapedData?.shopName,
      }),
    });

    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["products", id] });
      setAddDialogOpen(false);
      setNewUrl("");
      setScrapedData(null);
      setProductTitle("");
    }
    setAdding(false);
  }

  async function handleDeleteProduct() {
    if (!deleteProductId) return;
    const response = await fetch(`/api/wishlists/${id}/products/${deleteProductId}`, {
      method: "DELETE",
    });
    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["products", id] });
      toast.success(t("wishDeleted"));
    }
    setDeleteProductId(null);
  }

  function openEditDialog(product: Product) {
    setEditProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.price ? product.price.replace(".", ",") : "");
  }

  async function handleEditProduct() {
    if (!editProduct || !editTitle) return;
    setSaving(true);

    const response = await fetch(`/api/wishlists/${id}/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        price: editPrice ? normalizePrice(editPrice) : null,
      }),
    });

    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["products", id] });
      setEditProduct(null);
    }
    setSaving(false);
  }

  function handleShare() {
    if (!wishlist) return;
    if (products.length === 0) {
      toast.error(t("shareEmpty"));
      return;
    }
    const shareUrl = `${window.location.origin}/share/${wishlist.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success(t("linkCopied"));
  }

  async function handleEventDateChange(date: Date | undefined) {
    setEventDate(date);
    await fetch(`/api/wishlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventDate: date?.toISOString() ?? null }),
    });
    await queryClient.invalidateQueries({ queryKey: ["wishlist", id] });
  }

  async function handleVisibilityChange(visibility: OwnerVisibility) {
    setOwnerVisibility(visibility);
    await fetch(`/api/wishlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerVisibility: visibility }),
    });
    await queryClient.invalidateQueries({ queryKey: ["products", id] });
  }

  function openEditWishlist() {
    if (!wishlist) return;
    setEditWlTitle(wishlist.title);
    setEditWlDescription(wishlist.description || "");
    setEditWlOpen(true);
  }

  async function handleEditWishlist() {
    if (!wishlist || !editWlTitle.trim()) return;
    setEditWlSaving(true);
    const response = await fetch(`/api/wishlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editWlTitle.trim(),
        description: editWlDescription.trim() || null,
      }),
    });
    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["wishlist", id] });
      setEditWlOpen(false);
    }
    setEditWlSaving(false);
  }

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/40">{tCommon("loading")}</p>
      </main>
    );
  }

  if (!session || !wishlist) {
    return null;
  }

  return (
    <main
      className="min-h-screen bg-background transition-colors"
      data-theme={wishlist.theme !== "standard" ? wishlist.theme : undefined}
    >
      <MainNav />
      {wishlist.theme === "christmas" && <ChristmasDecorations />}
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-8 sm:px-6 sm:pt-36">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <button
            type="button"
            onClick={openEditWishlist}
            className="group/edit cursor-pointer text-left"
          >
            <h1 className="font-serif text-3xl md:text-4xl">
              {wishlist.title}
              <PencilLine className="ml-2 inline size-4 align-middle text-foreground/30 opacity-0 transition-opacity group-hover/edit:opacity-100" />
            </h1>
            {wishlist.description && (
              <p className="mt-2 text-foreground/50">{wishlist.description}</p>
            )}
          </button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={products.length === 0}
            >
              <Share2 className="size-4" />
              {t("share")}
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="accent" size="sm">
                  <Plus className="size-4" />
                  {t("addWish")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">{t("addWishTitle")}</DialogTitle>
                  <DialogDescription>
                    {t("addWishDescription")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">{t("productUrl")}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="url"
                        placeholder={t("productUrlPlaceholder")}
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="h-11 rounded-lg border-2 bg-card"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleScrape}
                        disabled={!newUrl || scraping}
                      >
                        {scraping ? <Loader2 className="size-4 animate-spin" /> : t("load")}
                      </Button>
                    </div>
                  </div>

                  {scrapedData && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="title">{t("titleLabel")}</Label>
                        <Input
                          id="title"
                          value={productTitle}
                          onChange={(e) => setProductTitle(e.target.value)}
                          required
                          className="h-11 rounded-lg border-2 bg-card"
                        />
                      </div>

                      {scrapedData.image && (
                        <div className="flex justify-center">
                          <ProductImage
                            src={scrapedData.image}
                            alt={productTitle}
                            className="h-32 w-32 rounded-lg object-contain"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-4 text-sm text-foreground/60">
                        {scrapedData.price && (
                          <span className="text-lg font-semibold text-foreground">
                            {formatPrice(scrapedData.price, scrapedData.currency || "EUR")}
                          </span>
                        )}
                        {scrapedData.shopName && (
                          <span>{tCommon("from", { name: scrapedData.shopName })}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setAddDialogOpen(false)}
                  >
                    {tCommon("cancel")}
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    disabled={!productTitle || !newUrl || adding}
                  >
                    {adding ? t("adding") : t("add")}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Settings: Event Date + Visibility */}
        <div className="mb-8 space-y-4 rounded-xl border-2 border-border bg-card/50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Label className="text-xs text-foreground/50">{t("eventDate")}</Label>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(
                        "justify-start text-left font-normal",
                        !eventDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 size-3.5" />
                      {eventDate ? format(eventDate, "PPP", { locale: de }) : t("noDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={eventDate}
                      onSelect={handleEventDateChange}
                      locale={de}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
                {eventDate && (
                  <button
                    type="button"
                    onClick={() => handleEventDateChange(undefined)}
                    className="text-xs font-medium text-foreground/50 hover:text-foreground cursor-pointer"
                  >
                    {t("removeDate")}
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-foreground/50">{t("visibility")}</Label>
              <div className="flex gap-1">
                {visibilityOptions.filter((option) => option.value !== "surprise" || (!surpriseSpoiled && ownerVisibility === "surprise")).map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={ownerVisibility === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (ownerVisibility === "surprise" && option.value !== "surprise") {
                        setPendingVisibility(option.value);
                      } else {
                        handleVisibilityChange(option.value);
                      }
                    }}
                    title={option.description}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {participants.length > 0 && (
          <div className="mb-8 flex items-center gap-3">
            <div className="flex -space-x-2">
              {participants.slice(0, 5).map((p) => (
                <UserAvatar
                  key={p.id}
                  name={p.name}
                  imageUrl={p.image}
                  size="sm"
                  className="ring-2 ring-background"
                />
              ))}
              {participants.length > 5 && (
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium ring-2 ring-background">
                  +{participants.length - 5}
                </div>
              )}
            </div>
            <Button
              variant="accent"
              size="xs"
              onClick={() => setParticipantsOpen(true)}
            >
              <Users className="size-3" />
              {t("participants", { count: participants.length })}
            </Button>
          </div>
        )}

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-foreground/40">
              {t("emptyState")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex items-center gap-3 rounded-xl border-2 border-border bg-card p-3 transition-colors hover:border-primary/20 sm:gap-4 sm:p-4"
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={product.title}
                  className="size-16 shrink-0 rounded-lg object-contain"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium leading-snug truncate" title={product.title}>{product.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-foreground/50">
                    {product.price && (
                      <span className="font-semibold text-foreground">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    )}
                    {product.shopName && <span>{product.shopName}</span>}
                  </div>
                  {product.reservationStatus && (
                    <div className="mt-1.5 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                      <Badge
                        variant={product.reservationStatus === "bought" ? "default" : "outline"}
                        className={product.reservationStatus === "bought" ? "bg-accent text-accent-foreground" : "border-accent text-accent"}
                      >
                        {product.reservationStatus === "bought" ? (
                          <><Check className="mr-1 size-3" />{t("bought")}</>
                        ) : (
                          <><Bookmark className="mr-1 size-3" />{t("reserved")}</>
                        )}
                      </Badge>
                      {product.reservedByName && (
                        <span className="text-xs text-foreground/50">{tCommon("from", { name: product.reservedByName })}</span>
                      )}
                    </div>
                  )}
                </div>
                {/* Desktop: Icon-Buttons */}
                <div className="hidden sm:flex items-center gap-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(product)}>
                    <PencilLine className="size-4" />
                  </Button>
                  <a
                    href={product.affiliateUrl || product.originalUrl}
                    target="_blank"
                    rel={`noopener${product.affiliateUrl ? " sponsored nofollow" : ""}`}
                  >
                    <Button variant="ghost" size="icon-sm">
                      <ExternalLink className="size-4" />
                    </Button>
                  </a>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteProductId(product.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {/* Mobile: Context Menu */}
                <div className="sm:hidden shrink-0">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(product)}>
                        <PencilLine className="mr-2 size-4" />
                        {tCommon("edit")}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a
                          href={product.affiliateUrl || product.originalUrl}
                          target="_blank"
                          rel={`noopener${product.affiliateUrl ? " sponsored nofollow" : ""}`}
                        >
                          <ExternalLink className="mr-2 size-4" />
                          {t("openInShop")}
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteProductId(product.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 size-4" />
                        {tCommon("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Edit Wishlist Dialog */}
        <Dialog open={editWlOpen} onOpenChange={(open) => { if (!open) setEditWlOpen(false); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{tCommon("edit")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-wl-title">{t("editWlTitleLabel")}</Label>
                <Input
                  id="edit-wl-title"
                  value={editWlTitle}
                  onChange={(e) => setEditWlTitle(e.target.value)}
                  required
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-wl-desc">{t("editWlDescriptionLabel")}</Label>
                <Textarea
                  id="edit-wl-desc"
                  value={editWlDescription}
                  onChange={(e) => setEditWlDescription(e.target.value)}
                  rows={3}
                  className="rounded-lg border-2 bg-card"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditWlOpen(false)}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleEditWishlist} disabled={!editWlTitle.trim() || editWlSaving}>
                {editWlSaving ? tCommon("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{t("editTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">{t("titleLabel")}</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">{t("priceLabel")}</Label>
                <Input
                  id="edit-price"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder={t("pricePlaceholder")}
                  inputMode="decimal"
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditProduct(null)}>
                {tCommon("cancel")}
              </Button>
              <Button onClick={handleEditProduct} disabled={!editTitle || saving}>
                {saving ? tCommon("saving") : tCommon("save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ConfirmationDialog
        open={deleteProductId !== null}
        onOpenChange={(open) => { if (!open) setDeleteProductId(null); }}
        title={t("deleteTitle")}
        description={t("deleteText")}
        confirmLabel={tCommon("delete")}
        cancelLabel={tCommon("cancel")}
        variant="destructive"
        onConfirm={handleDeleteProduct}
      />

      <ConfirmationDialog
        open={pendingVisibility !== null}
        onOpenChange={(open) => { if (!open) setPendingVisibility(null); }}
        title={t("spoilerTitle")}
        description={t("spoilerText")}
        confirmLabel={t("spoilerConfirm")}
        cancelLabel={t("spoilerCancel")}
        onConfirm={() => {
          if (pendingVisibility) {
            handleVisibilityChange(pendingVisibility);
            setSurpriseSpoiled(true);
          }
          setPendingVisibility(null);
        }}
      />

      <Dialog open={participantsOpen} onOpenChange={setParticipantsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">{t("participantsTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <UserAvatar name={p.name} imageUrl={p.image} size="sm" />
                <span className="text-sm font-medium">{p.name || t("unknown")}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
