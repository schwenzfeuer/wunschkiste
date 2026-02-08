"use client";

import { useState, use } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/product-image";
import { AuthDialog } from "@/components/auth-dialog";
import { Gift, Check, ShoppingBag, Calendar, Undo2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ChristmasDecorations, ChristmasHeaderStar, ChristmasEmptyState } from "@/components/themes/christmas-decorations";
import { MainNav } from "@/components/main-nav";
import { formatPrice } from "@/lib/format";
import { useTranslations } from "next-intl";

interface Product {
  id: string;
  title: string;
  originalUrl: string;
  affiliateUrl: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string;
  shopName: string | null;
  status: "available" | "reserved" | "bought";
  claimedByMe: boolean;
  claimedByName: string | null;
}

interface SharedWishlist {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  ownerName: string | null;
  eventDate: string | null;
  ownerVisibility: "full" | "partial" | "surprise";
  isOwner: boolean;
  isLoggedIn: boolean;
  claimedCount?: number;
  totalCount?: number;
  products: Product[];
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isEventPast(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useTranslations("share");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ product: Product; type: "buy" | "reserve" } | null>(null);

  const { data: wishlist, isLoading, isError } = useQuery<SharedWishlist>({
    queryKey: ["share", token],
    queryFn: async () => {
      const response = await fetch(`/api/share/${token}`);
      if (!response.ok) throw new Error("Not found");
      return response.json();
    },
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
  });

  function openClaimDialog(product: Product) {
    setSelectedProduct(product);
    setClaimMessage("");
    setClaimDialogOpen(true);
  }

  function openReserveDialog(product: Product) {
    setSelectedProduct(product);
    setClaimMessage("");
    setReserveDialogOpen(true);
  }

  function handleAuthRequired(product: Product, type: "buy" | "reserve") {
    setPendingAction({ product, type });
    setAuthDialogOpen(true);
  }

  async function handleAuthSuccess() {
    setAuthDialogOpen(false);
    await queryClient.invalidateQueries({ queryKey: ["share", token] });
    if (pendingAction) {
      const { product, type } = pendingAction;
      setPendingAction(null);
      if (type === "buy") {
        openClaimDialog(product);
      } else {
        openReserveDialog(product);
      }
    }
  }

