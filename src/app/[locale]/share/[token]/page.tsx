import type { Metadata } from "next";
import { cache } from "react";
import { headers } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations, users, savedWishlists } from "@/lib/db";
import SharePageContent from "./share-page-content";

interface SharePageProps {
  params: Promise<{ locale: string; token: string }>;
}

const getSharedWishlistData = cache(async (token: string) => {
  const requestHeaders = await headers();
  const session = await auth.api
    .getSession({ headers: requestHeaders })
    .catch(() => null);

  const [wishlist] = await db
    .select({
      id: wishlists.id,
      title: wishlists.title,
      description: wishlists.description,
      theme: wishlists.theme,
      isPublic: wishlists.isPublic,
      ownerName: users.name,
      ownerId: wishlists.userId,
      eventDate: wishlists.eventDate,
      ownerVisibility: wishlists.ownerVisibility,
    })
    .from(wishlists)
    .innerJoin(users, eq(users.id, wishlists.userId))
    .where(eq(wishlists.shareToken, token));

  if (!wishlist || !wishlist.isPublic) return null;

  const isOwner = session?.user?.id === wishlist.ownerId;
  const isLoggedIn = !!session?.user;
  const currentUserId = session?.user?.id;

  if (isLoggedIn && !isOwner) {
    await db.insert(savedWishlists)
      .values({ userId: currentUserId!, wishlistId: wishlist.id })
      .onConflictDoNothing();
  }

  const wishlistProducts = await db
    .select({
      id: products.id,
      title: products.title,
      originalUrl: products.originalUrl,
      affiliateUrl: products.affiliateUrl,
      imageUrl: products.imageUrl,
      price: products.price,
      currency: products.currency,
      shopName: products.shopName,
    })
    .from(products)
    .where(eq(products.wishlistId, wishlist.id));

  const productIds = wishlistProducts.map((p) => p.id);

  const productReservations =
    productIds.length > 0
      ? await db
          .select({
            productId: reservations.productId,
            userId: reservations.userId,
            userName: reservations.userName,
            status: reservations.status,
          })
          .from(reservations)
          .where(inArray(reservations.productId, productIds))
      : [];

  if (isOwner && wishlist.ownerVisibility === "surprise") {
    return {
      id: wishlist.id,
      title: wishlist.title,
      description: wishlist.description,
      theme: wishlist.theme,
      ownerName: wishlist.ownerName,
      eventDate: wishlist.eventDate?.toISOString() ?? null,
      ownerVisibility: wishlist.ownerVisibility as "full" | "partial" | "surprise",
      isOwner,
      isLoggedIn,
      claimedCount: productReservations.length,
      totalCount: wishlistProducts.length,
      products: wishlistProducts.map((product) => ({
        ...product,
        price: product.price ?? null,
        currency: product.currency ?? "EUR",
        status: "available" as const,
        claimedByMe: false,
        claimedByName: null,
      })),
    };
  }

  return {
    id: wishlist.id,
    title: wishlist.title,
    description: wishlist.description,
    theme: wishlist.theme,
    ownerName: wishlist.ownerName,
    eventDate: wishlist.eventDate?.toISOString() ?? null,
    ownerVisibility: wishlist.ownerVisibility as "full" | "partial" | "surprise",
    isOwner,
    isLoggedIn,
    products: wishlistProducts.map((product) => {
      const reservation = productReservations.find(
        (r) => r.productId === product.id
      );

      let status: "available" | "reserved" | "bought" = "available";
      let claimedByMe = false;
      let claimedByName: string | null = null;

      if (reservation) {
        status = reservation.status;
        claimedByMe = currentUserId === reservation.userId;
        if (!isOwner || wishlist.ownerVisibility === "full") {
          claimedByName = reservation.userName;
        }
      }

      return {
        ...product,
        price: product.price ?? null,
        currency: product.currency ?? "EUR",
        status,
        claimedByMe,
        claimedByName,
      };
    }),
  };
});

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const data = await getSharedWishlistData(token);

  if (!data) {
    return {
      title: "Nicht gefunden",
      robots: { index: false, follow: false },
    };
  }

  const ownerName = data.ownerName || "Jemand";
  const title = data.title;
  const productCount = data.products.length;
  const description =
    productCount > 0
      ? `${productCount} Wuensche von ${ownerName}`
      : `Wunschliste von ${ownerName}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title: `${title} - Wunschkiste`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} - Wunschkiste`,
      description,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;
  const initialData = await getSharedWishlistData(token);

  return <SharePageContent token={token} initialData={initialData} />;
}
