import { eq, and } from "drizzle-orm";
import { db, wishlists, savedWishlists } from "@/lib/db";

type ChatAccessResult = {
  canChat: boolean;
  role: "owner" | "editor" | "participant" | null;
  wishlistId?: string;
};

export async function verifyChatAccess(
  wishlistId: string,
  userId: string
): Promise<ChatAccessResult> {
  const [wishlist] = await db
    .select({
      id: wishlists.id,
      userId: wishlists.userId,
      ownerVisibility: wishlists.ownerVisibility,
    })
    .from(wishlists)
    .where(eq(wishlists.id, wishlistId));

  if (!wishlist) return { canChat: false, role: null };

  if (wishlist.userId === userId) {
    if (wishlist.ownerVisibility === "surprise") {
      return { canChat: false, role: "owner", wishlistId: wishlist.id };
    }
    return { canChat: true, role: "owner", wishlistId: wishlist.id };
  }

  const [saved] = await db
    .select({ role: savedWishlists.role })
    .from(savedWishlists)
    .where(
      and(
        eq(savedWishlists.wishlistId, wishlistId),
        eq(savedWishlists.userId, userId)
      )
    );

  if (saved) {
    return { canChat: true, role: saved.role, wishlistId: wishlist.id };
  }

  return { canChat: false, role: null };
}