  async function handleClaim(status: "reserved" | "bought") {
    if (!selectedProduct) return;
    setSubmitting(true);

    const response = await fetch(`/api/share/${token}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        status,
        message: claimMessage || undefined,
      }),
    });

    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["share", token] });
      setClaimDialogOpen(false);
      setReserveDialogOpen(false);
      setSelectedProduct(null);
      setClaimMessage("");

      if (status === "bought") {
        const shopUrl = selectedProduct.affiliateUrl || selectedProduct.originalUrl;
        window.open(shopUrl, "_blank", "noopener");
      }
    }
    setSubmitting(false);
  }

  async function handleUnclaim(productId: string) {
    const response = await fetch(
      `/api/share/${token}/reserve?productId=${productId}`,
      { method: "DELETE" }
    );

    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["share", token] });
    }
  }

  async function handleUpgradeToBought(product: Product) {
    const response = await fetch(`/api/share/${token}/reserve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id }),
    });

    if (response.ok) {
      await queryClient.invalidateQueries({ queryKey: ["share", token] });
      const shopUrl = product.affiliateUrl || product.originalUrl;
      window.open(shopUrl, "_blank", "noopener");
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/40">{tCommon("loading")}</p>
      </main>
    );
  }

  if (isError || !wishlist) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <Gift className="size-16 text-foreground/20" />
        <h1 className="font-serif text-2xl">{t("notFoundTitle")}</h1>
        <p className="text-foreground/50">
          {t("notFoundText")}
        </p>
      </main>
    );
  }

  const isOwner = wishlist.isOwner;
  const isLoggedIn = wishlist.isLoggedIn;

  return (
    <main
      className="min-h-screen bg-background transition-colors"
      data-theme={wishlist.theme !== "standard" ? wishlist.theme : undefined}
    >
      <MainNav />
      {wishlist.theme === "christmas" && <ChristmasDecorations />}
      <div className="mx-auto max-w-2xl px-6 pt-28 pb-12">
        {/* Header */}
        <div className="mb-12 text-center">
          {wishlist.theme === "christmas" ? <ChristmasHeaderStar /> : null}
          <h1 className="mt-4 font-serif text-4xl md:text-5xl">{wishlist.title}</h1>
          {wishlist.ownerName && (
            <p className="mt-3 text-foreground/50">
              {tCommon("from", { name: wishlist.ownerName })}
            </p>
          )}
          {wishlist.description && (
            <p className="mt-4 text-lg text-foreground/60">{wishlist.description}</p>
          )}
          {wishlist.eventDate && (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-foreground/50">
              <Calendar className="size-4" />
              {formatEventDate(wishlist.eventDate)}
              {isEventPast(wishlist.eventDate) && (
                <Badge variant="secondary">{t("eventPassed")}</Badge>
              )}
            </p>
          )}
        </div>

        {/* Owner surprise mode banner */}
        {isOwner && wishlist.ownerVisibility === "surprise" && wishlist.claimedCount !== undefined && (
          <div className="mb-8 rounded-xl border-2 border-border bg-card p-4 text-center">
            <p className="text-lg font-medium">
              {t("claimedOf", { claimed: wishlist.claimedCount ?? 0, total: wishlist.totalCount ?? 0 })}
            </p>
            <p className="mt-1 text-sm text-foreground/50">
              {t("surpriseMode")}
            </p>
          </div>
        )}

        {/* Products */}
        {wishlist.products.length === 0 ? (
          <div className="py-20 text-center">
            {wishlist.theme === "christmas" ? (
              <ChristmasEmptyState />
            ) : (
              <Gift className="mx-auto size-12 text-foreground/20" />
            )}
            <p className="mt-4 text-foreground/40">
              {t("emptyState")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isOwner={isOwner}
                isLoggedIn={isLoggedIn}
                ownerVisibility={wishlist.ownerVisibility}
                onClaim={() => openClaimDialog(product)}
                onReserve={() => openReserveDialog(product)}
                onUnclaim={() => handleUnclaim(product.id)}
                onUpgrade={() => handleUpgradeToBought(product)}
                onAuthRequired={(type) => handleAuthRequired(product, type)}
              />
            ))}
          </div>
        )}

        {/* Claim Dialog */}
        <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{t("claimTitle")}</DialogTitle>
              <DialogDescription>
                {selectedProduct?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <>
                {selectedProduct.imageUrl && (
                  <div className="flex justify-center">
                    <ProductImage
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="h-24 w-24 rounded-lg object-contain"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="claim-message">{t("messageLabel")}</Label>
                    <Textarea
                      id="claim-message"
                      placeholder={t("messagePlaceholder")}
                      value={claimMessage}
                      onChange={(e) => setClaimMessage(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="rounded-lg border-2 bg-card"
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    onClick={() => handleClaim("bought")}
                    disabled={submitting}
                    className="w-full"
                  >
                    <ShoppingBag className="size-4" />
                    {submitting ? "..." : t("buyAndMark")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setClaimDialogOpen(false)}
                    className="w-full"
                  >
                    {tCommon("cancel")}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Reserve Dialog */}
        <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{t("reserveTitle")}</DialogTitle>
              <DialogDescription>
                {selectedProduct?.title}
              </DialogDescription>
            </DialogHeader>
            {selectedProduct && (
              <>
                {selectedProduct.imageUrl && (
                  <div className="flex justify-center">
                    <ProductImage
                      src={selectedProduct.imageUrl}
                      alt={selectedProduct.title}
                      className="h-24 w-24 rounded-lg object-contain"
                    />
                  </div>
                )}
                <p className="text-sm text-foreground/60">
                  {t("reserveText")}
                </p>
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    onClick={() => handleClaim("reserved")}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "..." : t("reserve")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setReserveDialogOpen(false)}
                    className="w-full"
                  >
                    {tCommon("cancel")}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Auth Dialog */}
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={(open) => {
            setAuthDialogOpen(open);
            if (!open) setPendingAction(null);
          }}
          onSuccess={handleAuthSuccess}
        />

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center text-xs text-foreground/40">
          <p>
            {t("affiliateDisclosure")}
          </p>
          <p className="mt-2">
            {t("createdWith")}{" "}
            <Link href="/" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              <Image src="/wunschkiste-logo.svg" alt="" width={16} height={16} className="size-4 logo-light" />
              <Image src="/wunschkiste-logo-dark.svg" alt="" width={16} height={16} className="size-4 logo-dark" />
              Wunschkiste
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}

function ProductCard({
  product,
  isOwner,
  isLoggedIn,
  ownerVisibility,
  onClaim,
  onReserve,
  onUnclaim,
  onUpgrade,
  onAuthRequired,
}: {
  product: Product;
  isOwner: boolean;
  isLoggedIn: boolean;
  ownerVisibility: string;
  onClaim: () => void;
  onReserve: () => void;
  onUnclaim: () => void;
  onUpgrade: () => void;
  onAuthRequired: (type: "buy" | "reserve") => void;
}) {
  const t = useTranslations("share");
  const tCommon = useTranslations("common");
  const isClaimed = product.status !== "available";
  const isMine = product.claimedByMe;

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all ${
        isClaimed && !isMine ? "opacity-60" : ""
      }`}
    >
      <ProductImage
        src={product.imageUrl}
        alt={product.title}
        className="size-20 shrink-0 rounded-lg object-contain"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium leading-snug line-clamp-2">{product.title}</h3>
        <div className="mt-1 flex items-center gap-3 text-sm text-foreground/50">
          {product.price && (
            <span className="font-semibold text-foreground">
              {formatPrice(product.price, product.currency)}
            </span>
          )}
          {product.shopName && <span>{product.shopName}</span>}
        </div>

        {/* Status badges */}
        {isClaimed && (
          <div className="mt-2">
            {product.status === "bought" ? (
              <Badge variant="default" className="bg-green-600">
                <Check className="mr-1 size-3" />
                {t("bought")}
                {product.claimedByName && !isOwner && ` ${tCommon("from", { name: product.claimedByName })}`}
                {isOwner && ownerVisibility === "full" && product.claimedByName && ` ${tCommon("from", { name: product.claimedByName })}`}
              </Badge>
            ) : (
              <Badge variant="secondary">
                {t("reserved")}
                {product.claimedByName && !isOwner && ` ${tCommon("from", { name: product.claimedByName })}`}
                {isOwner && ownerVisibility === "full" && product.claimedByName && ` ${tCommon("from", { name: product.claimedByName })}`}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 flex-col gap-2">
        {!isOwner && isLoggedIn && (
          <>
            {product.status === "available" && (
              <>
                <Button size="sm" onClick={onClaim}>
                  <ShoppingBag className="size-4" />
                  {t("buy")}
                </Button>
                <Button size="sm" variant="outline" onClick={onReserve}>
                  {t("reserve")}
                </Button>
              </>
            )}

            {isMine && product.status === "reserved" && (
              <>
                <Button size="sm" onClick={onUpgrade}>
                  <ShoppingBag className="size-4" />
                  {t("buyNow")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUnclaim}
                  className="text-destructive hover:text-destructive"
                >
                  <Undo2 className="size-3" />
                  {t("unreserve")}
                </Button>
              </>
            )}

            {isMine && product.status === "bought" && (
              <>
                <Button size="sm" variant="outline" disabled>
                  <Check className="size-4" />
                  {t("bought")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUnclaim}
                  className="text-destructive hover:text-destructive"
                >
                  <Undo2 className="size-3" />
                  {t("undo")}
                </Button>
              </>
            )}
          </>
        )}

        {!isOwner && !isLoggedIn && product.status === "available" && (
          <>
            <Button size="sm" onClick={() => onAuthRequired("buy")}>
              <ShoppingBag className="size-4" />
              {t("buy")}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onAuthRequired("reserve")}>
              {t("reserve")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
