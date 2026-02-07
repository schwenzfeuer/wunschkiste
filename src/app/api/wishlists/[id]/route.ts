import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, wishlistThemeEnum, ownerVisibilityEnum } from "@/lib/db";

const updateWishlistSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  theme: z.enum(wishlistThemeEnum.enumValues).optional(),
  isPublic: z.boolean().optional(),
  eventDate: z.string().datetime().optional().nullable(),
  ownerVisibility: z.enum(ownerVisibilityEnum.enumValues).optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [wishlist] = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(wishlist);
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateWishlistSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { eventDate, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = {
    ...rest,
    updatedAt: new Date(),
  };
  if (eventDate !== undefined) {
    updateData.eventDate = eventDate ? new Date(eventDate) : null;
  }

  const [wishlist] = await db
    .update(wishlists)
    .set(updateData)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
    .returning();

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(wishlist);
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [deleted] = await db
    .delete(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)))
    .returning();

  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
