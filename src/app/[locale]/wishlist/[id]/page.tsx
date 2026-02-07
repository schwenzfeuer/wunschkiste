"use client";

import { useState, useEffect, use } from "react";
import { useRouter, Link } from "@/i18n/routing";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProductImage } from "@/components/product-image";
import { ThemeCard } from "@/components/theme-card";
import { ArrowLeft, Plus, Trash2, ExternalLink, Share2, Loader2, Pencil } from "lucide-react";
import { ChristmasDecorations } from "@/components/themes/christmas-decorations";
import { MainNav } from "@/components/main-nav";

const themes = [
  { value: "standard", label: "Standard" },
  { value: "birthday", label: "Geburtstag" },
  { value: "christmas", label: "Weihnachten" },
];

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
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [saving, setSaving] = useState(false);

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

  async function handleThemeChange(newTheme: string) {
    if (!wishlist || newTheme === wishlist.theme) return;

    const response = await fetch(`/api/wishlists/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    });

    if (response.ok) {
      setWishlist({ ...wishlist, theme: newTheme });
    }
  }

  function openEditDialog(product: Product) {
    setEditProduct(product);
    setEditTitle(product.title);
    setEditPrice(product.price || "");
  }

  async function handleEditProduct() {
    if (!editProduct || !editTitle) return;
    setSaving(true);

    const response = await fetch(`/api/wishlists/${id}/products/${editProduct.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        price: editPrice || null,
      }),
    });

    if (response.ok) {
      const updated = await response.json();
      setProducts(products.map((p) => (p.id === updated.id ? updated : p)));
      setEditProduct(null);
    }
    setSaving(false);
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
        <p className="text-foreground/40">Laden...</p>
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
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-8">
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">{wishlist.title}</h1>
            {wishlist.description && (
              <p className="mt-2 text-foreground/50">{wishlist.description}</p>
            )}
            {/* TODO: Theme-Auswahl für Post-MVP reaktivieren
            <div className="mt-3 flex gap-2">
              {themes.map((t) => (
                <ThemeCard
                  key={t.value}
                  value={t.value}
                  label={t.label}
                  active={wishlist.theme === t.value}
                  onClick={() => handleThemeChange(t.value)}
                />
              ))}
            </div>
            */}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="size-4" />
              Teilen
            </Button>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="size-4" />
                  Wunsch hinzufügen
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl">Wunsch hinzufügen</DialogTitle>
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
                        className="h-11 rounded-lg border-2 bg-card"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleScrape}
                        disabled={!newUrl || scraping}
                      >
                        {scraping ? <Loader2 className="size-4 animate-spin" /> : "Laden"}
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
                            {scrapedData.price} {scrapedData.currency}
                          </span>
                        )}
                        {scrapedData.shopName && (
                          <span>von {scrapedData.shopName}</span>
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
          <div className="py-20 text-center">
            <p className="text-foreground/40">
              Noch keine Wünsche. Füge deinen ersten Wunsch hinzu!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex items-center gap-4 rounded-xl border-2 border-border bg-card p-4 transition-colors hover:border-primary/20"
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={product.title}
                  className="size-16 shrink-0 rounded-lg object-contain"
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
                </div>
                <div className="flex items-center gap-1 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEditDialog(product)}>
                    <Pencil className="size-4" />
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
                    onClick={() => handleDeleteProduct(product.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Edit Dialog */}
        <Dialog open={!!editProduct} onOpenChange={(open) => !open && setEditProduct(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">Wunsch bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titel *</Label>
                <Input
                  id="edit-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Preis</Label>
                <Input
                  id="edit-price"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="z.B. 29.99"
                  className="h-11 rounded-lg border-2 bg-card"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditProduct(null)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditProduct} disabled={!editTitle || saving}>
                {saving ? "Speichern..." : "Speichern"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}
