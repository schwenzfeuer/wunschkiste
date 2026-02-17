import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { eq, and, inArray, sql, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, products, reservations, savedWishlists, users, wishlistThemeEnum, ownerVisibilityEnum, chatMessages, chatReadCursors, analyticsEvents } from "@/lib/db";

const createWishlistSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  theme: z.enum(wishlistThemeEnum.enumValues).default("standard"),
  isPublic: z.boolean().default(true),
  eventDate: z.string().datetime().optional().nullable(),
  ownerVisibility: z.enum(ownerVisibilityEnum.enumValues).default("partial"),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userWishlists = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, session.user.id));

  const wishlistIds = userWishlists.map((w) => w.id);

  const reservationCounts =
    wishlistIds.length > 0
      ? await db
          .select({
            wishlistId: products.wishlistId,
            claimedCount: count(reservations.id),
          })
          .from(reservations)
          .innerJoin(products, and(eq(products.id, reservations.productId), eq(products.hidden, false)))
          .where(inArray(products.wishlistId, wishlistIds))
          .groupBy(products.wishlistId)
      : [];

  const productCounts =
    wishlistIds.length > 0
      ? await db
          .select({
            wishlistId: products.wishlistId,
            totalCount: count(products.id),
          })
          .from(products)
          .where(and(inArray(products.wishlistId, wishlistIds), eq(products.hidden, false)))
          .groupBy(products.wishlistId)
      : [];

  const participantRows =
    wishlistIds.length > 0
      ? await db
          .select({
            wishlistId: savedWishlists.wishlistId,
            id: users.id,
            name: users.name,
            image: users.image,
          })
          .from(savedWishlists)
          .innerJoin(users, eq(users.id, savedWishlists.userId))
          .where(inArray(savedWishlists.wishlistId, wishlistIds))
      : [];

  const unreadCounts =
    wishlistIds.length > 0
      ? await db
          .select({
            wishlistId: chatMessages.wishlistId,
            unreadCount: sql<number>`cast(count(${chatMessages.id}) as int)`.as("unread_count"),
          })
          .from(chatMessages)
          .leftJoin(
            chatReadCursors,
            and(
              eq(chatReadCursors.wishlistId, chatMessages.wishlistId),
              eq(chatReadCursors.userId, sql`${session.user.id}::uuid`)
            )
          )
          .where(
            and(
              inArray(chatMessages.wishlistId, wishlistIds),
              sql`(${chatReadCursors.lastReadAt} IS NULL OR ${chatMessages.createdAt} > ${chatReadCursors.lastReadAt})`,
              sql`(${chatReadCursors.muted} IS NULL OR ${chatReadCursors.muted} = false)`
            )
          )
          .groupBy(chatMessages.wishlistId)
      : [];

  const withCounts = userWishlists.map((w) => ({
    ...w,
    totalCount: productCounts.find((p) => p.wishlistId === w.id)?.totalCount ?? 0,
    claimedCount: reservationCounts.find((r) => r.wishlistId === w.id)?.claimedCount ?? 0,
    participants: participantRows
      .filter((p) => p.wishlistId === w.id)
      .map(({ id, name, image }) => ({ id, name, image })),
    unreadChatCount:
      w.ownerVisibility === "surprise"
        ? 0
        : unreadCounts.find((u) => u.wishlistId === w.id)?.unreadCount ?? 0,
  }));

  return NextResponse.json(withCounts);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWishlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [wishlist] = await db
    .insert(wishlists)
    .values({
      userId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      theme: parsed.data.theme,
      isPublic: parsed.data.isPublic,
      eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
      ownerVisibility: parsed.data.ownerVisibility,
      shareToken: nanoid(12),
    })
    .returning();

  await db.insert(analyticsEvents).values({
    eventType: "wishlist_created",
    metadata: {},
  });

  return NextResponse.json(wishlist, { status: 201 });
}
