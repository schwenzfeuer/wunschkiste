"use client";

import { useState, useEffect, use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gift, ExternalLink, Check, ShoppingBag } from "lucide-react";

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

const themeLabels: Record<string, string> = {
  standard: "Standard",
  birthday: "Geburtstag",
  christmas: "Weihnachten",
  wedding: "Hochzeit",
  baby: "Baby",
};

const themeColors: Record<string, string> = {
  standard: "bg-background",
  birthday: "bg-pink-50",
  christmas: "bg-red-50",
  wedding: "bg-purple-50",
  baby: "bg-blue-50",
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
        <p className="text-muted-foreground">Laden...</p>
      </main>
    );
  }

  if (error || !wishlist) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Gift className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Wunschliste nicht gefunden</h1>
        <p className="text-muted-foreground">
          Diese Wunschliste existiert nicht oder ist nicht mehr öffentlich.
        </p>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${themeColors[wishlist.theme] || "bg-background"}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <Badge variant="secondary" className="mb-4">
            {themeLabels[wishlist.theme]}
          </Badge>
          <h1 className="text-3xl font-bold">{wishlist.title}</h1>
          {wishlist.ownerName && (
            <p className="mt-2 text-muted-foreground">
              von {wishlist.ownerName}
            </p>
          )}
          {wishlist.description && (
            <p className="mt-4 text-muted-foreground">{wishlist.description}</p>
          )}
        </div>

        {wishlist.products.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Gift className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">
                Diese Wunschliste ist noch leer.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wishlist.products.map((product) => (
              <Card
                key={product.id}
                className={product.isReserved ? "opacity-60" : ""}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 text-base">
                      {product.title}
                    </CardTitle>
                    {product.isReserved && (
                      <Badge variant="secondary" className="shrink-0">
                        <Check className="mr-1 h-3 w-3" />
                        Reserviert
                      </Badge>
                    )}
                  </div>
                  {product.shopName && (
                    <CardDescription>{product.shopName}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {product.imageUrl && (
                    <div className="mb-4 flex justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-32 w-32 rounded-md object-contain"
                      />
                    </div>
                  )}
                  {product.price && (
                    <p className="mb-4 text-center text-lg font-semibold">
                      {product.price} {product.currency}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={product.affiliateUrl || product.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        <ShoppingBag className="mr-2 h-4 w-4" />
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
                          <Button>Reservieren</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Wunsch reservieren</DialogTitle>
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
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <footer className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            Diese Seite enthält Affiliate-Links. Bei einem Kauf erhalten wir eine kleine Provision.
          </p>
          <p className="mt-2">
            Erstellt mit{" "}
            <a href="/" className="text-primary hover:underline">
              Wunschkiste
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
