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
import { Gift, Check, ShoppingBag, Calendar, LogIn, Undo2 } from "lucide-react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ChristmasDecorations, ChristmasHeaderStar, ChristmasEmptyState } from "@/components/themes/christmas-decorations";
import { MainNav } from "@/components/main-nav";

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

const themeEmojis: Record<string, string> = {
  standard: "🎁",
  birthday: "🎂",
  christmas: "🎄",
};

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
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [claimMessage, setClaimMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        <p className="text-foreground/40">Laden...</p>
      </main>
    );
  }

  if (isError || !wishlist) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <Gift className="size-16 text-foreground/20" />
        <h1 className="font-serif text-2xl">Wunschkiste nicht gefunden</h1>
        <p className="text-foreground/50">
          Diese Wunschkiste existiert nicht oder ist nicht mehr öffentlich.
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
          <span className="text-5xl">{themeEmojis[wishlist.theme]}</span>
          <h1 className="mt-4 font-serif text-4xl md:text-5xl">{wishlist.title}</h1>
          {wishlist.ownerName && (
            <p className="mt-3 text-foreground/50">
              von {wishlist.ownerName}
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
                <Badge variant="secondary">Anlass vorbei</Badge>
              )}
            </p>
          )}
        </div>

        {/* Not logged in hint */}
        {!isLoggedIn && !isOwner && (
          <div className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-center">
            <LogIn className="mx-auto mb-2 size-5 text-primary" />
            <p className="text-sm text-foreground/70">
              <Link
                href={`/login?callbackUrl=/share/${token}`}
                className="font-medium text-primary hover:underline"
              >
                Anmelden
              </Link>
              {" "}um Geschenke zu reservieren oder als gekauft zu markieren.
            </p>
          </div>
        )}

        {/* Owner surprise mode banner */}
        {isOwner && wishlist.ownerVisibility === "surprise" && wishlist.claimedCount !== undefined && (
          <div className="mb-8 rounded-xl border-2 border-border bg-card p-4 text-center">
            <p className="text-lg font-medium">
              {wishlist.claimedCount} von {wishlist.totalCount} Wünschen sind vergeben
            </p>
            <p className="mt-1 text-sm text-foreground/50">
              Du hast den Überraschungs-Modus aktiviert — du siehst nicht, wer was besorgt.
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
              Diese Wunschkiste ist noch leer.
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
                token={token}
                onClaim={() => openClaimDialog(product)}
                onUnclaim={() => handleUnclaim(product.id)}
                onUpgrade={() => handleUpgradeToBought(product)}
              />
            ))}
          </div>
        )}

        {/* Claim Dialog */}
        <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Wunsch beanspruchen</DialogTitle>
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
                    <Label htmlFor="claim-message">Nachricht (optional)</Label>
                    <Textarea
                      id="claim-message"
                      placeholder="Eine Nachricht für den Beschenkten..."
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
                    {submitting ? "..." : "Zum Shop & als gekauft markieren"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleClaim("reserved")}
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? "..." : "Erst mal reservieren"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setClaimDialogOpen(false)}
                    className="w-full"
                  >
                    Abbrechen
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center text-xs text-foreground/40">
          <p>
            Diese Seite enthält Affiliate-Links. Bei einem Kauf erhalten wir eine kleine Provision.
          </p>
          <p className="mt-2">
            Erstellt mit{" "}
            <Link href="/" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              <Image src="/wunschkiste-logo.svg" alt="" width={16} height={16} className="size-4" />
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
  token,
  onClaim,
  onUnclaim,
  onUpgrade,
}: {
  product: Product;
  isOwner: boolean;
  isLoggedIn: boolean;
  ownerVisibility: string;
  token: string;
  onClaim: () => void;
  onUnclaim: () => void;
  onUpgrade: () => void;
}) {
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
              {product.price} {product.currency}
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
                Gekauft
                {product.claimedByName && !isOwner && ` von ${product.claimedByName}`}
                {isOwner && ownerVisibility === "full" && product.claimedByName && ` von ${product.claimedByName}`}
              </Badge>
            ) : (
              <Badge variant="secondary">
                Reserviert
                {product.claimedByName && !isOwner && ` von ${product.claimedByName}`}
                {isOwner && ownerVisibility === "full" && product.claimedByName && ` von ${product.claimedByName}`}
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
              <Button size="sm" onClick={onClaim}>
                <ShoppingBag className="size-4" />
                Kaufen
              </Button>
            )}

            {isMine && product.status === "reserved" && (
              <>
                <Button size="sm" onClick={onUpgrade}>
                  <ShoppingBag className="size-4" />
                  Jetzt kaufen
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUnclaim}
                  className="text-destructive hover:text-destructive"
                >
                  <Undo2 className="size-3" />
                  Aufheben
                </Button>
              </>
            )}

            {isMine && product.status === "bought" && (
              <>
                <Button size="sm" variant="outline" disabled>
                  <Check className="size-4" />
                  Gekauft
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onUnclaim}
                  className="text-destructive hover:text-destructive"
                >
                  <Undo2 className="size-3" />
                  Rückgängig
                </Button>
              </>
            )}
          </>
        )}

        {!isOwner && !isLoggedIn && product.status === "available" && (
          <Link href={`/login?callbackUrl=/share/${token}`}>
            <Button size="sm" variant="outline">
              <LogIn className="size-4" />
              Anmelden
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
