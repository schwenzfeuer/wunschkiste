"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductImage } from "@/components/product-image";
import { AuthDialog } from "@/components/auth-dialog";
import { UserAvatar } from "@/components/user-avatar";
import { Gift, Check, ShoppingBag, Calendar, Undo2, Heart, Bookmark, ExternalLink, PencilLine, UserCog, Star, Users } from "lucide-react";
import { Link } from "@/i18n/routing";
import { ChristmasDecorations, ChristmasHeaderStar, ChristmasEmptyState } from "@/components/themes/christmas-decorations";
import { MainNav } from "@/components/main-nav";
import { formatPrice, getCountdownDays } from "@/lib/format";
import { useWishlistSync } from "@/hooks/use-wishlist-sync";
import { useChat } from "@/hooks/use-chat";
import { ChatPanel } from "@/components/chat/chat-panel";
import { ChatFab } from "@/components/chat/chat-fab";
import { useTranslations } from "next-intl";
import { trackEvent } from "@/lib/tracking";

interface Product {
  id: string;
  title: string;
  originalUrl: string;
  affiliateUrl: string | null;
  imageUrl: string | null;
  price: string | null;
  currency: string;
  shopName: string | null;
  priority: number | null;
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
  isEditor: boolean;
  isLoggedIn: boolean;
  participants: { name: string | null; image: string | null }[];
  claimedCount?: number;
  totalCount?: number;
  products: Product[];
  unreadChatCount?: number;
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

export default function SharePageContent({
  token,
  initialData,
}: {
  token: string;
  initialData?: SharedWishlist | null;
}) {
  const t = useTranslations("share");
  const tCommon = useTranslations("common");
  const tCountdown = useTranslations("countdown");
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDismissed, setAuthDismissed] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ product: Product; type: "buy" | "reserve" } | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const { data: wishlist, isLoading, isError } = useQuery<SharedWishlist>({
    queryKey: ["share", token],
    queryFn: async () => {
      const response = await fetch(`/api/share/${token}`);
      if (!response.ok) throw new Error("Not found");
      return response.json();
    },
    initialData: initialData ?? undefined,
  });

  const chat = useChat(wishlist?.id ?? "", chatOpen);
  useWishlistSync(wishlist?.id, [["share", token]], (msg: Record<string, unknown>) => {
    chat.onChatMessage(msg);
    queryClient.invalidateQueries({ queryKey: ["share", token] });
  });

  useEffect(() => {
    if (wishlist?.id) {
      window.dispatchEvent(new CustomEvent("share:wishlist-id", { detail: wishlist.id }));
    }
  }, [wishlist?.id]);

  useEffect(() => {
    trackEvent("page_view", { shareToken: token });
  }, [token]);

  useEffect(() => {
    function handleToolbarChat() {
      setChatOpen(true);
    }
    window.addEventListener("toolbar:toggle-chat", handleToolbarChat);
    return () => window.removeEventListener("toolbar:toggle-chat", handleToolbarChat);
  }, []);

  const [initialAuthChecked, setInitialAuthChecked] = useState(false);
  if (wishlist && !initialAuthChecked) {
    setInitialAuthChecked(true);
    if (!wishlist.isLoggedIn && !session && !authDismissed) {
      setAuthDialogOpen(true);
    }
  }

  function openClaimDialog(product: Product) {
    setSelectedProduct(product);
    setClaimDialogOpen(true);
  }

  function openReserveDialog(product: Product) {
    setSelectedProduct(product);
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

  // Optimistic update: Claim (reserve/buy)
  const claimMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: string; status: "reserved" | "bought" }) => {
      const response = await fetch(`/api/share/${token}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, status }),
      });
      if (!response.ok) throw new Error("Failed to reserve");
      return { productId, status };
    },
    onMutate: async ({ productId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["share", token] });
      const previous = queryClient.getQueryData<SharedWishlist>(["share", token]);
      queryClient.setQueryData<SharedWishlist>(["share", token], (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map((p) =>
            p.id === productId ? { ...p, status, claimedByMe: true, claimedByName: session?.user?.name ?? null } : p
          ),
        };
      });
      return { previous };
    },
    onSuccess: ({ productId, status }) => {
      setClaimDialogOpen(false);
      setReserveDialogOpen(false);
      if (status === "bought") {
        const product = wishlist?.products.find((p) => p.id === productId);
        if (product) {
          trackEvent("affiliate_click", {
            shop: product.shopName || "unknown",
            productId: product.id,
            wishlistId: wishlist?.id || "",
          });
          window.open(product.affiliateUrl || product.originalUrl, "_blank", "noopener");
        }
      }
      setSelectedProduct(null);
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["share", token], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["share", token] }),
  });

  // Optimistic update: Unclaim
  const unclaimMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await fetch(
        `/api/share/${token}/reserve?productId=${productId}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to unclaim");
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["share", token] });
      const previous = queryClient.getQueryData<SharedWishlist>(["share", token]);
      queryClient.setQueryData<SharedWishlist>(["share", token], (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map((p) =>
            p.id === productId ? { ...p, status: "available" as const, claimedByMe: false, claimedByName: null } : p
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["share", token], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["share", token] }),
  });

  // Optimistic update: Upgrade reserved → bought
  const upgradeMutation = useMutation({
    mutationFn: async (product: Product) => {
      const response = await fetch(`/api/share/${token}/reserve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      if (!response.ok) throw new Error("Failed to upgrade");
      return product;
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: ["share", token] });
      const previous = queryClient.getQueryData<SharedWishlist>(["share", token]);
      queryClient.setQueryData<SharedWishlist>(["share", token], (old) => {
        if (!old) return old;
        return {
          ...old,
          products: old.products.map((p) =>
            p.id === product.id ? { ...p, status: "bought" as const } : p
          ),
        };
      });
      return { previous };
    },
    onSuccess: (product) => {
      trackEvent("affiliate_click", {
        shop: product.shopName || "unknown",
        productId: product.id,
        wishlistId: wishlist?.id || "",
      });
      window.open(product.affiliateUrl || product.originalUrl, "_blank", "noopener");
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["share", token], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["share", token] }),
  });

  function handleClaim(status: "reserved" | "bought") {
    if (!selectedProduct) return;
    claimMutation.mutate({ productId: selectedProduct.id, status });
  }

  function handleUnclaim(productId: string) {
    unclaimMutation.mutate(productId);
  }

  function handleUpgradeToBought(product: Product) {
    upgradeMutation.mutate(product);
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
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 sm:px-6">
        <Gift className="size-16 text-foreground/20" />
        <h1 className="font-serif text-2xl">{t("notFoundTitle")}</h1>
        <p className="text-foreground/50">
          {t("notFoundText")}
        </p>
      </main>
    );
  }

  const isOwner = wishlist.isOwner;
  const isEditor = wishlist.isEditor;
  const isLoggedIn = wishlist.isLoggedIn;

  return (
    <main
      className="min-h-screen bg-background transition-colors"
      data-theme={wishlist.theme !== "standard" ? wishlist.theme : undefined}
    >
      <MainNav />
      {wishlist.theme === "christmas" && <ChristmasDecorations />}
      <div className="mx-auto max-w-2xl px-4 pt-24 pb-12 sm:px-6 sm:pt-28">
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
          {wishlist.eventDate && (() => {
            const countdownDays = getCountdownDays(wishlist.eventDate);
            return (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-foreground/50">
                <Calendar className="size-4" />
                {formatEventDate(wishlist.eventDate)}
                {isEventPast(wishlist.eventDate) ? (
                  <Badge variant="secondary">{t("eventPassed")}</Badge>
                ) : countdownDays !== null ? (
                  <Badge className="bg-accent text-accent-foreground">
                    {countdownDays === 0
                      ? tCountdown("today")
                      : countdownDays === 1
                        ? tCountdown("tomorrow")
                        : tCountdown("daysLeft", { days: countdownDays })}
                  </Badge>
                ) : null}
              </p>
            );
          })()}
          {isEditor && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Badge variant="secondary">
                <UserCog className="mr-1 size-3" />
                {t("coEditor")}
              </Badge>
              <Link href={{ pathname: "/wishlist/[id]", params: { id: wishlist.id } }}>
                <Button variant="outline" size="sm">
                  <PencilLine className="size-4" />
                  {t("editWishlist")}
                </Button>
              </Link>
            </div>
          )}
          {wishlist.participants.length > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex -space-x-1.5">
                {wishlist.participants.slice(0, 5).map((p, i) => (
                  <UserAvatar
                    key={i}
                    name={p.name}
                    imageUrl={p.image}
                    size="xs"
                    className="ring-2 ring-background"
                  />
                ))}
              </div>
              <Button
                variant="accent"
                size="xs"
                onClick={() => setParticipantsOpen(true)}
              >
                <Users className="size-3" />
                {t("participants", { count: wishlist.participants.length })}
              </Button>
            </div>
          )}
        </div>

        {/* Join button for unauthenticated users who dismissed the dialog */}
        {!isLoggedIn && !session && authDismissed && (
          <div className="mb-8 text-center">
            <Button
              size="lg"
              onClick={() => {
                setAuthDismissed(false);
                setAuthDialogOpen(true);
              }}
            >
              {t("join")}
            </Button>
          </div>
        )}

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
            {[...wishlist.products].sort((a, b) => {
              const prioA = a.priority ?? 4;
              const prioB = b.priority ?? 4;
              if (prioA !== prioB) return prioA - prioB;
              const order = { available: 0, reserved: 1, bought: 2 };
              return (order[a.status] ?? 0) - (order[b.status] ?? 0);
            }).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlistId={wishlist.id}
                isOwner={isOwner}
                isEditor={isEditor}
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
                <DialogFooter className="flex-col gap-2 sm:flex-col">
                  <Button
                    onClick={() => handleClaim("bought")}
                    disabled={claimMutation.isPending}
                    className="w-full"
                  >
                    {selectedProduct?.affiliateUrl ? <Heart className="size-4" /> : <ShoppingBag className="size-4" />}
                    {claimMutation.isPending ? "..." : t("buyAndMark")}
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
                    disabled={claimMutation.isPending}
                    className="w-full"
                  >
                    {claimMutation.isPending ? "..." : t("reserve")}
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

        {/* Participants Dialog */}
        <Dialog open={participantsOpen} onOpenChange={setParticipantsOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{t("participantsTitle")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {wishlist.participants.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <UserAvatar name={p.name} imageUrl={p.image} size="sm" />
                  <span className="text-sm font-medium">{p.name || "?"}</span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Auth Dialog */}
        <AuthDialog
          open={authDialogOpen}
          onOpenChange={(open) => {
            setAuthDialogOpen(open);
            if (!open) {
              setPendingAction(null);
              setAuthDismissed(true);
            }
          }}
          onSuccess={handleAuthSuccess}
          title={!wishlist.isLoggedIn && !session ? t("joinTitle", { title: wishlist.title }) : undefined}
        />

        {/* CTA for logged-in non-owners */}
        {isLoggedIn && !isOwner && !isEditor && (
          <div className="mt-12 rounded-xl border-2 border-accent/30 bg-accent/5 p-6 text-center">
            <h2 className="font-serif text-xl">{t("ctaTitle")}</h2>
            <p className="mt-2 text-sm text-foreground/50">{t("ctaText")}</p>
            <Link href="/dashboard">
              <Button
                variant="accent"
                size="lg"
                className="mt-4"
                onClick={() => trackEvent("cta_click", { location: "share_page" })}
              >
                {t("ctaButton")}
              </Button>
            </Link>
          </div>
        )}

      </div>

      {isLoggedIn && !(isOwner && wishlist.ownerVisibility === "surprise") && (
        <>
          <ChatFab onClick={() => setChatOpen(true)} unreadCount={wishlist.unreadChatCount ?? 0} />
          <ChatPanel
            wishlistTitle={wishlist.title}
            open={chatOpen}
            onOpenChange={setChatOpen}
            messages={chat.messages}
            isLoading={chat.isLoading}
            hasMore={chat.hasMore}
            isLoadingMore={chat.isLoadingMore}
            loadMore={chat.loadMore}
            sendMessage={(content) => chat.sendMessage(content)}
            isSending={chat.isSending}
          />
        </>
      )}
    </main>
  );
}

function ProductCard({
  product,
  wishlistId,
  isOwner,
  isEditor,
  isLoggedIn,
  ownerVisibility,
  onClaim,
  onReserve,
  onUnclaim,
  onUpgrade,
  onAuthRequired,
}: {
  product: Product;
  wishlistId: string;
  isOwner: boolean;
  isEditor: boolean;
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
  const productUrl = product.affiliateUrl || product.originalUrl;
  const isAffiliate = !!product.affiliateUrl;

  function handleAffiliateClick() {
    trackEvent("affiliate_click", {
      shop: product.shopName || "unknown",
      productId: product.id,
      wishlistId,
    });
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border-2 bg-card p-3 transition-all sm:gap-4 sm:p-4 ${
        product.priority ? "border-accent/40" : "border-border"
      } ${isClaimed && !isMine ? "opacity-60" : ""}`}
    >
      <a
        href={productUrl}
        target="_blank"
        rel={isAffiliate ? "sponsored nofollow noopener" : "noopener"}
        className="shrink-0"
        onClick={handleAffiliateClick}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.title}
          className="size-16 shrink-0 rounded-lg object-contain"
        />
      </a>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium leading-snug truncate" title={product.title}>
            <a
              href={productUrl}
              target="_blank"
              rel={isAffiliate ? "sponsored nofollow noopener" : "noopener"}
              className="hover:underline"
              onClick={handleAffiliateClick}
            >
              {product.title}
              <ExternalLink className="ml-1 inline size-3 text-foreground/30" />
            </a>
          </h3>
          {product.priority && (
            <Badge className="bg-accent text-accent-foreground shrink-0">
              <Star className="mr-1 size-3" />
              {t(`priority${product.priority}` as "priority1" | "priority2" | "priority3")}
            </Badge>
          )}
        </div>
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
          <div className="mt-1.5 flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-2">
            {product.status === "bought" ? (
              <Badge className="bg-accent text-accent-foreground">
                <Check className="mr-1 size-3" />
                {t("bought")}
              </Badge>
            ) : (
              <Badge variant="outline" className="border-accent text-accent">
                <Bookmark className="mr-1 size-3" />
                {t("reserved")}
              </Badge>
            )}
            {product.claimedByName && !isOwner && (
              <span className="text-xs text-foreground/50">{tCommon("from", { name: product.claimedByName })}</span>
            )}
            {isOwner && ownerVisibility === "full" && product.claimedByName && (
              <span className="text-xs text-foreground/50">{tCommon("from", { name: product.claimedByName })}</span>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 flex-col gap-2">
        {!isOwner && !isEditor && isLoggedIn && (
          <>
            {product.status === "available" && (
              <>
                <Button size="sm" onClick={onClaim}>
                  {product.affiliateUrl ? <Heart className="size-4" /> : <ShoppingBag className="size-4" />}
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
                  {product.affiliateUrl ? <Heart className="size-4" /> : <ShoppingBag className="size-4" />}
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

        {!isOwner && !isEditor && !isLoggedIn && product.status === "available" && (
          <>
            <Button size="sm" onClick={() => onAuthRequired("buy")}>
              {product.affiliateUrl ? <Heart className="size-4" /> : <ShoppingBag className="size-4" />}
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
