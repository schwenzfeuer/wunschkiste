import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, wishlists, savedWishlists, users } from "@/lib/db";
import { savedWishlistRoleEnum } from "@/lib/db/schema";

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
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const participants = await db
    .select({
      id: users.id,
      name: users.name,
      image: users.image,
      role: savedWishlists.role,
    })
    .from(savedWishlists)
    .innerJoin(users, eq(users.id, savedWishlists.userId))
    .where(eq(savedWishlists.wishlistId, id));

  return NextResponse.json(participants);
}

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(savedWishlistRoleEnum.enumValues),
});

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

  const [wishlist] = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(eq(wishlists.id, id), eq(wishlists.userId, session.user.id)));

  if (!wishlist) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = updateRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.userId === session.user.id) {
    return NextResponse.json(
      { error: "Cannot change your own role" },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(savedWishlists)
    .set({ role: parsed.data.role })
    .where(
      and(
        eq(savedWishlists.wishlistId, id),
        eq(savedWishlists.userId, parsed.data.userId)
      )
    )
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Participant not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, role: updated.role });
}
