"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, ExternalLink, Share2, Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  originalUrl: string;
  affiliateUrl: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string;
  shopName: string | null;
}

interface Wishlist {
  id: string;
  title: string;
  description: string | null;
  theme: string;
  shareToken: string;
}

interface ProductData {
  title: string | null;
  image: string | null;
  price: string | null;
  currency: string | null;
  shopName: string | null;
}

const themeLabels: Record<string, string> = {
  standard: "Standard",
  birthday: "Geburtstag",
  christmas: "Weihnachten",
  wedding: "Hochzeit",
  baby: "Baby",
};

export default function WishlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [scrapedData, setScrapedData] = useState<ProductData | null>(null);
  const [productTitle, setProductTitle] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchData() {
      const [wishlistRes, productsRes] = await Promise.all([
        fetch(`/api/wishlists/${id}`),
        fetch(`/api/wishlists/${id}/products`),
      ]);

      if (!wishlistRes.ok) {
        router.push("/dashboard");
        return;
      }

      setWishlist(await wishlistRes.json());
      setProducts(await productsRes.json());
      setLoading(false);
    }

    if (session) {
      fetchData();
    }
  }, [session, id, router]);

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
      const product = await response.json();
      setProducts([...products, product]);
      setAddDialogOpen(false);
      setNewUrl("");
      setScrapedData(null);
      setProductTitle("");
    }
    setAdding(false);
  }

  async function handleDeleteProduct(productId: string) {
    if (!confirm("Produkt wirklich löschen?")) return;

    const response = await fetch(`/api/wishlists/${id}/products/${productId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setProducts(products.filter((p) => p.id !== productId));
    }
  }

  function handleShare() {
    if (!wishlist) return;
    const shareUrl = `${window.location.origin}/share/${wishlist.shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Link kopiert!");
  }

  if (isPending || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Laden...</p>
      </main>
    );
  }

  if (!session || !wishlist) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück zum Dashboard
        </Link>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{wishlist.title}</h1>
              <Badge variant="secondary">{themeLabels[wishlist.theme]}</Badge>
            </div>
            {wishlist.description && (
              <p className="mt-2 text-muted-foreground">{wishlist.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Link teilen
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Wunsch hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Wunsch hinzufügen</DialogTitle>
                  <DialogDescription>
                    Füge einen Produktlink hinzu. Die Daten werden automatisch extrahiert.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="url">Produkt-URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="url"
                        placeholder="https://www.amazon.de/dp/..."
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleScrape}
                        disabled={!newUrl || scraping}
                      >
                        {scraping ? <Loader2 className="h-4 w-4 animate-spin" /> : "Laden"}
                      </Button>
                    </div>
                  </div>

                  {scrapedData && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="title">Titel *</Label>
                        <Input
                          id="title"
                          value={productTitle}
                          onChange={(e) => setProductTitle(e.target.value)}
                          required
                        />
                      </div>

                      {scrapedData.image && (
                        <div className="flex justify-center">
                          <img
                            src={scrapedData.image}
                            alt={productTitle}
                            className="h-32 w-32 rounded-md object-contain"
                          />
                        </div>
                      )}

                      {scrapedData.price && (
                        <p className="text-center text-lg font-semibold">
                          {scrapedData.price} {scrapedData.currency}
                        </p>
                      )}

                      {scrapedData.shopName && (
                        <p className="text-center text-sm text-muted-foreground">
                          von {scrapedData.shopName}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAddDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button
                    onClick={handleAddProduct}
                    disabled={!productTitle || !newUrl || adding}
                  >
                    {adding ? "Hinzufügen..." : "Hinzufügen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <p className="text-muted-foreground">
                Noch keine Wünsche. Füge deinen ersten Wunsch hinzu!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2 text-base">
                      {product.title}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                        className="h-24 w-24 rounded-md object-contain"
                      />
                    </div>
                  )}
                  {product.price && (
                    <p className="mb-4 text-center text-lg font-semibold">
                      {product.price} {product.currency}
                    </p>
                  )}
                  <a
                    href={product.affiliateUrl || product.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Zum Shop
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
