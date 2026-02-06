"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift, Check, ShoppingBag, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  title: string;
  originalUrl: string;
  affiliateUrl: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string;
  shopName: string | null;
  isReserved: boolean;
}

interface SharedWishlist {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  ownerName: string | null;
  products: Product[];
}

const themeEmojis: Record<string, string> = {
  standard: "🎁",
  birthday: "🎂",
  christmas: "🎄",
  wedding: "💒",
  baby: "👶",
};

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [wishlist, setWishlist] = useState<SharedWishlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reserveName, setReserveName] = useState("");
  const [reserveMessage, setReserveMessage] = useState("");
  const [reserving, setReserving] = useState(false);

  useEffect(() => {
    async function fetchWishlist() {
      const response = await fetch(`/api/share/${token}`);
      if (response.ok) {
        setWishlist(await response.json());
      } else {
        setError(true);
      }
      setLoading(false);
    }

    fetchWishlist();
  }, [token]);

  async function handleReserve() {
    if (!selectedProduct || !reserveName) return;
    setReserving(true);

    const response = await fetch(`/api/share/${token}/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct.id,
        reservedByName: reserveName,
        message: reserveMessage || undefined,
      }),
    });

    if (response.ok) {
      setWishlist((prev) =>
        prev
          ? {
              ...prev,
              products: prev.products.map((p) =>
                p.id === selectedProduct.id ? { ...p, isReserved: true } : p
              ),
            }
          : null
      );
      setReserveDialogOpen(false);
      setSelectedProduct(null);
      setReserveName("");
      setReserveMessage("");
    }
    setReserving(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/40">Laden...</p>
      </main>
    );
  }

  if (error || !wishlist) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <Gift className="size-16 text-foreground/20" />
        <h1 className="font-serif text-2xl">Wunschliste nicht gefunden</h1>
        <p className="text-foreground/50">
          Diese Wunschliste existiert nicht oder ist nicht mehr öffentlich.
        </p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen transition-colors"
      data-theme={wishlist.theme !== "standard" ? wishlist.theme : undefined}
    >
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
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
        </div>

        {/* Products */}
        {wishlist.products.length === 0 ? (
          <div className="py-20 text-center">
            <Gift className="mx-auto size-12 text-foreground/20" />
            <p className="mt-4 text-foreground/40">
              Diese Wunschliste ist noch leer.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {wishlist.products.map((product) => (
              <div
                key={product.id}
                className={`flex items-center gap-4 rounded-xl border-2 border-border bg-card p-4 transition-all ${
                  product.isReserved ? "opacity-50" : ""
                }`}
              >
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="size-20 shrink-0 rounded-lg object-contain"
                  />
                )}
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
                  {product.isReserved && (
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                      <Check className="size-3" />
                      Reserviert
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <a
                    href={product.affiliateUrl || product.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ShoppingBag className="size-4" />
                      Kaufen
                    </Button>
                  </a>
                  {!product.isReserved && (
                    <Dialog
                      open={reserveDialogOpen && selectedProduct?.id === product.id}
                      onOpenChange={(open) => {
                        setReserveDialogOpen(open);
                        if (open) setSelectedProduct(product);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm">Reservieren</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="font-serif text-xl">Wunsch reservieren</DialogTitle>
                          <DialogDescription>
                            Reserviere diesen Wunsch, damit niemand anderes das gleiche Geschenk kauft.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Dein Name *</Label>
                            <Input
                              id="name"
                              placeholder="z.B. Oma Helga"
                              value={reserveName}
                              onChange={(e) => setReserveName(e.target.value)}
                              required
                              className="h-11 rounded-lg border-2 bg-card"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">Nachricht (optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="Eine Nachricht für den Beschenkten..."
                              value={reserveMessage}
                              onChange={(e) => setReserveMessage(e.target.value)}
                              rows={3}
                              className="rounded-lg border-2 bg-card"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="ghost"
                            onClick={() => setReserveDialogOpen(false)}
                          >
                            Abbrechen
                          </Button>
                          <Button
                            onClick={handleReserve}
                            disabled={!reserveName || reserving}
                          >
                            {reserving ? "Reservieren..." : "Reservieren"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8 text-center text-xs text-foreground/40">
          <p>
            Diese Seite enthält Affiliate-Links. Bei einem Kauf erhalten wir eine kleine Provision.
          </p>
          <p className="mt-2">
            Erstellt mit{" "}
            <Link href="/" className="font-medium text-primary hover:underline">
              Wunschkiste
            </Link>
          </p>
        </footer>
      </div>
    </main>
  );
}
