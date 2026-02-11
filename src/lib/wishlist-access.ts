import { eq, and } from "drizzle-orm";
import { db, wishlists, savedWishlists } from "@/lib/db";

export async function verifyWishlistAccess(
  wishlistId: string,
  userId: string
): Promise<{ role: "owner" | "editor" | null }> {
  const [wishlist] = await db
    .select({ id: wishlists.id, userId: wishlists.userId })
    .from(wishlists)
    .where(eq(wishlists.id, wishlistId));

  if (!wishlist) return { role: null };

  if (wishlist.userId === userId) return { role: "owner" };

  const [saved] = await db
    .select({ role: savedWishlists.role })
    .from(savedWishlists)
    .where(
      and(
        eq(savedWishlists.wishlistId, wishlistId),
        eq(savedWishlists.userId, userId),
        eq(savedWishlists.role, "editor")
      )
    );

  if (saved) return { role: "editor" };

  return { role: null };
}
